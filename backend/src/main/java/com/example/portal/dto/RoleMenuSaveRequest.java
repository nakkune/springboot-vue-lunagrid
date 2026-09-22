package com.example.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/** 역할별 메뉴 권한 저장 요청 DTO (전달된 메뉴로 전체 교체, null/빈 목록 = 전체 해제) */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleMenuSaveRequest {
    private List<String> menuIds;
}
