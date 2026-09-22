package com.example.portal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 배치 작업 등록/수정 요청 DTO.
 * - 등록(POST): jobId 필수
 * - 수정(PUT): jobId 는 path 파라미터 사용 (body 의 jobId 무시)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchJobRequest {

    @Pattern(regexp = "^[A-Za-z0-9_]{2,30}$", message = "Job ID는 영문/숫자/언더스코어 2~30자입니다.")
    private String jobId;

    @NotBlank(message = "Job 이름은 필수 입력 항목입니다.")
    @Size(max = 100, message = "Job 이름은 100자 이하입니다.")
    private String jobNm;

    @Size(max = 500, message = "Job 설명은 500자 이하입니다.")
    private String jobDesc;

    private String cronExpr;   // jobType 이 CRON 일 때 필수 (service 에서 검증)
    private String jobType;    // CRON / SIMPLE, null 이면 CRON
    private String jobParams;  // JSON 문자열
    private String useYn;      // Y/N, null 이면 Y
}
