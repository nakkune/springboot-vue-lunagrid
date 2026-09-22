package com.example.portal.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** TB_COM_ROLE 매핑 모델 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {
    private String roleId;
    private String roleNm;
    private String roleDesc;
    private Integer sortOrd;
    @Builder.Default
    private String useYn = "Y";
    private String regUserId;
    @Builder.Default
    private LocalDateTime regDt = LocalDateTime.now();
    private String modUserId;
    private LocalDateTime modDt;
}
