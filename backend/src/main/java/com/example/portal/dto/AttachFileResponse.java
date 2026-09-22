package com.example.portal.dto;

import com.example.portal.entity.AttachFile;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.format.DateTimeFormatter;

/** 첨부파일 응답 DTO */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttachFileResponse {

    private String atchFileGrpId;
    private Integer fileSeq;
    private String originalFileNm;
    private Long fileSize;
    private String fileExt;
    private String mimeType;
    private Long downCnt;
    private String regDt;
    private String regUserId;

    public static AttachFileResponse from(AttachFile f) {
        AttachFileResponse r = new AttachFileResponse();
        r.atchFileGrpId = f.getAtchFileGrpId();
        r.fileSeq = f.getFileSeq();
        r.originalFileNm = f.getOriginalFileNm();
        r.fileSize = f.getFileSize();
        r.fileExt = f.getFileExt();
        r.mimeType = f.getMimeType();
        r.downCnt = f.getDownCnt();
        r.regUserId = f.getRegUserId();
        if (f.getRegDt() != null) {
            r.regDt = f.getRegDt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        }
        return r;
    }
}
