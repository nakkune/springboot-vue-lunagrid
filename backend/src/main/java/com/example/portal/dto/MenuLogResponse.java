package com.example.portal.dto;

import com.example.portal.entity.MenuLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuLogResponse {
    private Long logSeq;
    private String userId;
    private String userNm;
    private String menuId;
    private String menuNm;
    private String menuUrl;
    private LocalDateTime clickDt;
    private String userIp;

    public MenuLogResponse(MenuLog log) {
        this.logSeq = log.getLogSeq();
        this.userId = log.getUserId();
        this.userNm = log.getUserNm();
        this.menuId = log.getMenuId();
        this.menuNm = log.getMenuNm();
        this.menuUrl = log.getMenuUrl();
        this.clickDt = log.getClickDt();
        this.userIp = log.getUserIp();
    }
}
