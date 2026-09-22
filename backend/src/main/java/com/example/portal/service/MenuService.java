package com.example.portal.service;

import com.example.portal.dto.MenuRequest;
import com.example.portal.dto.MenuResponse;
import com.example.portal.entity.Menu;
import com.example.portal.entity.RoleMenu;
import com.example.portal.entity.UserRole;
import com.example.portal.exception.BusinessException;
import com.example.portal.mapper.MenuMapper;
import com.example.portal.mapper.RoleMenuMapper;
import com.example.portal.mapper.UserRoleMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MenuService {

    private static final Set<String> ADMIN_ROLES = Set.of("ROLE_ADMIN", "ROLE_SUPER_ADMIN");

    private final MenuMapper menuMapper;
    private final UserRoleMapper userRoleMapper;
    private final RoleMenuMapper roleMenuMapper;

    /**
     * 사용자 역할 기준 좌측 메뉴 트리 조회.
     * - 관리자: 노출 메뉴 전체
     * - 일반 역할: TB_COM_ROLE_MENU 매핑 메뉴 및 그 상위 부모 메뉴 포함
     * - 역할/권한 매핑이 없거나 결과가 비어있으면 노출 메뉴 전체 (데모/폴백)
     */
    @Transactional(readOnly = true)
    public List<MenuResponse> getMenuTreeForUser(String userId) {
        List<String> roleIds = userRoleMapper.selectByUserId(userId).stream()
                .map(UserRole::getRoleId)
                .collect(Collectors.toList());

        List<Menu> visibleMenus = menuMapper.selectVisibleMenus();

        boolean isAdmin = roleIds.stream().anyMatch(ADMIN_ROLES::contains);
        if (!isAdmin && !roleIds.isEmpty()) {
            Set<String> allowedMenuIds = roleMenuMapper.selectByRoleIds(roleIds).stream()
                    .map(RoleMenu::getMenuId)
                    .collect(Collectors.toCollection(HashSet::new));

            if (!allowedMenuIds.isEmpty()) {
                // 부모 메뉴 ID도 자동으로 포함하여 트리가 끊어지는 문제 방지
                Map<String, Menu> menuMap = visibleMenus.stream()
                        .collect(Collectors.toMap(Menu::getMenuId, m -> m, (a, b) -> a));

                Set<String> fullAllowedIds = new HashSet<>(allowedMenuIds);
                for (String mId : allowedMenuIds) {
                    Menu curr = menuMap.get(mId);
                    while (curr != null && curr.getUpperMenuId() != null && !curr.getUpperMenuId().isBlank()) {
                        fullAllowedIds.add(curr.getUpperMenuId());
                        curr = menuMap.get(curr.getUpperMenuId());
                    }
                }

                visibleMenus = visibleMenus.stream()
                        .filter(menu -> fullAllowedIds.contains(menu.getMenuId()))
                        .collect(Collectors.toList());
            }
        }

        return MenuResponse.toTree(visibleMenus);
    }

    /** 관리 화면용 전체 메뉴 트리 (숨김 포함) */
    @Transactional(readOnly = true)
    public List<MenuResponse> getFullMenuTree() {
        return MenuResponse.toTree(menuMapper.selectAllMenus());
    }

    /** 메뉴 등록 */
    @Transactional
    public MenuResponse createMenu(MenuRequest request, String regUserId) {
        if (request.getMenuId() == null || request.getMenuId().isBlank()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "메뉴 ID는 필수 입력 항목입니다.");
        }
        if (menuMapper.selectByMenuId(request.getMenuId()) != null) {
            throw new BusinessException(HttpStatus.CONFLICT, "이미 존재하는 메뉴 ID입니다.");
        }

        Menu menu = new Menu();
        menu.setMenuId(request.getMenuId());
        applyRequest(menu, request);
        menu.setRegUserId(regUserId);

        if (menu.getMenuLvl() == null) {
            menu.setMenuLvl(calculateLvl(menu.getUpperMenuId()));
        }

        menuMapper.insertMenu(menu);
        return new MenuResponse(menu);
    }

    /** 메뉴 수정 */
    @Transactional
    public MenuResponse updateMenu(String menuId, MenuRequest request, String modUserId) {
        Menu menu = menuMapper.selectByMenuId(menuId);
        if (menu == null) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "메뉴를 찾을 수 없습니다.");
        }

        applyRequest(menu, request);
        menu.setModUserId(modUserId);
        menu.setMenuLvl(calculateLvl(menu.getUpperMenuId()));

        menuMapper.updateMenu(menu);
        return new MenuResponse(menu);
    }

    /** 메뉴 삭제 (하위 메뉴 존재 시 차단) */
    @Transactional
    public void deleteMenu(String menuId) {
        Menu menu = menuMapper.selectByMenuId(menuId);
        if (menu == null) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "메뉴를 찾을 수 없습니다.");
        }
        if (menuMapper.countChildren(menuId) > 0) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "하위 메뉴가 존재하는 메뉴는 삭제할 수 없습니다.");
        }

        roleMenuMapper.deleteByMenuId(menuId);
        menuMapper.deleteMenu(menuId);
    }



    // ------------------------------------------------------------------
    // 내부 유틸
    // ------------------------------------------------------------------

    private void applyRequest(Menu menu, MenuRequest r) {
        if (r.getUpperMenuId() != null) menu.setUpperMenuId(r.getUpperMenuId().isBlank() ? null : r.getUpperMenuId());
        if (r.getMenuNm() != null) menu.setMenuNm(r.getMenuNm());
        if (r.getMenuUrl() != null) menu.setMenuUrl(r.getMenuUrl());
        if (r.getIconClass() != null) menu.setIconClass(r.getIconClass());
        if (r.getSortOrd() != null) menu.setSortOrd(r.getSortOrd());
        if (r.getTargetType() != null) menu.setTargetType(r.getTargetType());
        if (r.getDispYn() != null) menu.setDispYn(r.getDispYn());
        if (r.getUseYn() != null) menu.setUseYn(r.getUseYn());

        if (menu.getSortOrd() == null) menu.setSortOrd(1);
        if (menu.getTargetType() == null) menu.setTargetType("_SELF");
        if (menu.getDispYn() == null) menu.setDispYn("Y");
        if (menu.getUseYn() == null) menu.setUseYn("Y");
    }

    private int calculateLvl(String upperMenuId) {
        if (upperMenuId == null || upperMenuId.isBlank()) {
            return 1;
        }
        Menu upper = menuMapper.selectByMenuId(upperMenuId);
        return upper != null && upper.getMenuLvl() != null ? upper.getMenuLvl() + 1 : 2;
    }
}
