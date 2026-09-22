package com.example.portal.controller;

import com.example.portal.dto.MenuRequest;
import com.example.portal.dto.MenuResponse;
import com.example.portal.service.MenuService;
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
 * 관리자 전용 메뉴 관리 API (/api/admin/** 는 SecurityConfig 에서 ROLE_ADMIN 가드).
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/menus")
@RequiredArgsConstructor
public class MenuAdminController {

    private final MenuService menuService;

    /** 전체 메뉴 트리 조회 (숨김 포함) */
    @GetMapping
    public ResponseEntity<List<MenuResponse>> getAllMenus() {
        return ResponseEntity.ok(menuService.getFullMenuTree());
    }

    /** 메뉴 등록 */
    @PostMapping
    public ResponseEntity<MenuResponse> createMenu(@Valid @RequestBody MenuRequest request,
                                                   Authentication authentication) {
        MenuResponse created = menuService.createMenu(request, authentication.getName());
        return ResponseEntity.status(201).body(created);
    }

    /** 메뉴 수정 */
    @PutMapping("/{menuId}")
    public ResponseEntity<MenuResponse> updateMenu(@PathVariable String menuId,
                                                   @Valid @RequestBody MenuRequest request,
                                                   Authentication authentication) {
        return ResponseEntity.ok(menuService.updateMenu(menuId, request, authentication.getName()));
    }


    /** 메뉴 삭제 */
    @DeleteMapping("/{menuId}")
    public ResponseEntity<Void> deleteMenu(@PathVariable String menuId) {
        menuService.deleteMenu(menuId);
        return ResponseEntity.noContent().build();
    }
}
