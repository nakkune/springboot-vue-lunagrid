<template>
  <div class="menu-log-container">
    <div class="page-header header-row">
      <div>
        <h2 class="page-title-text">메뉴 접근 로그조회</h2>
        <p class="page-subtitle-text">시스템 사용자들의 메뉴 접근 및 이용 이력을 실시간으로 모니터링합니다.</p>
      </div>
      <div class="toolbar">
        <el-button type="success" plain :icon="DataAnalysis" @click="$router.push('/menu-logs-grid')">그리드 뷰 (LunaGrid)</el-button>
        <el-button type="primary" plain :icon="Refresh" @click="fetchLogs">새로고침</el-button>
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
      <!-- 엔터프라이즈 검색조건 카드 영역 -->
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

      <!-- 조회 결과 영역 -->
      <el-card class="result-card" shadow="never">
        <div class="list-toolbar">
          <div class="total-count">
            전체 <strong>{{ totalItems.toLocaleString() }}</strong> 건의 접근 로그
          </div>
        </div>

        <el-table
          v-loading="loading"
          :data="logList"
          row-key="logSeq"
          border
          stripe
          empty-text="조건에 일치하는 로그 데이터가 없습니다."
          class="log-table"
        >
          <el-table-column label="No" width="70" align="center">
            <template #default="{ $index }">
              <span class="seq-num">{{ displayNo($index) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="userId" label="사용자 ID" width="130" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="user-id-badge">{{ row.userId }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="userNm" label="사용자명" width="130" show-overflow-tooltip>
            <template #default="{ row }">
              <strong>{{ row.userNm }}</strong>
            </template>
          </el-table-column>
          <el-table-column prop="menuId" label="메뉴 ID" width="150" show-overflow-tooltip>
            <template #default="{ row }">
              <el-tag size="small" type="info" effect="plain">{{ row.menuId }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="menuNm" label="메뉴명" min-width="160" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="menu-name-text">{{ row.menuNm }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="menuUrl" label="접근 URL" min-width="180" show-overflow-tooltip>
            <template #default="{ row }">
              <code v-if="row.menuUrl" class="url-code">{{ row.menuUrl }}</code>
              <span v-else class="muted">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="userIp" label="IP 주소" width="140" align="center">
            <template #default="{ row }">
              <span class="ip-text">{{ row.userIp || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="clickDt" label="접속일시" width="180" align="center">
            <template #default="{ row }">
              <span class="time-text">{{ formatDt(row.clickDt) }}</span>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="totalItems > 0" class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="totalItems"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @current-change="fetchLogs"
            @size-change="onSizeChange"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Search, RefreshLeft, User, Menu, Monitor, DataAnalysis } from '@element-plus/icons-vue'
import http from '../api/http'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

const loading = ref(false)
const logList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const dateRange = ref(null)
const activePreset = ref('')

const filters = reactive({
  userId: '',
  menuId: '',
  userIp: '',
})

function formatDt(val) {
  if (!val) return '-'
  const d = new Date(val)
  if (isNaN(d.getTime())) return val
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function displayNo($index) {
  return totalItems.value - (currentPage.value - 1) * pageSize.value - $index
}

function formatDateStr(d) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
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

function onSizeChange() {
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
    logList.value = data.items || []
    totalItems.value = data.totalItems || 0
  } catch (e) {
    ElMessage.error(e?.message || '로그 조회에 실패했습니다.')
  } finally {
    loading.value = false
  }
}

onMounted(fetchLogs)
</script>
