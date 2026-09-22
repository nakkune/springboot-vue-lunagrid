package com.example.portal.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 메뉴설정(루나그리드) 전용 엔티티 (TB_COM_MENU 테이블 매핑)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuGrid {
    private String menuId;
    private String upperMenuId;
    private String menuNm;
    private String menuUrl;
    private Integer menuLvl;
    private Integer sortOrd;
    private String iconClass;
    @Builder.Default
    private String targetType = "_SELF";
    @Builder.Default
    private String dispYn = "Y";
    @Builder.Default
    private String useYn = "Y";
    private String regUserId;
    @Builder.Default
    private LocalDateTime regDt = LocalDateTime.now();
    private String modUserId;
    private LocalDateTime modDt;
}
