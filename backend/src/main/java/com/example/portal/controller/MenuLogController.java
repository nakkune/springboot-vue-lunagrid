package com.example.portal.controller;

import com.example.portal.dto.MenuLogRequest;
import com.example.portal.dto.MenuLogResponse;
import com.example.portal.dto.PagedResponse;
import com.example.portal.service.MenuLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MenuLogController {

    private final MenuLogService menuLogService;

    @PostMapping("/menu-logs")
    public ResponseEntity<Void> recordClick(@RequestBody MenuLogRequest request,
                                            Authentication authentication,
                                            HttpServletRequest httpRequest) {
        String userIp = getClientIp(httpRequest);
        menuLogService.recordClick(authentication.getName(), request, userIp);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/admin/menu-logs")
    public ResponseEntity<PagedResponse<MenuLogResponse>> getLogs(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String menuId,
            @RequestParam(required = false) String userIp,
            @RequestParam(required = false) String startDt,
            @RequestParam(required = false) String endDt,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        return ResponseEntity.ok(menuLogService.getLogsPaged(userId, menuId, userIp, startDt, endDt, page, pageSize));
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
