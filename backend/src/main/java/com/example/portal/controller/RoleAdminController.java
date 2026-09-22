package com.example.portal.controller;

import com.example.portal.dto.RoleMenuSaveRequest;
import com.example.portal.dto.RoleResponse;
import com.example.portal.service.RoleMenuService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * 역할별 메뉴 권한 관리 API (/api/admin/** 는 ROLE_ADMIN 가드).
 *
 * GET /api/admin/roles                  - 역할 목록
 * GET /api/admin/roles/{roleId}/menus   - 역할에 할당된 메뉴 ID 목록
 * PUT /api/admin/roles/{roleId}/menus   - 역할 메뉴 전체 교체 저장
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
public class RoleAdminController {

    private final RoleMenuService roleMenuService;

    @GetMapping
    public ResponseEntity<List<RoleResponse>> getRoles() {
        return ResponseEntity.ok(roleMenuService.getRoles());
    }

    @GetMapping("/{roleId}/menus")
    public ResponseEntity<Map<String, List<String>>> getAssignedMenus(@PathVariable String roleId) {
        return ResponseEntity.ok(Map.of("menuIds", roleMenuService.getMenuIds(roleId)));
    }

    @PutMapping("/{roleId}/menus")
    public ResponseEntity<Void> saveAssignedMenus(@PathVariable String roleId,
                                                  @RequestBody RoleMenuSaveRequest request,
                                                  Authentication authentication) {
        roleMenuService.saveRoleMenus(roleId, request.getMenuIds(), authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
