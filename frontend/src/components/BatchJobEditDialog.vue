<template>
  <el-dialog
    class="batch-job-dialog"
    :model-value="modelValue"
    :title="dlgTitle"
    width="700px"
    destroy-on-close
    @update:model-value="(v) => $emit('update:modelValue', v)"
    @open="onOpen"
  >
    <div v-loading="saving" class="dlg-body">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-divider content-position="left">기본정보</el-divider>

        <el-form-item label="Job ID" prop="jobId">
          <el-input
            v-model="form.jobId"
            placeholder="예: BATCH_001 (영문/숫자/언더스코어)"
            :disabled="activeMode === 'edit'"
            style="max-width: 320px"
          />
        </el-form-item>
        <el-form-item label="Job 이름" prop="jobNm">
          <el-input v-model="form.jobNm" placeholder="예: 데이터 동기화" maxlength="100" style="max-width: 320px" />
        </el-form-item>
        <el-form-item label="설명" prop="jobDesc">
          <el-input
            v-model="form.jobDesc"
            type="textarea"
            :rows="3"
            maxlength="500"
            placeholder="배치 작업에 대한 설명 (선택)"
          />
        </el-form-item>

        <el-divider content-position="left">스케줄 설정</el-divider>

        <el-form-item label="Job 타입" prop="jobType">
          <el-radio-group v-model="form.jobType">
            <el-radio-button value="CRON">CRON</el-radio-button>
            <el-radio-button value="SIMPLE">SIMPLE</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.jobType === 'CRON'" label="Cron 표현식" prop="cronExpr">
          <el-input
            v-model="form.cronExpr"
            placeholder="예: 0 0/5 * * * ?"
            style="max-width: 320px"
          />
          <span class="field-hint">초 분 시 일 월 요일 (5-필드)</span>
        </el-form-item>
        <el-form-item label="매개변수" prop="jobParams">
          <el-input
            v-model="form.jobParams"
            type="textarea"
            :rows="3"
            placeholder='{"source":"api","target":"db"}'
          />
          <span class="field-hint">JSON 형식의 실행 매개변수 (선택)</span>
        </el-form-item>

        <el-divider content-position="left">사용 설정</el-divider>

        <el-form-item label="사용 여부">
          <el-switch v-model="form.useYn" active-value="Y" inactive-value="N" active-text="사용" inactive-text="중지" />
        </el-form-item>
      </el-form>
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
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '../api/http'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  mode: { type: String, default: 'create' },
  editRow: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const saving = ref(false)
const formRef = ref(null)
const activeMode = ref('create')

const emptyForm = () => ({
  jobId: '',
  jobNm: '',
  jobDesc: '',
  jobType: 'CRON',
  cronExpr: '',
  jobParams: '',
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
  jobId: [
    { required: true, message: 'Job ID는 필수 입력 항목입니다.', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9_]{2,30}$/, message: '영문/숫자/언더스코어 2~30자입니다.', trigger: 'blur' },
  ],
  jobNm: [
    { required: true, message: 'Job 이름은 필수 입력 항목입니다.', trigger: 'blur' },
    { max: 100, message: 'Job 이름은 100자 이하입니다.', trigger: 'blur' },
  ],
  jobType: [
    { required: true, message: 'Job 타입을 선택하세요.', trigger: 'change' },
  ],
  cronExpr: [
    { required: true, message: 'Cron 표현식은 필수 입력 항목입니다.', trigger: 'blur' },
  ],
}

const dlgTitle = computed(() => {
  return activeMode.value === 'edit' ? '배치 수정' : '배치 등록'
})

async function onOpen() {
  activeMode.value = props.mode
  if (props.mode === 'edit' && props.editRow) {
    form.value = {
      jobId: props.editRow.jobId,
      jobNm: props.editRow.jobNm,
      jobDesc: props.editRow.jobDesc || '',
      jobType: props.editRow.jobType || 'CRON',
      cronExpr: props.editRow.cronExpr || '',
      jobParams: props.editRow.jobParams || '',
      useYn: props.editRow.useYn || 'Y',
    }
  } else {
    form.value = emptyForm()
  }
  takeSnapshot()
  formRef.value?.clearValidate()
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
      jobId: form.value.jobId,
      jobNm: form.value.jobNm,
      jobDesc: form.value.jobDesc || null,
      jobType: form.value.jobType,
      cronExpr: form.value.jobType === 'CRON' ? form.value.cronExpr : null,
      jobParams: form.value.jobParams || null,
      useYn: form.value.useYn,
    }

    if (activeMode.value === 'edit') {
      await http.put(`/admin/batch-jobs/${props.editRow.jobId}`, payload)
      ElMessage.success('배치 작업이 수정되었습니다.')
    } else {
      await http.post('/admin/batch-jobs', payload)
      ElMessage.success('배치 작업이 등록되었습니다.')
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
