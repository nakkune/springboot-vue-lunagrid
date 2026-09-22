package com.example.portal.mapper;

import com.example.portal.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {

    User selectByUserId(@Param("userId") String userId);

    int countByUserId(@Param("userId") String userId);

    int insertUser(User user);

    /** 동적 UPDATE (null 필드는 제외, MOD_DT 는 항상 SYSDATE) */
    int updateUser(User user);
}
