package com.example.portal.bootstrap;

import com.example.portal.entity.BoardMaster;
import com.example.portal.entity.Menu;
import com.example.portal.entity.Role;
import com.example.portal.entity.RoleMenu;
import com.example.portal.entity.User;
import com.example.portal.entity.UserRole;
import com.example.portal.mapper.BoardMasterMapper;
import com.example.portal.mapper.CommonCodeMapper;
import com.example.portal.mapper.MenuMapper;
import com.example.portal.mapper.RoleMenuMapper;
import com.example.portal.mapper.RoleMapper;
import com.example.portal.mapper.UserMapper;
import com.example.portal.mapper.UserRoleMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 기동 시 기준데이터 자동 등록 (항목별 존재 여부 확인 후 누락분만 INSERT → 멱등).
 * 예외가 발생해도 애플리케이션 기동은 막지 않는다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final RoleMapper roleMapper;
    private final UserMapper userMapper;
    private final UserRoleMapper userRoleMapper;
    private final MenuMapper menuMapper;
    private final RoleMenuMapper roleMenuMapper;
    private final BoardMasterMapper boardMasterMapper;
    private final BCryptPasswordEncoder passwordEncoder;
    private final CommonCodeMapper commonCodeMapper;
    private final javax.sql.DataSource dataSource;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        try {
            seedCommonCodeTables();
            seedRoles();
            seedUsers();
            seedBoards();
            seedMenus();
            seedCommonCodes();
        } catch (Exception e) {
            log.warn("기준데이터 시딩을 건너뜁니다. 사유: {}", e.getMessage());
        }
    }

    // ------------------------------------------------------------------
    // 역할
    // ------------------------------------------------------------------

    private void seedRoles() {
        ensureRole("ROLE_ADMIN", "시스템관리자", "전체 권한 보유", 1);
        ensureRole("ROLE_USER", "일반사용자", "조회 권한", 2);
    }

    private void ensureRole(String roleId, String roleNm, String roleDesc, int sortOrd) {
        if (roleMapper.selectByRoleId(roleId) != null) {
            return;
        }
        Role role = new Role();
        role.setRoleId(roleId);
        role.setRoleNm(roleNm);
        role.setRoleDesc(roleDesc);
        role.setSortOrd(sortOrd);
        role.setUseYn("Y");
        role.setRegUserId("SYSTEM");
        roleMapper.insertRole(role);
    }

    // ------------------------------------------------------------------
    // 사용자
    // ------------------------------------------------------------------

    private void seedUsers() {
        if (userMapper.countByUserId("admin") == 0) {
            User admin = newUser("admin", "admin123", "시스템관리자", "admin@example.com");
            userMapper.insertUser(admin);
            grantRole("admin", "ROLE_ADMIN");
        }
        if (userMapper.countByUserId("user") == 0) {
            User user = newUser("user", "user123", "일반사용자", "user@example.com");
            userMapper.insertUser(user);
            grantRole("user", "ROLE_USER");
        }
    }

    private User newUser(String userId, String rawPassword, String userNm, String email) {
        User user = new User();
        user.setUserId(userId);
        user.setUserNm(userNm);
        // BCrypt: 솔트가 해시 문자열에 포함되므로 PWD_SALT 는 null 유지
        user.setPwdHash(passwordEncoder.encode(rawPassword));
        user.setEmail(email);
        user.setAcctStatCd("01");
        user.setPwdFailCnt(0);
        user.setUseYn("Y");
        user.setRegUserId(userId);
        return user;
    }

    private void grantRole(String userId, String roleId) {
        UserRole userRole = new UserRole();
        userRole.setUserId(userId);
        userRole.setRoleId(roleId);
        userRole.setRegUserId(userId);
        userRoleMapper.insertUserRole(userRole);
    }

    // ------------------------------------------------------------------
    // 메뉴 (누락분만 추가 → 기존 운영 DB에도 신규 메뉴 자동 반영)
    // ------------------------------------------------------------------

    private void seedMenus() {
        createMenuIfAbsent(new SeedMenu("MNU_HOME_001", null, "대시보드", "/dashboard", 1, 1, "Dashboard"));
        createMenuIfAbsent(new SeedMenu("MNU_ORG_000", null, "조직관리", null, 1, 2, "Folder"));
        createMenuIfAbsent(new SeedMenu("MNU_ORG_001", "MNU_ORG_000", "회원관리", "/users", 2, 1, "User"));
        createMenuIfAbsent(new SeedMenu("MNU_BRD_001", null, "게시판", "/board", 1, 3, "Files"));
        createMenuIfAbsent(new SeedMenu("MNU_SYS_001", null, "시스템설정", "/settings", 1, 4, "Setting"));
        // 관리자 전용: 관리자 설정 > 메뉴설정 / 권한설정
        createMenuIfAbsent(new SeedMenu("MNU_ADM_000", null, "관리자 설정", null, 1, 5, "Tools"));
        createMenuIfAbsent(new SeedMenu("MNU_ADM_001", "MNU_ADM_000", "메뉴설정", "/menu-settings", 2, 1, "Operation"));
        createMenuIfAbsent(new SeedMenu("MNU_ADM_002", "MNU_ADM_000", "권한설정", "/role-settings", 2, 2, "Key"));
        createMenuIfAbsent(new SeedMenu("MNU_ADM_003", "MNU_ADM_000", "스케줄관리", "/batch-schedule", 2, 3, "Timer"));
        createMenuIfAbsent(new SeedMenu("MNU_ADM_004", "MNU_ADM_000", "로그조회", "/menu-logs", 2, 4, "Document"));
        createMenuIfAbsent(new SeedMenu("MNU_ADM_005", "MNU_ADM_000", "SQL스크립트", "/sql-scripts", 2, 5, "Tickets"));
        createMenuIfAbsent(new SeedMenu("MNU_ADM_006", "MNU_ADM_000", "로그조회(그리드)", "/menu-logs-grid", 2, 6, "DataBoard"));
        createMenuIfAbsent(new SeedMenu("MNU_ADM_007", "MNU_ADM_000", "공통코드관리", "/common-codes", 2, 7, "Collection"));
        createMenuIfAbsent(new SeedMenu("MNU_ADM_008", "MNU_ADM_000", "메뉴설정(그리드)", "/menu-settings-grid", 2, 8, "Grid"));

        // 역할별 권한 매핑 (기존 메뉴 + 신규 메뉴 모두 적용)
        grantMenuAuth("ROLE_ADMIN", true,
                "MNU_HOME_001", "MNU_ORG_000", "MNU_ORG_001", "MNU_BRD_001", "MNU_SYS_001",
                "MNU_ADM_000", "MNU_ADM_001", "MNU_ADM_002", "MNU_ADM_003", "MNU_ADM_004", "MNU_ADM_005", "MNU_ADM_006", "MNU_ADM_007", "MNU_ADM_008");
        grantMenuAuth("ROLE_USER", false,
                "MNU_HOME_001", "MNU_ORG_000", "MNU_ORG_001", "MNU_BRD_001", "MNU_SYS_001");
        // ※ ROLE_USER 에는 관리자 설정(MNU_ADM_*) 매핑 없음 → 일반 사용자에게 노출되지 않음
    }

    private void createMenuIfAbsent(SeedMenu seed) {
        if (menuMapper.selectByMenuId(seed.menuId()) != null) {
            return;
        }
        Menu menu = new Menu();
        menu.setMenuId(seed.menuId());
        menu.setUpperMenuId(seed.upperMenuId());
        menu.setMenuNm(seed.menuNm());
        menu.setMenuUrl(seed.menuUrl());
        menu.setMenuLvl(seed.menuLvl());
        menu.setSortOrd(seed.sortOrd());
        menu.setIconClass(seed.icon());
        menu.setTargetType("_SELF");
        menu.setDispYn("Y");
        menu.setUseYn("Y");
        menu.setRegUserId("admin");
        menuMapper.insertMenu(menu);
    }

    private void grantMenuAuth(String roleId, boolean fullAuth, String... menuIds) {
        for (String menuId : menuIds) {
            if (roleMenuMapper.countByRoleIdAndMenuId(roleId, menuId) > 0) {
                continue;
            }
            RoleMenu rm = new RoleMenu();
            rm.setRoleId(roleId);
            rm.setMenuId(menuId);
            rm.setAuthInqYn("Y");
            rm.setAuthRegYn(fullAuth ? "Y" : "N");
            rm.setAuthModYn(fullAuth ? "Y" : "N");
            rm.setAuthDelYn(fullAuth ? "Y" : "N");
            rm.setAuthExcYn(fullAuth ? "Y" : "N");
            rm.setAuthPrtYn(fullAuth ? "Y" : "N");
            rm.setRegUserId("admin");
            roleMenuMapper.insertRoleMenu(rm);
        }
    }

    // ------------------------------------------------------------------
    // 게시판 마스터 (누락분만 추가)
    // ------------------------------------------------------------------

    private void seedBoards() {
        ensureBoard("NOTICE", "공지사항", "시스템 운영 관련 공지를 확인하는 게시판입니다.", "NOTICE", "N");
        ensureBoard("FREE", "자유게시판", "자유로운 의견을 나누는 게시판입니다.", "NORMAL", "Y");
    }

    private void ensureBoard(String bbsId, String bbsNm, String bbsDesc, String typeCd, String replyYn) {
        if (boardMasterMapper.selectByBbsId(bbsId) != null) {
            return;
        }
        BoardMaster board = new BoardMaster();
        board.setBbsId(bbsId);
        board.setBbsNm(bbsNm);
        board.setBbsDesc(bbsDesc);
        board.setBbsTypeCd(typeCd);
        board.setReplyYn(replyYn);
        board.setRegUserId("SYSTEM");
        boardMasterMapper.insertBoardMaster(board);
    }

    private void seedCommonCodeTables() {
        try (java.sql.Connection conn = dataSource.getConnection();
             java.sql.Statement stmt = conn.createStatement()) {

            // 1. 공통 그룹 코드 테이블 (TB_COM_GRP_CD)
            try {
                stmt.execute("""
                    CREATE TABLE TB_COM_GRP_CD (
                        GRP_CD      VARCHAR2(30)    PRIMARY KEY,
                        GRP_CD_NM   VARCHAR2(100)   NOT NULL,
                        GRP_CD_DESC VARCHAR2(500),
                        SYS_DIV_CD  VARCHAR2(20)    DEFAULT 'COM',
                        USE_YN      CHAR(1)         DEFAULT 'Y' NOT NULL,
                        REG_USER_ID VARCHAR2(50),
                        REG_DT      TIMESTAMP       DEFAULT SYSDATE,
                        MOD_USER_ID VARCHAR2(50),
                        MOD_DT      TIMESTAMP
                    )
                """);
                log.info("TB_COM_GRP_CD 테이블이 자동 생성되었습니다.");
            } catch (Exception e) {
                // 이미 존재하거나 권한 이슈 시 무시
                log.debug("TB_COM_GRP_CD 테이블 생성 확인: {}", e.getMessage());
            }

            // 2. 공통 상세 코드 테이블 (TB_COM_DTL_CD)
            try {
                stmt.execute("""
                    CREATE TABLE TB_COM_DTL_CD (
                        GRP_CD      VARCHAR2(30)    NOT NULL,
                        DTL_CD      VARCHAR2(30)    NOT NULL,
                        DTL_NM      VARCHAR2(100)   NOT NULL,
                        DTL_DESC    VARCHAR2(500),
                        SORT_ORD    NUMBER          DEFAULT 1,
                        USE_YN      CHAR(1)         DEFAULT 'Y' NOT NULL,
                        ATTR1       VARCHAR2(100),
                        ATTR2       VARCHAR2(100),
                        ATTR3       VARCHAR2(100),
                        REG_USER_ID VARCHAR2(50),
                        REG_DT      TIMESTAMP       DEFAULT SYSDATE,
                        MOD_USER_ID VARCHAR2(50),
                        MOD_DT      TIMESTAMP,
                        CONSTRAINT PK_TB_COM_DTL_CD PRIMARY KEY (GRP_CD, DTL_CD)
                    )
                """);
                log.info("TB_COM_DTL_CD 테이블이 자동 생성되었습니다.");
            } catch (Exception e) {
                log.debug("TB_COM_DTL_CD 테이블 생성 확인: {}", e.getMessage());
            }
        } catch (Exception e) {
            log.warn("공통코드 테이블 확인 중 예외: {}", e.getMessage());
        }
    }

    private void seedCommonCodes() {
        try {
            // 그룹 1: USER_STATUS (회원 상태)
            if (commonCodeMapper.countGroupCodeByCd("USER_STATUS") == 0) {
                com.example.portal.entity.CommonGroupCode grp = new com.example.portal.entity.CommonGroupCode();
                grp.setGrpCd("USER_STATUS");
                grp.setGrpCdNm("회원 계정 상태");
                grp.setGrpCdDesc("사용자 계정 활성/비활성/잠금 등 상태 코드");
                grp.setSysDivCd("PORTAL");
                grp.setUseYn("Y");
                grp.setRegUserId("SYSTEM");
                commonCodeMapper.insertGroupCode(grp);

                ensureDetailCode("USER_STATUS", "01", "정상", "정상 활성 계정", 1, "Y", "#10b981", null, null);
                ensureDetailCode("USER_STATUS", "02", "휴면", "장기 미접속 휴면 계정", 2, "Y", "#f59e0b", null, null);
                ensureDetailCode("USER_STATUS", "03", "정지", "관리자에 의해 정지된 계정", 3, "Y", "#ef4444", null, null);
                ensureDetailCode("USER_STATUS", "09", "탈퇴", "회원 탈퇴 완료 계정", 4, "Y", "#6b7280", null, null);
            }

            // 그룹 2: MENU_TARGET (메뉴 열기 방식)
            if (commonCodeMapper.countGroupCodeByCd("MENU_TARGET") == 0) {
                com.example.portal.entity.CommonGroupCode grp = new com.example.portal.entity.CommonGroupCode();
                grp.setGrpCd("MENU_TARGET");
                grp.setGrpCdNm("메뉴 열기 타겟");
                grp.setGrpCdDesc("화면 이동 방식 (_SELF, _BLANK 등)");
                grp.setSysDivCd("PORTAL");
                grp.setUseYn("Y");
                grp.setRegUserId("SYSTEM");
                commonCodeMapper.insertGroupCode(grp);

                ensureDetailCode("MENU_TARGET", "_SELF", "현재 창", "현재 브라우저 탭에서 이동", 1, "Y", null, null, null);
                ensureDetailCode("MENU_TARGET", "_BLANK", "새 창/새 탭", "새 브라우저 탭에서 열기", 2, "Y", null, null, null);
            }

            // 그룹 3: BBS_TYPE (게시판 유형)
            if (commonCodeMapper.countGroupCodeByCd("BBS_TYPE") == 0) {
                com.example.portal.entity.CommonGroupCode grp = new com.example.portal.entity.CommonGroupCode();
                grp.setGrpCd("BBS_TYPE");
                grp.setGrpCdNm("게시판 유형");
                grp.setGrpCdDesc("공지사항, 일반, QnA, 갤러리 등");
                grp.setSysDivCd("PORTAL");
                grp.setUseYn("Y");
                grp.setRegUserId("SYSTEM");
                commonCodeMapper.insertGroupCode(grp);

                ensureDetailCode("BBS_TYPE", "NOTICE", "공지사항", "운영자 전용 공지 게시판", 1, "Y", "info", null, null);
                ensureDetailCode("BBS_TYPE", "NORMAL", "일반게시판", "자유로운 소통 게시판", 2, "Y", "general", null, null);
                ensureDetailCode("BBS_TYPE", "QNA", "질문답변", "질문 및 답변 게시판", 3, "Y", "help", null, null);
            }
        } catch (Exception e) {
            log.warn("공통코드 샘플 데이터 시딩 중 예외: {}", e.getMessage());
        }
    }

    private void ensureDetailCode(String grpCd, String dtlCd, String dtlNm, String desc, int sortOrd, String useYn, String attr1, String attr2, String attr3) {
        if (commonCodeMapper.countDetailCodeByPk(grpCd, dtlCd) == 0) {
            com.example.portal.entity.CommonDetailCode dtl = new com.example.portal.entity.CommonDetailCode();
            dtl.setGrpCd(grpCd);
            dtl.setDtlCd(dtlCd);
            dtl.setDtlNm(dtlNm);
            dtl.setDtlDesc(desc);
            dtl.setSortOrd(sortOrd);
            dtl.setUseYn(useYn);
            dtl.setAttr1(attr1);
            dtl.setAttr2(attr2);
            dtl.setAttr3(attr3);
            dtl.setRegUserId("SYSTEM");
            commonCodeMapper.insertDetailCode(dtl);
        }
    }

    /** 시드용 메뉴 정의 레코드 */
    private record SeedMenu(String menuId, String upperMenuId, String menuNm, String menuUrl,
                            int menuLvl, int sortOrd, String icon) {
    }
}
