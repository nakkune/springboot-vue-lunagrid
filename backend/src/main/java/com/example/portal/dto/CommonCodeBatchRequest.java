package com.example.portal.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * 그리드 일괄 저장 요청 DTO (추가, 수정, 삭제)
 */
@Data
public class CommonCodeBatchRequest<T> {
    private List<T> created = new ArrayList<>();
    private List<T> updated = new ArrayList<>();
    private List<T> deleted = new ArrayList<>();
}
