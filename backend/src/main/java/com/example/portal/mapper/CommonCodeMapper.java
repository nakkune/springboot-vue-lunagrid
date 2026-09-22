package com.example.portal.mapper;

import com.example.portal.entity.CommonDetailCode;
import com.example.portal.entity.CommonGroupCode;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CommonCodeMapper {

    // 그룹 코드
    List<CommonGroupCode> selectGroupCodes(@Param("grpCd") String grpCd,
                                           @Param("grpCdNm") String grpCdNm,
                                           @Param("useYn") String useYn);

    CommonGroupCode selectGroupCodeByCd(@Param("grpCd") String grpCd);

    int countGroupCodeByCd(@Param("grpCd") String grpCd);

    int insertGroupCode(CommonGroupCode groupCode);

    int updateGroupCode(CommonGroupCode groupCode);

    int deleteGroupCode(@Param("grpCd") String grpCd);

    // 상세 코드
    List<CommonDetailCode> selectDetailCodes(@Param("grpCd") String grpCd,
                                             @Param("useYn") String useYn);

    CommonDetailCode selectDetailCodeByPk(@Param("grpCd") String grpCd,
                                          @Param("dtlCd") String dtlCd);

    int countDetailCodeByPk(@Param("grpCd") String grpCd, @Param("dtlCd") String dtlCd);

    int insertDetailCode(CommonDetailCode detailCode);

    int updateDetailCode(CommonDetailCode detailCode);

    int deleteDetailCode(@Param("grpCd") String grpCd, @Param("dtlCd") String dtlCd);

    // 특정 그룹 코드에 속한 모든 상세 코드 일괄 삭제 (선삭제용)
    int deleteDetailsByGrpCd(@Param("grpCd") String grpCd);
}
