<template>
  <div class="board-list-page">
    <div class="page-header header-row">
      <div>
        <h2>{{ boardNm || '게시판' }}</h2>
        <p>{{ boardDesc || '게시글을 조회하고 작성할 수 있습니다.' }}</p>
      </div>
      <div class="toolbar">
        <el-button :icon="Refresh" @click="fetchPosts" :disabled="!selectedBbsId">새로고침</el-button>
        <el-button type="primary" :icon="EditPen" :disabled="!selectedBbsId" @click="goWrite">글쓰기</el-button>
      </div>
    </div>

    <el-alert
      v-if="noBoards"
      title="등록된 게시판이 없습니다."
      description="TB_BBS_MST에 게시판을 먼저 등록해야 합니다. 백엔드 재기동 시 기본 게시판(공지사항/자유게시판)이 자동 생성됩니다."
      type="warning"
      show-icon
      :closable="false"
      class="no-board-alert"
    />

    <!-- 게시판 언더라인 탭 -->
    <nav v-if="boards.length > 1" class="board-tabs">
      <button
        v-for="b in boards"
        :key="b.bbsId"
        class="tab-btn"
        :class="{ active: selectedBbsId === b.bbsId }"
        @click="switchBoard(b.bbsId)"
      >
        {{ b.bbsNm }}
      </button>
    </nav>

    <el-card shadow="never" :body-style="{ padding: 0 }">
      <!-- 총건수 + 검색바 -->
      <div class="list-toolbar">
        <span class="total-count">
          총 <strong>{{ totalItems.toLocaleString() }}</strong>건
          <template v-if="appliedKeyword">
            (검색결과)
            <el-button link size="small" @click="resetSearch">검색해제</el-button>
          </template>
        </span>
        <div class="search-area">
          <el-select v-model="searchType" class="search-type">
            <el-option label="제목+내용" value="ALL" />
            <el-option label="제목" value="TITLE" />
            <el-option label="내용" value="CONTENT" />
            <el-option label="작성자" value="USER" />
          </el-select>
          <el-input
            v-model="searchKeyword"
            class="search-input"
            placeholder="검색어를 입력하세요"
            clearable
            @keyup.enter="handleSearch"
            @clear="resetSearch"
          />
          <el-button type="primary" :icon="Search" @click="handleSearch">검색</el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="posts"
        border
        empty-text="등록된 게시글이 없습니다."
        class="board-table"
        :row-class-name="rowClassName"
        @row-click="goDetail"
      >
        <el-table-column label="번호" width="72" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.noticeYn === 'Y'" size="small" type="danger" effect="dark" class="notice-tag">공지</el-tag>
            <span v-else class="row-no">{{ displayNo(row) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="제목" min-width="320">
          <template #default="{ row }">
            <div class="title-cell" :style="{ paddingLeft: row.depthNo * 26 + 'px' }">
              <span v-if="row.depthNo > 0" class="reply-mark">└</span>
              <el-icon v-if="row.secretYn === 'Y'" class="lock-icon"><Lock /></el-icon>
              <span class="title-text">{{ row.title }}</span>
              <sup v-if="row.commentCnt > 0" class="comment-count">[{{ row.commentCnt }}]</sup>
              <el-icon v-if="row.fileYn === 'Y'" class="attach-icon"><Paperclip /></el-icon>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="regUserNm" label="작성자" width="110" align="center" />

        <el-table-column label="작성일" width="100" align="center">
          <template #default="{ row }">{{ smartDate(row.regDt) }}</template>
        </el-table-column>

        <el-table-column label="조회" width="80" align="center">
          <template #default="{ row }">{{ (row.viewCnt || 0).toLocaleString() }}</template>
        </el-table-column>
      </el-table>

      <div v-if="totalItems > 0" class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="totalItems"
          layout="prev, pager, next, sizes, jumper"
          background
          @current-change="fetchPosts"
          @size-change="onSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Refresh, EditPen, Search, Lock, Paperclip } from '@element-plus/icons-vue'
import boardApi from '../api/board'

const router = useRouter()

const boards = ref([])
const selectedBbsId = ref('')
const boardNm = ref('')
const boardDesc = ref('')
const noBoards = ref(false)

const loading = ref(false)
const posts = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)

const searchType = ref('ALL')
const searchKeyword = ref('')
const appliedType = ref('ALL')
const appliedKeyword = ref('')

async function fetchBoards() {
  try {
    const { data } = await boardApi.getBoards()
    boards.value = data
    if (data.length === 0) {
      noBoards.value = true
      return
    }
    noBoards.value = false

    const urlBbsId = router.currentRoute.value.query.bbsId
    const found = data.find((b) => b.bbsId === urlBbsId)
    switchBoard(found ? found.bbsId : data[0].bbsId)
  } catch (e) {
    ElMessage.error(e?.message || '게시판 조회에 실패했습니다.')
  }
}

function switchBoard(bbsId) {
  selectedBbsId.value = bbsId
  const board = boards.value.find((b) => b.bbsId === bbsId)
  boardNm.value = board?.bbsNm || ''
  boardDesc.value = board?.bbsDesc || ''
  resetSearch()
}

function handleSearch() {
  appliedType.value = searchType.value
  appliedKeyword.value = searchKeyword.value.trim()
  currentPage.value = 1
  fetchPosts()
}

function resetSearch() {
  searchType.value = 'ALL'
  searchKeyword.value = ''
  appliedType.value = ''
  appliedKeyword.value = ''
  currentPage.value = 1
  fetchPosts()
}

async function fetchPosts() {
  loading.value = true
  try {
    const { data } = await boardApi.getPostList(
      selectedBbsId.value, currentPage.value, pageSize.value,
      appliedType.value, appliedKeyword.value
    )
    posts.value = data.items
    totalItems.value = data.totalItems
  } catch (e) {
    ElMessage.error(e?.message || '게시글 조회에 실패했습니다.')
  } finally {
    loading.value = false
  }
}

function onSizeChange() {
  currentPage.value = 1
  fetchPosts()
}

/** 페이지 내 역순 번호 (공지행은 라벨로 대체) */
function displayNo(row) {
  const idx = posts.value.findIndex((p) => p.postId === row.postId)
  return totalItems.value - (currentPage.value - 1) * pageSize.value - idx
}

function smartDate(dtStr) {
  if (!dtStr) return ''
  const dt = new Date(dtStr.replace(' ', 'T'))
  const now = new Date()
  if (dt.toDateString() === now.toDateString()) return dtStr.slice(11, 16)
  return dt.getFullYear() === now.getFullYear() ? dtStr.slice(5, 10) : dtStr.slice(0, 10)
}

function rowClassName({ row }) {
  return row.noticeYn === 'Y' ? 'notice-row' : ''
}

function goDetail(row) {
  if (!selectedBbsId.value) return
  const idx = posts.value.findIndex((p) => p.postId === row.postId)
  const prev = posts.value[idx + 1]
  const next = posts.value[idx - 1]
  router.push({
    name: 'BoardDetail',
    params: { bbsId: selectedBbsId.value, postId: row.postId },
    query: {
      prevId: prev?.postId,
      prevTitle: prev?.title,
      nextId: next?.postId,
      nextTitle: next?.title,
    },
  })
}

function goWrite() {
  if (!selectedBbsId.value) {
    ElMessage.warning('등록된 게시판이 없습니다. 게시판을 먼저 등록하세요.')
    return
  }
  router.push({ name: 'BoardWrite', params: { bbsId: selectedBbsId.value } })
}

onMounted(fetchBoards)
</script>
