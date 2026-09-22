<template>
  <div class="menu-log-grid-container">
    <div class="page-header header-row">
      <div>
        <div class="title-badge-wrap">
          <h2 class="page-title-text">메뉴 접근 로그조회 (그리드)</h2>
          <el-tag effect="dark" type="primary" class="version-badge">LunaGrid v3.0</el-tag>
          <el-tag effect="plain" type="success" class="mode-badge">조회 모드 (Read-Only)</el-tag>
        </div>
        <p class="page-subtitle-text">
          고성능 <strong>LunaGrid</strong> 엔터프라이즈 모듈을 활용하여 대용량 로그 검색, 다차원 그룹핑, 정렬, 엑셀/CSV Export를 제공합니다.
        </p>
      </div>
      <div class="toolbar">
        <el-button type="success" plain :icon="Download" @click="exportExcel">
          Excel 내보내기
        </el-button>
        <el-button type="primary" plain :icon="Document" @click="exportCsv">
          CSV 내보내기
        </el-button>
        <el-button type="info" plain :icon="List" @click="$router.push('/menu-logs')">
          일반 테이블 뷰
        </el-button>
        <el-button type="primary" plain :icon="Refresh" @click="fetchLogs">
          새로고침
        </el-button>
      </div>
    </div>

    <el-alert
      v-if="!auth.isAdmin"
      title="관리자 권한이 필요합니다."
      description="이 화면은 ROLE_ADMIN 계정만 사용할 수 있습니다."
      type="warning"
      show-icon
      :closable="false"
      class="guard-alert"
    />

    <div v-else class="log-content-wrapper">
      <!-- 검색 필터 카드 -->
      <el-card class="search-card" shadow="never">
        <el-form :model="filters" label-position="left" label-width="85px" @submit.prevent="handleSearch">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="사용자">
                <el-input
                  v-model="filters.userId"
                  placeholder="ID 또는 사용자명 입력"
                  clearable
                  :prefix-icon="User"
                  @keyup.enter="handleSearch"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="메뉴">
                <el-input
                  v-model="filters.menuId"
                  placeholder="메뉴ID 또는 메뉴명 입력"
                  clearable
                  :prefix-icon="Menu"
                  @keyup.enter="handleSearch"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="접속 IP">
                <el-input
                  v-model="filters.userIp"
                  placeholder="IP 주소 입력"
                  clearable
                  :prefix-icon="Monitor"
                  @keyup.enter="handleSearch"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="10">
              <el-form-item label="접속 기간">
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="~"
                  start-placeholder="시작일"
                  end-placeholder="종료일"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="14" class="quick-preset-col">
              <div class="preset-buttons">
                <span class="preset-label">빠른선택:</span>
                <el-button-group size="small">
                  <el-button :type="activePreset === 'today' ? 'primary' : ''" @click="setPreset('today')">오늘</el-button>
                  <el-button :type="activePreset === '1w' ? 'primary' : ''" @click="setPreset('1w')">1주일</el-button>
                  <el-button :type="activePreset === '1m' ? 'primary' : ''" @click="setPreset('1m')">1개월</el-button>
                  <el-button :type="activePreset === '3m' ? 'primary' : ''" @click="setPreset('3m')">3개월</el-button>
                  <el-button :type="activePreset === 'all' ? 'primary' : ''" @click="setPreset('all')">전체</el-button>
                </el-button-group>
              </div>
            </el-col>
          </el-row>

          <div class="search-actions">
            <el-button type="primary" :icon="Search" class="search-btn" @click="handleSearch">검색</el-button>
            <el-button :icon="RefreshLeft" @click="resetSearch">초기화</el-button>
          </div>
        </el-form>
      </el-card>

      <!-- 그리드 렌더링 컨테이너 -->
      <el-card class="grid-card" shadow="never">
        <div v-loading="loading" class="grid-card-body">
          <div id="luna-menu-log-grid" class="luna-grid-target"></div>
        </div>

        <!-- 서버 페이징 컨트롤 바 (대용량 로그 대응) -->
        <div class="grid-footer-bar">
          <div class="total-info">
            총 <strong>{{ totalItems.toLocaleString() }}</strong> 건 중
            현재 페이지 <strong>{{ logList.length }}</strong> 건 표시
          </div>
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100, 200]"
            :total="totalItems"
            layout="total, sizes, prev, pager, next, jumper"
            background
            size="small"
            @current-change="onPageChange"
            @size-change="onPageSizeChange"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, reactive, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Refresh,
  Search,
  RefreshLeft,
  User,
  Menu,
  Monitor,
  List,
  Download,
  Document,
  Filter,
  CopyDocument,
  Close,
} from '@element-plus/icons-vue'
import http from '../api/http'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

// 관리자 권한 늦은 로딩 대응
watch(
  () => auth.isAdmin,
  async (isAdmin) => {
    if (isAdmin && !grid) {
      await nextTick()
      initGrid()
    }
  }
)

const loading = ref(false)
const logList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const dateRange = ref(null)
const activePreset = ref('')
const currentGroup = ref('')
const currentTheme = ref('default')

const filters = reactive({
  userId: '',
  menuId: '',
  userIp: '',
})

let dataAdapter = null
let grid = null

function formatDateStr(d) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function formatDt(val) {
  if (!val) return '-'
  const d = new Date(val)
  if (isNaN(d.getTime())) return val
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function setPreset(preset) {
  activePreset.value = preset
  const end = new Date()
  const start = new Date()

  if (preset === 'today') {
    dateRange.value = [formatDateStr(start), formatDateStr(end)]
  } else if (preset === '1w') {
    start.setDate(start.getDate() - 7)
    dateRange.value = [formatDateStr(start), formatDateStr(end)]
  } else if (preset === '1m') {
    start.setMonth(start.getMonth() - 1)
    dateRange.value = [formatDateStr(start), formatDateStr(end)]
  } else if (preset === '3m') {
    start.setMonth(start.getMonth() - 3)
    dateRange.value = [formatDateStr(start), formatDateStr(end)]
  } else if (preset === 'all') {
    dateRange.value = null
  }
  handleSearch()
}

function handleSearch() {
  currentPage.value = 1
  fetchLogs()
}

function resetSearch() {
  filters.userId = ''
  filters.menuId = ''
  filters.userIp = ''
  dateRange.value = null
  activePreset.value = ''
  currentPage.value = 1
  fetchLogs()
}

function onPageChange() {
  fetchLogs()
}

function onPageSizeChange() {
  currentPage.value = 1
  fetchLogs()
}

async function fetchLogs() {
  if (!auth.isAdmin) return
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
    }
    if (filters.userId) params.userId = filters.userId
    if (filters.menuId) params.menuId = filters.menuId
    if (filters.userIp) params.userIp = filters.userIp
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDt = dateRange.value[0]
      params.endDt = dateRange.value[1]
    }
    const { data } = await http.get('/admin/menu-logs', { params })
    const items = data.items || []
    logList.value = items
    totalItems.value = data.totalItems || 0

    // 그리드 데이터 주입
    if (dataAdapter) {
      const formattedRows = items.map((item, idx) => ({
        id: item.logSeq || idx + 1,
        logSeq: item.logSeq,
        userId: item.userId || '-',
        userNm: item.userNm || '-',
        menuId: item.menuId || '-',
        menuNm: item.menuNm || '-',
        menuUrl: item.menuUrl || '-',
        userIp: item.userIp || '-',
        clickDt: formatDt(item.clickDt),
      }))
      dataAdapter.setRows(formattedRows)
    }
  } catch (e) {
    ElMessage.error(e?.message || '로그 조회에 실패했습니다.')
  } finally {
    loading.value = false
  }
}

// ----------------------------------------------------
// [리얼그리드 호환 구조] 1. fields (데이터 모델 스키마 정의)
// ----------------------------------------------------
// LunaValueType 상수 참조 (초기 파싱 시 fallback 지원)
const LunaValueType = window.LunaValueType || {
  TEXT: 'text',
  NUMBER: 'number',
  DATETIME: 'datetime',
  BOOLEAN: 'boolean',
}

const fields = [
  { fieldName: 'logSeq', dataType: LunaValueType.NUMBER },
  { fieldName: 'userId', dataType: LunaValueType.TEXT },
  { fieldName: 'userNm', dataType: LunaValueType.TEXT },
  { fieldName: 'menuId', dataType: LunaValueType.TEXT },
  { fieldName: 'menuNm', dataType: LunaValueType.TEXT },
  { fieldName: 'menuUrl', dataType: LunaValueType.TEXT },
  { fieldName: 'userIp', dataType: LunaValueType.TEXT },
  { fieldName: 'clickDt', dataType: LunaValueType.DATETIME },
]

// ----------------------------------------------------
// [리얼그리드 호환 구조] 2. columns (화면 뷰 컬럼 정의)
// ----------------------------------------------------
const columns = [
  {
    name: 'logSeq',
    fieldName: 'logSeq',
    header: { text: '로그 SEQ', align: 'center' },
    width: 90,
    align: 'center',
    type: 'number',
    sortable: false,
    filterable: false,
    autoFilter: false,
    editable: false,
    readOnly: true,
  },
  {
    name: 'userId',
    fieldName: 'userId',
    header: { text: '사용자 ID', align: 'center' },
    width: 120,
    align: 'center',
    sortable: false,
    filterable: false,
    autoFilter: false,
    editable: false,
    readOnly: true,
  },
  {
    name: 'userNm',
    fieldName: 'userNm',
    header: { text: '사용자명', align: 'center' },
    width: 120,
    align: 'center',
    sortable: false,
    filterable: false,
    autoFilter: false,
    editable: false,
    readOnly: true,
  },
  {
    name: 'menuId',
    fieldName: 'menuId',
    header: { text: '메뉴 ID', align: 'center' },
    width: 140,
    align: 'center',
    sortable: false,
    filterable: false,
    autoFilter: false,
    editable: false,
    readOnly: true,
  },
  {
    name: 'menuNm',
    fieldName: 'menuNm',
    header: { text: '메뉴명', align: 'center' },
    width: 160,
    sortable: false,
    filterable: false,
    autoFilter: false,
    editable: false,
    readOnly: true,
  },
  {
    name: 'menuUrl',
    fieldName: 'menuUrl',
    header: { text: '접근 URL', align: 'center' },
    width: 220,
    sortable: false,
    filterable: false,
    autoFilter: false,
    editable: false,
    readOnly: true,
  },
  {
    name: 'userIp',
    fieldName: 'userIp',
    header: { text: '접속 IP', align: 'center' },
    width: 140,
    align: 'center',
    sortable: false,
    filterable: false,
    autoFilter: false,
    editable: false,
    readOnly: true,
  },
  {
    name: 'clickDt',
    fieldName: 'clickDt',
    header: { text: '접속일시', align: 'center' },
    width: 180,
    align: 'center',
    sortable: false,
    filterable: false,
    autoFilter: false,
    editable: false,
    readOnly: true,
  },
]

/** LunaGrid 초기화 */
async function initGrid() {
  await nextTick()

  // window.LunaGrid 준비될 때까지 대기 (최대 3초)
  let retryCount = 0
  while ((!window.LunaGrid || !window.LunaDataAdapter) && retryCount < 30) {
    await new Promise((r) => setTimeout(r, 100))
    retryCount++
  }

  if (!window.LunaGrid || !window.LunaDataAdapter) {
    ElMessage.error('LunaGrid 라이브러리를 로드하지 못했습니다.')
    return
  }

  const container = document.querySelector('#luna-menu-log-grid')
  if (!container) return

  // 기존 그리드 인스턴스 초기화
  container.innerHTML = ''

  // 1. DataAdapter 생성 및 fields 스키마 등록 (RealGrid의 dataProvider.setFields(fields)와 동일)
  dataAdapter = new window.LunaDataAdapter()
  dataAdapter.setFields(fields)
  dataAdapter.setOptions({
    checkStates: false, // 조회 모드: 상태 관리 비활성화
    undoable: false,    // 조회 모드: 실행취소 스택 비활성화
  })

  // -------------------------------------------------------------------------
  // 2. GridView 생성 및 옵션 바인딩 (RealGrid의 new GridView(...)와 동일)
  // -------------------------------------------------------------------------
  grid = new window.LunaGrid(
    // [필수 1] 그리드가 렌더링될 DOM 컨테이너 (CSS 셀렉터 문자열 또는 DOM 엘리먼트)
    '#luna-menu-log-grid',
    {
      // =======================================================================
      // 📌 [필수 / 핵심 연동 옵션]
      // =======================================================================
      // [필수 권장] 연동할 데이터 어댑터 인스턴스 (생략 시 기본값: null)
      dataAdapter: dataAdapter,

      // [필수 권장] 그리드에 표시할 컬럼 스키마 배열 (생략 시 기본값: [])
      columns: columns,

      // =======================================================================
      // 📌 [선택 옵션] 1. 레이아웃, 테마, 페이징
      // =======================================================================
      // [선택] 상단 타이틀 텍스트 (생략 시 기본값: 'Luna Enterprise Data Grid')
      // -> 빈 문자열('') 지정 시 기본 헤더 타이틀 숨김 처리
      title: '',

      // [선택] 그리드 테마 (생략 시 기본값: 'default' | 'dark' 등 지원)
      theme: currentTheme.value,

      // [선택] 그리드 전체 높이 (생략 시 기본값: 'auto' | 예: '500px', '100%')
      height: 'auto',

      // [선택] 그리드 자체 클라이언트 페이징 네비게이션 표시 여부 (생략 시 기본값: true)
      // -> 현재 화면은 Element-Plus의 고성능 서버 페이징을 사용하므로 false로 비활성화
      // -> (참고: true일 때 기본 페이지 크기 pageSize: 10, pageSizeOptions: [5, 10, 20, 50, 100])
      pageable: false,

      // =======================================================================
      // 📌 [선택 옵션] 2. 엔터프라이즈 3대 컨트롤 바 설정
      // =======================================================================
      // [선택] 행 순번(No.) 표시 인디케이터 바
      // -> 생략 시 기본값: { visible: true, width: '48px', label: 'No.' }
      indicator: { visible: true, label: 'No.', width: 55 },

      // [선택] C/U/D 행 변경 상태바 (신규: C, 수정: U, 삭제: D 표시)
      // -> 생략 시 기본값: { visible: true, width: '34px', label: '상태' }
      // -> 현재 화면은 순수 조회 모드이므로 false 설정
      stateBar: { visible: false },

      // [선택] 행 다중/단일 선택 체크박스 바
      // -> 생략 시 기본값: { visible: true, multiSelect: true }
      // -> 현재 화면은 단순 조회용이므로 체크박스 숨김(false) 처리
      checkBar: { visible: false },

      // [선택] 행 클릭 시 선택 하이라이트 활성화 여부 (생략 시 기본값: true)
      selectable: false,

      // =======================================================================
      // 📌 [선택 옵션] 3. 데이터 편집 및 트랜잭션 제어 (조회 vs 입력/수정 모드)
      // =======================================================================
      // [선택] 셀 인라인 더블클릭 편집 허용 여부 (생략 시 기본값: true)
      // -> 조회 모드에서는 반드시 false 설정 (생략하면 더블클릭 시 텍스트/숫자 편집창 열림)
      editable: false,

      // [선택] 그리드 읽기 전용 여부 (생략 시 기본값: false)
      readOnly: true,

      // [선택] 그리드 내장 기본 CRUD 버튼 노출 여부 (생략 시 기본값: 모두 false)
      showAddRowBtn: false,  // 행 추가(+) 버튼
      showDeleteBtn: false,  // 행 삭제(-) 버튼
      showSaveBtn: false,    // 저장 버튼

      // [선택] 세부 편집 제어 옵션 (생략 시 기본값: 아래 모든 항목이 true 또는 기본 활성화)
      editOptions: {
        readOnly: true,       // 생략 시 기본값: false
        editable: false,      // 생략 시 기본값: true
        updatable: false,     // 수정 가능 여부 (생략 시 기본값: true)
        insertable: false,    // 삽입 가능 여부 (생략 시 기본값: true)
        appendable: false,    // 행 추가 가능 여부 (생략 시 기본값: true)
        deletable: false,     // 삭제 가능 여부 (생략 시 기본값: true)
      },

      // =======================================================================
      // 📌 [선택 옵션] 4. 그룹핑, 정렬, 필터 기능 제어
      // =======================================================================
      // [선택] 상단 드래그 앤 드롭 행 그룹핑 영역 활성화 여부 (생략 시 기본값: true)
      // -> 조회 모드에서 화면을 깔끔하게 유지하기 위해 false 비활성화
      enableGrouping: false,

      // [선택] 컬럼 정렬(소팅) 활성화 여부 (생략 시 기본값: true, multiSort: true)
      // -> 서버 페이징 환경에서 클라이언트 정렬과의 충돌을 방지하기 위해 false 처리
      enableSort: false,
      sortable: false,
      multiSort: false,
      sortingOptions: { enabled: false, style: 'none' },

      // [선택] 컬럼 헤더 엑셀 스타일 다중 필터 팝오버 활성화 (생략 시 기본값: true)
      enableFilter: false,
      filterable: false,
      filteringOptions: { enabled: false },
      filterPanel: { visible: false },

      // =======================================================================
      // 📌 [선택 옵션] 5. 셀 범위 선택, 클립보드 복사 및 붙여넣기
      // =======================================================================
      // [선택] 마우스 드래그를 통한 셀 블록 범위 선택 활성화 (생략 시 기본값: true)
      enableRangeSelection: true,

      // [선택] 선택된 셀 영역 Ctrl+C 클립보드 복사 허용 (생략 시 기본값: true)
      enableClipboard: true,

      // [선택] 엑셀 데이터 복사 후 Ctrl+V 일괄 붙여넣기 허용 (생략 시 기본값: true)
      // -> 조회 전용 화면에서는 데이터 위변조 방지를 위해 false 차단 필수
      enableExcelPaste: false,

      // =======================================================================
      // 📌 [선택 옵션] 6. 그리드 내장 간이 툴바 버튼 노출 여부
      // =======================================================================
      // [선택] 상단 우측 간이 검색창 (생략 시 기본값: true) -> 상단 Vue 검색 카드가 있으므로 false
      showSearch: false,

      // [선택] 상단 우측 CSV / JSON 다운로드 기본 버튼 (생략 시 기본값: true) -> 상단 Vue 툴바 사용으로 false
      showExport: false,
      showJsonExport: false,

      // =======================================================================
      // 📌 [선택 옵션] 7. 컬럼 상호작용 (리사이즈, 순서 이동, 틀고정)
      // =======================================================================
      // [선택] 마우스 드래그로 컬럼 너비 조절 허용 (생략 시 기본값: true)
      resizable: true,

      // [선택] 마우스 드래그로 컬럼 헤더 좌우 순서 변경 허용 (생략 시 기본값: true)
      movableColumns: true,

      // [선택] 좌측 열 틀고정 개수 (생략 시 기본값: 0 | 예: 2 설정 시 앞 2개 컬럼 고정)
      // fixedColCount: 2,

      // [선택] 우측 열 틀고정 개수 (생략 시 기본값: 0)
      // fixedRightColCount: 0,
    }
  )

  // 로그 데이터 로드
  fetchLogs()
}

/** 그룹핑 토글 */
function toggleGroupBy(colKey) {
  if (!grid) return
  if (currentGroup.value === colKey) {
    grid.groupBy([])
    currentGroup.value = ''
    ElMessage.info('그룹핑이 해제되었습니다.')
  } else {
    grid.groupBy([colKey])
    currentGroup.value = colKey
    ElMessage.success(`[${colKey === 'menuNm' ? '메뉴명' : '사용자ID'}] 기준으로 그룹핑되었습니다.`)
  }
}

/** 그룹핑 해제 */
function clearGrouping() {
  if (!grid) return
  grid.groupBy([])
  currentGroup.value = ''
  ElMessage.info('그룹핑이 해제되었습니다.')
}

/** 필터 초기화 */
function resetGridFilters() {
  if (!grid) return
  grid.clearAllFilters()
}

/** 클립보드 복사 */
function copySelection() {
  if (!grid) return
  grid.copySelectedToClipboard()
}

/** Excel 파일 내보내기 */
function exportExcel() {
  if (!grid) return
  grid.exportData('excel', `menu_logs_${formatDateStr(new Date())}.xlsx`)
}

/** CSV 파일 내보내기 */
function exportCsv() {
  if (!grid) return
  grid.exportData('csv', `menu_logs_${formatDateStr(new Date())}.csv`)
}

/** 테마 변경 */
function toggleTheme() {
  if (!grid) return
  currentTheme.value = currentTheme.value === 'default' ? 'dark' : 'default'
  grid.setTheme(currentTheme.value)
  ElMessage.info(`그리드 테마: ${currentTheme.value === 'default' ? '라이트' : '다크'}`)
}

onMounted(() => {
  initGrid()
})

onUnmounted(() => {
  const container = document.querySelector('#luna-menu-log-grid')
  if (container) container.innerHTML = ''
  grid = null
  dataAdapter = null
})
</script>
