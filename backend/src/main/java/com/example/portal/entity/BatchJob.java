package com.example.portal.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** TB_COM_BATCH_JOB 매핑 모델 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchJob {
    private String jobId;
    private String jobNm;
    private String jobDesc;
    private String cronExpr;
    @Builder.Default
    private String jobType = "CRON";
    private String jobParams;
    @Builder.Default
    private String status = "IDLE";
    @Builder.Default
    private String useYn = "Y";
    private LocalDateTime lastRunDt;
    private String lastRunResult;
    private String regUserId;
    @Builder.Default
    private LocalDateTime regDt = LocalDateTime.now();
    private String modUserId;
    private LocalDateTime modDt;
}
