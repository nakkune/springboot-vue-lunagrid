package com.example.portal.controller;

import com.example.portal.dto.BatchJobRequest;
import com.example.portal.dto.BatchJobResponse;
import com.example.portal.service.BatchJobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 관리자 전용 배치 작업 관리 API (/api/admin/** 는 SecurityConfig 에서 ROLE_ADMIN 가드).
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/batch-jobs")
@RequiredArgsConstructor
public class BatchJobAdminController {

    private final BatchJobService batchJobService;

    /** 전체 배치 작업 목록 조회 */
    @GetMapping
    public ResponseEntity<List<BatchJobResponse>> getAllJobs() {
        return ResponseEntity.ok(batchJobService.getAllJobs());
    }

    /** 배치 작업 등록 */
    @PostMapping
    public ResponseEntity<BatchJobResponse> createJob(@Valid @RequestBody BatchJobRequest request,
                                                      Authentication authentication) {
        BatchJobResponse created = batchJobService.createJob(request, authentication.getName());
        return ResponseEntity.status(201).body(created);
    }

    /** 배치 작업 수정 */
    @PutMapping("/{jobId}")
    public ResponseEntity<BatchJobResponse> updateJob(@PathVariable String jobId,
                                                      @Valid @RequestBody BatchJobRequest request,
                                                      Authentication authentication) {
        return ResponseEntity.ok(batchJobService.updateJob(jobId, request, authentication.getName()));
    }

    /** 배치 작업 삭제 */
    @DeleteMapping("/{jobId}")
    public ResponseEntity<Void> deleteJob(@PathVariable String jobId) {
        batchJobService.deleteJob(jobId);
        return ResponseEntity.noContent().build();
    }

    /** 사용여부 토글 (Y ↔ N) */
    @PutMapping("/{jobId}/toggle")
    public ResponseEntity<BatchJobResponse> toggleUseYn(@PathVariable String jobId,
                                                        Authentication authentication) {
        return ResponseEntity.ok(batchJobService.toggleUseYn(jobId, authentication.getName()));
    }
}
