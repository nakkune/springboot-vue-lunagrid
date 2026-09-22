package com.example.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * 메뉴설정(루나그리드) 일괄 저장 요청 DTO (추가, 수정, 삭제)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuGridBatchRequest {
    @Builder.Default
    private List<MenuGridRowRequest> created = new ArrayList<>();
    @Builder.Default
    private List<MenuGridRowRequest> updated = new ArrayList<>();
    @Builder.Default
    private List<MenuGridRowRequest> deleted = new ArrayList<>();
}
