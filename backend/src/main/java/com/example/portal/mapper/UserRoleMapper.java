package com.example.portal.mapper;

import com.example.portal.entity.UserRole;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserRoleMapper {

    List<UserRole> selectByUserId(@Param("userId") String userId);

    int insertUserRole(UserRole userRole);
}
