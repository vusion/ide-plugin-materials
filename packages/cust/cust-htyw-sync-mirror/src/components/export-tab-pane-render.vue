<template>
  <div v-bind="attrs" :class="$style.root">
    <div :class="$style.container" v-if="exportedRecords.length">
      <div :class="$style.header">
        <el-button type="primary" @click="handleExport">导出应用</el-button>
      </div>
      <el-table
        :data="exportedRecords"
        key="exportedRecordsTable"
        :loading="listLoading"
        :class="$style.exportedRecordsTable"
        :height="360"
        @sort-change="onSortChange"
      >
        <el-table-column
          prop="ideVersion"
          label="IDE版本"
          width="80"
          show-overflow-tooltip
        >
          <template #default="scope">
            <template v-if="scope.$index === -1" />
            <span v-else>{{ scope.row.ideVersion || "-" }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="branchName"
          label="所属分支"
          width="80"
          show-overflow-tooltip
        >
          <template #default="scope">
            <template v-if="scope.$index === -1" />
            <span v-else>{{ scope.row.branchName || "-" }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="typeLabel"
          label="导出类型"
          width="100"
          show-overflow-tooltip
        >
          <template #default="{ row: item, $index }">
            <template v-if="$index === -1" />
            <template v-else>
              {{ item.typeLabel }}
              <el-tooltip
                trigger="hover"
                placement="top"
                :show-after="500"
                v-if="item.subTypeLabel"
              >
                <s-others-icon name="info" :class="$style.iconInfo">
                </s-others-icon>
                <template #content>
                  <slot name="tooltip">{{ item.subTypeLabel }}</slot>
                </template>
              </el-tooltip>
            </template>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="导出状态"
          width="100"
          show-overflow-tooltip
        >
          <template #default="{ row: item, $index }">
            <template v-if="$index === -1" />
            <template v-else>
              <div
                v-if="item.message === '导出中'"
                :class="$style.loading"
              ></div>
              <s-others-icon
                v-if="['上传失败', '导出失败'].includes(item.message)"
                name="fail"
                :class="$style.statusicon"
              ></s-others-icon>
              <s-others-icon
                v-if="item.message === '已上传'"
                name="success"
                :class="$style.statusicon"
              ></s-others-icon>
              <s-others-icon
                v-if="item.message === '已导出'"
                name="primary"
                :class="$style.statusicon"
              ></s-others-icon>
              {{ item.message }}
            </template>
          </template>
        </el-table-column>
        <el-table-column
          prop="createdBy"
          label="导出人"
          width="100"
          show-overflow-tooltip
        >
          <template #default="scope">
            <template v-if="scope.$index === -1" />
            <span v-else>{{ scope.row.createdBy || "-" }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="createdTime"
          sortable="custom"
          label="导出时间"
          width="160"
          show-overflow-tooltip
        >
          <template #default="scope">
            <template v-if="scope.$index === -1" />
            <span v-else>{{ scope.row.createdTime || "-" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <template v-if="scope.$index === -1" />
            <div v-else>
              <el-link
                v-if="scope.row.message === '已导出' && needDownload(scope.row)"
                @click="download(scope.row)"
                style="margin-right: 10px"
                >下载</el-link
              >
              <el-popover
                v-else-if="
                  scope.row.message === '已导出' && !needDownload(scope.row)
                "
                placement="bottom"
                :width="60"
                trigger="click"
              >
                <div
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px;
                  "
                >
                  <el-button link @click="goGitRepo(scope.row, 'frontend')"
                    >前端源码</el-button
                  >
                  <el-button link @click="goGitRepo(scope.row, 'backend')"
                    >后端源码</el-button
                  >
                </div>
                <template #reference>
                  <el-link
                    @click="0 && download(scope.row)"
                    style="margin-right: 10px"
                    >下载</el-link
                  >
                </template>
              </el-popover>
              <el-link
                v-else-if="scope.row.message === '已上传'"
                @click="viewOutput(scope.row)"
                style="margin-right: 10px"
                >查看</el-link
              >
              <el-link @click="viewLog(scope.row)" style="margin-right: 10px"
                >日志</el-link
              >
              <el-link
                @click="remove(scope.row)"
                :disabled="scope.row.message === '导出中'"
                style="margin-right: 10px"
                >删除</el-link
              >
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-bind="tableProps.pagination"
        :current-page="tableProps.pageNo"
        :total="tableProps.count"
        :page-size="tableProps.pageSize"
        @current-change="changePage"
        class="s-table-pagination"
      ></el-pagination>
    </div>
    <div v-else :class="$style.emptyContent">
      <div :class="$style.emptyInner">
        <p>没有导出应用记录</p>
        <el-button style="width: 100%" type="primary" @click="handleExport"
          >导出应用</el-button
        >
      </div>
    </div>
    <!-- 导出源码 -->
    <skeleton-render
      name="views/head/export-source-code/index"
      ref="exportSourceCodeRef"
    />
    <!-- 查看日志 -->
    <skeleton-render
      name="views/head/export-log-modal/index"
      ref="exportLogModal"
      @close="handleReloadList"
    />
  </div>
</template>

<script setup>
import { inject, useAttrs } from "vue";

const attrs = useAttrs();

const {
  /**
   * 导出记录列表
   *
   * @type {Vue.ref<Array>}
   */
  exportedRecords,
  /**
   * 列表加载中状态
   *
   * @type {Vue.ref<boolean>}
   */
  listLoading,
  /**
   * 分页及表格属性
   *
   * @type {Vue.ref<object>}
   */
  tableProps,
  /**
   * 导出源码 skeleton 实例
   *
   * @type {Vue.ref<any>}
   */
  exportSourceCodeRef,
  /**
   * 日志弹窗实例 (skeleton-render 通过 instanceRef 获取内部逻辑组件实例)
   *
   * @type {Vue.ref<any>}
   */
  exportLogModal,
  /**
   * 切换页码
   *
   * @function
   */
  changePage,
  /**
   * 排序变更
   *
   * @function
   */
  onSortChange,
  /**
   * 导出应用操作
   *
   * @function
   */
  handleExport,
  /**
   * 重新加载列表
   *
   * @function
   */
  handleReloadList,
  /**
   * 查看上传结果
   *
   * @function
   */
  viewOutput,
  /**
   * 查看日志
   *
   * @function
   */
  viewLog,
  /**
   * 删除记录
   *
   * @function
   */
  remove,
  /**
   * 判断是否需要下载
   *
   * @function
   */
  needDownload,
  /**
   * 下载导出结果
   *
   * @function
   */
  download,
  /**
   * 跳转到 Git 仓库
   *
   * @function
   */
  goGitRepo,
} = inject("$context");
</script>

<style module>
.root {
  height: 458px;
  overflow: auto;
}

.header {
  padding: 0 0 15px;
  text-align: right;
}

.emptyContent {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.emptyInner {
  display: inline-block;
  transform: translateY(-50%);
}

.emptyInner p {
  text-align: center;
  color: #999;
}

.iconInfo {
  font-size: 16px;
  vertical-align: top;
  color: #666;
}

.statusicon svg {
  cursor: pointer;
  width: 16px;
  height: 16px;
  vertical-align: sub;
}

.s-table-pagination {
  justify-content: flex-end;
  --pagination-item-background-selected: var(--fill-color-active);
  --pagination-item-color-selected: var(--text-color-primary);
  margin-top: 10px;
}

.s-table-pagination .el-pager li.is-active {
  background-color: var(--pagination-item-background-selected);
  color: var(--pagination-item-color-selected);
  border-radius: 4px;
}
.s-table-pagination .el-pager li + li {
  margin-left: 4px;
}

.loading {
  display: inline-block;
  position: relative;
  width: 16px;
  height: 16px;
  vertical-align: sub;
  border: 2px solid #337eff;
  border-top-color: rgba(0, 0, 0, 0.2);
  border-right-color: #00000033;
  border-bottom-color: rgba(0, 0, 0, 0.2);
  border-radius: 100%;
  animation: circle infinite 0.75s linear;
}

@keyframes circle {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
