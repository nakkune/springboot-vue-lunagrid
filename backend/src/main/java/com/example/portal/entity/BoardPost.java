package com.example.portal.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** TB_BBS_POST 매핑 모델 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardPost {
    private Long postId;
    private String bbsId;
    private String title;
    private String content;

    /** 계층형 답글 지원 */
    private Long groupNo;
    @Builder.Default
    private Integer depthNo = 0;
    @Builder.Default
    private Integer sortOrd = 0;

    /** 확장 속성 */
    private String categoryCd;
    @Builder.Default
    private String noticeYn = "N";
    private LocalDateTime noticeStartDt;
    private LocalDateTime noticeEndDt;
    @Builder.Default
    private String secretYn = "N";
    private String secretPwd;

    /** 통계 */
    @Builder.Default
    private Long viewCnt = 0L;
    @Builder.Default
    private Long likeCnt = 0L;
    @Builder.Default
    private Integer commentCnt = 0;

    /** 첨부파일 */
    private String atchFileGrpId;

    /** 목록 전용: 첨부파일 존재 여부 (EXISTS 서브쿼리로 채워짐, 테이블 컬럼 아님) */
    private String fileYn;

    /** 작성자 정보 */
    private String regUserNm;
    private String regUserId;
    private String regIp;
    private LocalDateTime regDt;
    private String modUserId;
    private LocalDateTime modDt;

    /** Soft Delete */
    @Builder.Default
    private String delYn = "N";
    private LocalDateTime delDt;
    private String delUserId;
}
