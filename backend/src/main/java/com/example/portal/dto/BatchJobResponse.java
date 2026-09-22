package com.example.portal.dto;

import com.example.portal.entity.BatchJob;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchJobResponse {
    private String jobId;
    private String jobNm;
    private String jobDesc;
    private String cronExpr;
    private String jobType;
    private String jobParams;
    private String status;
    private String useYn;
    private LocalDateTime lastRunDt;
    private String lastRunResult;
    private String regUserId;
    private LocalDateTime regDt;
    private String modUserId;
    private LocalDateTime modDt;

    public BatchJobResponse(BatchJob job) {
        this.jobId = job.getJobId();
        this.jobNm = job.getJobNm();
        this.jobDesc = job.getJobDesc();
        this.cronExpr = job.getCronExpr();
        this.jobType = job.getJobType();
        this.jobParams = job.getJobParams();
        this.status = job.getStatus();
        this.useYn = job.getUseYn();
        this.lastRunDt = job.getLastRunDt();
        this.lastRunResult = job.getLastRunResult();
        this.regUserId = job.getRegUserId();
        this.regDt = job.getRegDt();
        this.modUserId = job.getModUserId();
        this.modDt = job.getModDt();
    }

    public static List<BatchJobResponse> fromList(List<BatchJob> jobs) {
        return jobs.stream().map(BatchJobResponse::new).collect(Collectors.toList());
    }
}
