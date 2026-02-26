<template>
  <!-- 导出应用及部署 - 导出应用弹窗 -->
  <skeleton-portal name="views/head/export-source-code/render" method="insert">
    <template v-slot="props">
      <ExportSourceCodeRender v-bind="props" />
    </template>
  </skeleton-portal>
</template>

<script setup>
import ExportSourceCodeRender from "../export-source-code-render.vue";
import { useAttrs } from "vue";

const attrs = useAttrs();

const onClick = () => {
  const json = JSON.stringify(attrs, null, 2);
  const text = `插件配置：\n${json}`;

  alert(text);
};
</script>

<style module>
.button {
  margin: 5px;
}
</style>
