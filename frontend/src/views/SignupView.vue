<template>
  <div class="auth-page">
    <el-card class="auth-card" :body-style="{ padding: '0' }">
      <h1 class="auth-title">회원가입</h1>
      <p class="auth-subtitle">새 계정을 만들어 보세요</p>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="handleSignup">
        <el-form-item prop="userNm" label="이름">
          <el-input v-model="form.userNm" placeholder="이름을 입력하세요" clearable />
        </el-form-item>
        <el-form-item prop="userId" label="아이디">
          <el-input v-model="form.userId" placeholder="영문/숫자 4~20자" clearable />
        </el-form-item>
        <el-form-item prop="password" label="비밀번호">
          <el-input v-model="form.password" type="password" placeholder="8자 이상" show-password />
        </el-form-item>
        <el-form-item prop="passwordConfirm" label="비밀번호 확인">
          <el-input v-model="form.passwordConfirm" type="password" placeholder="비밀번호를 다시 입력하세요" show-password />
        </el-form-item>
        <el-form-item prop="email" label="이메일">
          <el-input v-model="form.email" placeholder="example@company.com" clearable />
        </el-form-item>

        <el-button type="primary" size="large" class="submit-btn" native-type="submit" :loading="loading">
          가입하기
        </el-button>
      </el-form>

      <div class="auth-footer">
        이미 계정이 있으신가요? <router-link to="/login">로그인</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  userNm: '',
  userId: '',
  password: '',
  passwordConfirm: '',
  email: '',
})

const rules = {
  userNm: [{ required: true, message: '이름은 필수 입력 항목입니다.', trigger: 'blur' }],
  userId: [
    { required: true, message: '아이디는 필수 입력 항목입니다.', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9]{4,20}$/, message: '아이디는 영문/숫자 4~20자입니다.', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '비밀번호는 필수 입력 항목입니다.', trigger: 'blur' },
    { min: 8, max: 100, message: '비밀번호는 8자 이상입니다.', trigger: 'blur' },
  ],
  passwordConfirm: [
    { required: true, message: '비밀번호 확인을 입력해주세요.', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== form.password) {
          callback(new Error('비밀번호가 일치하지 않습니다.'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  email: [
    { required: true, message: '이메일은 필수 입력 항목입니다.', trigger: 'blur' },
    { type: 'email', message: '유효한 이메일 형식이 아닙니다.', trigger: 'blur' },
  ],
}

async function handleSignup() {
  try {
    await formRef.value.validate()
  } catch (e) {
    return
  }

  loading.value = true
  try {
    await auth.signup({
      userNm: form.userNm,
      userId: form.userId,
      password: form.password,
      email: form.email,
    })
    ElMessage.success('회원가입이 완료되었습니다. 로그인해 주세요.')
    router.push('/login')
  } catch (e) {
    ElMessage.error(e?.message || '회원가입에 실패했습니다.')
  } finally {
    loading.value = false
  }
}
</script>
