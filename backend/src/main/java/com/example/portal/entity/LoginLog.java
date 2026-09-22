package com.example.portal.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** TB_COM_LOGIN_LOG 매핑 모델 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginLog {
    private Long logSeq;
    private String userId;
    @Builder.Default
    private LocalDateTime loginDt = LocalDateTime.now();
    private String loginIp;
    private String loginSuccYn;
    private String failRsnCd;
    private String userAgent;
}
