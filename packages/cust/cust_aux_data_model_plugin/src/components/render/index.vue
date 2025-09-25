<template>
  <!-- 实体属性编辑器 -->
  <skeleton-portal name="views/data/entity-property-designer/render" method="insert">
    <template v-slot="props">
      <EntityPropertyDesigner v-bind="props" />
    </template>
  </skeleton-portal>
</template>

<script setup>
  import EntityPropertyDesigner from '../EntityPropertyDesigner.vue'
  import { useAttrs } from 'vue'

  const attrs = useAttrs()
</script>

<style module>
  .button {
    margin: 5px;
  }
</style>
