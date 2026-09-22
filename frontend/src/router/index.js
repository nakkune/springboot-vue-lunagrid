import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import MainLayout from '../layouts/MainLayout.vue'
import http from '../api/http'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { public: true, title: '로그인' },
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../views/SignupView.vue'),
    meta: { public: true, title: '회원가입' },
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', redirect: '/dashboard' },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/DashboardView.vue'),
        meta: { title: '대시보드' },
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/UserManageView.vue'),
        meta: { title: '회원관리' },
      },
      {
        path: 'board',
        name: 'BoardList',
        component: () => import('../views/BoardList.vue'),
        meta: { title: '게시판' },
      },
      {
        path: 'board/:bbsId/write',
        name: 'BoardWrite',
        component: () => import('../views/BoardWrite.vue'),
        meta: { title: '게시글 작성' },
      },
      {
        path: 'board/:bbsId/:postId',
        name: 'BoardDetail',
        component: () => import('../views/BoardDetail.vue'),
        meta: { title: '게시글 상세' },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/SettingsView.vue'),
        meta: { title: '시스템설정' },
      },
      {
        path: 'menu-settings',
        name: 'MenuSettings',
        component: () => import('../views/MenuManageView.vue'),
        meta: { title: '메뉴설정' },
      },
      {
        path: 'menu-settings-grid',
        name: 'MenuSettingsGrid',
        component: () => import('../views/MenuManageGridView.vue'),
        meta: { title: '메뉴설정(그리드)' },
      },
      {
        path: 'role-settings',
        name: 'RoleSettings',
        component: () => import('../views/RoleMenuView.vue'),
        meta: { title: '메뉴권한설정' },
      },
      {
        path: 'batch-schedule',
        name: 'BatchSchedule',
        component: () => import('../views/BatchScheduleView.vue'),
        meta: { title: '스케줄관리' },
      },
      {
        path: 'menu-logs',
        name: 'MenuLogs',
        component: () => import('../views/MenuLogView.vue'),
        meta: { title: '로그조회' },
      },
      {
        path: 'menu-logs-grid',
        name: 'MenuLogsGrid',
        component: () => import('../views/MenuLogGridView.vue'),
        meta: { title: '로그조회(그리드)' },
      },
      {
        path: 'sql-scripts',
        name: 'SqlScripts',
        component: () => import('../views/SqlScriptView.vue'),
        meta: { title: 'SQL스크립트' },
      },
      {
        path: 'common-codes',
        name: 'CommonCodes',
        component: () => import('../views/CommonCodeView.vue'),
        meta: { title: '공통코드관리' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
    meta: { title: '페이지를 찾을 수 없음' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isLoggedIn) {
    return { path: '/login' }
  }
  if (auth.isLoggedIn && (to.path === '/login' || to.path === '/signup')) {
    return { path: '/' }
  }
  document.title = to.meta.title ? `포털 시스템 - ${to.meta.title}` : '포털 시스템'
  return true
})

router.afterEach((to) => {
  const auth = useAuthStore()
  if (!auth.isLoggedIn || to.meta.public) return

  const menuId = to.name || ''
  const menuNm = to.meta.title || ''
  const menuUrl = to.fullPath || ''

  http.post('/menu-logs', { menuId, menuNm, menuUrl }).catch(() => {})
})

export default router
