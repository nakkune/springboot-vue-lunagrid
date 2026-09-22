package com.example.portal.dto;

import com.example.portal.entity.MenuGrid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 메뉴설정(루나그리드) 응답 DTO (트리 계층 변환 지원)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuGridResponse {
    private String menuId;
    private String upperMenuId;
    private String menuNm;
    private String menuUrl;
    private String iconClass;
    private String targetType;
    private Integer sortOrd;
    private Integer menuLvl;
    private String dispYn;
    private String useYn;
    @Builder.Default
    private List<MenuGridResponse> children = new ArrayList<>();

    public MenuGridResponse(MenuGrid menu) {
        this.menuId = menu.getMenuId();
        this.upperMenuId = menu.getUpperMenuId();
        this.menuNm = menu.getMenuNm();
        this.menuUrl = menu.getMenuUrl();
        this.iconClass = menu.getIconClass();
        this.targetType = menu.getTargetType();
        this.sortOrd = menu.getSortOrd();
        this.menuLvl = menu.getMenuLvl();
        this.dispYn = menu.getDispYn();
        this.useYn = menu.getUseYn();
        this.children = new ArrayList<>();
    }

    public static List<MenuGridResponse> toTree(List<MenuGrid> menus) {
        if (menus == null || menus.isEmpty()) {
            return new ArrayList<>();
        }

        Map<String, MenuGridResponse> dtoMap = menus.stream()
                .collect(Collectors.toMap(MenuGrid::getMenuId, MenuGridResponse::new, (a, b) -> a));

        List<MenuGridResponse> rootMenus = new ArrayList<>();
        for (MenuGrid menu : menus) {
            MenuGridResponse dto = dtoMap.get(menu.getMenuId());
            String upperId = menu.getUpperMenuId();
            if (upperId == null || upperId.isBlank() || !dtoMap.containsKey(upperId)) {
                rootMenus.add(dto);
            } else {
                MenuGridResponse parent = dtoMap.get(upperId);
                if (parent != null) {
                    if (parent.getChildren() == null) {
                        parent.setChildren(new ArrayList<>());
                    }
                    parent.getChildren().add(dto);
                } else {
                    rootMenus.add(dto);
                }
            }
        }
        return rootMenus;
    }
}
