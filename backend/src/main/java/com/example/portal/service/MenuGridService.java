package com.example.portal.service;

import com.example.portal.dto.MenuGridBatchRequest;
import com.example.portal.dto.MenuGridCodeResponse;
import com.example.portal.dto.MenuGridResponse;
import com.example.portal.dto.MenuGridRowRequest;
import com.example.portal.entity.MenuGrid;
import com.example.portal.exception.BusinessException;
import com.example.portal.mapper.MenuGridMapper;
import com.example.portal.mapper.RoleMenuMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 메뉴설정 (루나그리드) 전용 비즈니스 로직 서비스.
 * 그리드 인라인 편집 데이터를 바탕으로 생성, 수정, 삭제의 일괄 트랜잭션 처리를 담당합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MenuGridService {

    private final MenuGridMapper menuGridMapper;
    private final RoleMenuMapper roleMenuMapper;

    /**
     * 공통 그룹 코드에 해당하는 상세 코드 목록을 DB에서 조회
     */
    @Transactional(readOnly = true)
    public List<MenuGridCodeResponse> getCodesByGrpCd(String grpCd) {
        return menuGridMapper.selectCodesByGrpCd(grpCd);
    }

    /**
     * 그리드용 전체 메뉴 목록 조회 (트리 구조)
     */
    @Transactional(readOnly = true)
    public List<MenuGridResponse> getGridMenuTree() {
        return MenuGridResponse.toTree(menuGridMapper.selectGridMenus());
    }

    /**
     * 그리드 일괄 저장 (삭제 -> 등록 -> 수정)
     */
    @Transactional
    public void saveBatch(MenuGridBatchRequest batchRequest, String userId) {
        if (batchRequest == null) {
            return;
        }

        // 1. 신규 등록 대상 내 menuId 중복 사전 검사
        if (batchRequest.getCreated() != null) {
            java.util.Set<String> newIds = new java.util.HashSet<>();
            for (MenuGridRowRequest item : batchRequest.getCreated()) {
                if (item.getMenuId() != null && !item.getMenuId().isBlank()) {
                    String mid = item.getMenuId().trim();
                    if (!newIds.add(mid)) {
                        throw new BusinessException(HttpStatus.BAD_REQUEST, "저장 요청에 중복된 메뉴 ID가 포함되어 있습니다: " + mid);
                    }
                }
            }
        }

        // 2. 삭제 처리 (선택된 행 삭제)
        if (batchRequest.getDeleted() != null) {
            for (MenuGridRowRequest item : batchRequest.getDeleted()) {
                if (item.getMenuId() != null && !item.getMenuId().isBlank()) {
                    deleteMenu(item.getMenuId().trim());
                }
            }
        }

        // 3. 신규 등록 처리
        if (batchRequest.getCreated() != null) {
            for (MenuGridRowRequest item : batchRequest.getCreated()) {
                createMenu(item, userId);
            }
        }

        // 4. 수정 처리
        if (batchRequest.getUpdated() != null) {
            for (MenuGridRowRequest item : batchRequest.getUpdated()) {
                if (item.getMenuId() != null && !item.getMenuId().isBlank()) {
                    updateMenu(item.getMenuId().trim(), item, userId);
                }
            }
        }
    }

    /**
     * 단일 메뉴 등록
     */
    @Transactional
    public MenuGridResponse createMenu(MenuGridRowRequest request, String regUserId) {
        if (request.getMenuId() == null || request.getMenuId().isBlank()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "메뉴 ID는 필수 입력 항목입니다.");
        }

        String menuId = request.getMenuId().trim();
        if (menuGridMapper.selectByMenuId(menuId) != null) {
            throw new BusinessException(HttpStatus.CONFLICT, "이미 존재하는 메뉴 ID입니다: " + menuId);
        }

        MenuGrid menu = new MenuGrid();
        menu.setMenuId(menuId);
        applyRequest(menu, request);
        menu.setRegUserId(regUserId);

        if (menu.getMenuLvl() == null) {
            menu.setMenuLvl(calculateLvl(menu.getUpperMenuId()));
        }

        menuGridMapper.insertGridMenu(menu);
        return new MenuGridResponse(menu);
    }

    /**
     * 단일 메뉴 수정
     */
    @Transactional
    public MenuGridResponse updateMenu(String menuId, MenuGridRowRequest request, String modUserId) {
        MenuGrid menu = menuGridMapper.selectByMenuId(menuId);
        if (menu == null) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "메뉴를 찾을 수 없습니다: " + menuId);
        }

        applyRequest(menu, request);
        menu.setModUserId(modUserId);
        menu.setMenuLvl(calculateLvl(menu.getUpperMenuId()));

        menuGridMapper.updateGridMenu(menu);
        return new MenuGridResponse(menu);
    }

    /**
     * 단일 메뉴 삭제 (하위 메뉴 존재 시 차단, 역할 매핑 함께 삭제)
     */
    @Transactional
    public void deleteMenu(String menuId) {
        MenuGrid menu = menuGridMapper.selectByMenuId(menuId);
        if (menu == null) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "삭제할 메뉴를 찾을 수 없습니다: " + menuId);
        }
        if (menuGridMapper.countChildren(menuId) > 0) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "하위 메뉴가 존재하는 메뉴는 삭제할 수 없습니다. (ID: " + menuId + ")");
        }

        roleMenuMapper.deleteByMenuId(menuId);
        menuGridMapper.deleteGridMenu(menuId);
    }

    // ------------------------------------------------------------------
    // 내부 헬퍼 메서드
    // ------------------------------------------------------------------

    private void applyRequest(MenuGrid menu, MenuGridRowRequest r) {
        if (r.getUpperMenuId() != null) {
            menu.setUpperMenuId(r.getUpperMenuId().isBlank() ? null : r.getUpperMenuId().trim());
        }
        if (r.getMenuNm() != null) menu.setMenuNm(r.getMenuNm().trim());
        if (r.getMenuUrl() != null) menu.setMenuUrl(r.getMenuUrl().trim());
        if (r.getIconClass() != null) menu.setIconClass(r.getIconClass().trim());
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
        MenuGrid upper = menuGridMapper.selectByMenuId(upperMenuId.trim());
        return upper != null && upper.getMenuLvl() != null ? upper.getMenuLvl() + 1 : 2;
    }
}
