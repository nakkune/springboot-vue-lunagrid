package com.example.portal.mapper;

import com.example.portal.entity.BoardMaster;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BoardMasterMapper {

    List<BoardMaster> selectAll();

    List<BoardMaster> selectActive();

    BoardMaster selectByBbsId(@Param("bbsId") String bbsId);

    int insertBoardMaster(BoardMaster boardMaster);

    int updateBoardMaster(BoardMaster boardMaster);

    int deleteBoardMaster(@Param("bbsId") String bbsId);
}
