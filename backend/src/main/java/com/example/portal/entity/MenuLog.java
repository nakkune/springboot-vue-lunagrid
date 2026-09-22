package com.example.portal.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** TB_COM_MENU_LOG 매핑 모델 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuLog {
    private Long logSeq;
    private String userId;
    private String userNm;
    private String menuId;
    private String menuNm;
    private String menuUrl;
    @Builder.Default
    private LocalDateTime clickDt = LocalDateTime.now();
    private String userIp;
}
