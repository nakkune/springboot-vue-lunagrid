package com.example.portal.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** TB_COM_ROLE_MENU 매핑 모델 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleMenu {
    private String roleId;
    private String menuId;
    @Builder.Default
    private String authInqYn = "N";
    @Builder.Default
    private String authRegYn = "N";
    @Builder.Default
    private String authModYn = "N";
    @Builder.Default
    private String authDelYn = "N";
    @Builder.Default
    private String authExcYn = "N";
    @Builder.Default
    private String authPrtYn = "N";
    private String regUserId;
    @Builder.Default
    private LocalDateTime regDt = LocalDateTime.now();
}
