<template>
  <div class="role-menu-container">
    <div class="page-header header-row">
      <div>
        <h2>권한설정</h2>
        <p>역할별로 노출할 메뉴를 지정합니다. 저장 후 해당 역할 사용자는 재로그인(또는 새로고침) 시 반영됩니다.</p>
      </div>
      <div class="toolbar">
        <el-button :icon="Refresh" @click="reload">새로고침</el-button>
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

    <div v-else class="role-layout">
      <!-- 좌측: 역할 목록 -->
      <el-card shadow="never" :body-style="{ padding: '8px' }" class="role-panel">
        <template #header>
          <span class="panel-title">역할 목록</span>
        </template>
        <div v-loading="rolesLoading">
          <button
            v-for="r in roles"
            :key="r.roleId"
            class="role-row"
            :class="{ active: selectedRoleId === r.roleId }"
            @click="selectRole(r.roleId)"
          >
            <span class="role-name">{{ r.roleNm }}</span>
            <span class="role-id">{{ r.roleId }}</span>
          </button>
          <div v-if="!rolesLoading && roles.length === 0" class="empty-hint">등록된 역할이 없습니다.</div>
        </div>
      </el-card>

      <!-- 우측: 메뉴 트리 -->
      <el-card shadow="never" :body-style="{ padding: '12px' }" class="tree-panel">
        <template #header>
          <div class="tree-header">
            <span class="panel-title">
              메뉴 권한 <el-tag v-if="selectedRole" size="small" effect="plain">{{ selectedRole.roleNm }}</el-tag>
            </span>
            <div class="tree-actions">
              <el-button size="small" @click="clearAll" :disabled="!selectedRoleId">모두 해제</el-button>
              <el-button size="small" @click="applyChecked" :disabled="!selectedRoleId">다시 불러오기</el-button>
              <el-button type="primary" size="small" :loading="saving" @click="handleSave" :disabled="!selectedRoleId">
                저장
              </el-button>
            </div>
          </div>
        </template>

        <el-alert
          v-if="selectedRoleId === 'ROLE_ADMIN'"
          type="info"
          :closable="false"
          show-icon
          title="ROLE_ADMIN 은 모든 메뉴가 항상 노출됩니다 (역할 필터링 우회). 참고용으로만 활용하세요."
          class="admin-hint"
        />
        <el-alert
          v-else-if="selectedRoleId"
          type="info"
          :closable="false"
          show-icon
          title="체크한 메뉴(및 그룹)만 해당 역할의 사이드바에 노출됩니다. 그룹 체크 시 하위 전체가 포함됩니다."
          class="admin-hint"
        />

        <el-tree
          ref="treeRef"
          v-loading="menusLoading || assignedLoading"
          :data="menuTree"
          node-key="menuId"
          show-checkbox
          default-expand-all
          :props="{ label: 'menuNm', children: 'children' }"
          empty-text="등록된 메뉴가 없습니다. [메뉴설정]에서 먼저 메뉴를 등록하세요."
        />
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import http from '../api/http'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

const roles = ref([])
const selectedRoleId = ref('')
const selectedRole = computed(() => roles.value.find((r) => r.roleId === selectedRoleId.value))

const rolesLoading = ref(false)
const menusLoading = ref(false)
const assignedLoading = ref(false)
const saving = ref(false)

const menuTree = ref([])
const treeRef = ref(null)

/** el-tree 리프 판정 방지를 위해 빈 children 제거 */
function normalizeTree(nodes) {
  return (nodes || []).map((n) => ({
    menuId: n.menuId,
    menuNm: n.menuNm,
    children: n.children && n.children.length > 0 ? normalizeTree(n.children) : undefined,
  }))
}

async function fetchRoles() {
  rolesLoading.value = true
  try {
    const { data } = await http.get('/admin/roles')
    roles.value = data
    if (data.length > 0 && !data.some((r) => r.roleId === selectedRoleId.value)) {
      selectRole(data[0].roleId)
    }
  } catch (e) {
    ElMessage.error(e?.message || '역할 조회에 실패했습니다.')
  } finally {
    rolesLoading.value = false
  }
}

async function fetchMenuTree() {
  menusLoading.value = true
  try {
    const { data } = await http.get('/admin/menus')
    menuTree.value = normalizeTree(data)
  } catch (e) {
    ElMessage.error(e?.message || '메뉴 트리 조회에 실패했습니다.')
  } finally {
    menusLoading.value = false
  }
}

function selectRole(roleId) {
  selectedRoleId.value = roleId
  applyChecked()
}

async function applyChecked() {
  if (!selectedRoleId.value) return
  assignedLoading.value = true
  try {
    const { data } = await http.get(`/admin/roles/${selectedRoleId.value}/menus`)
    await nextTick()
    treeRef.value?.setCheckedKeys(data.menuIds || [])
  } catch (e) {
    ElMessage.error(e?.message || '권한 조회에 실패했습니다.')
  } finally {
    assignedLoading.value = false
  }
}

function clearAll() {
  treeRef.value?.setCheckedKeys([])
}

async function handleSave() {
  if (!selectedRoleId.value) return
  const checked = treeRef.value?.getCheckedKeys() || []
  const halfChecked = treeRef.value?.getHalfCheckedKeys() || []
  const menuIds = [...new Set([...halfChecked, ...checked])]

  saving.value = true
  try {
    await http.put(`/admin/roles/${selectedRoleId.value}/menus`, { menuIds })
    ElMessage.success(`[${selectedRole.value?.roleNm}] 메뉴 권한이 저장되었습니다.`)
  } catch (e) {
    ElMessage.error(e?.message || '저장에 실패했습니다.')
  } finally {
    saving.value = false
  }
}

function reload() {
  fetchRoles()
  fetchMenuTree()
}

onMounted(reload)
</script>
