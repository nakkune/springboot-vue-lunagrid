package com.example.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 메뉴설정(루나그리드) 공통코드 조회 응답 DTO (TB_COM_DTL_CD 매핑)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuGridCodeResponse {
    private String code;
    private String codeName;
    private Integer sortOrd;
}
