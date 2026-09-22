<template>
  <div class="batch-schedule-container">
    <div class="page-header header-row">
      <div>
        <h2>스케줄관리</h2>
        <p>시스템 배치 작업을 등록하고 스케줄을 관리합니다.</p>
      </div>
      <div class="toolbar">
        <el-button :icon="Refresh" @click="fetchJobs">새로고침</el-button>
        <el-button type="primary" :icon="Plus" @click="openCreate">배치 추가</el-button>
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
        :data="jobList"
        row-key="jobId"
        border
        empty-text="등록된 배치 작업이 없습니다. [배치 추가] 버튼으로 첫 배치를 등록하세요."
      >
        <el-table-column prop="jobId" label="Job ID" width="150" />
        <el-table-column prop="jobNm" label="Job 이름" min-width="160" />
        <el-table-column prop="jobDesc" label="설명" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.jobDesc">{{ row.jobDesc }}</span>
            <span v-else class="muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="cronExpr" label="Cron 표현식" width="160">
          <template #default="{ row }">
            <span v-if="row.cronExpr" class="cron-text">{{ row.cronExpr }}</span>
            <span v-else class="muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="jobType" label="타입" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.jobType === 'CRON' ? '' : 'success'" size="small">{{ row.jobType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="상태" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="useYn" label="사용" width="70" align="center">
          <template #default="{ row }">
            <el-tag :type="row.useYn === 'Y' ? 'success' : 'danger'" size="small">{{ row.useYn }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastRunDt" label="최근 실행" width="150" align="center">
          <template #default="{ row }">
            <span v-if="row.lastRunDt">{{ formatDt(row.lastRunDt) }}</span>
            <span v-else class="muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="lastRunResult" label="실행결과" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.lastRunResult" :type="row.lastRunResult === 'SUCCESS' ? 'success' : 'danger'" size="small">
              {{ row.lastRunResult }}
            </el-tag>
            <span v-else class="muted">-</span>
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

    <BatchJobEditDialog v-model="dialogVisible" :mode="dialogMode" :edit-row="editRow" @saved="fetchJobs" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import http from '../api/http'
import { useAuthStore } from '../stores/auth'
import BatchJobEditDialog from '../components/BatchJobEditDialog.vue'

const auth = useAuthStore()

const loading = ref(false)
const jobList = ref([])

const dialogVisible = ref(false)
const dialogMode = ref('create')
const editRow = ref(null)

function statusType(status) {
  const map = { IDLE: 'info', RUNNING: 'success', ERROR: 'danger', DISABLED: 'warning' }
  return map[status] || 'info'
}

function formatDt(val) {
  if (!val) return '-'
  const d = new Date(val)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function fetchJobs() {
  if (!auth.isAdmin) return
  loading.value = true
  try {
    const { data } = await http.get('/admin/batch-jobs')
    jobList.value = data
  } catch (e) {
    ElMessage.error(e?.message || '배치 작업 조회에 실패했습니다.')
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
      `[${row.jobNm}] 배치 작업을 삭제하시겠습니까?`,
      '배치 삭제',
      { confirmButtonText: '삭제', cancelButtonText: '취소', type: 'warning' }
    )
  } catch (e) {
    return
  }

  try {
    await http.delete(`/admin/batch-jobs/${row.jobId}`)
    ElMessage.success('배치 작업이 삭제되었습니다.')
    await fetchJobs()
  } catch (e) {
    ElMessage.error(e?.message || '삭제에 실패했습니다.')
  }
}

onMounted(fetchJobs)
</script>
