package com.example.portal.mapper;

import com.example.portal.entity.Menu;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MenuMapper {

    /** 좌측 메뉴용: 노출(Y) + 활성(Y) 메뉴만 레벨/정렬순서순 */
    List<Menu> selectVisibleMenus();

    /** 관리 화면용: 전체 메뉴 (숨김 포함) */
    List<Menu> selectAllMenus();

    Menu selectByMenuId(@Param("menuId") String menuId);

    int countChildren(@Param("upperMenuId") String upperMenuId);

    int insertMenu(Menu menu);

    /** 동적 UPDATE (null 필드는 제외, MOD_DT 는 항상 SYSDATE) */
    int updateMenu(Menu menu);

    int deleteMenu(@Param("menuId") String menuId);
}
