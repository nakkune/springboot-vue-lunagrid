<template>
  <div class="auth-page">
    <el-card class="auth-card" :body-style="{ padding: '0' }">
      <h1 class="auth-title">포털 시스템</h1>
      <p class="auth-subtitle">계정으로 로그인해 주세요</p>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large" @submit.prevent="handleLogin">
        <el-form-item prop="userId" label="아이디">
          <el-input v-model="form.userId" placeholder="아이디를 입력하세요" :prefix-icon="User" clearable />
        </el-form-item>
        <el-form-item prop="password" label="비밀번호">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-button type="primary" size="large" class="submit-btn" native-type="submit" :loading="loading">
          로그인
        </el-button>
      </el-form>

      <div class="auth-footer">
        계정이 없으신가요? <router-link to="/signup">회원가입</router-link>
      </div>

      <div class="auth-hint">
        테스트 계정 안내<br />
        관리자: admin / admin123 &nbsp;|&nbsp; 일반: user / user123
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  userId: '',
  password: '',
})

const rules = {
  userId: [{ required: true, message: '아이디를 입력해주세요.', trigger: 'blur' }],
  password: [{ required: true, message: '비밀번호를 입력해주세요.', trigger: 'blur' }],
}

async function handleLogin() {
  try {
    await formRef.value.validate()
  } catch (e) {
    return // 클라이언트 검증 실패
  }

  loading.value = true
  try {
    const data = await auth.login(form)
    ElMessage.success(`${data.user.userNm}님 환영합니다.`)
    router.push('/')
  } catch (e) {
    ElMessage.error(e?.message || '로그인에 실패했습니다.')
  } finally {
    loading.value = false
  }
}
</script>
