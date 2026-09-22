---
name: backend-architecture
description: >-
  Spring Boot + MyBatis 기반 백엔드 API 신규 개발 및 리팩토링 시 사용합니다. Controller, Service, Mapper,
  MyBatis XML, DTO, Entity 6대 계층을 기존 파일에 혼합하지 않고 신규 전용 파일로 완전 분리하여 구현하는 표준 개발 패턴을 안내합니다.
---

# 백엔드 전용 아키텍처(Full-Stack Layered Architecture) 개발 스킬

## 1. 개요
본 프로젝트(`backend/`)에서 신규 기능(관리 화면, 그리드, 대용량 처리 등)에 대한 백엔드 API를 구현할 때, 기존 컨트롤러나 서비스 파일에 메서드를 추가하여 코드를 혼합하지 않고 **컨트롤러, 서비스, 매퍼, MyBatis 쿼리 XML, DTO, Entity 6대 전 계층을 신규 전용 파일로 완전 독립 생성**하여 개발합니다.

---

## 2. 6대 전용 계층 구조 및 명명 규칙

| 계층 (Layer) | 파일 위치 및 명명 규칙 | 주요 역할 및 어노테이션 |
|---|---|---|
| **1. Entity** | `com.example.portal.entity.{Feature}.java` | DB 테이블 1:1 매핑 객체 (`@Getter`, `@Setter`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`) |
| **2. DTO** | `com.example.portal.dto.{Feature}Request.java`<br>`com.example.portal.dto.{Feature}Response.java`<br>`com.example.portal.dto.{Feature}BatchRequest.java` | 클라이언트 요청/응답 전문 객체 (단건 요청, 일괄 저장 요청, 계층 트리 변환 등) |
| **3. Controller** | `com.example.portal.controller.{Feature}Controller.java` | REST API 엔드포인트 정의 (`@RestController`, `@RequestMapping("/api/...")`, `@RequiredArgsConstructor`) |
| **4. Service** | `com.example.portal.service.{Feature}Service.java` | 비즈니스 로직 및 트랜잭션 관리 (`@Service`, `@Transactional`, `@RequiredArgsConstructor`) |
| **5. Mapper** | `com.example.portal.mapper.{Feature}Mapper.java` | MyBatis 매퍼 인터페이스 (`@Mapper`, `@Param`) |
| **6. MyBatis XML** | `src/main/resources/mapper/{Feature}.xml` | SQL 쿼리 매퍼 (`<mapper namespace="com.example.portal.mapper.{Feature}Mapper">`) |

---

## 3. 계층별 표준 구현 가이드

### 3.1 Entity
- DB 테이블 컬럼과 매핑되며, 기본값 설정 시 `@Builder.Default` 활용.
- 카멜케이스(CamelCase) 프로퍼티 사용 (`mybatis.configuration.map-underscore-to-camel-case: true` 자동 매핑).

### 3.2 DTO (Data Transfer Object)
- 등록/수정용 Request DTO와 조회용 Response DTO를 분리.
- 루나그리드 등 일괄 저장 기능이 필요한 경우 `BatchRequest` DTO 내에 `created`, `updated`, `deleted` 리스트를 구성.

### 3.3 Controller
- 관리자 전용 API의 경우 `/api/admin/**` 경로를 사용하여 `SecurityConfig`의 `hasRole("ADMIN")` 인가 적용.
- 성공 응답 시 `ResponseEntity.ok(...)` 표준 준수.

### 3.4 Service
- `@Transactional`을 명시하여 데이터 무결성 보장.
- 일괄 처리 시 외래키/참조 정합성을 위해 **삭제(`deleted`) -> 등록(`created`) -> 수정(`updated`)** 순서로 실행.

### 3.5 Mapper & MyBatis XML
- 매퍼 인터페이스의 메서드명과 XML 파일의 `id`를 1:1 매핑.
- `parameterType`과 `resultType`은 새로 정의한 전용 Entity 또는 DTO 풀패키지 경로 지정.
- 공통 컬럼은 `<sql id="...Columns">` 태그로 선언하여 재사용.
