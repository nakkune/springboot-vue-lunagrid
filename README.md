# 엔터프라이즈 포털 시스템

Spring Boot 3 + Oracle + **MyBatis** + Vue 3 기반의 사내 포털 스캐폴딩입니다.
회원가입 → 로그인(JWT) → 로그인 후 좌측 메뉴(DB에서 조회) 구조로 동작하며,
관리자는 **메뉴설정 화면에서 메뉴를 추가/수정/삭제**할 수 있습니다.

```
springboot/
├── backend/    # Spring Boot 3.5 (Java 21) + MyBatis - REST API 서버
├── frontend/   # Vue 3 + Vite + Element Plus - 웹 화면
└── README.md
```

---

## 1. 사전 준비

| 항목 | 버전 |
|---|---|
| JDK | 21 |
| Node.js | 20+ (개발환경: 24 확인됨) |
| Oracle DB | 19c/23ai (개발환경: FREEPDB1 사용) |

**테이블은 이미 생성되어 있다고 가정합니다**(TB_COM_USER / TB_COM_ROLE / TB_COM_USER_ROLE /
TB_COM_MENU / TB_COM_ROLE_MENU / TB_COM_LOGIN_LOG). 앱은 스키마를 절대 변경하지 않습니다.
기준데이터(역할·테스트계정·기본메뉴)는 기동 시 `DataSeeder`가 **항목별 존재 여부를 확인해
누락분만** 등록하므로, 이미 데이터가 있는 DB에도 안전하게 신규 메뉴가 추가됩니다(멱등).

## 2. 백엔드 실행

접속정보는 이미 실제 값으로 설정되어 있습니다. 변경 시
`backend/src/main/resources/application.yml` 을 수정하세요.

```yaml
spring:
  datasource:
    url: jdbc:oracle:thin:@//localhost:1521/FREEPDB1
    username: myoracle
    password: ${DB_PASSWORD}               # backend/.env 파일에서 로드됨

mybatis:
  mapper-locations: classpath:mapper/*.xml   # SQL은 src/main/resources/mapper/*.xml 에서 관리
  configuration:
    map-underscore-to-camel-case: true      # USER_ID → userId 자동 매핑
```

```bash
cd backend
./gradlew bootRun          # 개발 실행
# 또는 jar 실행
./gradlew build -x test
java -jar build/libs/backend-0.0.1-SNAPSHOT.jar
```

- 포트: **8080**
- JWT 시크릿(`jwt.secret`)은 샘플값이므로 운영 배포 전 반드시 교체하세요.

## 3. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev                # http://localhost:5173
```

- `/api` 요청을 `http://localhost:8080` 으로 프록시합니다 (`vite.config.js`).
- 프로덕션 빌드: `npm run build` → `dist/`

## 4. 테스트 계정 (기동 시 자동 생성)

| 계정 | 비밀번호 | 역할 | 좌측 메뉴 |
|---|---|---|---|
| admin | admin123 | ROLE_ADMIN | 전체 메뉴 (**관리자 설정 > 메뉴설정** 포함) |
| user | user123 | ROLE_USER | 권한 매핑 메뉴만 (관리자 설정 미노출) |

## 5. 주요 API

| Method | Path | 설명 | 권한 |
|---|---|---|---|
| POST | `/api/auth/signup` | 회원가입 `{userId, password, userNm, email}` | 공개 |
| POST | `/api/auth/login` | 로그인 (JWT 발급) | 공개 |
| GET | `/api/auth/me` | 내 정보 | 로그인 |
| GET | `/api/menus` | 좌측 메뉴 트리(역할별 필터링) | 로그인 |
| GET | `/api/admin/menus` | 전체 메뉴 트리(숨김 포함) — 관리화면용 | ADMIN |
| POST | `/api/admin/menus` | 메뉴 등록 | ADMIN |
| PUT | `/api/admin/menus/{menuId}` | 메뉴 수정 | ADMIN |
| DELETE | `/api/admin/menus/{menuId}` | 메뉴 삭제(하위메뉴 존재 시 차단) | ADMIN |

에러 응답 형식: `{ "status": 409, "message": "...한글 메시지..." }`

## 6. 메뉴 관리 화면

로그인 후 좌측 **관리자 설정 > 메뉴설정** (`/menu-settings`, admin 전용):

- 트리 그리드로 전체 메뉴 조회 (숨김 메뉴 포함)
- **메뉴 추가**: 상위메뉴 선택(el-tree-select), 메뉴 ID/명/URL/아이콘/정렬순서/
  화면타겟/노출여부/사용여부 설정 → 즉시 사이드바 반영
- 수정 / 삭제 (하위 메뉴가 있으면 삭제 차단, 역할권한 매핑은 함께 정리)
- URL 이 없는 메뉴는 그룹(폴더) 메뉴로 동작

## 7. 보안 정책

- 비밀번호 BCrypt 해시 저장 (`PWD_HASH`, 솔트는 해시에 포함 → `PWD_SALT` 미사용)
- 비밀번호 **5회 연속 오류 시 계정 잠금** (`ACCT_STAT_CD='02'`, `LOCK_DT` 기록)
- 계정 상태 체크: 01정상 / 02잠김 / 03휴면 / 09탈퇴
- 모든 로그인 시도 이력을 `TB_COM_LOGIN_LOG` 에 기록 (IP, User-Agent, 성공여부, 실패사유)
- `/api/admin/**` 은 `ROLE_ADMIN` 만 접근 가능 (SecurityConfig 가드)

## 8. 참고 스크립트

- `backend/src/main/resources/db/seed_sample.sql`: 수동 시딩용 참고 SQL
  (평소에는 DataSeeder 가 자동 처리하므로 실행 불필요)
- SQL 변경 위치: `backend/src/main/resources/mapper/*.xml`

---

## 9. 다른 PC에서 소스 받아 작업하기 (초기 세팅)

새로운 PC(Windows, Mac, Linux 등)에서 처음 세팅할 때의 절차입니다.

### 1) 소스코드 다운로드 (Clone)
작업할 폴더 위치에서 터미널(또는 Git Bash/PowerShell)을 열고 실행합니다:
```bash
git clone https://github.com/nakkune/springboot-vue-lunagrid.git
cd springboot-vue-lunagrid
```

### 2) 필수 개발 환경 확인
- **JDK**: 17 이상 설치 확인 (`java -version`)
- **Node.js**: 18 이상 설치 확인 (`node -v`, `npm -v`)
- **Oracle DB**: `localhost:1521/FREEPDB1` 접속 가능 여부 (다른 PC에 DB가 없다면 현재 PC의 IP로 `application.yml`의 host를 변경하거나 동일 DB 환경 구축 필요)

### 3) 환경변수(.env) 설정
DB 패스워드는 보안을 위해 Git에서 제외되어 있으므로, 템플릿 파일을 복사하여 `.env` 파일을 생성합니다:
- **Linux / Mac**:
  ```bash
  cp backend/.env.example backend/.env
  ```
- **Windows (CMD / PowerShell)**:
  ```cmd
  copy backend\.env.example backend\.env
  ```
*필요 시 `backend/.env` 파일의 `DB_PASSWORD` 값을 로컬 DB 패스워드에 맞게 수정합니다.*

### 4) 프론트엔드(Frontend) 의존성 설치 및 실행
```bash
cd frontend
npm install       # node_modules 설치
npm run dev       # 개발 서버 구동 (http://localhost:5173)
```

### 5) 백엔드(Backend) 실행
새 터미널을 열고 프로젝트 루트의 `backend` 폴더로 이동하여 실행합니다:
- **Linux / Mac**:
  ```bash
  cd backend
  ./gradlew bootRun
  ```
- **Windows (CMD / PowerShell)**:
  ```cmd
  cd backend
  gradlew.bat bootRun
  ```

---

## 10. 앞으로 두 PC를 오가며 작업할 때의 기본 루틴

두 대 이상의 PC에서 번갈아 작업할 때는 **"작업 시작 전 pull, 작업 끝난 후 push"** 규칙만 지키시면 충돌 없이 작업할 수 있습니다:

### 작업 마치고 나올 때 (현재 PC):
```bash
git add .
git commit -m "작업 내용 요약"
git push
```

### 다른 PC에 앉아서 작업 시작할 때:
```bash
git pull
# 만약 package.json에 라이브러리를 새로 추가했다면 frontend에서 npm install 한번 실행
```
