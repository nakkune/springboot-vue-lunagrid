package com.example.portal.controller;

import com.example.portal.dto.CommonCodeBatchRequest;
import com.example.portal.entity.CommonDetailCode;
import com.example.portal.entity.CommonGroupCode;
import com.example.portal.service.CommonCodeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * 관리자 전용 공통 코드 관리 API
 * (/api/admin/** 는 SecurityConfig 에서 ROLE_ADMIN 가드)
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/common-codes")
@RequiredArgsConstructor
public class CommonCodeAdminController {

    private final CommonCodeService commonCodeService;

    // =========================================================================
    // 1. 공통 그룹 코드 API (TB_COM_GRP_CD)
    // =========================================================================

    /** 그룹 코드 목록 조회 */
    @GetMapping("/groups")
    public ResponseEntity<List<CommonGroupCode>> getGroupCodes(
            @RequestParam(required = false) String grpCd,
            @RequestParam(required = false) String grpNm,
            @RequestParam(required = false) String useYn) {
        return ResponseEntity.ok(commonCodeService.getGroupCodes(grpCd, grpNm, useYn));
    }

    /** 단일 그룹 코드 조회 */
    @GetMapping("/groups/{grpCd}")
    public ResponseEntity<CommonGroupCode> getGroupCode(@PathVariable String grpCd) {
        CommonGroupCode code = commonCodeService.getGroupCode(grpCd);
        if (code == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(code);
    }

    /**
     * 그룹 코드 일괄 저장 (신규 등록, 수정, 삭제)
     * [핵심 요구사항] 삭제 시 상세 코드 선행 삭제 후 그룹 코드 삭제
     */
    @PostMapping("/groups/save")
    public ResponseEntity<Map<String, Object>> saveGroupCodes(
            @RequestBody CommonCodeBatchRequest<CommonGroupCode> batchRequest,
            Authentication authentication) {
        String userId = authentication != null ? authentication.getName() : "admin";
        commonCodeService.saveGroupCodes(batchRequest, userId);
        return ResponseEntity.ok(Map.of("success", true, "message", "공통 그룹 코드가 성공적으로 저장되었습니다."));
    }

    /**
     * 그룹 코드 단건 삭제 (연계 상세 코드 선삭제)
     */
    @DeleteMapping("/groups/{grpCd}")
    public ResponseEntity<Map<String, Object>> deleteGroupCode(@PathVariable String grpCd) {
        commonCodeService.deleteGroupCodeWithDetails(grpCd);
        return ResponseEntity.ok(Map.of("success", true, "message", "공통 그룹 코드 및 하위 상세 코드가 삭제되었습니다."));
    }

    // =========================================================================
    // 2. 공통 상세 코드 API (TB_COM_DTL_CD)
    // =========================================================================

    /** 특정 그룹의 상세 코드 목록 조회 */
    @GetMapping("/details")
    public ResponseEntity<List<CommonDetailCode>> getDetailCodes(
            @RequestParam String grpCd,
            @RequestParam(required = false) String useYn) {
        return ResponseEntity.ok(commonCodeService.getDetailCodes(grpCd, useYn));
    }

    /**
     * 상세 코드 일괄 저장 (신규 등록, 수정, 삭제)
     */
    @PostMapping("/details/save")
    public ResponseEntity<Map<String, Object>> saveDetailCodes(
            @RequestBody CommonCodeBatchRequest<CommonDetailCode> batchRequest,
            Authentication authentication) {
        String userId = authentication != null ? authentication.getName() : "admin";
        commonCodeService.saveDetailCodes(batchRequest, userId);
        return ResponseEntity.ok(Map.of("success", true, "message", "공통 상세 코드가 성공적으로 저장되었습니다."));
    }
}
