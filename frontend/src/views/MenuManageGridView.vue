<template>
  <div class="menu-manage-grid-container">
    <el-alert
      v-if="!auth.isAdmin"
      title="관리자 권한이 필요합니다."
      description="이 화면은 ROLE_ADMIN 계정만 접근할 수 있습니다."
      type="warning"
      show-icon
      :closable="false"
      class="guard-alert"
    />

    <el-card v-else shadow="never" class="grid-card">
      <div class="grid-card-header">
        <div class="header-left-title">
          <span class="grid-title">시스템 메뉴 목록</span>
          <el-tag size="small" type="primary" effect="plain">총 {{ rowCount }}건</el-tag>
          <span class="grid-guide-text">* 셀을 더블 클릭하면 인라인 편집이 가능하며, [행추가]/[행삭제] 후 [저장] 버튼을 클릭하세요.</span>
        </div>

        <!-- 루나그리드 상단 우측 액션 버튼들 -->
        <div class="grid-card-actions">
          <el-button type="primary" plain :icon="Plus" size="small" @click="handleAddRow">
            행추가
          </el-button>
          <el-button type="danger" plain :icon="Delete" size="small" @click="handleDeleteRows">
            행삭제
          </el-button>
          <el-button type="success" :icon="Check" size="small" :loading="saving" @click="handleSave">
            저장
          </el-button>
          <el-button type="info" plain :icon="Refresh" size="small" @click="fetchMenus">
            새로고침
          </el-button>
        </div>
      </div>

      <!-- 루나그리드 마운트 컨테이너 -->
      <div class="grid-wrapper">
        <div id="luna-menu-manage-grid" class="luna-grid-target"></div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Check, Refresh } from '@element-plus/icons-vue'
import http from '../api/http'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

// 그리드 인스턴스 및 상태
let grid = null
let adapter = null
let tempIdCounter = 1

const rowCount = ref(0)
const saving = ref(false)

// -----------------------------------------------------------------------------
// 1. 루나그리드 스키마 정의 (LunaValueType / LunaRowState 적용)
// -----------------------------------------------------------------------------
const LunaValueType = window.LunaValueType || {
  TEXT: 'text',
  NUMBER: 'number',
  DATETIME: 'datetime',
  BOOLEAN: 'boolean',
}

const LunaRowState = window.LunaRowState || {
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
  NORMAL: 'normal',
}

const fields = [
  { fieldName: 'id', dataType: LunaValueType.TEXT },
  { fieldName: 'menuId', dataType: LunaValueType.TEXT },
  { fieldName: 'upperMenuId', dataType: LunaValueType.TEXT },
  { fieldName: 'menuNm', dataType: LunaValueType.TEXT },
  { fieldName: 'menuUrl', dataType: LunaValueType.TEXT },
  { fieldName: 'iconClass', dataType: LunaValueType.TEXT },
  { fieldName: 'menuLvl', dataType: LunaValueType.NUMBER },
  { fieldName: 'sortOrd', dataType: LunaValueType.NUMBER },
  { fieldName: 'dispYn', dataType: LunaValueType.TEXT },
  { fieldName: 'useYn', dataType: LunaValueType.TEXT },
  { fieldName: 'targetType', dataType: LunaValueType.TEXT },
]

const columns = [
  {
    name: 'menuId',
    fieldName: 'menuId',
    header: { text: '메뉴 ID', align: 'center' },
    width: 140,
    align: 'center',
    editable: true,
    editor: 'text',
    styleName: 'col-code',
  },
  {
    name: 'upperMenuId',
    fieldName: 'upperMenuId',
    header: { text: '상위 메뉴 ID', align: 'center' },
    width: 130,
    align: 'center',
    editable: true,
    editor: 'text',
  },
  {
    name: 'menuNm',
    fieldName: 'menuNm',
    header: { text: '메뉴명', align: 'center' },
    width: 220,
    align: 'left',
    editable: true,
    editor: 'text',
  },
  {
    name: 'menuUrl',
    fieldName: 'menuUrl',
    header: { text: 'URL 경로', align: 'center' },
    width: 200,
    align: 'left',
    editable: true,
    editor: 'text',
  },
  {
    name: 'iconClass',
    fieldName: 'iconClass',
    header: { text: '아이콘', align: 'center' },
    width: 110,
    align: 'center',
    editable: true,
    editor: 'text',
  },
  {
    name: 'menuLvl',
    fieldName: 'menuLvl',
    header: { text: '레벨', align: 'center' },
    width: 70,
    align: 'center',
    editable: true,
    editor: 'number',
  },
  {
    name: 'sortOrd',
    fieldName: 'sortOrd',
    header: { text: '정렬', align: 'center' },
    width: 70,
    align: 'center',
    editable: true,
    editor: 'number',
  },
  {
    name: 'dispYn',
    fieldName: 'dispYn',
    header: { text: '노출', align: 'center' },
    width: 80,
    align: 'center',
    editable: true,
    lookupDisplay: true,
    editor: {
      type: 'select',
      options: [],
    },
  },
  {
    name: 'useYn',
    fieldName: 'useYn',
    header: { text: '사용', align: 'center' },
    width: 80,
    align: 'center',
    editable: true,
    lookupDisplay: true,
    editor: {
      type: 'select',
      options: [],
    },
  },
  {
    name: 'targetType',
    fieldName: 'targetType',
    header: { text: '타겟', align: 'center' },
    width: 100,
    align: 'center',
    editable: true,
    lookupDisplay: true,
    editor: {
      type: 'select',
      options: [],
    },
  },
]

// -----------------------------------------------------------------------------
// 2. 공통코드(USE_YN, MENU_TARGET) DB 조회 및 루나그리드 초기화
// -----------------------------------------------------------------------------
const useYnOptions = ref([])
const targetTypeOptions = ref([])

/** 백엔드 DB에서 공통상세코드(USE_YN) 조회 (라벨명 매핑) */
async function fetchUseYnCodes() {
  try {
    const { data } = await http.get('/admin/menu-grid/codes/USE_YN')
    if (Array.isArray(data) && data.length > 0) {
      return data.map((c) => ({
        value: c.code,
        label: c.codeName || c.code,
      }))
    }
    return []
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e?.message || '공통코드(USE_YN) DB 조회에 실패했습니다.')
    return []
  }
}

/** 백엔드 DB에서 공통상세코드(MENU_TARGET) 조회 (라벨명 매핑) */
async function fetchTargetTypeCodes() {
  try {
    const { data } = await http.get('/admin/menu-grid/codes/MENU_TARGET')
    if (Array.isArray(data) && data.length > 0) {
      return data.map((c) => ({
        value: c.code,
        label: c.codeName || c.code,
      }))
    }
    return []
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e?.message || '공통코드(MENU_TARGET) DB 조회에 실패했습니다.')
    return []
  }
}

async function initGrid() {
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

  // 1. DB에서 공통코드(USE_YN) 조회 후 노출/사용 컬럼 에디터 옵션 및 라벨명 렌더링(lookup) 동적 세팅
  const dynamicUseYnOptions = await fetchUseYnCodes()
  useYnOptions.value = dynamicUseYnOptions

  const lookupDataMap = {}
  dynamicUseYnOptions.forEach((opt) => {
    lookupDataMap[opt.value] = opt.label
  })

  const dispCol = columns.find((c) => c.name === 'dispYn')
  if (dispCol) {
    dispCol.lookupDisplay = true
    dispCol.lookupSource = dynamicUseYnOptions
    dispCol.lookupData = lookupDataMap
    dispCol.editor = {
      type: 'select',
      options: dynamicUseYnOptions,
    }
  }

  const useCol = columns.find((c) => c.name === 'useYn')
  if (useCol) {
    useCol.lookupDisplay = true
    useCol.lookupSource = dynamicUseYnOptions
    useCol.lookupData = lookupDataMap
    useCol.editor = {
      type: 'select',
      options: dynamicUseYnOptions,
    }
  }

  // 2. DB에서 공통코드(MENU_TARGET) 조회 후 타겟 컬럼 에디터 옵션 및 라벨명 렌더링(lookup) 동적 세팅
  const dynamicTargetOptions = await fetchTargetTypeCodes()
  targetTypeOptions.value = dynamicTargetOptions

  const targetLookupMap = {}
  dynamicTargetOptions.forEach((opt) => {
    targetLookupMap[opt.value] = opt.label
  })

  const targetCol = columns.find((c) => c.name === 'targetType')
  if (targetCol) {
    targetCol.lookupDisplay = true
    targetCol.lookupSource = dynamicTargetOptions
    targetCol.lookupData = targetLookupMap
    targetCol.editor = {
      type: 'select',
      options: dynamicTargetOptions,
    }
  }

  const container = document.querySelector('#luna-menu-manage-grid')
  if (!container) return

  container.innerHTML = ''

  adapter = new window.LunaDataAdapter()
  adapter.setFields(fields)
  adapter.setOptions({
    checkStates: true,
    undoable: true,
  })

  grid = new window.LunaGrid('#luna-menu-manage-grid', {
    title: '',
    dataAdapter: adapter,
    columns: columns,
    rowHeight: 38,
    height: 'auto',
    displayOptions: {
      rowHeight: 38,
      minRowHeight: 38,
    },
    pageable: false,
    showFooterPagingInfo: false,
    pagingOptions: {
      enabled: false,
    },
    enableGrouping: false,
    enableSort: false,
    enableFilter: false,
    showSearch: false,
    showExport: false,
    showJsonExport: false,
    indicator: { visible: true, width: '45px', label: 'No' },
    stateBar: { visible: true, width: '40px', label: '상태' },
    checkBar: { visible: true, width: '48px', multiSelect: true },
    selectable: true,
    multiSelect: true,
    editable: true,
    editOptions: {
      readOnly: false,
      editable: true,
      updatable: true,
      insertable: true,
      appendable: true,
      deletable: true,
    },
    editTrigger: 'dblclick',
    onSave: () => handleSave(),
    onAddRow: () => handleAddRow(),
    onDeleteRow: () => handleDeleteRows(),
  })

  await fetchMenus()
}

// -----------------------------------------------------------------------------
// 3. 메뉴 데이터 조회 및 평면화 바인딩
// -----------------------------------------------------------------------------
function flattenMenuTree(tree, depth = 0) {
  const result = []
  for (const item of tree) {
    result.push({
      id: item.menuId,
      menuId: item.menuId,
      upperMenuId: item.upperMenuId || '',
      menuNm: item.menuNm || '',
      menuUrl: item.menuUrl || '',
      iconClass: item.iconClass || '',
      menuLvl: item.menuLvl || (depth + 1),
      sortOrd: item.sortOrd || 0,
      dispYn: item.dispYn || 'Y',
      useYn: item.useYn || 'Y',
      targetType: item.targetType || '_SELF',
      _isNew: false,
    })
    if (Array.isArray(item.children) && item.children.length > 0) {
      result.push(...flattenMenuTree(item.children, depth + 1))
    }
  }
  return result
}

async function fetchMenus() {
  if (!auth.isAdmin) return
  pendingDeleteMenuIds.value.clear()
  try {
    const { data } = await http.get('/admin/menu-grid/menus')
    const flatList = flattenMenuTree(data || [])
    rowCount.value = flatList.length

    if (adapter) {
      adapter.setRows(flatList)
      adapter.commit()
    }
  } catch (e) {
    ElMessage.error(e?.message || '메뉴 목록 조회에 실패했습니다.')
  }
}

// -----------------------------------------------------------------------------
// 4. 루나그리드 C/U/D (행추가, 행삭제, 저장)
// -----------------------------------------------------------------------------

/** 행 추가 */
function handleAddRow() {
  if (!adapter) return
  const tempId = `NEW_MENU_${tempIdCounter++}`
  const nextSort = (adapter.getRowCount ? adapter.getRowCount() : rowCount.value) + 1

  const defaultVal = useYnOptions.value.length > 0 ? useYnOptions.value[0].value : 'Y'
  const defaultTarget = targetTypeOptions.value.length > 0 ? targetTypeOptions.value[0].value : '_SELF'
  const newRow = {
    id: tempId,
    menuId: '',
    upperMenuId: '',
    menuNm: '',
    menuUrl: '',
    iconClass: '',
    menuLvl: 1,
    sortOrd: nextSort,
    dispYn: defaultVal,
    useYn: defaultVal,
    targetType: defaultTarget,
    _isNew: true,
  }

  adapter.addRow(newRow, 'top')
  rowCount.value = adapter.getRowCount ? adapter.getRowCount() : rowCount.value + 1
  ElMessage.info('상단에 신규 메뉴 행이 추가되었습니다. 메뉴 ID, 메뉴명 등을 입력 후 [저장]하세요.')
}

// 삭제 대기 중인 DB 메뉴 ID 목록
const pendingDeleteMenuIds = ref(new Set())

/** 행 삭제 (그리드에서 삭제 상태 'D' 및 취소선 표시, 토글 지원) */
function handleDeleteRows() {
  if (!grid || !adapter) return

  const checkedRows = grid.getCheckedRows ? grid.getCheckedRows() : []
  if (!checkedRows || checkedRows.length === 0) {
    ElMessage.warning('삭제할 메뉴를 체크박스로 선택해주세요.')
    return
  }

  let markDeletedCount = 0
  let unmarkDeletedCount = 0
  let newRemoveCount = 0

  for (const r of checkedRows) {
    const currentState = adapter.getRowState ? adapter.getRowState(r.id) : null
    const isAlreadyDeleted =
      currentState === 'deleted' ||
      currentState === 'createAndDeleted' ||
      !!r._isDeleted

    if (r._isNew) {
      // 신규 추가된 행은 DB에 없으므로 그리드에서 바로 제거
      adapter.removeRow(r.id)
      newRemoveCount++
    } else {
      // 기존 DB 행: 이미 삭제 상태인 경우 취소(원복), 아니면 삭제 상태(D)로 지정
      if (isAlreadyDeleted) {
        adapter.setRowState(r.id, 'none', true)
        r._isDeleted = false
        if (r.menuId) pendingDeleteMenuIds.value.delete(r.menuId)
        unmarkDeletedCount++
      } else {
        adapter.setRowState(r.id, 'deleted', true)
        r._isDeleted = true
        if (r.menuId) pendingDeleteMenuIds.value.add(r.menuId)
        markDeletedCount++
      }
    }
  }

  rowCount.value = adapter.getRowCount ? adapter.getRowCount() : adapter.getRows().length
  if (typeof grid.clearChecked === 'function') {
    grid.clearChecked()
  }

  const msgParts = []
  if (markDeletedCount > 0) msgParts.push(`메뉴 ${markDeletedCount}건 삭제 대기(D) 지정`)
  if (unmarkDeletedCount > 0) msgParts.push(`메뉴 ${unmarkDeletedCount}건 삭제 상태 취소(원복)`)
  if (newRemoveCount > 0) msgParts.push(`신규 행 ${newRemoveCount}건 제거`)

  ElMessage.info(`${msgParts.join(', ')} 되었습니다. [저장] 버튼을 클릭하면 추가, 수정, 삭제가 한 번에 반영됩니다.`)
}

/** 완전 일괄 저장 (신규 등록 + 수정 + 삭제를 단일 트랜잭션으로 일괄 전송) */
async function handleSave() {
  if (!adapter || !grid) return

  // 셀 편집 강제 커밋
  if (typeof grid.commitEdit === 'function') {
    grid.commitEdit()
  }

  const allRows = adapter.getRows ? adapter.getRows() : []
  const createdRows = []
  const updatedRows = []
  const deletedRows = []

  for (const r of allRows) {
    const rowState = adapter.getRowState ? adapter.getRowState(r.id) : null
    const isDeleted =
      rowState === 'deleted' ||
      rowState === 'createAndDeleted' ||
      !!r._isDeleted

    if (isDeleted) {
      if (!r._isNew && r.menuId) {
        deletedRows.push(r)
      }
    } else if (r._isNew || rowState === LunaRowState.CREATED) {
      createdRows.push(r)
    } else if (rowState === LunaRowState.UPDATED || r._isDirty) {
      updatedRows.push(r)
    }
  }

  // 삭제 대기 ID 셋과 결합하여 중복 제거
  const deleteIdSet = new Set(deletedRows.map((r) => r.menuId.trim()))
  if (pendingDeleteMenuIds.value) {
    pendingDeleteMenuIds.value.forEach((id) => {
      if (id && id.trim()) deleteIdSet.add(id.trim())
    })
  }
  const deleteList = Array.from(deleteIdSet).map((id) => ({ menuId: id }))

  if (createdRows.length === 0 && updatedRows.length === 0 && deleteList.length === 0) {
    ElMessage.info('저장할 메뉴 변경 내역(추가/수정/삭제)이 없습니다.')
    return
  }

  // 1. 신규 행 MENU_ID 필수값 및 형식 유효성 검증
  for (const r of createdRows) {
    if (!r.menuId || !r.menuId.trim()) {
      ElMessage.warning('신규 메뉴 행의 [메뉴 ID]는 필수 입력 항목입니다.')
      return
    }
    if (!/^[A-Za-z0-9_]{2,30}$/.test(r.menuId.trim())) {
      ElMessage.warning(`[${r.menuId}] 메뉴 ID는 영문/숫자/언더스코어 2~30자여야 합니다.`)
      return
    }
    if (!r.menuNm || !r.menuNm.trim()) {
      ElMessage.warning(`[${r.menuId}] 메뉴의 [메뉴명]을 입력해주세요.`)
      return
    }
  }

  // 2. 수정 행 MENU_NM 필수값 유효성 검증
  for (const r of updatedRows) {
    if (!r.menuNm || !r.menuNm.trim()) {
      ElMessage.warning(`[${r.menuId}] 메뉴의 [메뉴명]을 입력해주세요.`)
      return
    }
  }

  // 3. MENU_ID 중복 검증 (삭제 대상 제외, 활성 행 전체 대상)
  const menuIdCounts = new Map()
  const duplicateIds = new Set()

  for (const r of allRows) {
    const rowState = adapter.getRowState ? adapter.getRowState(r.id) : null
    const isDeleted =
      rowState === 'deleted' ||
      rowState === 'createAndDeleted' ||
      !!r._isDeleted

    if (isDeleted) continue // 삭제 대기 행은 중복 검사에서 제외

    const mid = (r.menuId || '').trim()
    if (mid) {
      if (menuIdCounts.has(mid)) {
        duplicateIds.add(mid)
      } else {
        menuIdCounts.set(mid, true)
      }
    }
  }

  if (duplicateIds.size > 0) {
    ElMessage.warning(`중복된 메뉴 ID가 존재합니다: [${Array.from(duplicateIds).join(', ')}]\n메뉴 ID는 중복될 수 없으므로 수정 후 다시 저장해주세요.`)
    return
  }

  // 4. 저장 확인 팝업
  const summaryParts = []
  if (createdRows.length > 0) summaryParts.push(`추가 ${createdRows.length}건`)
  if (updatedRows.length > 0) summaryParts.push(`수정 ${updatedRows.length}건`)
  if (deleteList.length > 0) summaryParts.push(`삭제 ${deleteList.length}건`)

  try {
    await ElMessageBox.confirm(
      `다음 변경사항을 DB에 일괄 반영하시겠습니까?\n(${summaryParts.join(', ')})`,
      '일괄 저장 확인',
      {
        confirmButtonText: '저장',
        cancelButtonText: '취소',
        type: deleteList.length > 0 ? 'warning' : 'info',
      }
    )
  } catch {
    return
  }

  try {
    saving.value = true
    await http.post('/admin/menu-grid/save', {
      created: createdRows.map((r) => ({
        menuId: r.menuId.trim(),
        upperMenuId: r.upperMenuId && r.upperMenuId.trim() !== '' ? r.upperMenuId.trim() : null,
        menuNm: r.menuNm.trim(),
        menuUrl: r.menuUrl ? r.menuUrl.trim() : '',
        iconClass: r.iconClass ? r.iconClass.trim() : '',
        sortOrd: Number(r.sortOrd) || 1,
        dispYn: r.dispYn || 'Y',
        useYn: r.useYn || 'Y',
        targetType: r.targetType || '_SELF',
      })),
      updated: updatedRows.map((r) => ({
        menuId: r.menuId ? r.menuId.trim() : '',
        upperMenuId: r.upperMenuId && r.upperMenuId.trim() !== '' ? r.upperMenuId.trim() : null,
        menuNm: r.menuNm.trim(),
        menuUrl: r.menuUrl ? r.menuUrl.trim() : '',
        iconClass: r.iconClass ? r.iconClass.trim() : '',
        sortOrd: Number(r.sortOrd) || 1,
        dispYn: r.dispYn || 'Y',
        useYn: r.useYn || 'Y',
        targetType: r.targetType || '_SELF',
      })),
      deleted: deleteList,
    })

    pendingDeleteMenuIds.value.clear()
    ElMessage.success('메뉴가 성공적으로 일괄 저장되었습니다. (추가/수정/삭제 반영)')
    await fetchMenus()
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e?.message || '메뉴 일괄 저장 중 오류가 발생했습니다.')
  } finally {
    saving.value = false
  }
}

// -----------------------------------------------------------------------------
// 5. 수명주기 관리 (메모리 해제)
// -----------------------------------------------------------------------------
onMounted(() => {
  initGrid()
})

onUnmounted(() => {
  const container = document.querySelector('#luna-menu-manage-grid')
  if (container) container.innerHTML = ''
  grid = null
  adapter = null
})
</script>
