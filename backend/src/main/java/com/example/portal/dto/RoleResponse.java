package com.example.portal.dto;

import com.example.portal.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 역할 응답 DTO */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleResponse {
    private String roleId;
    private String roleNm;
    private String roleDesc;
    private Integer sortOrd;

    public RoleResponse(Role role) {
        this.roleId = role.getRoleId();
        this.roleNm = role.getRoleNm();
        this.roleDesc = role.getRoleDesc();
        this.sortOrd = role.getSortOrd();
    }
}
