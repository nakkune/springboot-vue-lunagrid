package com.example.portal.mapper;

import com.example.portal.entity.MenuLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MenuLogMapper {

    int insertMenuLog(MenuLog menuLog);

    List<MenuLog> selectMenuLogs(@Param("userId") String userId,
                                  @Param("menuId") String menuId,
                                  @Param("userIp") String userIp,
                                  @Param("startDt") String startDt,
                                  @Param("endDt") String endDt,
                                  @Param("offset") int offset,
                                  @Param("pageSize") int pageSize);

    int countMenuLogs(@Param("userId") String userId,
                       @Param("menuId") String menuId,
                       @Param("userIp") String userIp,
                       @Param("startDt") String startDt,
                       @Param("endDt") String endDt);
}
