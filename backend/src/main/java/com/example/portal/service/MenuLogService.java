package com.example.portal.service;

import com.example.portal.dto.MenuLogRequest;
import com.example.portal.dto.MenuLogResponse;
import com.example.portal.dto.PagedResponse;
import com.example.portal.entity.MenuLog;
import com.example.portal.entity.User;
import com.example.portal.mapper.MenuLogMapper;
import com.example.portal.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MenuLogService {

    private final MenuLogMapper menuLogMapper;
    private final UserMapper userMapper;

    @Transactional
    public void recordClick(String userId, MenuLogRequest request, String userIp) {
        User user = userMapper.selectByUserId(userId);
        String userNm = user != null ? user.getUserNm() : userId;

        MenuLog log = new MenuLog();
        log.setUserId(userId);
        log.setUserNm(userNm);
        log.setMenuId(request.getMenuId());
        log.setMenuNm(request.getMenuNm());
        log.setMenuUrl(request.getMenuUrl());
        log.setUserIp(userIp);
        menuLogMapper.insertMenuLog(log);
    }

    @Transactional(readOnly = true)
    public PagedResponse<MenuLogResponse> getLogsPaged(String userId, String menuId, String userIp, String startDt, String endDt, int page, int pageSize) {
        int count = menuLogMapper.countMenuLogs(userId, menuId, userIp, startDt, endDt);
        int offset = (page - 1) * pageSize;
        List<MenuLogResponse> items = menuLogMapper.selectMenuLogs(userId, menuId, userIp, startDt, endDt, offset, pageSize)
                .stream()
                .map(MenuLogResponse::new)
                .collect(Collectors.toList());
        return new PagedResponse<>(items, page, pageSize, count);
    }
}
