package com.example.portal.mapper;

import com.example.portal.entity.Role;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RoleMapper {

    Role selectByRoleId(@Param("roleId") String roleId);

    List<Role> selectAll();

    int insertRole(Role role);
}
