---
name: lunagrid
description: >-
  화면 목록(리스트) 또는 테이블 UI를 구현할 때 루나그리드(luna-lib-grid.min.js, window.LunaGrid, window.LunaDataAdapter)를
  적용하여 개발할 때 사용합니다. 프론트엔드 스키마/어댑터/그리드/인라인편집/수명주기뿐만 아니라, 백엔드 연동 시 컨트롤러, 서비스, 매퍼,
  MyBatis 쿼리 XML, DTO, Entity 전 계층을 신규 전용 파일로 독립 분리하여 구현하는 표준 패턴을 제공합니다.
---

# 루나그리드(LunaGrid) 적용 개발 스킬

## 1. 개요
본 프로젝트(`frontend/`)에서 화면 내 데이터 목록/리스트를 구현할 때는 Element-Plus의 `<el-table>` 대신 **루나그리드(`luna-lib-grid.min.js`)**를 적용합니다.

- **라이브러리 로드**: [`frontend/index.html`](file:///home/knh11/spring/springboot/frontend/index.html)에서 `<script src="/js/luna-lib-grid.min.js"></script>`로 전역 로드됨
- **전역 객체 및 네임스페이스**:
  - 권장 인스턴스: `window.LunaGrid`, `window.LunaDataAdapter`
  - 네임스페이스 상수/열거형: `window.LunaValueType` (또는 `LunaGrid.ValueType`), `window.LunaRowState` (또는 `LunaGrid.RowState`), `window.LunaValidationLevel` (또는 `LunaGrid.ValidationLevel`)
  - 뷰 클래스: `window.LunaGridView`, `window.LunaTreeView`
  - *참고: `GridView`, `TreeView`, `RowState`, `ValueType` 같은 제네릭 식별자는 전역 충돌을 방지하기 위해 `Luna` 접두어를 사용하는 식별자 및 `LunaGrid` 네임스페이스 접근을 표준으로 합니다.*
- **스타일 관리 원칙**: 루나그리드 관련 CSS는 절대 `*.vue` 파일 내에 작성하지 않고, [`frontend/src/styles/common.css`](file:///home/knh11/spring/springboot/frontend/src/styles/common.css)의 섹션에 추가합니다.

---

## 2. 표준 구현 아키텍처

### 2.1 템플릿 영역 (Template)
```html
<template>
  <div class="my-feature-container">
    <el-card class="grid-card" shadow="never">
      <!-- 그리드 헤더 및 툴바 -->
      <div class="grid-card-header">
        <div class="header-left-title">
          <span class="grid-title">목록 타이틀</span>
          <el-tag size="small" type="info" effect="plain">총 {{ rowCount }}건</el-tag>
        </div>
        <div class="grid-card-actions">
          <el-button type="primary" plain :icon="Plus" size="small" @click="handleAddRow">행추가</el-button>
          <el-button type="danger" plain :icon="Delete" size="small" @click="handleDeleteRows">행삭제</el-button>
          <el-button type="success" :icon="Check" size="small" @click="handleSave">저장</el-button>
        </div>
      </div>

      <!-- 그리드 마운트 컨테이너 -->
      <div class="grid-wrapper">
        <div id="luna-my-grid" class="luna-grid-target"></div>
      </div>
    </el-card>
  </div>
</template>
```

### 2.2 스크립트 영역 (Script Setup)
```javascript
import { onMounted, onUnmounted, ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

// 1. 그리드 및 어댑터 인스턴스
let grid = null
let adapter = null
const rowCount = ref(0)

// 2. 필드(스키마) 정의
const gridFields = [
  { fieldName: 'id', dataType: 'text' },
  { fieldName: 'code', dataType: 'text' },
  { fieldName: 'name', dataType: 'text' },
  { fieldName: 'useYn', dataType: 'text' },
  { fieldName: 'regDt', dataType: 'datetime' },
  { fieldName: '_isNew', dataType: 'boolean' },
]

// 3. 컬럼 정의
const gridColumns = [
  {
    name: 'code',
    fieldName: 'code',
    header: { text: '코드 *', align: 'center' },
    width: 140,
    align: 'center',
    editable: true,
    editor: 'text',
    styleName: 'col-code',
  },
  {
    name: 'name',
    fieldName: 'name',
    header: { text: '명칭 *', align: 'center' },
    width: 200,
    editable: true,
    editor: 'text',
  },
  {
    name: 'useYn',
    fieldName: 'useYn',
    header: { text: '사용여부', align: 'center' },
    width: 100,
    align: 'center',
    editable: true,
    editor: { type: 'select', options: ['Y', 'N'] },
  },
  {
    name: 'regDt',
    fieldName: 'regDt',
    header: { text: '등록일시', align: 'center' },
    width: 160,
    align: 'center',
    editable: false,
    readOnly: true,
  },
]

// 4. 그리드 초기화 함수
async function initGrid() {
  await nextTick()

  // 라이브러리 비동기 로딩 대기 루프
  let retry = 0
  while ((!window.LunaGrid || !window.LunaDataAdapter) && retry < 30) {
    await new Promise((r) => setTimeout(r, 100))
    retry++
  }

  if (!window.LunaGrid || !window.LunaDataAdapter) {
    ElMessage.error('LunaGrid 라이브러리를 로드하지 못했습니다.')
    return
  }

  const container = document.querySelector('#luna-my-grid')
  if (!container) return

  // 중복 초기화 방지
  container.innerHTML = ''

  // 어댑터 생성
  adapter = new window.LunaDataAdapter()
  adapter.setFields(gridFields)
  adapter.setOptions({
    checkStates: true,
    undoable: true,
  })

  // 그리드 인스턴스 생성
  grid = new window.LunaGrid('#luna-my-grid', {
    title: '',
    dataAdapter: adapter,
    columns: gridColumns,
    rowHeight: 38,
    displayOptions: {
      rowHeight: 38,
      minRowHeight: 38,
    },
    pageable: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
    showFooterPagingInfo: true,
    pagingAlign: 'center',
    paginationAlign: 'center',
    pagingOptions: {
      enabled: true,
      size: 10,
      page: 0,
      align: 'center',
    },
    enableGrouping: false,
    enableSort: false,
    enableFilter: false,
    showSearch: false,
    showExport: false,
    showJsonExport: false,
    indicator: { visible: true, width: '45px', label: 'No.' },
    stateBar: { visible: true, width: '40px', label: '상태' },
    checkBar: { visible: true, width: '48px', multiSelect: true },
    selectable: true,
    multiSelect: true,
    editable: true,
    editTrigger: 'dblclick', // 편집 트리거는 반드시 더블 클릭 사용
    onRowClick: (rowData) => {
      // 행 클릭 이벤트 처리
    },
  })

  await fetchData()
}

// 5. 데이터 조회 및 바인딩
async function fetchData() {
  try {
    const list = await fetchListApi() // API 호출
    rowCount.value = list.length

    if (adapter) {
      const formatted = list.map((item, idx) => ({
        id: item.id || `ROW_${idx + 1}`,
        ...item,
        _isNew: false,
      }))
      adapter.setRows(formatted)
      adapter.commit()
    }
  } catch (e) {
    ElMessage.error(e?.message || '조회 실패')
  }
}

// 6. 수명주기 훅
onMounted(() => {
  initGrid()
})

onUnmounted(() => {
  // 루나그리드에는 별도 destroy 메서드가 없으므로, 참조를 해제하고 필요 시 컨테이너 DOM을 비웁니다.
  const container = document.querySelector('#luna-my-grid')
  if (container) container.innerHTML = ''
  grid = null
  adapter = null
})
```

---

## 3. 핵심 규칙 체크리스트
1. **`editTrigger: 'dblclick'` 준수**: 셀 수정 시 행 선택(클릭)과의 간섭을 방지하기 위해 기본 편집 트리거는 더블 클릭(`'dblclick'`)을 설정합니다.
2. **`nextTick()` 및 로딩 대기**: DOM 렌더링 이후 안전하게 마운트될 수 있도록 `nextTick()` 및 `while (!window.LunaGrid)` 대기 로직을 항상 포함합니다.
3. **`onUnmounted` 인스턴스 및 DOM 정리**: 루나그리드 라이브러리 자체에는 `destroy()` 메서드가 제공되지 않으므로, `grid = null; adapter = null;`로 참조를 해제하고 컨테이너 엘리먼트를 비워(`container.innerHTML = ''`) 메모리 및 DOM을 정리합니다.
4. **스타일 분리**: 그리드 너비, 높이, 페이징 정렬 스타일 등은 반드시 [`common.css`](file:///home/knh11/spring/springboot/frontend/src/styles/common.css)에 작성합니다.
5. **백엔드 전용 계층 독립 분리 준수**: 그리드 연동 백엔드 개발 시 기존 파일에 코드를 덧붙이지 않고, **Controller, Service, Mapper, MyBatis XML, DTO, Entity 6대 요소를 모두 새 파일로 분리 생성**하여 구현합니다.

---

## 4. 백엔드(Backend) 전용 아키텍처 구현 표준

그리드 화면의 데이터 조회 및 일괄 C/U/D(저장/수정/삭제)를 처리하는 백엔드 개발 시, **기존 일반 관리 API 파일에 메서드를 추가하지 않고 전 계층을 신규 전용 파일로 독립 생성**하여 구현합니다.

### 4.1 계층별 파일 생성 규칙
| 계층 (Layer) | 위치 및 명명 규칙 | 설명 |
|---|---|---|
| **Entity** | `com.example.portal.entity.{Feature}Grid.java` | 테이블 매핑 전용 그리드 엔티티 (Lombok `@Getter`, `@Setter`, `@Builder`) |
| **DTO (Request)** | `com.example.portal.dto.{Feature}GridRowRequest.java` | 그리드 단건 행 요청 모델 (필드 단위 C/U/D 데이터 수신) |
| **DTO (Batch)** | `com.example.portal.dto.{Feature}GridBatchRequest.java` | 일괄 저장 요청 DTO (`created`, `updated`, `deleted` 목록 포함) |
| **DTO (Response)**| `com.example.portal.dto.{Feature}GridResponse.java` | 그리드 조회 및 계층 트리/목록 변환 응답 모델 |
| **Controller** | `com.example.portal.controller.{Feature}GridAdminController.java` | 그리드 전용 REST API (`@RequestMapping("/api/admin/{feature}-grid")`) |
| **Service** | `com.example.portal.service.{Feature}GridService.java` | 단일 `@Transactional` 하에서 `deleted` -> `created` -> `updated` 일괄 처리 |
| **Mapper** | `com.example.portal.mapper.{Feature}GridMapper.java` | `@Mapper` 어노테이션이 지정된 MyBatis 인터페이스 |
| **MyBatis XML** | `src/main/resources/mapper/{Feature}Grid.xml` | `namespace="com.example.portal.mapper.{Feature}GridMapper"` 전용 SQL 쿼리 |

### 4.2 일괄 저장(Batch Save) 트랜잭션 처리 순서
1. **외래키/참조 무결성 유지**: 삭제(`deleted`)를 먼저 수행하여 충돌을 방지한 후, 신규 등록(`created`), 수정(`updated`) 순서로 실행합니다.
2. **트랜잭션 격리**: `@Transactional`을 반드시 서비스 메서드에 선언하여 일괄 저장 중 하나라도 실패 시 전체 롤백되도록 보장합니다.
