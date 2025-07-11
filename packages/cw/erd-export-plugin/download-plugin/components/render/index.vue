<template>
  <el-button @click="onClickBatchDownload" v-if="showBatchDownloadBtn" :class="$style.btn">
    批量下载
    <template #icon>
      <i :class="$style.batchDownload"></i>
    </template>
  </el-button>
  <el-button type="primary" @click="onClickDownload" :class="$style.btn" v-if="downloadEnable">
    下载
    <template #icon>
      <i :class="$style.download"></i>
    </template>
  </el-button>
</template>
  
<script setup>
import { usePlugin } from 'opp-vue';
import { computed } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  datasourcename: {
    type: String,
    default: '',
  },
});

const appStore = usePlugin('store-app').getMutableState();

const emit = defineEmits(['download', 'batchDownload']);

const plugin = usePlugin('erd-export-plugin');
const downloadEnable = computed(() => {
    const downloadData = plugin && plugin.useStore((state) => state.download);
    return downloadData?.value === 'enabled';
});
const batchDownloadEnable = computed(() => {
    const batchDownloadData = plugin && plugin.useStore((state) => state.batchDownload);
    return batchDownloadData?.value === 'enabled';
});

const showBatchDownloadBtn = computed(() => {
  return appStore.app?.dataSources?.length > 1 && batchDownloadEnable.value;
});

const onClickDownload = () => {
  if (props.datasourcename) {
    const dataSource = appStore.app?.findDataSourceByName(props.datasourcename);
    const hasEntities = dataSource && dataSource.entities?.length > 0;
    if (!hasEntities) {
      ElMessage.warning('当前数据源下暂无实体，无法下载实体关系图');
      return;
    }
  }
  emit('download');
};

const onClickBatchDownload = () => {
  emit('batchDownload');
};
</script>

<style module>
.btn > [class="el-icon"] {
  width: 16px;
  height: 16px;
}
.download {
  background-image: url('../../../assets/download.svg');
  width: 16px;
  height: 16px;
  display: inline-block;
}
.batchDownload {
  background-image: url('../../../assets/batch-download.svg');
  width: 16px;
  height: 16px;
  display: inline-block;
}
</style>
  