<template>
  <div class="menu-manage-container">
    <div class="page-header header-row">
      <div>
        <h2>메뉴설정</h2>
        <p>좌측 사이드바에 노출되는 메뉴를 관리합니다. 변경 즉시 반영됩니다.</p>
      </div>
      <div class="toolbar">
        <el-button :icon="Refresh" @click="fetchMenus">새로고침</el-button>
        <el-button type="primary" :icon="Plus" @click="openCreate">메뉴 추가</el-button>
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

    <el-card v-else shadow="never" :body-style="{ padding: '12px' }">
      <el-table
        v-loading="loading"
        :data="menuTree"
        row-key="menuId"
        border
        default-expand-all
        :tree-props="{ children: 'children' }"
        empty-text="등록된 메뉴가 없습니다. [메뉴 추가] 버튼으로 첫 메뉴를 등록하세요."
      >
        <el-table-column prop="menuNm" label="메뉴명" min-width="200" />
        <el-table-column prop="menuId" label="메뉴 ID" width="150" />
        <el-table-column prop="menuUrl" label="URL" min-width="140">
          <template #default="{ row }">
            <span v-if="row.menuUrl">{{ row.menuUrl }}</span>
            <el-tag v-else size="small" type="info">그룹</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="iconClass" label="아이콘" width="110">
          <template #default="{ row }">
            <span v-if="row.iconClass">{{ row.iconClass }}</span>
            <span v-else class="muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="sortOrd" label="정렬" width="70" align="center" />
        <el-table-column prop="dispYn" label="노출" width="70" align="center">
          <template #default="{ row }">
            <el-tag :type="row.dispYn === 'Y' ? 'success' : 'danger'" size="small">{{ row.dispYn }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="useYn" label="사용" width="70" align="center">
          <template #default="{ row }">
            <el-tag :type="row.useYn === 'Y' ? 'success' : 'danger'" size="small">{{ row.useYn }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="관리" width="140" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEdit(row)">수정</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">삭제</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <MenuEditDialog v-model="dialogVisible" :mode="dialogMode" :edit-row="editRow" @saved="fetchMenus" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import http from '../api/http'
import { useAuthStore } from '../stores/auth'
import MenuEditDialog from '../components/MenuEditDialog.vue'

const auth = useAuthStore()

const loading = ref(false)
const menuTree = ref([])

const dialogVisible = ref(false)
const dialogMode = ref('create')
const editRow = ref(null)

async function fetchMenus() {
  if (!auth.isAdmin) return
  loading.value = true
  try {
    const { data } = await http.get('/admin/menus')
    menuTree.value = data
  } catch (e) {
    ElMessage.error(e?.message || '메뉴 조회에 실패했습니다.')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  dialogMode.value = 'create'
  editRow.value = null
  dialogVisible.value = true
}

function openEdit(row) {
  dialogMode.value = 'edit'
  editRow.value = row
  dialogVisible.value = true
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `[${row.menuNm}] 메뉴와 역할별 권한 매핑이 함께 삭제됩니다. 계속하시겠습니까?`,
      '메뉴 삭제',
      { confirmButtonText: '삭제', cancelButtonText: '취소', type: 'warning' }
    )
  } catch (e) {
    return
  }

  try {
    await http.delete(`/admin/menus/${row.menuId}`)
    ElMessage.success('메뉴가 삭제되었습니다.')
    await fetchMenus()
  } catch (e) {
    ElMessage.error(e?.message || '삭제에 실패했습니다.')
  }
}

onMounted(fetchMenus)
</script>
