package com.example.portal.mapper;

import com.example.portal.entity.RoleMenu;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RoleMenuMapper {

    List<RoleMenu> selectByRoleIds(@Param("roleIds") List<String> roleIds);

    List<RoleMenu> selectByRoleId(@Param("roleId") String roleId);

    int countByRoleIdAndMenuId(@Param("roleId") String roleId, @Param("menuId") String menuId);

    int insertRoleMenu(RoleMenu roleMenu);

    int deleteByMenuId(@Param("menuId") String menuId);

    int deleteByRoleId(@Param("roleId") String roleId);
}
