package com.example.portal.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** TB_BBS_COMMENT 매핑 모델 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardComment {
    private Long commentId;
    private Long postId;
    private Long upperCommentId;
    private String content;
    @Builder.Default
    private String secretYn = "N";
    private String regUserNm;
    private String regUserId;
    private String regIp;
    private LocalDateTime regDt;
    private String modUserId;
    private LocalDateTime modDt;
    @Builder.Default
    private String delYn = "N";
    private LocalDateTime delDt;
}
