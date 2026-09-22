package com.example.portal.service;

import com.example.portal.dto.RoleResponse;
import com.example.portal.entity.Role;
import com.example.portal.entity.RoleMenu;
import com.example.portal.exception.BusinessException;
import com.example.portal.mapper.MenuMapper;
import com.example.portal.mapper.RoleMenuMapper;
import com.example.portal.mapper.RoleMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoleMenuService {

    private final RoleMapper roleMapper;
    private final RoleMenuMapper roleMenuMapper;
    private final MenuMapper menuMapper;

    @Transactional(readOnly = true)
    public List<RoleResponse> getRoles() {
        return roleMapper.selectAll().stream()
                .map(RoleResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getMenuIds(String roleId) {
        requireRole(roleId);
        return roleMenuMapper.selectByRoleId(roleId).stream()
                .map(RoleMenu::getMenuId)
                .collect(Collectors.toList());
    }

    /**
     * 역할의 메뉴 매핑을 전달된 목록으로 전체 교체.
     * 존재하지 않는 메뉴 ID는 조용히 제외(잘못된 키로 인한 저장 실패 방지).
     */
    @Transactional
    public void saveRoleMenus(String roleId, List<String> menuIds, String regUserId) {
        requireRole(roleId);

        List<String> validIds = menuIds == null ? List.of()
                : menuIds.stream()
                        .filter(id -> id != null && !id.isBlank())
                        .distinct()
                        .filter(id -> menuMapper.selectByMenuId(id) != null)
                        .collect(Collectors.toList());

        roleMenuMapper.deleteByRoleId(roleId);
        for (String menuId : validIds) {
            RoleMenu rm = new RoleMenu();
            rm.setRoleId(roleId);
            rm.setMenuId(menuId);
            rm.setAuthInqYn("Y");
            rm.setAuthRegYn("N");
            rm.setAuthModYn("N");
            rm.setAuthDelYn("N");
            rm.setAuthExcYn("N");
            rm.setAuthPrtYn("N");
            rm.setRegUserId(regUserId);
            roleMenuMapper.insertRoleMenu(rm);
        }
    }

    private void requireRole(String roleId) {
        if (roleMapper.selectByRoleId(roleId) == null) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "역할을 찾을 수 없습니다.");
        }
    }
}
