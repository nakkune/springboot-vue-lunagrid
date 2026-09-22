package com.example.portal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 댓글 등록/수정 요청 DTO */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardCommentRequest {

    @NotBlank(message = "댓글 내용은 필수 입력 항목입니다.")
    @Size(max = 2000, message = "댓글은 2000자 이내로 입력하세요.")
    private String content;

    @Builder.Default
    private String secretYn = "N";

    /** 대댓글인 경우 상위 댓글 ID */
    private Long upperCommentId;
}
