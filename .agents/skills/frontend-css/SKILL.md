---
name: frontend-css
description: >-
  현재 frontend 폴더의 모든 CSS 스타일 작성 및 수정 작업에 사용합니다.
  개별 *.vue 컴포넌트 파일 내에 <style> 태그를 작성하는 것을 금지하며,
  모든 CSS 스타일을 단일 공통 CSS 파일(frontend/src/styles/common.css)에 중앙 집중하여 관리하는 규칙을 안내합니다.
---

# Frontend 공통 CSS 관리 스킬 (Frontend Common CSS Guide)

## 개요
이 프로젝트(`frontend/`)의 모든 컴포넌트와 뷰 스타일은 단일 공통 파일에 통합되어 관리됩니다.
- **공통 CSS 파일 경로**: [`frontend/src/styles/common.css`](file:///home/knh11/spring/springboot/frontend/src/styles/common.css)
- **전역 로드 위치**: [`frontend/src/main.js`](file:///home/knh11/spring/springboot/frontend/src/main.js) (`import './styles/common.css'`)

---

## 핵심 지침 (Core Rules)

### 1. `*.vue` 파일 내 `<style>` 태그 작성 절대 금지
- 신규 Vue 컴포넌트 생성 또는 기존 컴포넌트 수정 시, 파일 내에 `<style>` 또는 `<style scoped>` 태그를 추가하지 않습니다.
- 모든 스타일링 규칙은 반드시 [`frontend/src/styles/common.css`](file:///home/knh11/spring/springboot/frontend/src/styles/common.css)에 추가/수정합니다.

### 2. 루트 컨테이너 클래스 기반 네임스페이스 격리
- 스타일이 전역 파일로 통합되어 있으므로, 컴포넌트 간 스타일 간섭 및 클래스명 충돌을 방지하기 위해 각 컴포넌트의 루트 엘리먼트에 고유 클래스를 지정하고 이를 셀렉터 프리픽스로 사용합니다.
- 주요 화면별 루트 컨테이너 클래스:
  - 공통 코드 관리: `.common-code-container`
  - 메뉴 로그 조회 (테이블/그리드): `.menu-log-container`, `.menu-log-grid-container`
  - 게시판: `.board-list-page`, `.board-detail-page`, `.board-write-page`
  - 메뉴/권한 설정: `.menu-manage-container`, `.role-menu-container`
  - 스케줄/SQL: `.batch-schedule-container`, `.sql-script-container`
  - 대시보드: `.dashboard-container`
  - 인증 화면: `.auth-card`, `.auth-page`
  - 다이얼로그: `.menu-edit-dialog`, `.batch-job-dialog`

### 3. 표준 CSS 문법 준수 (Vue 전용 셀렉터 사용 금지)
- `common.css`는 표준 CSS 파일이므로 Vue scoped 전용 문법인 `:deep()` 또는 `v-deep`을 사용하지 않고 표준 하위 셀렉터를 사용합니다.
  - 예: `:deep(.el-table__cell)` (X) $\rightarrow$ `.board-table .el-table__cell` (O)

### 4. `common.css` 섹션별 체계적 배치
새로운 스타일을 추가할 때는 `common.css`의 기존 섹션 체계에 맞추어 적절한 섹션 아래에 작성합니다.
1. 전역 공통 유틸리티 & 헤더 & 공통 컴포넌트
2. 메인 레이아웃 & 네비게이션 사이드바
3. 공통 다이얼로그
4. 인증 화면
5. 대시보드
6. 메뉴 관리 & 역할 권한 설정
7. 메뉴 로그 조회 (테이블 & LunaGrid)
8. 배치 스케줄 관리
9. SQL 스크립트 뷰어
10. 게시판 (목록, 상세, 작성)
11. 공통 코드 관리 (LunaGrid)

---

## 연계 스킬
- 목록/리스트 화면 개발 시: [lunagrid 스킬](file:///home/knh11/spring/springboot/.agents/skills/lunagrid/SKILL.md) 참조 (`luna-lib-grid.min.js` 적용 가이드)
