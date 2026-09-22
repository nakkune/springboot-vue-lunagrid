<template>
  <div class="auth-page">
    <el-card class="auth-card" :body-style="{ padding: '32px' }">
      <el-result icon="warning" title="404" sub-title="요청하신 페이지를 찾을 수 없습니다.">
        <template #extra>
          <el-button type="primary" @click="$router.push('/')">홈으로 이동</el-button>
        </template>
      </el-result>
    </el-card>
  </div>
</template>

<script setup>
</script>
