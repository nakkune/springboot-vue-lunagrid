package com.example.portal.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 공통 그룹 코드 엔티티 (TB_COM_GRP_CD)
 * 실제 DB 컬럼 매핑: GRP_CD, GRP_CD_NM, GRP_CD_DESC, SYS_DIV_CD, USE_YN, REG_USER_ID, REG_DT, MOD_USER_ID, MOD_DT
 */
@Data
public class CommonGroupCode {
    private String grpCd;
    private String grpCdNm;
    private String grpCdDesc;
    private String sysDivCd;
    private String useYn;
    private String regUserId;
    private LocalDateTime regDt;
    private String modUserId;
    private LocalDateTime modDt;

    // 호환용 게터/세터
    public String getGrpNm() {
        return grpCdNm;
    }

    public void setGrpNm(String grpNm) {
        this.grpCdNm = grpNm;
    }

    public String getGrpDesc() {
        return grpCdDesc;
    }

    public void setGrpDesc(String grpDesc) {
        this.grpCdDesc = grpDesc;
    }
}
