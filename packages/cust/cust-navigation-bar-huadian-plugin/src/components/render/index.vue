<template>
  <!-- 自定义主题样式 -->
  <!-- 隐藏顶部的搜索组件input -->
  <skeleton-portal
    name="theme-setting/header/search"
    method="hide"></skeleton-portal>
  <!-- container区域固定展示画布尺寸 -->
  <skeleton-portal
    name="theme-setting/main"
    method="insert">
    <template v-slot="props">
      <skeleton-render
        name="theme-setting/main/canvas-scale-setting" />
    </template>
  </skeleton-portal>

  <!-- 导出 -->
  <skeleton-portal
    name="more-menu/export-deploy"
    method="insert">
    <template v-slot="props">
      <el-dropdown-item @click="handleExport">
        导出应用
      </el-dropdown-item>
    </template>
  </skeleton-portal>
  <el-dialog
    v-model="dialogVisible"
    title="导出应用"
    width="800">
    <skeleton-render
      name="popups/export-tab-pane" />
  </el-dialog>
</template>

<script setup>
  import { ref, nextTick } from "vue"
  import { getPlugin } from "opp-core"

  const dialogVisible = ref(false)

  const handleExport = () => {
    dialogVisible.value = true
  }
</script>

<style module></style>
