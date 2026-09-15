<template>
  <!-- 发布为应用模版 -->
  <skeleton-portal name="views/head/export-tab-pane/render" method="insert">
    <template v-slot="props">
      <ExportTabPaneRender v-bind="props" />
    </template>
  </skeleton-portal>
</template>

<script setup>
import ExportTabPaneRender from "../export-tab-pane-render.vue";
</script>

<style module></style>
