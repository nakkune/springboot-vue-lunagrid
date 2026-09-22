<template>
  <el-container class="layout">
    <!-- 좌측 메뉴 사이드바 -->
    <el-aside :width="isCollapsed ? '64px' : '240px'" class="sidebar">
      <div class="sidebar-logo">
        <span v-if="!isCollapsed" class="logo-text">포털 시스템</span>
        <el-icon v-else :size="22" color="#fff"><Platform /></el-icon>
      </div>

      <el-scrollbar class="sidebar-scroll">
        <el-menu
          class="sidebar-menu"
          :collapse="isCollapsed"
          :default-active="route.path"
          background-color="var(--sidebar-bg)"
          text-color="var(--sidebar-text)"
          active-text-color="var(--sidebar-active)"
          unique-opened
          router
        >
          <SidebarMenuItem v-for="menu in menus" :key="menu.menuId" :item="menu" />
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container>
      <!-- 상단 헤더 -->
      <el-header class="header" height="56px">
        <div class="header-left">
          <el-button text @click="toggleCollapse">
            <el-icon :size="18">
              <Expand v-if="isCollapsed" />
              <Fold v-else />
            </el-icon>
          </el-button>
          <span class="page-title">{{ route.meta.title }}</span>
        </div>

        <div class="header-right">
          <span class="user-name">{{ auth.userName }}님</span>
          <el-tag :type="auth.isAdmin ? 'danger' : 'info'" size="small" effect="light">
            {{ auth.isAdmin ? '관리자' : '일반사용자' }}
          </el-tag>
          <el-button type="primary" plain size="small" @click="handleLogout">로그아웃</el-button>
        </div>
      </el-header>

      <!-- 본문 -->
      <el-main class="main-area">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Fold, Expand, Platform } from '@element-plus/icons-vue'
import http from '../api/http'
import { useAuthStore } from '../stores/auth'
import SidebarMenuItem from '../components/SidebarMenuItem.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const isCollapsed = ref(false)
const menus = ref([])

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

async function fetchMenus() {
  try {
    const { data } = await http.get('/menus')
    menus.value = data
  } catch (e) {
    ElMessage.error(e?.message || '메뉴 조회에 실패했습니다.')
  }
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('로그아웃 하시겠습니까?', '알림', {
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      type: 'warning',
    })
    auth.logout()
    router.push('/login')
  } catch (e) {
    // 취소한 경우 - 아무 동작 없음
  }
}

onMounted(fetchMenus)
</script>
