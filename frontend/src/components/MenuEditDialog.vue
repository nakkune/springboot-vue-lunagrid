<template>
  <el-dialog
    class="menu-edit-dialog"
    :model-value="modelValue"
    :title="dlgTitle"
    width="940px"
    destroy-on-close
    @update:model-value="(v) => $emit('update:modelValue', v)"
    @open="onOpen"
  >
    <div v-loading="loading" class="dlg-body">
      <!-- 좌측: 메뉴 트리 -->
      <aside class="tree-pane">
        <div class="tree-pane-header">
          <span>메뉴 트리</span>
          <el-button size="small" text type="primary" :icon="Plus" @click="startCreateUnder(null)">
            최상위 추가
          </el-button>
        </div>
        <el-input
          v-model="filterText"
          placeholder="메뉴명 검색"
          :prefix-icon="Search"
          clearable
          size="small"
          class="tree-search"
        />
        <el-scrollbar class="tree-scroll">
          <el-tree
            ref="treeRef"
            :data="treeData"
            node-key="menuId"
            highlight-current
            :expand-on-click-node="false"
            default-expand-all
            :filter-node-method="filterNode"
            @node-click="onNodeClick"
          >
            <template #default="{ data }">
              <span class="tree-node">
                <el-icon class="tree-icon"><component :is="resolveIcon(data.iconClass)" /></el-icon>
                <span class="tree-label">{{ data.menuNm }}</span>
                <span class="node-actions">
                  <el-tooltip content="이 메뉴 아래에 추가" placement="top" :hide-after="0">
                    <el-button
                      link type="primary" size="small"
                      class="act-btn" :icon="CirclePlus"
                      @click.stop="startCreateUnder(data)"
                    />
                  </el-tooltip>
                  <el-tooltip v-if="!hasChildren(data)" content="삭제" placement="top" :hide-after="0">
                    <el-button
                      link type="danger" size="small"
                      class="act-btn" :icon="Delete"
                      @click.stop="removeNode(data)"
                    />
                  </el-tooltip>
                </span>
                <el-tag v-if="data.dispYn === 'N'" size="small" type="info">숨김</el-tag>
              </span>
            </template>
          </el-tree>
        </el-scrollbar>
        <div class="tree-pane-footer">
          <span class="loc-label">
            등록 위치: <b>{{ parentPathLabel }}</b>
          </span>
          <el-button
            v-if="form.upperMenuId"
            link size="small" type="primary" @click="resetToRoot"
          >루트로 변경</el-button>
        </div>
      </aside>

      <!-- 우측: 속성 등록 -->
      <section class="form-pane">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
          <el-divider content-position="left">기본정보</el-divider>

          <!-- 좌측 트리에서 선택한 등록 위치 (조회 전용) -->
          <el-row :gutter="12">
            <el-col :span="12">
              <el-form-item label="상위 메뉴 ID">
                <el-input :model-value="parentMenu?.menuId || '최상위'" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="상위 메뉴명">
                <el-input :model-value="parentMenu ? parentMenu.menuNm : '최상위'" disabled />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="메뉴 ID" prop="menuId">
            <el-input
              v-model="form.menuId"
              placeholder="예: MNU_BBS_001 (영문/숫자/언더스코어)"
              :disabled="activeMode === 'edit'"
              style="max-width: 320px"
            />
          </el-form-item>
          <el-form-item label="메뉴명" prop="menuNm">
            <el-input v-model="form.menuNm" placeholder="예: 공지사항" maxlength="100" style="max-width: 320px" />
          </el-form-item>

          <el-divider content-position="left">화면정보</el-divider>

          <el-form-item label="메뉴 URL">
            <el-input v-model="form.menuUrl" placeholder="/notice (비우면 그룹 메뉴)" style="max-width: 320px" />
          </el-form-item>
          <el-form-item label="아이콘">
            <div class="icon-row">
              <el-select
                v-model="form.iconClass"
                filterable allow-create clearable
                placeholder="아이콘 선택 또는 직접 입력"
                style="width: 260px"
              >
                <el-option v-for="name in iconOptions" :key="name" :label="name" :value="name" />
              </el-select>
              <span class="icon-preview">
                <el-icon :size="20"><component :is="resolveIcon(form.iconClass)" /></el-icon>
              </span>
              <span class="muted">{{ form.iconClass || '아이콘 없음' }}</span>
            </div>
          </el-form-item>
          <el-form-item label="화면 타겟">
            <el-radio-group v-model="form.targetType">
              <el-radio-button value="_SELF">현재창</el-radio-button>
              <el-radio-button value="_BLANK">새창</el-radio-button>
              <el-radio-button value="MODAL">모달</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-divider content-position="left">노출 · 정렬</el-divider>

          <el-form-item label="정렬 순서">
            <el-input-number v-model="form.sortOrd" :min="0" :max="999" controls-position="right" />
            <span class="muted sort-hint">같은 레벨 내 표시 순서 (작을수록 먼저)</span>
          </el-form-item>
          <el-form-item label="메뉴 노출">
            <el-switch v-model="form.dispYn" active-value="Y" inactive-value="N" active-text="노출" inactive-text="숨김" />
          </el-form-item>
          <el-form-item label="사용 여부">
            <el-switch v-model="form.useYn" active-value="Y" inactive-value="N" active-text="사용" inactive-text="중지" />
          </el-form-item>
        </el-form>
      </section>
    </div>

    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">취소</el-button>
      <el-button type="primary" :loading="saving" @click="save">
        {{ activeMode === 'edit' ? '수정 저장' : '등록' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as Icons from '@element-plus/icons-vue'
import { Search, Plus, CirclePlus, Delete } from '@element-plus/icons-vue'
import http from '../api/http'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  mode: { type: String, default: 'create' }, // 팝업이 열린 목적: 'create' | 'edit'
  editRow: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const loading = ref(false)
const saving = ref(false)
const treeData = ref([])
const treeRef = ref(null)
const formRef = ref(null)
const filterText = ref('')

// 팝업 내부에서 [+] 버튼으로 등록모드로 전환될 수 있어 내부 모드를 별도 관리
const activeMode = ref('create')
const editingId = ref(null)

const emptyForm = () => ({
  menuId: '',
  menuNm: '',
  upperMenuId: '',
  menuUrl: '',
  iconClass: '',
  sortOrd: 1,
  targetType: '_SELF',
  dispYn: 'Y',
  useYn: 'Y',
})
const form = ref(emptyForm())
let snapshot = ''
const isDirty = computed(() => JSON.stringify(form.value) !== snapshot)

function takeSnapshot() {
  snapshot = JSON.stringify(form.value)
}

async function confirmIfDirty() {
  if (!isDirty.value) return true
  try {
    await ElMessageBox.confirm('저장하지 않은 변경사항이 사라집니다. 계속하시겠습니까?', '알림', {
      confirmButtonText: '계속',
      cancelButtonText: '취소',
      type: 'warning',
    })
    return true
  } catch (e) {
    return false
  }
}

const rules = {
  menuId: [
    { required: true, message: '메뉴 ID는 필수 입력 항목입니다.', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9_]{2,30}$/, message: '영문/숫자/언더스코어 2~30자입니다.', trigger: 'blur' },
  ],
  menuNm: [
    { required: true, message: '메뉴명은 필수 입력 항목입니다.', trigger: 'blur' },
    { max: 100, message: '메뉴명은 100자 이하입니다.', trigger: 'blur' },
  ],
}

const iconOptions = [
  'Dashboard', 'Folder', 'User', 'Users', 'Files', 'Setting', 'Tools', 'Operation',
  'Menu', 'Grid', 'Document', 'Memo', 'Tickets', 'Bell', 'House', 'DataAnalysis',
]

function resolveIcon(name) {
  if (name && Icons[name]) return Icons[name]
  return Icons.Menu
}

function hasChildren(data) {
  return Array.isArray(data.children) && data.children.length > 0
}

const dlgTitle = computed(() => {
  if (activeMode.value === 'edit') return '메뉴 수정'
  return form.value.upperMenuId ? '하위 메뉴 등록' : '메뉴 등록'
})

const parentPathLabel = computed(() => {
  if (!form.value.upperMenuId) return '최상위'
  const path = findPath(treeData.value, form.value.upperMenuId, [])
  return path.length ? path.map((n) => n.menuNm).join(' > ') : '최상위'
})

const parentMenu = computed(() => {
  if (!form.value.upperMenuId) return null
  const path = findPath(treeData.value, form.value.upperMenuId, [])
  return path && path.length ? path[path.length - 1] : null
})

function findPath(nodes, menuId, acc) {
  for (const node of nodes) {
    const next = [...acc, node]
    if (node.menuId === menuId) return next
    if (node.children?.length) {
      const found = findPath(node.children, menuId, next)
      if (found) return found
    }
  }
  return null
}

// ── 좌측 트리 인터랙션 ──────────────────────────────

function onNodeClick(data) {
  if (activeMode.value === 'edit' && data.menuId === editingId.value) {
    ElMessage.warning('자기 자신은 상위 메뉴로 지정할 수 없습니다.')
    return
  }
  form.value.upperMenuId = data.menuId
  takeSnapshot()
}

async function startCreateUnder(node) {
  if (!(await confirmIfDirty())) return
  activeMode.value = 'create'
  editingId.value = null
  form.value = { ...emptyForm(), upperMenuId: node ? node.menuId : '' }
  highlightNode(form.value.upperMenuId || null)
  takeSnapshot()
  formRef.value?.clearValidate()
}

function resetToRoot() {
  form.value.upperMenuId = ''
  treeRef.value?.setCurrentKey(null)
  takeSnapshot()
}

async function removeNode(data) {
  if (hasChildren(data)) {
    ElMessage.warning('하위 메뉴가 있어 삭제할 수 없습니다. 하위 메뉴를 먼저 삭제하세요.')
    return
  }
  if (!(await confirmIfDirty())) return

  try {
    await ElMessageBox.confirm(
      `[${data.menuNm}] 메뉴와 역할별 권한 매핑이 함께 삭제됩니다. 삭제하시겠습니까?`,
      '메뉴 삭제',
      { confirmButtonText: '삭제', cancelButtonText: '취소', type: 'warning' }
    )
  } catch (e) {
    return
  }

  saving.value = true
  try {
    await http.delete(`/admin/menus/${data.menuId}`)
    ElMessage.success('메뉴가 삭제되었습니다.')

    const wasEditingDeleted = props.mode === 'edit' && props.editRow?.menuId === data.menuId
    if (wasEditingDeleted) {
      emit('update:modelValue', false)
      emit('saved')
      return
    }

    await fetchTree()
    if (form.value.upperMenuId === data.menuId) {
      form.value.upperMenuId = ''
      treeRef.value?.setCurrentKey(null)
    }
    takeSnapshot()
  } catch (e) {
    ElMessage.error(e?.message || '삭제에 실패했습니다.')
  } finally {
    saving.value = false
  }
}

watch(filterText, (val) => treeRef.value?.filter(val))

function filterNode(value, data) {
  if (!value) return true
  return (
    (data.menuNm || '').includes(value) ||
    (data.menuId || '').toLowerCase().includes(String(value).toLowerCase())
  )
}

// ── 열기/조회/저장 ─────────────────────────────────

async function onOpen() {
  filterText.value = ''
  activeMode.value = props.mode
  editingId.value = props.mode === 'edit' ? props.editRow?.menuId ?? null : null
  await fetchTree()

  if (props.mode === 'edit' && props.editRow) {
    form.value = {
      menuId: props.editRow.menuId,
      menuNm: props.editRow.menuNm,
      upperMenuId: props.editRow.upperMenuId || '',
      menuUrl: props.editRow.menuUrl || '',
      iconClass: props.editRow.iconClass || '',
      sortOrd: props.editRow.sortOrd ?? 1,
      targetType: props.editRow.targetType || '_SELF',
      dispYn: props.editRow.dispYn || 'Y',
      useYn: props.editRow.useYn || 'Y',
    }
    highlightNode(props.editRow.upperMenuId || null)
  } else {
    form.value = emptyForm()
    highlightNode(null)
  }
  takeSnapshot()
  formRef.value?.clearValidate()
}

async function fetchTree() {
  loading.value = true
  try {
    const { data } = await http.get('/admin/menus')
    treeData.value = data
  } catch (e) {
    ElMessage.error(e?.message || '메뉴 조회에 실패했습니다.')
  } finally {
    loading.value = false
  }
}

function highlightNode(menuId) {
  requestAnimationFrame(() => treeRef.value?.setCurrentKey(menuId || null))
}

async function save() {
  try {
    await formRef.value.validate()
  } catch (e) {
    return
  }

  saving.value = true
  try {
    const payload = {
      menuId: form.value.menuId,
      upperMenuId: form.value.upperMenuId || null,
      menuNm: form.value.menuNm,
      menuUrl: form.value.menuUrl || null,
      iconClass: form.value.iconClass || null,
      sortOrd: form.value.sortOrd,
      targetType: form.value.targetType,
      dispYn: form.value.dispYn,
      useYn: form.value.useYn,
    }

    if (activeMode.value === 'edit') {
      await http.put(`/admin/menus/${editingId.value}`, payload)
      ElMessage.success('메뉴가 수정되었습니다.')
    } else {
      await http.post('/admin/menus', payload)
      ElMessage.success('메뉴가 등록되었습니다. 사이드바에 바로 반영됩니다.')
    }

    emit('update:modelValue', false)
    emit('saved')
  } catch (e) {
    ElMessage.error(e?.message || '저장에 실패했습니다.')
  } finally {
    saving.value = false
  }
}
</script>
