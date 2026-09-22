package com.example.portal.mapper;

import com.example.portal.entity.LoginLog;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface LoginLogMapper {

    int insertLoginLog(LoginLog loginLog);
}
