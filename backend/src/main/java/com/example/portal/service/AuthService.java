package com.example.portal.service;

import com.example.portal.dto.AuthResponse;
import com.example.portal.dto.LoginRequest;
import com.example.portal.dto.SignupRequest;
import com.example.portal.dto.UserResponse;
import com.example.portal.entity.LoginLog;
import com.example.portal.entity.Role;
import com.example.portal.entity.User;
import com.example.portal.entity.UserRole;
import com.example.portal.exception.BusinessException;
import com.example.portal.mapper.LoginLogMapper;
import com.example.portal.mapper.RoleMapper;
import com.example.portal.mapper.UserMapper;
import com.example.portal.mapper.UserRoleMapper;
import com.example.portal.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int MAX_PWD_FAIL_CNT = 5;

    private final UserMapper userMapper;
    private final RoleMapper roleMapper;
    private final UserRoleMapper userRoleMapper;
    private final LoginLogMapper loginLogMapper;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public UserResponse signup(SignupRequest request) {
        if (userMapper.countByUserId(request.getUserId()) > 0) {
            throw new BusinessException(HttpStatus.CONFLICT, "이미 존재하는 아이디입니다.");
        }

        User user = new User();
        user.setUserId(request.getUserId());
        user.setUserNm(request.getUserNm());
        user.setPwdHash(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setAcctStatCd("01");
        user.setRegUserId(request.getUserId());
        user.setUseYn("Y");
        user.setPwdFailCnt(0);
        userMapper.insertUser(user);

        ensureRole("ROLE_USER", "일반사용자", 2);
        grantRole(user.getUserId(), "ROLE_USER");

        return new UserResponse(user.getUserId(), user.getUserNm(), user.getEmail(), null, null, List.of("ROLE_USER"));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String userId = request.getUserId();
        String password = request.getPassword();

        HttpServletRequest servletRequest = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        String ip = servletRequest.getRemoteAddr();
        String userAgent = servletRequest.getHeader("User-Agent");
        if (userAgent != null && userAgent.length() > 500) {
            userAgent = userAgent.substring(0, 500);
        }

        User user = userMapper.selectByUserId(userId);

        if (user == null) {
            writeLoginLog(userId, ip, userAgent, "N", "USER_NOT_FOUND");
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 일치하지 않습니다.");
        }

        // 계정 상태 체크
        checkAccountStatus(user, ip, userAgent);

        if (!passwordEncoder.matches(password, user.getPwdHash())) {
            int failCnt = user.getPwdFailCnt() + 1;
            String failRsn = "PWD_MISMATCH";
            String msg = "아이디 또는 비밀번호가 일치하지 않습니다.";

            if (failCnt >= MAX_PWD_FAIL_CNT) {
                user.setAcctStatCd("02"); // 잠김
                user.setLockDt(LocalDateTime.now());
                failRsn = "ACCT_LOCKED";
                msg = "비밀번호가 " + MAX_PWD_FAIL_CNT + "회 연속 틀려 계정이 잠겼습니다.";
            }
            user.setPwdFailCnt(failCnt);
            userMapper.updateUser(user);

            writeLoginLog(userId, ip, userAgent, "N", failRsn);
            throw new BusinessException(HttpStatus.UNAUTHORIZED, msg);
        }

        // 로그인 성공 처리
        user.setPwdFailCnt(0);
        user.setLastLoginDt(LocalDateTime.now());
        user.setLastLoginIp(ip);
        userMapper.updateUser(user);

        writeLoginLog(userId, ip, userAgent, "Y", null);

        List<String> roles = userRoleMapper.selectByUserId(userId).stream()
                .map(UserRole::getRoleId)
                .collect(Collectors.toList());

        String token = jwtTokenProvider.createToken(userId, roles);
        UserResponse userResponse = new UserResponse(user.getUserId(), user.getUserNm(),
                user.getEmail(), user.getTelNo(), user.getDeptCd(), roles);

        return new AuthResponse(token, userResponse);
    }

    public UserResponse getMe(String userId) {
        User user = userMapper.selectByUserId(userId);
        if (user == null) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다.");
        }

        List<String> roles = userRoleMapper.selectByUserId(userId).stream()
                .map(UserRole::getRoleId)
                .collect(Collectors.toList());

        return new UserResponse(user.getUserId(), user.getUserNm(), user.getEmail(),
                user.getTelNo(), user.getDeptCd(), roles);
    }

    // ------------------------------------------------------------------
    // 내부 유틸
    // ------------------------------------------------------------------

    private void checkAccountStatus(User user, String ip, String userAgent) {
        if ("N".equals(user.getUseYn())) {
            writeLoginLog(user.getUserId(), ip, userAgent, "N", "USE_YN_N");
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "사용 중지된 계정입니다.");
        }

        switch (user.getAcctStatCd()) {
            case "02":
                writeLoginLog(user.getUserId(), ip, userAgent, "N", "ACCT_LOCKED");
                throw new BusinessException(HttpStatus.UNAUTHORIZED, "잠긴 계정입니다. 관리자에게 문의하세요.");
            case "03":
                writeLoginLog(user.getUserId(), ip, userAgent, "N", "ACCT_DORMANT");
                throw new BusinessException(HttpStatus.UNAUTHORIZED, "휴면 계정입니다.");
            case "09":
                writeLoginLog(user.getUserId(), ip, userAgent, "N", "ACCT_WITHDRAWN");
                throw new BusinessException(HttpStatus.UNAUTHORIZED, "탈퇴한 계정입니다.");
            default:
                break; // 01 정상
        }
    }

    private void writeLoginLog(String userId, String ip, String userAgent, String succYn, String failRsnCd) {
        LoginLog log = new LoginLog();
        log.setUserId(userId);
        log.setLoginIp(ip);
        log.setUserAgent(userAgent);
        log.setLoginSuccYn(succYn);
        log.setFailRsnCd(failRsnCd);
        loginLogMapper.insertLoginLog(log);
    }

    private void ensureRole(String roleId, String roleNm, int sortOrd) {
        if (roleMapper.selectByRoleId(roleId) == null) {
            Role role = new Role();
            role.setRoleId(roleId);
            role.setRoleNm(roleNm);
            role.setSortOrd(sortOrd);
            role.setUseYn("Y");
            role.setRegUserId("SYSTEM");
            roleMapper.insertRole(role);
        }
    }

    private void grantRole(String userId, String roleId) {
        UserRole userRole = new UserRole();
        userRole.setUserId(userId);
        userRole.setRoleId(roleId);
        userRole.setRegUserId(userId);
        userRoleMapper.insertUserRole(userRole);
    }
}
