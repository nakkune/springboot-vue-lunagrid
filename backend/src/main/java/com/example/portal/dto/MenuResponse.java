package com.example.portal.dto;

import com.example.portal.entity.Menu;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuResponse {
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
    private List<MenuResponse> children = new ArrayList<>();

    public MenuResponse(Menu menu) {
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

    public static List<MenuResponse> toTree(List<Menu> menus) {
        if (menus == null || menus.isEmpty()) {
            return new ArrayList<>();
        }

        Map<String, MenuResponse> dtoMap = menus.stream()
                .collect(Collectors.toMap(Menu::getMenuId, MenuResponse::new, (a, b) -> a));

        List<MenuResponse> rootMenus = new ArrayList<>();
        for (Menu menu : menus) {
            MenuResponse dto = dtoMap.get(menu.getMenuId());
            String upperId = menu.getUpperMenuId();
            if (upperId == null || upperId.isBlank() || !dtoMap.containsKey(upperId)) {
                rootMenus.add(dto);
            } else {
                MenuResponse parent = dtoMap.get(upperId);
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
