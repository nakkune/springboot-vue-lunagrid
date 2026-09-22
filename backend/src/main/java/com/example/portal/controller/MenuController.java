package com.example.portal.controller;

import com.example.portal.dto.MenuResponse;
import com.example.portal.service.MenuService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    /** 좌측 메뉴 트리 조회 (사용자 역할 기준 필터링) */
    @GetMapping
    public ResponseEntity<List<MenuResponse>> getMenus(Authentication authentication) {
        return ResponseEntity.ok(menuService.getMenuTreeForUser(authentication.getName()));
    }
}
