package com.example.portal.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 공통 상세 코드 엔티티 (TB_COM_DTL_CD)
 * 실제 DB 컬럼 매핑: GRP_CD, DTL_CD, DTL_CD_NM, DTL_CD_DESC, SORT_ORD, ATTR_VAL1~5, USE_YN, REG_USER_ID, REG_DT, MOD_USER_ID, MOD_DT
 */
@Data
public class CommonDetailCode {
    private String grpCd;
    private String dtlCd;
    private String dtlCdNm;
    private String dtlCdDesc;
    private Integer sortOrd;
    private String attrVal1;
    private String attrVal2;
    private String attrVal3;
    private String attrVal4;
    private String attrVal5;
    private String useYn;
    private String regUserId;
    private LocalDateTime regDt;
    private String modUserId;
    private LocalDateTime modDt;

    // 호환용 게터/세터
    public String getDtlNm() {
        return dtlCdNm;
    }

    public void setDtlNm(String dtlNm) {
        this.dtlCdNm = dtlNm;
    }

    public String getDtlDesc() {
        return dtlCdDesc;
    }

    public void setDtlDesc(String dtlDesc) {
        this.dtlCdDesc = dtlDesc;
    }

    public String getAttr1() {
        return attrVal1;
    }

    public void setAttr1(String attr1) {
        this.attrVal1 = attr1;
    }

    public String getAttr2() {
        return attrVal2;
    }

    public void setAttr2(String attr2) {
        this.attrVal2 = attr2;
    }

    public String getAttr3() {
        return attrVal3;
    }

    public void setAttr3(String attr3) {
        this.attrVal3 = attr3;
    }
}
