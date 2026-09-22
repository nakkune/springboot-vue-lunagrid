package com.example.portal.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** TB_COM_ATTACH_FILE 매핑 모델 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttachFile {
    private String atchFileGrpId;
    private Integer fileSeq;
    private String originalFileNm;
    private String storedFileNm;
    private String filePath;
    private Long fileSize;
    private String fileExt;
    private String mimeType;
    @Builder.Default
    private Long downCnt = 0L;
    private String regUserId;
    private LocalDateTime regDt;
    @Builder.Default
    private String delYn = "N";
}
