<template>
  <!-- 하위 메뉴가 있는 그룹 -->
  <el-sub-menu v-if="hasChildren" :index="item.menuId">
    <template #title>
      <el-icon><component :is="resolveIcon(item.iconClass)" /></el-icon>
      <span>{{ item.menuNm }}</span>
    </template>
    <SidebarMenuItem v-for="child in item.children" :key="child.menuId" :item="child" />
  </el-sub-menu>

  <!-- URL 이 있는 리프 메뉴 -->
  <el-menu-item v-else-if="item.menuUrl" :index="item.menuUrl">
    <el-icon><component :is="resolveIcon(item.iconClass)" /></el-icon>
    <template #title>{{ item.menuNm }}</template>
  </el-menu-item>

  <!-- URL 없는 단독 항목(그룹 헤더 성격): 클릭 이동 없음 -->
  <el-menu-item v-else :index="item.menuId" disabled>
    <el-icon><component :is="resolveIcon(item.iconClass)" /></el-icon>
    <template #title>{{ item.menuNm }}</template>
  </el-menu-item>
</template>

<script setup>
import { computed } from 'vue'
import * as Icons from '@element-plus/icons-vue'

const props = defineProps({
  item: { type: Object, required: true },
})

// 재귀 렌더링을 위해 자기 자신을 이름으로 참조
defineOptions({ name: 'SidebarMenuItem' })

const hasChildren = computed(() => Array.isArray(props.item.children) && props.item.children.length > 0)

function resolveIcon(name) {
  if (name && Icons[name]) return Icons[name]
  return Icons.Menu // 알 수 없는 아이콘명 폴백
}
</script>
