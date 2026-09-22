<template>
  <div class="board-write-page">
    <div class="page-header header-row">
      <div>
        <h2>{{ isEdit ? '게시글 수정' : '게시글 작성' }}</h2>
        <p>{{ boardNm || '게시판' }}{{ isEdit ? ' · 게시글 내용을 수정합니다.' : ' · 새 게시글을 작성합니다.' }}</p>
      </div>
    </div>

    <el-card shadow="never" v-loading="pageLoading" :body-style="{ padding: '28px 32px' }">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="write-form">
        <el-form-item label="제목" prop="title">
          <el-input
            v-model="form.title"
            size="large"
            placeholder="제목을 입력하세요"
            maxlength="300"
            show-word-limit
          />
        </el-form-item>

        <div class="option-row">
          <el-form-item label="말머리" class="option-item category-item">
            <el-select v-model="form.categoryCd" placeholder="선택 안 함" clearable>
              <el-option label="일반" value="일반" />
              <el-option label="공지" value="공지" />
              <el-option label="정보" value="정보" />
              <el-option label="질문" value="질문" />
              <el-option label="이벤트" value="이벤트" />
            </el-select>
          </el-form-item>

          <el-form-item label="상단 공지" class="option-item">
            <el-switch v-model="noticeEnabled" active-text="고정" />
          </el-form-item>

          <el-form-item label="비밀글" class="option-item secret-item">
            <el-switch v-model="secretEnabled" active-text="잠금" />
          </el-form-item>

          <el-form-item
            v-if="secretEnabled"
            label="비밀번호"
            class="option-item pwd-item"
            prop="secretPwd"
          >
            <el-input
              v-model="form.secretPwd"
              type="password"
              placeholder="열람 비밀번호 (선택)"
              maxlength="64"
              show-password
            />
          </el-form-item>
        </div>

        <el-form-item label="내용" prop="content" class="content-item">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="16"
            resize="vertical"
            placeholder="내용을 입력하세요."
          />
        </el-form-item>

        <el-form-item label="첨부파일">
          <div class="attach-area">
            <div class="attach-toolbar">
              <el-upload
                :show-file-list="false"
                :auto-upload="false"
                :on-change="onFileChange"
                multiple
              >
                <el-button :icon="Paperclip" :loading="uploading">파일 추가</el-button>
              </el-upload>
              <span class="attach-hint">
                최대 {{ maxFileCnt }}개 · 파일당 {{ maxFileSizeMb }}MB
              </span>
            </div>
            <ul v-if="attachFiles.length > 0" class="attach-list">
              <li v-for="f in attachFiles" :key="f.fileSeq">
                <el-icon class="af-icon"><Document /></el-icon>
                <span class="af-name">{{ f.originalFileNm }}</span>
                <span class="af-size">{{ formatSize(f.fileSize) }}</span>
                <el-button link type="danger" size="small" @click="removeAttach(f)">삭제</el-button>
              </li>
            </ul>
          </div>
        </el-form-item>
      </el-form>

      <footer class="form-footer">
        <el-button :icon="ArrowLeft" @click="goBack">목록</el-button>
        <span class="spacer"></span>
        <el-button @click="goBack">취소</el-button>
        <el-button type="primary" :icon="Check" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? '수정 완료' : '등록' }}
        </el-button>
      </footer>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Check, Paperclip, Document } from '@element-plus/icons-vue'
import boardApi from '../api/board'

const route = useRoute()
const router = useRouter()

const bbsId = String(route.params.bbsId)
const editPostId = route.query.postId ? Number(route.query.postId) : null
const isEdit = computed(() => !!editPostId)

const formRef = ref(null)
const pageLoading = ref(false)
const submitting = ref(false)
const boardNm = ref('')
let boardInfo = null

const attachFiles = ref([])
const grpId = ref(null)
const uploading = ref(false)
const maxFileCnt = computed(() => boardInfo?.maxFileCnt ?? 5)
const maxFileSizeMb = computed(() => Math.floor((boardInfo?.maxFileSize ?? 10485760) / 1024 / 1024))

const form = ref({
  title: '',
  content: '',
  categoryCd: '',
  noticeYn: 'N',
  secretYn: 'N',
  secretPwd: '',
})

const noticeEnabled = ref(false)
const secretEnabled = ref(false)

const rules = {
  title: [
    { required: true, message: '제목을 입력하세요', trigger: 'blur' },
    { max: 300, message: '제목은 300자 이내로 입력하세요', trigger: 'blur' },
  ],
  content: [{ required: true, message: '내용을 입력하세요', trigger: 'blur' }],
}

async function loadInitial() {
  try {
    const [boardRes] = await Promise.all([
      boardApi.getBoard(bbsId),
      editPostId ? fetchPost() : Promise.resolve(),
    ])
    boardNm.value = boardRes.data.bbsNm || ''
    boardInfo = boardRes.data
  } catch (e) {
    ElMessage.error(e?.message || '게시판 정보를 불러오지 못했습니다.')
  }
}

async function fetchPost() {
  pageLoading.value = true
  try {
    const { data } = await boardApi.getPost(bbsId, editPostId)
    form.value.title = data.title
    form.value.content = data.content
    form.value.categoryCd = data.categoryCd || ''
    form.value.noticeYn = data.noticeYn || 'N'
    form.value.secretYn = data.secretYn || 'N'
    noticeEnabled.value = data.noticeYn === 'Y'
    secretEnabled.value = data.secretYn === 'Y'

    if (data.atchFileGrpId) {
      grpId.value = data.atchFileGrpId
      const { data: files } = await boardApi.getFiles(bbsId, data.atchFileGrpId)
      attachFiles.value = files || []
    }
  } catch (e) {
    ElMessage.error(e?.message || '게시글 조회에 실패했습니다.')
    goList()
  } finally {
    pageLoading.value = false
  }
}

async function onFileChange(uploadFile) {
  const raw = uploadFile?.raw
  if (!raw) return

  if (attachFiles.value.length >= maxFileCnt.value) {
    ElMessage.warning(`첨부파일은 최대 ${maxFileCnt.value}개까지 등록할 수 있습니다.`)
    return
  }
  if (boardInfo?.maxFileSize && raw.size > boardInfo.maxFileSize) {
    ElMessage.warning(`파일 용량은 개당 ${maxFileSizeMb.value}MB 이하여야 합니다.`)
    return
  }
  if (attachFiles.value.some((f) => f.originalFileNm === raw.name && f.fileSize === raw.size)) {
    ElMessage.warning('이미 추가된 파일입니다.')
    return
  }

  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('files', raw)
    if (grpId.value) fd.append('atchFileGrpId', grpId.value)

    const { data } = await boardApi.uploadFiles(bbsId, fd)
    if (!grpId.value && data.length > 0) {
      grpId.value = data[0].atchFileGrpId
    }
    attachFiles.value.push(...data)
  } catch (e) {
    ElMessage.error(e?.message || '파일 업로드에 실패했습니다.')
  } finally {
    uploading.value = false
  }
}

async function removeAttach(f) {
  try {
    await boardApi.deleteFile(bbsId, f.atchFileGrpId, f.fileSeq)
    attachFiles.value = attachFiles.value.filter((x) => x.fileSeq !== f.fileSeq)
    if (attachFiles.value.length === 0) grpId.value = null
  } catch (e) {
    ElMessage.error(e?.message || '파일 삭제에 실패했습니다.')
  }
}

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

async function handleSubmit() {
  try {
    await formRef.value.validate()
  } catch { return }

  submitting.value = true
  try {
    const payload = {
      title: form.value.title.trim(),
      content: form.value.content,
      categoryCd: form.value.categoryCd || null,
      noticeYn: noticeEnabled.value ? 'Y' : 'N',
      secretYn: secretEnabled.value ? 'Y' : 'N',
      secretPwd: secretEnabled.value && form.value.secretPwd ? form.value.secretPwd : null,
      atchFileGrpId: grpId.value,
    }

    if (isEdit.value) {
      await boardApi.updatePost(bbsId, editPostId, payload)
      ElMessage.success('게시글이 수정되었습니다.')
      router.push({ name: 'BoardDetail', params: { bbsId, postId: editPostId } })
    } else {
      const { data } = await boardApi.createPost(bbsId, payload)
      ElMessage.success('게시글이 등록되었습니다.')
      if (!data?.postId) {
        ElMessage.warning('상세 화면 이동에 실패하여 목록으로 이동합니다.')
        goList()
        return
      }
      router.push({ name: 'BoardDetail', params: { bbsId, postId: data.postId } })
    }
  } catch (e) {
    ElMessage.error(e?.message || '저장에 실패했습니다.')
  } finally {
    submitting.value = false
  }
}

function goList() {
  router.push({ name: 'BoardList', query: { bbsId } })
}
function goBack() {
  if (isEdit.value) {
    router.push({ name: 'BoardDetail', params: { bbsId, postId: editPostId } })
  } else {
    goList()
  }
}

onMounted(loadInitial)
</script>
