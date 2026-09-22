package com.example.portal.service;

import com.example.portal.dto.AttachFileResponse;
import com.example.portal.entity.AttachFile;
import com.example.portal.entity.BoardMaster;
import com.example.portal.exception.BusinessException;
import com.example.portal.mapper.AttachFileMapper;
import com.example.portal.mapper.BoardMasterMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttachFileService {

    private static final Set<String> BLOCKED_EXT = Set.of(
            "exe", "bat", "cmd", "com", "scr", "vbs", "sh",
            "jsp", "asp", "php", "war", "jar", "msi"
    );

    private final BoardMasterMapper boardMasterMapper;
    private final AttachFileMapper attachFileMapper;

    @Value("${app.upload.path:${user.home}/portal-upload}")
    private String uploadPath;

    @Transactional
    public List<AttachFileResponse> upload(String bbsId, List<MultipartFile> parts,
                                            String grpId, String userId) {
        BoardMaster board = boardMasterMapper.selectByBbsId(bbsId);
        if (board == null) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "게시판을 찾을 수 없습니다.");
        }
        if (!"Y".equals(board.getAtchFileYn())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "이 게시판은 첨부파일을 허용하지 않습니다.");
        }
        if (parts == null || parts.isEmpty()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "업로드할 파일이 없습니다.");
        }

        String groupId = (grpId == null || grpId.isBlank())
                ? UUID.randomUUID().toString().replace("-", "")
                : grpId;

        List<AttachFile> existing = attachFileMapper.selectByGrpId(groupId);
        if (!existing.isEmpty() && !userId.equals(existing.get(0).getRegUserId())) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "다른 사용자의 첨부파일 그룹입니다.");
        }

        if (existing.size() + parts.size() > board.getMaxFileCnt()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST,
                    "첨부파일은 최대 " + board.getMaxFileCnt() + "개까지 등록할 수 있습니다.");
        }

        int nextSeq = existing.stream()
                .mapToInt(AttachFile::getFileSeq)
                .max().orElse(0);

        Path baseDir = Paths.get(uploadPath).toAbsolutePath()
                .resolve(LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM")));
        try {
            Files.createDirectories(baseDir);
        } catch (IOException e) {
            throw new BusinessException(HttpStatus.INTERNAL_SERVER_ERROR, "저장 디렉터리 생성에 실패했습니다.");
        }

        List<AttachFileResponse> result = new ArrayList<>();
        for (MultipartFile part : parts) {
            if (part == null || part.isEmpty()) {
                throw new BusinessException(HttpStatus.BAD_REQUEST, "비어있는 파일이 포함되어 있습니다.");
            }
            if (part.getSize() > board.getMaxFileSize()) {
                throw new BusinessException(HttpStatus.BAD_REQUEST,
                        "파일 용량은 개당 " + (board.getMaxFileSize() / 1024 / 1024) + "MB 이하여야 합니다: "
                                + sanitizeName(part.getOriginalFilename()));
            }

            String originalNm = sanitizeName(part.getOriginalFilename());
            String ext = extractExt(originalNm);
            if (!ext.isEmpty() && BLOCKED_EXT.contains(ext)) {
                throw new BusinessException(HttpStatus.BAD_REQUEST,
                        "[" + ext + "] 확장자는 업로드할 수 없습니다.");
            }

            String storedNm = UUID.randomUUID().toString().replace("-", "")
                    + (ext.isEmpty() ? "" : "." + ext);

            AttachFile file = new AttachFile();
            file.setAtchFileGrpId(groupId);
            file.setFileSeq(++nextSeq);
            file.setOriginalFileNm(originalNm);
            file.setStoredFileNm(storedNm);
            file.setFilePath(baseDir.toString());
            file.setFileSize(part.getSize());
            file.setFileExt(ext.isEmpty() ? "bin" : ext);
            file.setMimeType(part.getContentType());
            file.setRegUserId(userId);

            try {
                part.transferTo(baseDir.resolve(storedNm));
            } catch (IOException e) {
                throw new BusinessException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "파일 저장에 실패했습니다: " + originalNm);
            }

            attachFileMapper.insertFile(file);
            result.add(AttachFileResponse.from(file));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<AttachFileResponse> getByGrpId(String grpId) {
        if (grpId == null || grpId.isBlank()) {
            return List.of();
        }
        return attachFileMapper.selectByGrpId(grpId).stream()
                .map(AttachFileResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteFile(String grpId, Integer fileSeq) {
        attachFileMapper.deleteFile(grpId, fileSeq);
    }

    /** 다운로드용 파일 정보 로드 + 다운로드 수 증가 */
    @Transactional
    public AttachFile loadForDownload(String grpId, Integer fileSeq) {
        AttachFile target = attachFileMapper.selectByGrpId(grpId).stream()
                .filter(f -> f.getFileSeq().equals(fileSeq))
                .findFirst()
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "파일을 찾을 수 없습니다."));

        Path path = Paths.get(target.getFilePath()).resolve(target.getStoredFileNm());
        if (!Files.exists(path)) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "서버에 파일이 존재하지 않습니다.");
        }

        attachFileMapper.incrementDownCnt(grpId, fileSeq);
        return target;
    }

    private String sanitizeName(String name) {
        if (name == null || name.isBlank()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "파일명이 올바르지 않습니다.");
        }
        String cleaned = name.replace("\\", "/");
        int idx = cleaned.lastIndexOf('/');
        return idx >= 0 ? cleaned.substring(idx + 1) : cleaned;
    }

    private String extractExt(String fileName) {
        int dot = fileName.lastIndexOf('.');
        return dot < 0 ? "" : fileName.substring(dot + 1).toLowerCase();
    }
}
