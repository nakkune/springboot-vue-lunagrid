package com.example.portal.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** TB_COM_MENU 매핑 모델 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Menu {
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
