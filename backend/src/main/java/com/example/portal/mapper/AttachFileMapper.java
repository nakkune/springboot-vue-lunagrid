package com.example.portal.mapper;

import com.example.portal.entity.AttachFile;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AttachFileMapper {

    /** 그룹별 파일 목록 조회 */
    List<AttachFile> selectByGrpId(@Param("atchFileGrpId") String atchFileGrpId);

    /** 파일 등록 */
    int insertFile(AttachFile file);

    /** 파일 Soft Delete */
    int deleteFile(@Param("atchFileGrpId") String atchFileGrpId, @Param("fileSeq") Integer fileSeq);

    /** 그룹 전체 삭제 */
    int deleteByGrpId(@Param("atchFileGrpId") String atchFileGrpId);

    /** 다운로드 횟수 증가 */
    int incrementDownCnt(@Param("atchFileGrpId") String atchFileGrpId, @Param("fileSeq") Integer fileSeq);
}
