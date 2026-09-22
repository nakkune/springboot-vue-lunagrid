package com.example.portal.controller;

import com.example.portal.dto.AttachFileResponse;
import com.example.portal.service.AttachFileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * 게시판 첨부파일 API.
 *
 * POST   /api/boards/{bbsId}/files                          - 업로드 (multipart, files[] + atchFileGrpId 옵션)
 * GET    /api/boards/{bbsId}/files?atchFileGrpId=           - 그룹 파일 목록
 * DELETE /api/boards/{bbsId}/files?atchFileGrpId=&fileSeq=  - 파일 삭제(soft)
 * GET    /api/boards/{bbsId}/files/{grpId}/{fileSeq}/download - 다운로드
 */
@Slf4j
@RestController
@RequestMapping("/api/boards/{bbsId}")
@RequiredArgsConstructor
public class BoardFileController {

    private final AttachFileService attachFileService;

    @PostMapping("/files")
    public ResponseEntity<List<AttachFileResponse>> upload(
            @PathVariable String bbsId,
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(required = false) String atchFileGrpId,
            Authentication authentication) {
        return ResponseEntity.status(201).body(
                attachFileService.upload(bbsId, files, atchFileGrpId, authentication.getName()));
    }

    @GetMapping("/files")
    public ResponseEntity<List<AttachFileResponse>> listFiles(
            @PathVariable String bbsId,
            @RequestParam String atchFileGrpId) {
        return ResponseEntity.ok(attachFileService.getByGrpId(atchFileGrpId));
    }

    @DeleteMapping("/files")
    public ResponseEntity<Void> deleteFile(
            @PathVariable String bbsId,
            @RequestParam String atchFileGrpId,
            @RequestParam Integer fileSeq) {
        attachFileService.deleteFile(atchFileGrpId, fileSeq);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/files/{grpId}/{fileSeq}/download")
    public ResponseEntity<FileSystemResource> download(
            @PathVariable String bbsId,
            @PathVariable String grpId,
            @PathVariable Integer fileSeq,
            Authentication authentication) {
        com.example.portal.entity.AttachFile meta = attachFileService.loadForDownload(grpId, fileSeq);
        FileSystemResource resource = new FileSystemResource(
                java.nio.file.Paths.get(meta.getFilePath(), meta.getStoredFileNm()));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename(meta.getOriginalFileNm(), StandardCharsets.UTF_8)
                .build());
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);

        return ResponseEntity.ok().headers(headers).body(resource);
    }
}
