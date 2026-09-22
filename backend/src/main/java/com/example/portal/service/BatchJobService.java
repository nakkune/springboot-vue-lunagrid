package com.example.portal.service;

import com.example.portal.dto.BatchJobRequest;
import com.example.portal.dto.BatchJobResponse;
import com.example.portal.entity.BatchJob;
import com.example.portal.exception.BusinessException;
import com.example.portal.mapper.BatchJobMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BatchJobService {

    private final BatchJobMapper batchJobMapper;

    /** 전체 배치 작업 목록 조회 */
    @Transactional(readOnly = true)
    public List<BatchJobResponse> getAllJobs() {
        return BatchJobResponse.fromList(batchJobMapper.selectAll());
    }

    /** 단건 조회 */
    @Transactional(readOnly = true)
    public BatchJobResponse getJob(String jobId) {
        return new BatchJobResponse(requireJob(jobId));
    }

    /** 배치 작업 등록 */
    @Transactional
    public BatchJobResponse createJob(BatchJobRequest request, String regUserId) {
        if (request.getJobId() == null || request.getJobId().isBlank()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Job ID는 필수 입력 항목입니다.");
        }
        if (batchJobMapper.countByJobId(request.getJobId()) > 0) {
            throw new BusinessException(HttpStatus.CONFLICT, "이미 존재하는 Job ID입니다.");
        }

        BatchJob job = new BatchJob();
        job.setJobId(request.getJobId());
        applyRequest(job, request);
        job.setRegUserId(regUserId);
        batchJobMapper.insertBatchJob(job);

        return new BatchJobResponse(job);
    }

    /** 배치 작업 수정 */
    @Transactional
    public BatchJobResponse updateJob(String jobId, BatchJobRequest request, String modUserId) {
        BatchJob existing = requireJob(jobId);
        applyRequest(existing, request);
        existing.setModUserId(modUserId);
        batchJobMapper.updateBatchJob(existing);

        return new BatchJobResponse(existing);
    }

    /** 배치 작업 삭제 */
    @Transactional
    public void deleteJob(String jobId) {
        requireJob(jobId);
        batchJobMapper.deleteBatchJob(jobId);
    }

    /** 사용여부 토글 (Y ↔ N) */
    @Transactional
    public BatchJobResponse toggleUseYn(String jobId, String modUserId) {
        BatchJob job = requireJob(jobId);
        job.setUseYn("Y".equals(job.getUseYn()) ? "N" : "Y");
        job.setModUserId(modUserId);
        batchJobMapper.updateBatchJob(job);
        return new BatchJobResponse(job);
    }

    // ------------------------------------------------------------------
    // 내부 유틸
    // ------------------------------------------------------------------

    private BatchJob requireJob(String jobId) {
        BatchJob job = batchJobMapper.selectByJobId(jobId);
        if (job == null) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "배치 작업을 찾을 수 없습니다.");
        }
        return job;
    }

    private void applyRequest(BatchJob job, BatchJobRequest request) {
        job.setJobNm(request.getJobNm());
        job.setJobDesc("".equals(request.getJobDesc()) ? null : request.getJobDesc());

        String jobType = request.getJobType() != null && !request.getJobType().isBlank()
                ? request.getJobType() : "CRON";
        job.setJobType(jobType);

        if ("CRON".equals(jobType)) {
            if (request.getCronExpr() == null || request.getCronExpr().isBlank()) {
                throw new BusinessException(HttpStatus.BAD_REQUEST, "CRON 타입의 배치 작업은 Cron 표현식이 필수입니다.");
            }
            job.setCronExpr(request.getCronExpr());
        } else {
            job.setCronExpr(null);
        }

        job.setJobParams("".equals(request.getJobParams()) ? null : request.getJobParams());
        job.setUseYn(request.getUseYn() != null ? request.getUseYn() : "Y");
    }
}
