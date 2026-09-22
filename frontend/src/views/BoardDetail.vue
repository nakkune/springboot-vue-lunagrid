<template>
  <div class="board-detail-page">
    <div class="detail-topbar">
      <el-button :icon="ArrowLeft" @click="goList">목록</el-button>
      <div v-if="post?.ownerYn" class="topbar-actions">
        <el-button type="warning" plain :icon="EditPen" @click="goEdit">수정</el-button>
        <el-button type="danger" plain :icon="Delete" @click="handleDelete">삭제</el-button>
      </div>
    </div>

    <!-- 게시글 본문 -->
    <el-card shadow="never" v-loading="loading" class="post-card" :body-style="{ padding: '28px 32px' }">
      <header class="post-header">
        <div class="post-tags">
          <el-tag v-if="post?.noticeYn === 'Y'" type="danger" effect="dark" size="small">공지</el-tag>
          <el-tag v-if="post?.categoryCd" type="info" size="small">{{ post.categoryCd }}</el-tag>
          <el-tag v-if="post?.secretYn === 'Y'" type="warning" size="small">
            <el-icon style="vertical-align:-2px"><Lock /></el-icon> 비밀글
          </el-tag>
        </div>

        <h1 class="post-title">{{ post?.title }}</h1>

        <div class="post-meta-row">
          <span class="author-avatar" :style="{ background: avatarColor(post?.regUserNm) }">
            {{ (post?.regUserNm || '?').slice(0, 1) }}
          </span>
          <span class="author-name">{{ post?.regUserNm }}</span>
          <span class="meta-divider"></span>
          <span class="meta-item">{{ post?.regDt }}</span>
          <template v-if="post?.modDt && post.modDt !== post.regDt">
            <span class="meta-edited">(수정됨)</span>
          </template>
          <span class="meta-spacer"></span>
          <span class="meta-item"><el-icon><View /></el-icon>{{ (post?.viewCnt || 0).toLocaleString() }}</span>
        </div>
      </header>

      <el-divider class="post-divider" />

      <article class="post-content" v-html="post?.content"></article>

      <!-- 첨부파일 -->
      <section v-if="post?.files?.length" class="attach-section">
        <div class="attach-title">
          <el-icon><FolderOpened /></el-icon>
          첨부파일 {{ post.files.length }}
        </div>
        <button v-for="f in post.files" :key="f.fileSeq" class="attach-row" @click="download(f)">
          <el-icon class="af-icon"><Document /></el-icon>
          <span class="af-name">{{ f.originalFileNm }}</span>
          <span class="af-meta">{{ formatSize(f.fileSize) }} · {{ f.downCnt || 0 }}회</span>
          <el-icon class="af-dl"><Download /></el-icon>
        </button>
      </section>

      <footer class="reaction-bar">
        <button class="like-btn" :class="{ liked }" @click="handleLike">
          <el-icon><component :is="liked ? StarFilled : Star" /></el-icon>
          좋아요 {{ (post?.likeCnt || 0).toLocaleString() }}
        </button>
      </footer>
    </el-card>

    <!-- 이전/다음글 -->
    <el-card v-if="prevId || nextId" shadow="never" class="sibling-card" :body-style="{ padding: '4px 20px' }">
      <button v-if="prevId" class="sibling-row" @click="goSibling(prevId)">
        <el-icon class="sibling-icon"><CaretTop /></el-icon>
        <span class="sibling-label">이전글</span>
        <span class="sibling-title">{{ prevTitle }}</span>
      </button>
      <button v-if="nextId" class="sibling-row" @click="goSibling(nextId)">
        <el-icon class="sibling-icon"><CaretBottom /></el-icon>
        <span class="sibling-label">다음글</span>
        <span class="sibling-title">{{ nextTitle }}</span>
      </button>
    </el-card>

    <!-- 댓글 -->
    <el-card shadow="never" class="comment-card" :body-style="{ padding: '20px 24px' }">
      <template #header>
        <div class="comment-header">
          <el-icon><ChatDotRound /></el-icon>
          댓글 <strong>{{ comments.length.toLocaleString() }}</strong>
        </div>
      </template>

      <div v-if="comments.length === 0" class="no-comments">
        등록된 댓글이 없습니다. 첫 댓글을 남겨보세요.
      </div>

      <ul v-else class="comment-list">
        <li
          v-for="c in flatComments"
          :key="c.commentId"
          class="comment-item"
          :class="{ reply: c.depth > 0 }"
        >
          <span v-if="c.depth > 0" class="reply-mark">└</span>
          <span v-else class="author-avatar sm" :style="{ background: avatarColor(c.regUserNm) }">
            {{ (c.regUserNm || '?').slice(0, 1) }}
          </span>

          <div class="comment-body">
            <div class="comment-meta">
              <span class="comment-author">{{ c.regUserNm }}</span>
              <el-tag v-if="c.secretYn === 'Y'" type="warning" size="small" effect="plain">비밀</el-tag>
              <span class="comment-date">{{ c.regDt }}</span>
              <span class="comment-actions" v-if="c.ownerYn">
                <el-button link type="primary" size="small" @click="startEditComment(c)">수정</el-button>
                <el-button link type="danger" size="small" @click="handleDeleteComment(c)">삭제</el-button>
              </span>
              <span class="comment-actions" v-if="c.depth === 0">
                <el-button link size="small" @click="startReply(c.commentId)">답글</el-button>
              </span>
            </div>

            <template v-if="editingCommentId === c.commentId">
              <el-input
                v-model="editCommentContent"
                type="textarea"
                :rows="2"
                maxlength="2000"
                show-word-limit
              />
              <div class="inline-actions">
                <el-button size="small" @click="cancelEditComment">취소</el-button>
                <el-button type="primary" size="small" @click="handleUpdateComment(c)">저장</el-button>
              </div>
            </template>
            <p v-else class="comment-content">{{ c.content }}</p>

            <template v-if="replyUpperId === c.commentId">
              <div class="reply-form">
                <el-input
                  v-model="replyContent"
                  type="textarea"
                  :rows="2"
                  placeholder="답글을 입력하세요."
                  maxlength="2000"
                  show-word-limit
                />
                <div class="inline-actions">
                  <el-button size="small" @click="cancelReply">취소</el-button>
                  <el-button type="primary" size="small" @click="handleCreateReply(c.commentId)">등록</el-button>
                </div>
              </div>
            </template>
          </div>
        </li>
      </ul>

      <el-divider v-if="comments.length > 0" />

      <div ref="commentInputRef" class="new-comment">
        <div class="new-comment-label">
          <span class="author-avatar sm" :style="{ background: avatarColor(auth.userName) }">
            {{ auth.userName.slice(0, 1) }}
          </span>
          <strong>{{ auth.userName }}</strong>
        </div>
        <el-input
          v-model="newComment"
          type="textarea"
          :rows="3"
          placeholder="댓글을 입력하세요."
          maxlength="2000"
          show-word-limit
        />
        <div class="new-comment-footer">
          <el-checkbox v-model="commentSecret" size="small">비밀댓글</el-checkbox>
          <el-button type="primary" :disabled="!newComment.trim()" @click="handleCreateComment">등록</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft, EditPen, Delete, Lock, View,
  ChatDotRound, Star, StarFilled, CaretTop, CaretBottom,
  FolderOpened, Document, Download,
} from '@element-plus/icons-vue'
import boardApi from '../api/board'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const bbsId = computed(() => String(route.params.bbsId))
const postId = computed(() => Number(route.params.postId))

const prevId = ref(null)
const prevTitle = ref('')
const nextId = ref(null)
const nextTitle = ref('')

const loading = ref(false)
const post = ref(null)
const comments = ref([])
const liked = ref(false)

const newComment = ref('')
const commentSecret = ref(false)
const commentInputRef = ref(null)

const replyUpperId = ref(null)
const replyContent = ref('')

const editingCommentId = ref(null)
const editCommentContent = ref('')

const AVATAR_COLORS = ['#4054e0', '#00a37a', '#e6832c', '#d94f70', '#7a5af8']

function avatarColor(name) {
  let hash = 0
  for (const ch of name || '') hash = (hash * 31 + ch.charCodeAt(0)) % 9973
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

/** 루트+1단계 대댓글을 depth 플래그와 함께 평탄화 */
const flatComments = computed(() => {
  const out = []
  for (const root of buildTree(comments.value)) {
    out.push({ ...root, depth: 0 })
    for (const child of root.children) {
      out.push({ ...child, depth: 1 })
    }
  }
  return out
})

function buildTree(flat) {
  const map = {}
  flat.forEach((c) => { map[c.commentId] = { ...c, children: [] } })
  const roots = []
  flat.forEach((c) => {
    if (c.upperCommentId && map[c.upperCommentId]) {
      map[c.upperCommentId].children.push(map[c.commentId])
    } else {
      roots.push(map[c.commentId])
    }
  })
  return roots
}

async function fetchPost() {
  loading.value = true
  try {
    const { data } = await boardApi.getPost(bbsId.value, postId.value)
    post.value = data
    liked.value = false

    prevId.value = route.query.prevId ? Number(route.query.prevId) : null
    prevTitle.value = route.query.prevTitle || ''
    nextId.value = route.query.nextId ? Number(route.query.nextId) : null
    nextTitle.value = route.query.nextTitle || ''
  } catch (e) {
    ElMessage.error(e?.message || '게시글 조회에 실패했습니다.')
    goList()
  } finally {
    loading.value = false
  }
}

async function fetchComments() {
  try {
    const { data } = await boardApi.getComments(bbsId.value, postId.value)
    comments.value = data
  } catch (e) {
    ElMessage.error(e?.message || '댓글 조회에 실패했습니다.')
  }
}

async function handleLike() {
  if (liked.value) return
  try {
    await boardApi.likePost(bbsId.value, postId.value)
    liked.value = true
    post.value.likeCnt = (post.value.likeCnt || 0) + 1
  } catch (e) {
    ElMessage.error(e?.message || '좋아요 처리에 실패했습니다.')
  }
}

async function handleDelete() {
  try {
    await ElMessageBox.confirm('이 게시글을 삭제하시겠습니까?', '게시글 삭제', {
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
      type: 'warning',
    })
  } catch { return }

  try {
    await boardApi.deletePost(bbsId.value, postId.value)
    ElMessage.success('게시글이 삭제되었습니다.')
    goList()
  } catch (e) {
    ElMessage.error(e?.message || '삭제에 실패했습니다.')
  }
}

function goList() {
  router.push({ name: 'BoardList', query: { bbsId: bbsId.value } })
}

function goEdit() {
  router.push({ name: 'BoardWrite', params: { bbsId: bbsId.value }, query: { postId: postId.value } })
}

function goSibling(targetId) {
  router.push({
    name: 'BoardDetail',
    params: { bbsId: bbsId.value, postId: targetId },
  })
}

async function handleCreateComment() {
  if (!newComment.value.trim()) return
  try {
    await boardApi.createComment(bbsId.value, postId.value, {
      content: newComment.value,
      secretYn: commentSecret.value ? 'Y' : 'N',
    })
    newComment.value = ''
    commentSecret.value = false
    ElMessage.success('댓글이 등록되었습니다.')
    await Promise.all([fetchComments(), refreshPostCount()])
  } catch (e) {
    ElMessage.error(e?.message || '댓글 등록에 실패했습니다.')
  }
}

function startReply(upperCommentId) {
  replyUpperId.value = upperCommentId
  replyContent.value = ''
  editingCommentId.value = null
}
function cancelReply() {
  replyUpperId.value = null
  replyContent.value = ''
}
async function handleCreateReply(upperCommentId) {
  if (!replyContent.value.trim()) return
  try {
    await boardApi.createComment(bbsId.value, postId.value, {
      content: replyContent.value,
      upperCommentId,
    })
    cancelReply()
    ElMessage.success('답글이 등록되었습니다.')
    await Promise.all([fetchComments(), refreshPostCount()])
  } catch (e) {
    ElMessage.error(e?.message || '답글 등록에 실패했습니다.')
  }
}

function startEditComment(c) {
  editingCommentId.value = c.commentId
  editCommentContent.value = c.content
  replyUpperId.value = null
}
function cancelEditComment() {
  editingCommentId.value = null
  editCommentContent.value = ''
}
async function handleUpdateComment(c) {
  if (!editCommentContent.value.trim()) return
  try {
    await boardApi.updateComment(bbsId.value, c.commentId, { content: editCommentContent.value })
    cancelEditComment()
    ElMessage.success('댓글이 수정되었습니다.')
    await fetchComments()
  } catch (e) {
    ElMessage.error(e?.message || '댓글 수정에 실패했습니다.')
  }
}

async function handleDeleteComment(c) {
  try {
    await ElMessageBox.confirm('이 댓글을 삭제하시겠습니까?', '댓글 삭제', {
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
      type: 'warning',
    })
  } catch { return }

  try {
    await boardApi.deleteComment(bbsId.value, c.commentId)
    ElMessage.success('댓글이 삭제되었습니다.')
    await Promise.all([fetchComments(), refreshPostCount()])
  } catch (e) {
    ElMessage.error(e?.message || '댓글 삭제에 실패했습니다.')
  }
}

/** 서버의 비정규화 COMMENT_CNT 재동기화 */
async function refreshPostCount() {
  try {
    const { data } = await boardApi.getPost(bbsId.value, postId.value)
    post.value.viewCnt = data.viewCnt
    post.value.likeCnt = data.likeCnt
    post.value.commentCnt = data.commentCnt
  } catch { /* 카운트 동기화 실패는 UX에 영향 없음 */ }
}

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

async function download(f) {
  try {
    const res = await boardApi.downloadFile(bbsId.value, f.atchFileGrpId, f.fileSeq)
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = f.originalFileNm
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    f.downCnt = (f.downCnt || 0) + 1
  } catch (e) {
    ElMessage.error('파일 다운로드에 실패했습니다.')
  }
}

function reloadAll() {
  newComment.value = ''
  commentSecret.value = false
  cancelReply()
  cancelEditComment()
  fetchPost()
  fetchComments()
}

watch(() => route.params.postId, (nv, ov) => {
  if (route.name === 'BoardDetail' && nv && nv !== ov) {
    reloadAll()
  }
})

onMounted(() => {
  fetchPost()
  fetchComments()
})
</script>
