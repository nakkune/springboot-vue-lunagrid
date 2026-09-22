<template>
  <div class="dashboard-container">
    <!-- 환영 패널 -->
    <el-card shadow="never" class="welcome-card">
      <div class="welcome-row">
        <div>
          <h2 class="welcome-title">{{ auth.userName }}님, 안녕하세요!</h2>
          <p class="welcome-desc">오늘도 좋은 하루 되세요. 포털 시스템 대시보드입니다.</p>
        </div>
        <el-tag :type="auth.isAdmin ? 'danger' : 'primary'" size="large" effect="light">
          {{ auth.isAdmin ? '관리자' : '일반사용자' }}
        </el-tag>
      </div>
    </el-card>

    <!-- 통계 카드 (샘플 데이터) -->
    <el-row :gutter="16" class="stat-row">
      <el-col :span="6" v-for="stat in stats" :key="stat.label">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-unit">{{ stat.unit }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-alert
      title="대시보드 지표는 현재 샘플 값입니다. 실제 연동은 추후 화면 개발 시 반영됩니다."
      type="info"
      :closable="false"
      show-icon
      class="sample-alert"
    />
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

const stats = [
  { label: '총 사용자', value: 128, unit: '명' },
  { label: '오늘 접속', value: 42, unit: '건' },
  { label: '등록 게시글', value: 356, unit: '건' },
  { label: '미처리 알림', value: 7, unit: '건' },
]
</script>
