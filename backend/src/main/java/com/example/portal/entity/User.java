package com.example.portal.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** TB_COM_USER 매핑 모델 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    private String userId;
    private String userNm;
    private String pwdHash;
    private String pwdSalt; // BCrypt 사용 시 null 유지
    private String email;
    private String telNo;
    private String deptCd;
    private String positionCd;
    @Builder.Default
    private String acctStatCd = "01"; // 01:정상, 02:잠김, 03:휴면, 09:탈퇴
    @Builder.Default
    private Integer pwdFailCnt = 0;
    private LocalDateTime pwdChgDt;
    private LocalDateTime lastLoginDt;
    private String lastLoginIp;
    private LocalDateTime lockDt;
    @Builder.Default
    private String useYn = "Y";
    private String regUserId;
    @Builder.Default
    private LocalDateTime regDt = LocalDateTime.now();
    private String modUserId;
    private LocalDateTime modDt;
}
