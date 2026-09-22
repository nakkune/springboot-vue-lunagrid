package com.example.portal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 게시글 등록/수정 요청 DTO */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardPostRequest {

    @NotBlank(message = "제목은 필수 입력 항목입니다.")
    @Size(max = 300, message = "제목은 300자 이내로 입력하세요.")
    private String title;

    @NotBlank(message = "내용은 필수 입력 항목입니다.")
    private String content;

    private String categoryCd;
    @Builder.Default
    private String noticeYn = "N";
    @Builder.Default
    private String secretYn = "N";
    private String secretPwd;

    /** 답글 등록 시 사용 */
    private Long upperPostId;

    /** 첨부파일 그룹 ID (선택) */
    private String atchFileGrpId;
}
