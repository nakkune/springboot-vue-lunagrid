package com.example.portal.mapper;

import com.example.portal.entity.MenuGrid;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 메뉴설정(루나그리드) 전용 MyBatis 매퍼 인터페이스
 */
@Mapper
public interface MenuGridMapper {

    /**
     * 그리드용 전체 메뉴 목록 조회 (정렬: 레벨, 정렬순서)
     */
    List<MenuGrid> selectGridMenus();

    /**
     * 메뉴 ID로 단건 조회
     */
    MenuGrid selectByMenuId(@Param("menuId") String menuId);

    /**
     * 특정 메뉴의 하위 메뉴 개수 조회 (삭제 전 하위 존재 여부 체크용)
     */
    int countChildren(@Param("upperMenuId") String upperMenuId);

    /**
     * 그리드 신규 메뉴 등록
     */
    int insertGridMenu(MenuGrid menu);

    /**
     * 그리드 메뉴 정보 동적 수정
     */
    int updateGridMenu(MenuGrid menu);

    /**
     * 그리드 메뉴 삭제
     */
    int deleteGridMenu(@Param("menuId") String menuId);

    /**
     * 공통 그룹 코드에 해당하는 상세 코드 목록을 DB에서 조회 (USE_YN='Y' 조건)
     */
    List<com.example.portal.dto.MenuGridCodeResponse> selectCodesByGrpCd(@Param("grpCd") String grpCd);
}
