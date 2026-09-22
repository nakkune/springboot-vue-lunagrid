<template>
  <div class="common-code-container">


    <!-- 권한 알림 -->
    <el-alert
      v-if="!auth.isAdmin"
      title="관리자 권한이 필요합니다."
      description="이 화면은 ROLE_ADMIN 권한을 가진 계정만 사용할 수 있습니다."
      type="warning"
      show-icon
      :closable="false"
      class="guard-alert"
    />

    <div v-else class="content-wrapper">
      <!-- 검색 필터 카드 -->
      <el-card class="search-card" shadow="never">
        <el-form :model="filters" label-position="left" label-width="90px" @submit.prevent="handleSearch">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8" :lg="7">
              <el-form-item label="그룹 코드">
                <el-input
                  v-model="filters.grpCd"
                  placeholder="그룹코드 입력 (예: USER_STATUS)"
                  clearable
                  :prefix-icon="Key"
                  @keyup.enter="handleSearch"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="7">
              <el-form-item label="그룹 코드명">
                <el-input
                  v-model="filters.grpNm"
                  placeholder="그룹명 입력"
                  clearable
                  :prefix-icon="Document"
                  @keyup.enter="handleSearch"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="5">
              <el-form-item label="사용 여부">
                <el-select v-model="filters.useYn" placeholder="전체" clearable style="width: 100%">
                  <el-option label="전체" value="" />
                  <el-option label="사용 (Y)" value="Y" />
                  <el-option label="미사용 (N)" value="N" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="24" :lg="5" class="search-btn-col">
              <el-button type="primary" :icon="Search" @click="handleSearch">조회</el-button>
              <el-button :icon="RefreshLeft" @click="handleResetSearch">초기화</el-button>
            </el-col>
          </el-row>
        </el-form>
      </el-card>

      <!-- ================================================================= -->
      <!-- 1. 상단 그리드: 공통 그룹 코드 (TB_COM_GRP_CD) -->
      <!-- ================================================================= -->
      <el-card class="grid-card" shadow="never">
        <div class="grid-card-header">
          <div class="header-left-title">
            <span class="grid-title">공통 그룹 코드 (TB_COM_GRP_CD)</span>
            <el-tag size="small" type="info" effect="plain" class="count-tag">
              총 {{ grpRowCount }}건
            </el-tag>
            <el-tag v-if="selectedGrpCd" size="small" type="success" effect="dark" class="active-tag">
              선택 그룹: {{ selectedGrpCd }} ({{ selectedGrpNm }})
            </el-tag>
            <span class="grid-help-tip">※ 행을 클릭하면 하단에 상세 코드가 자동 조회되며, 셀 더블클릭으로 인라인 편집이 가능합니다.</span>
          </div>

          <!-- 상단 그룹 그리드 툴바: [행추가], [행삭제], [저장] -->
          <div class="grid-card-actions">
            <el-button type="primary" plain :icon="Plus" size="small" @click="handleAddGrpRow">
              행추가
            </el-button>
            <el-button type="danger" plain :icon="Delete" size="small" @click="handleDeleteGrpRows">
              행삭제
            </el-button>
            <el-button type="success" :icon="Check" size="small" :loading="savingGrp" @click="handleSaveGrp">
              저장
            </el-button>
            <el-button type="info" plain :icon="Refresh" size="small" @click="fetchGroupCodes">
              새로고침
            </el-button>
          </div>
        </div>

        <!-- 루나그리드 상단 마운트 영역 -->
        <div class="grid-wrapper">
          <div id="luna-grp-grid" class="luna-grid-target"></div>
        </div>
      </el-card>

      <!-- ================================================================= -->
      <!-- 2. 하단 그리드: 공통 상세 코드 (TB_COM_DTL_CD) -->
      <!-- ================================================================= -->
      <el-card class="grid-card detail-grid-card" shadow="never">
        <div class="grid-card-header">
          <div class="header-left-title">
            <span class="grid-title">공통 상세 코드 (TB_COM_DTL_CD)</span>
            <el-tag size="small" type="info" effect="plain" class="count-tag">
              총 {{ dtlRowCount }}건
            </el-tag>
            <el-tag v-if="selectedGrpCd" size="small" type="primary" effect="plain" class="active-tag">
              소속 그룹: {{ selectedGrpCd }}
            </el-tag>
            <el-tag v-else size="small" type="danger" effect="plain" class="active-tag">
              상단 그룹 미선택 (상단 행을 클릭하세요)
            </el-tag>
            <span class="grid-help-tip">※ 상단 그룹 코드가 삭제될 경우 소속된 모든 상세 코드가 백엔드에서 먼저 선삭제됩니다.</span>
          </div>

          <!-- 하단 상세 그리드 툴바: [행추가], [행삭제], [저장] -->
          <div class="grid-card-actions">
            <el-button
              type="primary"
              plain
              :icon="Plus"
              size="small"
              :disabled="!selectedGrpCd"
              @click="handleAddDtlRow"
            >
              행추가
            </el-button>
            <el-button
              type="danger"
              plain
              :icon="Delete"
              size="small"
              :disabled="!selectedGrpCd"
              @click="handleDeleteDtlRows"
            >
              행삭제
            </el-button>
            <el-button
              type="success"
              :icon="Check"
              size="small"
              :loading="savingDtl"
              :disabled="!selectedGrpCd"
              @click="handleSaveDtl"
            >
              저장
            </el-button>
            <el-button
              type="info"
              plain
              :icon="Refresh"
              size="small"
              :disabled="!selectedGrpCd"
              @click="fetchDetailCodes(selectedGrpCd)"
            >
              새로고침
            </el-button>
          </div>
        </div>

        <!-- 루나그리드 하단 마운트 영역 -->
        <div class="grid-wrapper">
          <div id="luna-dtl-grid" class="luna-grid-target"></div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, reactive, ref, nextTick } from 'vue'
import {
  Search,
  Refresh,
  RefreshLeft,
  Plus,
  Delete,
  Check,
  Key,
  Document,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '../api/http'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

// 검색 필터
const filters = reactive({
  grpCd: '',
  grpNm: '',
  useYn: '',
})

// 상태 변수
const selectedGrpCd = ref('')
const selectedGrpNm = ref('')
const grpRowCount = ref(0)
const dtlRowCount = ref(0)
const savingGrp = ref(false)
const savingDtl = ref(false)

// 루나그리드 & 데이터어댑터 인스턴스
let grpGrid = null
let grpAdapter = null
let dtlGrid = null
let dtlAdapter = null

// 임시 고유 ID 생성 카운터 (신규 행용)
let tempIdCounter = 1000

// =============================================================================
// 1. 공통 그룹 코드 (TB_COM_GRP_CD) 그리드 스키마 정의
// =============================================================================
// LunaValueType 상수 참조 (초기 파싱 시 fallback 지원)
const LunaValueType = window.LunaValueType || {
  TEXT: 'text',
  NUMBER: 'number',
  DATETIME: 'datetime',
  BOOLEAN: 'boolean',
}

const grpFields = [
  { fieldName: 'id', dataType: LunaValueType.TEXT },
  { fieldName: 'grpCd', dataType: LunaValueType.TEXT },
  { fieldName: 'grpNm', dataType: LunaValueType.TEXT },
  { fieldName: 'grpDesc', dataType: LunaValueType.TEXT },
  { fieldName: 'useYn', dataType: LunaValueType.TEXT },
  { fieldName: 'regUserId', dataType: LunaValueType.TEXT },
  { fieldName: 'regDt', dataType: LunaValueType.DATETIME },
  { fieldName: 'modUserId', dataType: LunaValueType.TEXT },
  { fieldName: 'modDt', dataType: LunaValueType.DATETIME },
  { fieldName: '_isNew', dataType: LunaValueType.BOOLEAN },
]

const grpColumns = [
  {
    name: 'grpCd',
    fieldName: 'grpCd',
    header: { text: '그룹 코드 *', align: 'center' },
    width: 150,
    align: 'center',
    editable: true,
    editor: 'text',
    styleName: 'col-code',
  },
  {
    name: 'grpNm',
    fieldName: 'grpNm',
    header: { text: '그룹 코드명 *', align: 'center' },
    width: 200,
    editable: true,
    editor: 'text',
  },
  {
    name: 'grpDesc',
    fieldName: 'grpDesc',
    header: { text: '그룹 설명', align: 'center' },
    width: 300,
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
    name: 'regUserId',
    fieldName: 'regUserId',
    header: { text: '등록자', align: 'center' },
    width: 110,
    align: 'center',
    editable: false,
    readOnly: true,
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

// =============================================================================
// 2. 공통 상세 코드 (TB_COM_DTL_CD) 그리드 스키마 정의
// =============================================================================
const dtlFields = [
  { fieldName: 'id', dataType: LunaValueType.TEXT },
  { fieldName: 'grpCd', dataType: LunaValueType.TEXT },
  { fieldName: 'dtlCd', dataType: LunaValueType.TEXT },
  { fieldName: 'dtlNm', dataType: LunaValueType.TEXT },
  { fieldName: 'dtlDesc', dataType: LunaValueType.TEXT },
  { fieldName: 'attr1', dataType: LunaValueType.TEXT },
  { fieldName: 'attr2', dataType: LunaValueType.TEXT },
  { fieldName: 'attr3', dataType: LunaValueType.TEXT },
  { fieldName: 'sortOrd', dataType: LunaValueType.NUMBER },
  { fieldName: 'useYn', dataType: LunaValueType.TEXT },
  { fieldName: 'regUserId', dataType: LunaValueType.TEXT },
  { fieldName: 'regDt', dataType: LunaValueType.DATETIME },
  { fieldName: 'modUserId', dataType: LunaValueType.TEXT },
  { fieldName: 'modDt', dataType: LunaValueType.DATETIME },
  { fieldName: '_isNew', dataType: LunaValueType.BOOLEAN },
]

const dtlColumns = [
  {
    name: 'grpCd',
    fieldName: 'grpCd',
    header: { text: '그룹 코드', align: 'center' },
    width: 130,
    align: 'center',
    editable: false,
    readOnly: true,
    styleName: 'col-readonly-code',
  },
  {
    name: 'dtlCd',
    fieldName: 'dtlCd',
    header: { text: '상세 코드 *', align: 'center' },
    width: 140,
    align: 'center',
    editable: true,
    editor: 'text',
    styleName: 'col-code',
  },
  {
    name: 'dtlNm',
    fieldName: 'dtlNm',
    header: { text: '상세 코드명 *', align: 'center' },
    width: 180,
    editable: true,
    editor: 'text',
  },
  {
    name: 'dtlDesc',
    fieldName: 'dtlDesc',
    header: { text: '상세 설명', align: 'center' },
    width: 220,
    editable: true,
    editor: 'text',
  },
  {
    name: 'attr1',
    fieldName: 'attr1',
    header: { text: '속성 1', align: 'center' },
    width: 110,
    align: 'center',
    editable: true,
    editor: 'text',
  },
  {
    name: 'attr2',
    fieldName: 'attr2',
    header: { text: '속성 2', align: 'center' },
    width: 110,
    align: 'center',
    editable: true,
    editor: 'text',
  },
  {
    name: 'sortOrd',
    fieldName: 'sortOrd',
    header: { text: '정렬순서', align: 'center' },
    width: 90,
    align: 'center',
    type: 'number',
    editable: true,
    editor: { type: 'numberSpin', min: 1, max: 9999 },
  },
  {
    name: 'useYn',
    fieldName: 'useYn',
    header: { text: '사용여부', align: 'center' },
    width: 90,
    align: 'center',
    editable: true,
    editor: { type: 'select', options: ['Y', 'N'] },
  },
  {
    name: 'regUserId',
    fieldName: 'regUserId',
    header: { text: '등록자', align: 'center' },
    width: 100,
    align: 'center',
    editable: false,
    readOnly: true,
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

// =============================================================================
// 날짜 포맷 함수
// =============================================================================
function formatDt(val) {
  if (!val) return '-'
  const d = new Date(val)
  if (isNaN(d.getTime())) return val
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// =============================================================================
// 그리드 초기화
// =============================================================================
async function initGrids() {
  await nextTick()

  let retry = 0
  while ((!window.LunaGrid || !window.LunaDataAdapter) && retry < 30) {
    await new Promise((r) => setTimeout(r, 100))
    retry++
  }

  if (!window.LunaGrid || !window.LunaDataAdapter) {
    ElMessage.error('LunaGrid 라이브러리를 로드하지 못했습니다.')
    return
  }

  // 1. 상단 그룹 코드 그리드 생성
  const grpContainer = document.querySelector('#luna-grp-grid')
  if (grpContainer) {
    grpContainer.innerHTML = ''
    grpAdapter = new window.LunaDataAdapter()
    grpAdapter.setFields(grpFields)
    grpAdapter.setOptions({
      checkStates: true,
      undoable: true,
    })

    grpGrid = new window.LunaGrid('#luna-grp-grid', {
      title: '',
      dataAdapter: grpAdapter,
      columns: grpColumns,
      rowHeight: 38,
      displayOptions: {
        rowHeight: 38,
        minRowHeight: 38,
      },
      pageable: true,
      pageSize: 5,
      pageSizeOptions: [5, 10, 20, 50],
      showFooterPagingInfo: true,
      pagingAlign: 'center',
      paginationAlign: 'center',
      pagingOptions: {
        enabled: true,
        size: 5,
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
      editTrigger: 'dblclick',
      onRowClick: (rowData) => {
        if (!rowData || !rowData.grpCd) return
        onSelectGroupRow(rowData)
      },
      onCellClick: (cellValue, rowData) => {
        if (!rowData || !rowData.grpCd) return
        onSelectGroupRow(rowData)
      },
    })
  }

  // 2. 하단 상세 코드 그리드 생성
  const dtlContainer = document.querySelector('#luna-dtl-grid')
  if (dtlContainer) {
    dtlContainer.innerHTML = ''
    dtlAdapter = new window.LunaDataAdapter()
    dtlAdapter.setFields(dtlFields)
    dtlAdapter.setOptions({
      checkStates: true,
      undoable: true,
    })

    dtlGrid = new window.LunaGrid('#luna-dtl-grid', {
      title: '',
      dataAdapter: dtlAdapter,
      columns: dtlColumns,
      rowHeight: 38,
      displayOptions: {
        rowHeight: 38,
        minRowHeight: 38,
      },
      pageable: true,
      pageSize: 5,
      pageSizeOptions: [5, 10, 20, 50],
      showFooterPagingInfo: true,
      pagingAlign: 'center',
      paginationAlign: 'center',
      pagingOptions: {
        enabled: true,
        size: 5,
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
      editTrigger: 'dblclick',
    })
  }

  // 초기 그룹 코드 데이터 조회
  await fetchGroupCodes()
}

// 상단 그룹 행 선택 시 처리
function onSelectGroupRow(rowData) {
  if (selectedGrpCd.value === rowData.grpCd) return
  selectedGrpCd.value = rowData.grpCd || ''
  selectedGrpNm.value = rowData.grpNm || ''
  fetchDetailCodes(rowData.grpCd)
}

// =============================================================================
// 데이터 조회 (그룹 및 상세)
// =============================================================================
async function fetchGroupCodes() {
  if (!auth.isAdmin) return
  try {
    const params = {}
    if (filters.grpCd) params.grpCd = filters.grpCd
    if (filters.grpNm) params.grpNm = filters.grpNm
    if (filters.useYn) params.useYn = filters.useYn

    const { data } = await http.get('/admin/common-codes/groups', { params })
    const list = Array.isArray(data) ? data : []
    grpRowCount.value = list.length

    if (grpAdapter) {
      const formatted = list.map((item, idx) => ({
        id: item.grpCd || `GRP_${idx + 1}`,
        grpCd: item.grpCd,
        grpNm: item.grpNm || item.grpCdNm || '',
        grpDesc: item.grpDesc || item.grpCdDesc || '',
        useYn: item.useYn || 'Y',
        regUserId: item.regUserId || '-',
        regDt: formatDt(item.regDt),
        modUserId: item.modUserId || '-',
        modDt: formatDt(item.modDt),
        _isNew: false,
      }))
      grpAdapter.setRows(formatted)
      grpAdapter.commit()
    }

    // 기존 선택된 그룹이 여전히 존재하는지 체크
    if (selectedGrpCd.value) {
      const exists = list.some((item) => item.grpCd === selectedGrpCd.value)
      if (exists) {
        fetchDetailCodes(selectedGrpCd.value)
      } else {
        selectedGrpCd.value = ''
        selectedGrpNm.value = ''
        clearDetailGrid()
      }
    } else if (list.length > 0) {
      // 첫 번째 행 자동 선택
      selectedGrpCd.value = list[0].grpCd
      selectedGrpNm.value = list[0].grpNm || list[0].grpCdNm || ''
      fetchDetailCodes(list[0].grpCd)
    } else {
      clearDetailGrid()
    }
  } catch (e) {
    ElMessage.error(e?.message || '그룹 코드 조회 중 오류가 발생했습니다.')
  }
}

async function fetchDetailCodes(grpCd) {
  if (!grpCd) {
    clearDetailGrid()
    return
  }
  try {
    const { data } = await http.get('/admin/common-codes/details', { params: { grpCd } })
    const list = Array.isArray(data) ? data : []
    dtlRowCount.value = list.length

    if (dtlAdapter) {
      const formatted = list.map((item, idx) => ({
        id: `${item.grpCd}_${item.dtlCd}`,
        grpCd: item.grpCd,
        dtlCd: item.dtlCd,
        dtlNm: item.dtlNm || item.dtlCdNm || '',
        dtlDesc: item.dtlDesc || item.dtlCdDesc || '',
        attr1: item.attr1 || item.attrVal1 || '',
        attr2: item.attr2 || item.attrVal2 || '',
        attr3: item.attr3 || item.attrVal3 || '',
        sortOrd: item.sortOrd ?? idx + 1,
        useYn: item.useYn || 'Y',
        regUserId: item.regUserId || '-',
        regDt: formatDt(item.regDt),
        modUserId: item.modUserId || '-',
        modDt: formatDt(item.modDt),
        _isNew: false,
      }))
      dtlAdapter.setRows(formatted)
      dtlAdapter.commit()
    }
  } catch (e) {
    ElMessage.error(e?.message || '상세 코드 조회 중 오류가 발생했습니다.')
  }
}

function clearDetailGrid() {
  dtlRowCount.value = 0
  if (dtlAdapter) {
    dtlAdapter.setRows([])
    dtlAdapter.commit()
  }
}

function handleSearch() {
  fetchGroupCodes()
}

function handleResetSearch() {
  filters.grpCd = ''
  filters.grpNm = ''
  filters.useYn = ''
  fetchGroupCodes()
}

function handleRefreshAll() {
  fetchGroupCodes()
}

// =============================================================================
// 1. 공통 그룹 코드 C/U/D (행추가, 행삭제, 저장)
// =============================================================================

/** 상단 그룹 코드 [행추가] */
function handleAddGrpRow() {
  if (!grpAdapter) return
  const tempId = `NEW_GRP_${tempIdCounter++}`

  const newRow = {
    id: tempId,
    grpCd: '',
    grpNm: '',
    grpDesc: '',
    useYn: 'Y',
    regUserId: auth.user?.userId || 'admin',
    regDt: '-',
    _isNew: true,
  }

  grpAdapter.addRow(newRow, 'top')
  grpRowCount.value = (grpAdapter.getRowCount ? grpAdapter.getRowCount() : grpRowCount.value + 1)
  ElMessage.info('상단에 신규 그룹 코드 행이 추가되었습니다. 코드와 명칭을 입력 후 [저장]하세요.')
}

/**
 * 상단 그룹 코드 [행삭제]
 * [핵심 요구사항]
 * 공통 상세 코드가 먼저 삭제되고 공통 그룹 코드가 삭제되도록 안내 및 백엔드 연계 처리
 */
async function handleDeleteGrpRows() {
  if (!grpGrid || !grpAdapter) return

  const checkedRows = grpGrid.getCheckedRows ? grpGrid.getCheckedRows() : []
  if (!checkedRows || checkedRows.length === 0) {
    ElMessage.warning('삭제할 공통 그룹 코드를 체크박스로 선택해주세요.')
    return
  }

  const grpCds = checkedRows.map((r) => r.grpCd).filter(Boolean)
  const count = checkedRows.length

  // 경고 메시지 표시: 상세 코드가 먼저 삭제되고 그룹 코드가 삭제됨을 명확히 안내
  try {
    await ElMessageBox.confirm(
      `선택한 ${count}건의 공통 그룹 코드를 삭제하시겠습니까?\n\n[연계 삭제 안내]\n해당 그룹 코드에 속한 모든 공통 상세 코드(TB_COM_DTL_CD)가 먼저 삭제된 후, 공통 그룹 코드(TB_COM_GRP_CD)가 삭제됩니다.\n\n대상 코드: [${grpCds.join(', ')}]`,
      '공통 그룹 코드 연계 삭제 확인',
      {
        confirmButtonText: '상세 코드 선삭제 및 그룹 삭제',
        cancelButtonText: '취소',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        dangerouslyUseHTMLString: false,
      }
    )
  } catch {
    // 취소됨
    return
  }

  // 서버 전송 대상 (기존 DB에 등록된 그룹 코드)
  const dbRowsToDelete = checkedRows.filter((r) => !r._isNew && r.grpCd)

  if (dbRowsToDelete.length > 0) {
    try {
      savingGrp.value = true
      await http.post('/admin/common-codes/groups/save', {
        created: [],
        updated: [],
        deleted: dbRowsToDelete.map((r) => ({ grpCd: r.grpCd })),
      })
      ElMessage.success('공통 상세 코드가 선삭제된 후 공통 그룹 코드가 성공적으로 삭제되었습니다.')
    } catch (e) {
      ElMessage.error(e?.message || '공통 그룹 코드 삭제 중 오류가 발생했습니다.')
      return
    } finally {
      savingGrp.value = false
    }
  } else {
    ElMessage.info('저장 전 신규 추가되었던 행이 삭제되었습니다.')
  }

  // 삭제된 행 화면 어댑터에서 제거 및 재조회
  await fetchGroupCodes()
}

/** 상단 그룹 코드 [저장] */
async function handleSaveGrp() {
  if (!grpAdapter || !grpGrid) return

  // 현재 셀 편집 강제 커밋
  if (typeof grpGrid.commitEdit === 'function') {
    grpGrid.commitEdit()
  }

  // 어댑터로부터 현재 C/U/D 상태 행 취득
  const allRows = grpAdapter.getRows ? grpAdapter.getRows() : []
  const createdRows = []
  const updatedRows = []

  // 행 순회하며 _isNew 또는 수정 여부 파악 (window.LunaRowState 상수 적용)
  const RowState = window.LunaRowState || { CREATED: 'created', UPDATED: 'updated' }
  for (const r of allRows) {
    const rowState = grpAdapter.getRowState ? grpAdapter.getRowState(r.id) : null
    if (r._isNew || rowState === RowState.CREATED) {
      createdRows.push(r)
    } else if (rowState === RowState.UPDATED || r._isDirty) {
      updatedRows.push(r)
    }
  }

  // 유효성 검증
  for (const r of createdRows) {
    if (!r.grpCd || !r.grpCd.trim()) {
      ElMessage.warning('신규 그룹 행의 [그룹 코드]는 필수 입력 항목입니다.')
      return
    }
    if (!r.grpNm || !r.grpNm.trim()) {
      ElMessage.warning(`[${r.grpCd}] 그룹 코드의 [그룹 코드명]을 입력해주세요.`)
      return
    }
  }

  for (const r of updatedRows) {
    if (!r.grpNm || !r.grpNm.trim()) {
      ElMessage.warning(`[${r.grpCd}] 그룹 코드의 [그룹 코드명]을 입력해주세요.`)
      return
    }
  }

  if (createdRows.length === 0 && updatedRows.length === 0) {
    ElMessage.info('저장할 그룹 코드 변경 내역이 없습니다.')
    return
  }

  try {
    savingGrp.value = true
    await http.post('/admin/common-codes/groups/save', {
      created: createdRows.map((r) => ({
        grpCd: r.grpCd.trim(),
        grpCdNm: r.grpNm.trim(),
        grpNm: r.grpNm.trim(),
        grpCdDesc: r.grpDesc || '',
        grpDesc: r.grpDesc || '',
        useYn: r.useYn || 'Y',
      })),
      updated: updatedRows.map((r) => ({
        grpCd: r.grpCd,
        grpCdNm: r.grpNm.trim(),
        grpNm: r.grpNm.trim(),
        grpCdDesc: r.grpDesc || '',
        grpDesc: r.grpDesc || '',
        useYn: r.useYn || 'Y',
      })),
      deleted: [],
    })

    ElMessage.success('공통 그룹 코드가 성공적으로 저장되었습니다.')
    await fetchGroupCodes()
  } catch (e) {
    ElMessage.error(e?.message || '공통 그룹 코드 저장 중 오류가 발생했습니다.')
  } finally {
    savingGrp.value = false
  }
}

// =============================================================================
// 2. 공통 상세 코드 C/U/D (행추가, 행삭제, 저장)
// =============================================================================

/** 하단 상세 코드 [행추가] */
function handleAddDtlRow() {
  if (!dtlAdapter || !selectedGrpCd.value) {
    ElMessage.warning('먼저 상단에서 그룹 코드를 선택해주세요.')
    return
  }
  const tempId = `NEW_DTL_${tempIdCounter++}`
  const nextSortOrd = (dtlAdapter.getRowCount ? dtlAdapter.getRowCount() : 0) + 1

  const newRow = {
    id: tempId,
    grpCd: selectedGrpCd.value,
    dtlCd: '',
    dtlNm: '',
    dtlDesc: '',
    attr1: '',
    attr2: '',
    attr3: '',
    sortOrd: nextSortOrd,
    useYn: 'Y',
    regUserId: auth.user?.userId || 'admin',
    regDt: '-',
    _isNew: true,
  }

  dtlAdapter.addRow(newRow, 'top')
  dtlRowCount.value = (dtlAdapter.getRowCount ? dtlAdapter.getRowCount() : dtlRowCount.value + 1)
  ElMessage.info(`[${selectedGrpCd.value}] 그룹에 신규 상세 코드 행이 추가되었습니다.`)
}

/** 하단 상세 코드 [행삭제] */
async function handleDeleteDtlRows() {
  if (!dtlGrid || !dtlAdapter) return

  const checkedRows = dtlGrid.getCheckedRows ? dtlGrid.getCheckedRows() : []
  if (!checkedRows || checkedRows.length === 0) {
    ElMessage.warning('삭제할 공통 상세 코드를 체크박스로 선택해주세요.')
    return
  }

  const dtlCds = checkedRows.map((r) => r.dtlCd).filter(Boolean)
  const count = checkedRows.length

  try {
    await ElMessageBox.confirm(
      `선택한 ${count}건의 공통 상세 코드를 삭제하시겠습니까?\n\n대상 코드: [${dtlCds.join(', ')}]`,
      '공통 상세 코드 삭제 확인',
      {
        confirmButtonText: '삭제 진행',
        cancelButtonText: '취소',
        type: 'warning',
      }
    )
  } catch {
    return
  }

  const dbRowsToDelete = checkedRows.filter((r) => !r._isNew && r.dtlCd)

  if (dbRowsToDelete.length > 0) {
    try {
      savingDtl.value = true
      await http.post('/admin/common-codes/details/save', {
        created: [],
        updated: [],
        deleted: dbRowsToDelete.map((r) => ({ grpCd: r.grpCd, dtlCd: r.dtlCd })),
      })
      ElMessage.success('선택한 공통 상세 코드가 삭제되었습니다.')
    } catch (e) {
      ElMessage.error(e?.message || '공통 상세 코드 삭제 중 오류가 발생했습니다.')
      return
    } finally {
      savingDtl.value = false
    }
  } else {
    ElMessage.info('저장 전 신규 추가되었던 상세 행이 삭제되었습니다.')
  }

  await fetchDetailCodes(selectedGrpCd.value)
}

/** 하단 상세 코드 [저장] */
async function handleSaveDtl() {
  if (!dtlAdapter || !dtlGrid || !selectedGrpCd.value) {
    ElMessage.warning('먼저 상단에서 그룹 코드를 선택해주세요.')
    return
  }

  if (typeof dtlGrid.commitEdit === 'function') {
    dtlGrid.commitEdit()
  }

  const allRows = dtlAdapter.getRows ? dtlAdapter.getRows() : []
  const createdRows = []
  const updatedRows = []

  // 행 순회하며 _isNew 또는 수정 여부 파악 (window.LunaRowState 상수 적용)
  const RowState = window.LunaRowState || { CREATED: 'created', UPDATED: 'updated' }
  for (const r of allRows) {
    const rowState = dtlAdapter.getRowState ? dtlAdapter.getRowState(r.id) : null
    if (r._isNew || rowState === RowState.CREATED) {
      createdRows.push(r)
    } else if (rowState === RowState.UPDATED || r._isDirty) {
      updatedRows.push(r)
    }
  }

  // 유효성 검증
  for (const r of createdRows) {
    if (!r.dtlCd || !r.dtlCd.trim()) {
      ElMessage.warning('신규 상세 행의 [상세 코드]는 필수 입력 항목입니다.')
      return
    }
    if (!r.dtlNm || !r.dtlNm.trim()) {
      ElMessage.warning(`[${r.dtlCd}] 상세 코드의 [상세 코드명]을 입력해주세요.`)
      return
    }
  }

  for (const r of updatedRows) {
    if (!r.dtlNm || !r.dtlNm.trim()) {
      ElMessage.warning(`[${r.dtlCd}] 상세 코드의 [상세 코드명]을 입력해주세요.`)
      return
    }
  }

  if (createdRows.length === 0 && updatedRows.length === 0) {
    ElMessage.info('저장할 상세 코드 변경 내역이 없습니다.')
    return
  }

  try {
    savingDtl.value = true
    await http.post('/admin/common-codes/details/save', {
      created: createdRows.map((r) => ({
        grpCd: selectedGrpCd.value,
        dtlCd: r.dtlCd.trim(),
        dtlCdNm: r.dtlNm.trim(),
        dtlNm: r.dtlNm.trim(),
        dtlCdDesc: r.dtlDesc || '',
        dtlDesc: r.dtlDesc || '',
        sortOrd: Number(r.sortOrd) || 1,
        attrVal1: r.attr1 || '',
        attr1: r.attr1 || '',
        attrVal2: r.attr2 || '',
        attr2: r.attr2 || '',
        attrVal3: r.attr3 || '',
        attr3: r.attr3 || '',
        useYn: r.useYn || 'Y',
      })),
      updated: updatedRows.map((r) => ({
        grpCd: r.grpCd,
        dtlCd: r.dtlCd,
        dtlCdNm: r.dtlNm.trim(),
        dtlNm: r.dtlNm.trim(),
        dtlCdDesc: r.dtlDesc || '',
        dtlDesc: r.dtlDesc || '',
        sortOrd: Number(r.sortOrd) || 1,
        attrVal1: r.attr1 || '',
        attr1: r.attr1 || '',
        attrVal2: r.attr2 || '',
        attr2: r.attr2 || '',
        attrVal3: r.attr3 || '',
        attr3: r.attr3 || '',
        useYn: r.useYn || 'Y',
      })),
      deleted: [],
    })

    ElMessage.success('공통 상세 코드가 성공적으로 저장되었습니다.')
    await fetchDetailCodes(selectedGrpCd.value)
  } catch (e) {
    ElMessage.error(e?.message || '공통 상세 코드 저장 중 오류가 발생했습니다.')
  } finally {
    savingDtl.value = false
  }
}

onMounted(() => {
  initGrids()
})

onUnmounted(() => {
  // 인스턴스 정리
  grpGrid = null
  grpAdapter = null
  dtlGrid = null
  dtlAdapter = null
})
</script>
