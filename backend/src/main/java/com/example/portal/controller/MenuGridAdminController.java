package com.example.portal.controller;

import com.example.portal.dto.MenuGridBatchRequest;
import com.example.portal.dto.MenuGridResponse;
import com.example.portal.service.MenuGridService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * 메뉴설정(루나그리드) 전용 관리자 API 컨트롤러.
 * 그리드에서 요청하는 메뉴 목록 조회 및 신규/수정/삭제 일괄 저장을 처리합니다.
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/menu-grid")
@RequiredArgsConstructor
public class MenuGridAdminController {

    private final MenuGridService menuGridService;

    /**
     * 그리드용 전체 메뉴 목록 조회
     */
    @GetMapping("/menus")
    public ResponseEntity<List<MenuGridResponse>> getGridMenus() {
        return ResponseEntity.ok(menuGridService.getGridMenuTree());
    }

    /**
     * 그리드 컬럼 옵션용 공통코드 DB 조회 (예: USE_YN, MENU_TARGET 등)
     */
    @GetMapping("/codes/{grpCd}")
    public ResponseEntity<List<com.example.portal.dto.MenuGridCodeResponse>> getGridCodes(@org.springframework.web.bind.annotation.PathVariable String grpCd) {
        return ResponseEntity.ok(menuGridService.getCodesByGrpCd(grpCd));
    }

    /**
     * 그리드 일괄 저장 (신규 등록, 수정, 삭제)
     */
    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> saveGridMenus(
            @RequestBody MenuGridBatchRequest batchRequest,
            Authentication authentication) {
        String userId = authentication != null ? authentication.getName() : "admin";
        menuGridService.saveBatch(batchRequest, userId);
        return ResponseEntity.ok(Map.of("success", true, "message", "메뉴가 성공적으로 저장되었습니다."));
    }
}
