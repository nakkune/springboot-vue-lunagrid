package com.example.portal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 메뉴 등록/수정 요청 DTO.
 * - 등록(POST): menuId 필수
 * - 수정(PUT): menuId 는 path 파라미터 사용 (body 의 menuId 무시)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuRequest {

    @Pattern(regexp = "^[A-Za-z0-9_]{2,30}$", message = "메뉴 ID는 영문/숫자/언더스코어 2~30자입니다.")
    private String menuId;

    private String upperMenuId; // null 이면 최상위

    @NotBlank(message = "메뉴명은 필수 입력 항목입니다.")
    @Size(max = 100, message = "메뉴명은 100자 이하입니다.")
    private String menuNm;

    private String menuUrl;
    private String iconClass;
    private Integer sortOrd;      // null 이면 1
    private String targetType;    // _SELF / _BLANK / MODAL, null 이면 _SELF
    private String dispYn;        // Y/N, null 이면 Y
    private String useYn;         // Y/N, null 이면 Y
}
