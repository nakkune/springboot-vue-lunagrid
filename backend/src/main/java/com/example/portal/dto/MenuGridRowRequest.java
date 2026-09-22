package com.example.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 메뉴설정(루나그리드) 행 단위 C/U/D 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuGridRowRequest {
    private String menuId;
    private String upperMenuId;
    private String menuNm;
    private String menuUrl;
    private String iconClass;
    private Integer menuLvl;
    private Integer sortOrd;
    private String dispYn;
    private String useYn;
    private String targetType;
}
