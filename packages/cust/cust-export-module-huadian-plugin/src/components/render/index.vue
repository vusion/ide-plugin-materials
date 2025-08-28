<template>
  <!-- 发布为应用模版 -->
  <skeleton-portal
    name="views/modules/export-app-template-module/render"
    method="insert">
    <template v-slot="props">
      <ExportAppTemplateModule v-bind="props" />
    </template>
  </skeleton-portal>
  <!-- 发布为局部模版 -->
  <skeleton-portal
    name="views/modules/export-part-template-module/render"
    method="insert">
    <template v-slot="props">
      <ExportPartTemplateModule v-bind="props" />
    </template>
  </skeleton-portal>
</template>

<script setup>
  import ExportAppTemplateModule from "../export-app-template-module-render.vue"
  import ExportPartTemplateModule from "../export-part-template-module-render.vue"
  import { useAttrs } from "vue"

  const attrs = useAttrs()

  const onClick = () => {
    const json = JSON.stringify(attrs, null, 2)
    const text = `插件配置：\n${json}`

    alert(text)
  }
</script>

<style module>
  .button {
    margin: 5px;
  }
</style>
