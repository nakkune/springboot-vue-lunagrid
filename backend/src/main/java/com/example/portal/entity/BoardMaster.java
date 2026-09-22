package com.example.portal.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** TB_BBS_MST 매핑 모델 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardMaster {
    private String bbsId;
    private String bbsNm;
    private String bbsDesc;
    @Builder.Default
    private String bbsTypeCd = "NORMAL";
    @Builder.Default
    private String replyYn = "N";
    @Builder.Default
    private String commentYn = "Y";
    @Builder.Default
    private String atchFileYn = "Y";
    @Builder.Default
    private Integer maxFileCnt = 5;
    @Builder.Default
    private Long maxFileSize = 10485760L;
    @Builder.Default
    private String secretYn = "N";
    @Builder.Default
    private Integer pagePerSize = 10;
    @Builder.Default
    private String useYn = "Y";
    private String regUserId;
    private LocalDateTime regDt;
    private String modUserId;
    private LocalDateTime modDt;
}
