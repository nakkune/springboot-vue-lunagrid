package com.example.portal.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * 메뉴 그리드 일괄 저장 요청 DTO (추가, 수정, 삭제)
 */
@Data
public class MenuBatchRequest {
    private List<MenuRequest> created = new ArrayList<>();
    private List<MenuRequest> updated = new ArrayList<>();
    private List<MenuRequest> deleted = new ArrayList<>();
}
