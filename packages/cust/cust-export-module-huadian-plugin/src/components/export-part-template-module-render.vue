<template>
  <el-dialog
    v-model="visible"
    class="s-export-part-template-modal"
    width="800px"
    align-center
    destroy-on-close
    append-to-body
    :close-on-click-modal="false"
    @close="close()">
    <template #header>
      <span style="margin-right: 8px">
        发布为局部模板
      </span>
      <el-tooltip placement="top">
        <s-others-icon
          :class="$style.titleTipIcon"
          name="help_line"></s-others-icon>
        <template #content>
          <div style="width: 300px">
            应用中的部分内容（页面、逻辑、实体等）可导出为局部模板。局部模板可在其他应用中导入，用于快捷创建相同的页面、逻辑、实体等。
          </div>
        </template>
      </el-tooltip>
    </template>
    <el-container>
      <el-aside
        :class="$style.left"
        style="
          width: 400px;
          height: 478px;
          overflow: scroll;
        ">
        <el-form
          ref="formRef"
          label-position="top"
          :model="model"
          require-asterisk-position="right"
          @validate="formValid = $event.valid">
          <div :class="$style.symbolbox">
            <s-upload-icon
              v-if="!isEditOldTemp"
              @changeIcon="changeIcon"
              :can-edit="canEditIcon"
              :prop-icon="
                model.icon
              "></s-upload-icon>
            <el-form-item
              style="position: relative"
              required
              :rules="
                isEditOldTemp
                  ? {}
                  : validateRules.symbol
              "
              prop="symbol"
              for="none">
              <template #label>
                <span>
                  {{
                    isEditOldTemp
                      ? "模板名称（标识）"
                      : "模板标识"
                  }}
                </span>
                <div
                  :class="$style.histroy"
                  v-if="
                    historyList.length > 0 &&
                    isEditOldTemp
                  ">
                  <el-link
                    @click="canEditToNewTemp">
                    发布为新模板
                  </el-link>
                </div>

                <div
                  :class="$style.histroy"
                  style="left: 203px"
                  v-else-if="
                    historyList.length > 0 &&
                    !isEditOldTemp
                  ">
                  <el-popover
                    width="auto"
                    trigger="click">
                    <template #reference>
                      <el-link>发布历史</el-link>
                    </template>
                    <div :class="$style.menu">
                      <div
                        :class="$style.menuItem"
                        v-for="(
                          history, index
                        ) in historyList"
                        :key="index">
                        <div
                          style="
                            display: flex;
                            justify-content: space-between;
                          ">
                          <span
                            :class="
                              $style.menuName
                            ">
                            {{ history.name }}
                          </span>
                          <el-link
                            @click="
                              toggleHistory(
                                history
                              )
                            ">
                            发布到该模板
                          </el-link>
                        </div>
                        <div
                          :class="
                            $style.menuSymbol
                          ">
                          标识：{{
                            history.symbol
                          }}
                        </div>
                      </div>
                    </div>
                  </el-popover>
                </div>
                <el-tooltip
                  v-if="!isEditOldTemp"
                  type="help"
                  placement="top"
                  :class="$style.histroy"
                  style="
                    left: 64px;
                    margin-top: 4px;
                  "
                  size="auto">
                  <s-others-icon
                    name="help_line"
                    style="
                      margin-left: 8px;
                    "></s-others-icon>
                  <template #content>
                    <div style="width: 300px">
                      若发布为已存在的局部模板的“新版本”，则请输入已存在的局部模板标识；若发布为新的局部模板发布，则请输入新的唯一模板标识。
                    </div>
                  </template>
                </el-tooltip>
              </template>
              <el-input
                v-if="!isEditOldTemp"
                v-model="model.symbol"
                maxlength="100"
                :disabled="loading"
                maxlength-message="标识最长100字符"
                placeholder="请输入"
                style="width: 252px"></el-input>
              <el-select
                v-else
                style="width: 336px"
                placeholder="请选择模板历史"
                v-model="lastItem.symbol"
                :data="historyEditList"
                @change="
                  onSelectSegmentTemp($event)
                ">
                <el-option
                  v-for="option in historyEditList"
                  :key="option.value"
                  :label="option.label"
                  :value="
                    option.value
                  "></el-option>
              </el-select>
            </el-form-item>
          </div>
          <el-form-item
            v-if="!isEditOldTemp"
            label="模板名称"
            required
            :rules="validateRules.name"
            prop="name"
            for="none">
            <el-input
              v-model="model.name"
              :disabled="loading"
              maxlength="50"
              maxlength-message="模板名称最长50字符"
              placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item
            v-if="!isEditOldTemp"
            style="position: relative"
            label="模板分类（资产中心展示）"
            required
            :rules="validateRules.tags"
            prop="tags"
            for="none">
            <div :class="$style.tagcategory">
              <el-link
                :disabled="!checkPermission"
                @click="openAssetconfig">
                分类管理
                <s-others-icon
                  name="check-detail"
                  :class="
                    $style.toDetail
                  "></s-others-icon>
              </el-link>
              <u-tooltip
                v-if="!checkPermission"
                trigger="hover"
                placement="top"
                :hover-delay="500">
                暂无操作权限
              </u-tooltip>
            </div>
            <el-tree-select
              class="treetag"
              v-model="model.tags"
              style="width: 336px"
              :data="taglist"
              multiple
              :render-after-expand="false"
              show-checkbox
              node-key="id"
              :default-expanded-keys="[
                '全部分类'
              ]"
              @change="onSelectTags"
              :props="{
                children: 'child',
                label: 'tag',
                disabled: 'disable'
              }" />
          </el-form-item>
          <!-- <div :class="$style.dashline"></div> -->
          <el-form-item
            label="发布版本"
            required
            layout="block"
            :rules="validateRules.checkVersion"
            ref="version"
            prop="version"
            for="none">
            <span
              :class="$style.lastVersionTitle">
              (上次导出的版本：{{
                isEditOldTemp
                  ? lastVersion || "暂无"
                  : "暂无"
              }}
              )
            </span>
            <s-version
              v-model:value="model.version"
              :disabled="loading"
              min-value="1.0.0"></s-version>
          </el-form-item>
          <el-form-item
            label="版本描述"
            :rules="validateRules.description"
            prop="description"
            for="none">
            <el-input
              type="textarea"
              v-model="model.description"
              :disabled="loading"
              maxlength="500"
              show-word-limit
              placeholder="请输入"
              :autosize="{
                minRows: 5
              }"></el-input>
          </el-form-item>
          <el-form-item
            label="版本配图"
            style="margin-bottom: 0"
            for="none">
            <s-uploader
              v-model:file-list="model.picture"
              multiple
              list-type="picture"
              drag
              action="/api/v1/userIcon/upload"
              max-size="50MB"
              accept="image/png, image/jpg, image/jpeg, image/gif, image/bmp"
              :limit="10"
              :class="$style.upload">
              <div :class="$style.uploadArea">
                <s-others-icon
                  name="upload"
                  :class="
                    $style.uploadIcon
                  "></s-others-icon>
                点击/拖拽/粘贴文件到这里
              </div>
            </s-uploader>
          </el-form-item>
        </el-form>
      </el-aside>
      <el-main
        :class="$style.right"
        style="width: 400px; height: 478px">
        <div :class="$style.tipwrap">
          <div>
            <span :class="$style.tiptext">
              请选择能力
            </span>
            <span :class="$style.required">
              *
            </span>
            <span
              :class="$style.errmsg"
              v-if="isEmptyChecked">
              <s-others-icon
                name="solid-hint"
                :class="
                  $style.iconinfo
                "></s-others-icon>
              请至少选择一项能力
            </span>
          </div>
          <div>
            <el-checkbox
              :class="$style.autoCheck"
              v-model="autoCheckdepends">
              自动勾选依赖项
            </el-checkbox>
            <el-tooltip placement="top">
              <s-others-icon
                name="hint"
                :class="
                  $style.hinticon
                "></s-others-icon>
              <template #content>
                <div style="width: 300px">
                  若开发者只想将前端页面导出为模板复用，后端逻辑相关希望让模板使用者自己定义，此时可选择不导出前端页面所依赖的后端逻辑。
                </div>
              </template>
            </el-tooltip>
          </div>
        </div>
        <div
          v-if="loading"
          :class="$style.loading">
          <div v-loading="loading"></div>
          <div :class="$style.text">
            数据加载中，请稍后...
          </div>
        </div>
        <div
          v-else-if="empty"
          :class="$style.loading">
          <div :class="$style.text">
            暂无可导出对象
          </div>
        </div>
        <el-scrollbar
          v-else
          :class="$style.scrollview">
          <el-tree-v2
            ref="treeViewRef"
            :data="treeData"
            :props="treeProps"
            :height="400"
            :item-size="35"
            show-checkbox
            :default-expanded-keys="
              defaultExpandedKeys
            "
            :default-checked-keys="checkedValues"
            class="s-tree s-tree-export-template"
            check-strictly
            @check-change="onCheckChange"
            @node-expand="setDirectoryExpandIcon"
            @node-collapse="
              setDirectoryCollapseIcon
            ">
            <template #default="{ data: node }">
              <u-tooltip
                trigger="hover"
                placement="left"
                :show-after="200"
                reference="prev"
                :disabled="!node.exportDisabled">
                暂不支持导出
              </u-tooltip>
              <template
                v-if="
                  node.concept ===
                  'ConfigProperty'
                ">
                <div :class="$style.configWrap">
                  <div :class="$style.main">
                    <s-concept-icon
                      :name="
                        node.icon || node.concept
                      "
                      :class="
                        $style.conceptIcon
                      "></s-concept-icon>
                    <span>{{ node.name }}</span>
                  </div>
                  <div
                    :class="$style.desc"
                    v-if="node.description">
                    {{ node.description }}
                  </div>
                </div>
              </template>
              <template v-else>
                <template
                  v-if="
                    node.concept ===
                    'ConnectorModuleItem'
                  ">
                  <s-upload-icon
                    v-if="
                      isImage(
                        getConnectorSetting(node)
                          .icon
                      )
                    "
                    displayModeCustom
                    width="14px"
                    height="14px"
                    :can-edit="false"
                    :prop-icon="
                      getConnectorSetting(node)
                        .icon
                    "
                    :class="$style.uploadIcon" />
                  <s-concept-icon
                    v-else
                    :name="
                      getConnectorSetting(node)
                        .icon
                    "
                    :class="
                      $style.conceptIcon
                    "></s-concept-icon>
                </template>
                <template
                  v-else-if="
                    node.concept === 'Connection'
                  ">
                  <s-upload-icon
                    v-if="
                      isImage(
                        node.connector.previewImg,
                        node.connector
                          .connectorKind
                      )
                    "
                    displayModeCustom
                    width="14px"
                    height="14px"
                    :can-edit="false"
                    :prop-icon="
                      getConnectorWrapperIcon(
                        node
                      )
                    "
                    :class="$style.uploadIcon" />
                  <s-concept-icon
                    v-else
                    :name="
                      node.connector.connectorKind
                    "
                    :class="
                      $style.conceptIcon
                    "></s-concept-icon>
                </template>
                <s-concept-icon
                  v-else
                  :name="getIcon(node)"
                  :class="
                    $style.conceptIcon
                  "></s-concept-icon>
                <div
                  :class="$style.topTitle"
                  v-if="
                    node.concept &&
                    node.concept.endsWith(
                      'Root'
                    ) &&
                    node.concept !==
                      'DataSourceRoot'
                  ">
                  <span
                    class="titellipsis"
                    :title="
                      node.aliasName || node.name
                    ">
                    {{
                      node.aliasName || node.name
                    }}
                  </span>
                  <el-link
                    v-show="
                      node.childNodes.length > 0
                    "
                    @click="
                      onCheckAll($event, node)
                    ">
                    {{ getCheckedState(node) }}
                  </el-link>
                </div>
                <div
                  :class="$style.topTitle"
                  v-else-if="
                    node.concept === 'DataSource'
                  ">
                  <div>
                    <span
                      class="titellipsis"
                      :title="
                        node.aliasName ||
                        node.name
                      ">
                      {{
                        node.aliasName ||
                        node.name
                      }}
                    </span>
                    <s-others-icon
                      name="info"
                      :class="$style.dreficon">
                      <u-tooltip
                        trigger="hover"
                        placement="top"
                        :show-after="200">
                        数据源不会带出数据库链接等信息，不支持数据共享
                      </u-tooltip>
                    </s-others-icon>
                  </div>
                  <el-link
                    @click="
                      onCheckAll($event, node)
                    "
                    v-if="!node.module">
                    {{ getCheckedState(node) }}
                  </el-link>
                </div>
                <span
                  v-else
                  class="titellipsis"
                  :title="getTextName(node)">
                  {{ getTextName(node) }}
                </span>
                <span
                  v-if="
                    [
                      'Module',
                      'ConnectorModuleItem'
                    ].includes(node.concept)
                  ">
                  {{
                    node.version
                      ? `（${node.version}）`
                      : ""
                  }}
                </span>
              </template>
              <s-others-icon
                v-if="
                  getNodeReferences(node).length
                "
                name="depend-reference"
                :class="$style.dreficon">
                <u-tooltip
                  trigger="hover"
                  placement="top"
                  :show-after="200">
                  <div :class="$style.refwrap">
                    <span>依赖关系：</span>
                    <span
                      v-for="(
                        nref, index
                      ) in getNodeReferences(
                        node
                      )"
                      :key="nref.name">
                      <template
                        v-if="
                          nref.concept ===
                          'ConnectorModuleItem'
                        ">
                        <s-upload-icon
                          v-if="
                            isImage(
                              getConnectorSetting(
                                nref.node
                              ).icon
                            )
                          "
                          displayModeCustom
                          width="14px"
                          height="14px"
                          :can-edit="false"
                          :prop-icon="
                            getConnectorSetting(
                              nref.node
                            ).icon
                          "
                          :class="
                            $style.reficon
                          " />
                        <s-concept-icon
                          v-else
                          :name="
                            getConnectorSetting(
                              nref.node
                            ).icon
                          "
                          :class="
                            $style.reficon
                          "></s-concept-icon>
                      </template>
                      <template
                        v-else-if="
                          nref.concept ===
                          'Connection'
                        ">
                        <s-upload-icon
                          v-if="
                            isImage(
                              nref.node.connector
                                .previewImg,
                              nref.node.connector
                                .connectorKind
                            )
                          "
                          displayModeCustom
                          width="14px"
                          height="14px"
                          :can-edit="false"
                          :prop-icon="
                            getConnectorWrapperIcon(
                              nref.node
                            )
                          "
                          :class="
                            $style.reficon
                          " />
                        <s-concept-icon
                          v-else
                          :name="
                            nref.node.connector
                              .connectorKind
                          "
                          :class="
                            $style.reficon
                          "></s-concept-icon>
                      </template>
                      <s-concept-icon
                        v-else
                        :name="getIcon(nref)"
                        :class="
                          $style.reficon
                        "></s-concept-icon>
                      <span>{{ nref.name }}</span>
                      <span
                        v-if="
                          index !==
                          getNodeReferences(node)
                            .length -
                            1
                        ">
                        、
                      </span>
                    </span>
                  </div>
                </u-tooltip>
              </s-others-icon>
            </template>
          </el-tree-v2>
        </el-scrollbar>
      </el-main>
    </el-container>
    <template #footer>
      <div
        style="
          display: flex;
          justify-content: space-between;
        ">
        <el-space v-if="hasPreCheckedNodes">
          <span>发布的资产，可前往</span>
          <el-link @click="goAssetCenterSeg">
            「资产中心-局部模板」
          </el-link>
          <span>查看</span>
        </el-space>
        <el-space v-else>&nbsp</el-space>
        <el-space justify="end">
          <el-button @click="close()">
            取 消
          </el-button>
          <el-button
            type="primary"
            @click="onSubmit"
            :loading="submiting">
            发 布
          </el-button>
        </el-space>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  import { inject } from "vue"

  const {
    /**
     * 表单节点
     *
     * @type {Vue.ref<HTMLElement>}
     */
    formRef,
    /**
     * 树形视图节点
     *
     * @type {Vue.ref<HTMLElement>}
     */
    treeViewRef,
    /**
     * 是否可见
     *
     * @type {Vue.ref<boolean>}
     */
    visible,
    /**
     * 是否加载中
     *
     * @type {Vue.ref<boolean>}
     */
    loading,
    /**
     * 是否为空
     *
     * @type {Vue.ref<boolean>}
     */
    empty,
    /**
     * 是否提交中
     *
     * @type {Vue.ref<boolean>}
     */
    submiting,
    /**
     * 是否编辑旧模板
     *
     * @type {Vue.ref<boolean>}
     */
    isEditOldTemp,
    /**
     * 是否可以编辑图标
     *
     * @type {Vue.ref<boolean>}
     */
    canEditIcon,
    /**
     * 是否自动勾选依赖
     *
     * @type {Vue.ref<boolean>}
     */
    autoCheckdepends,
    /**
     * 是否为空选中
     *
     * @type {Vue.ref<boolean>}
     */
    isEmptyChecked,
    /**
     * 是否有预选节点
     *
     * @type {Vue.ref<boolean>}
     */
    hasPreCheckedNodes,
    /**
     * 是否有权限
     *
     * @type {Vue.computed<boolean>}
     */
    checkPermission,
    /**
     * 表单数据
     *
     * @type {Vue.reactive<object>}
     * @property {string} icon - 图标
     * @property {array} picture - 图片列表
     * @property {array} tags - 标签列表
     * @property {string} symbol - 标识
     * @property {string} name - 名称
     * @property {string} version - 版本
     * @property {string} description - 描述
     */
    model,
    /**
     * 验证规则
     *
     * @type {object}
     */
    validateRules,
    /**
     * 标签列表
     *
     * @type {Vue.ref<array>}
     */
    taglist,
    /**
     * 历史列表
     *
     * @type {Vue.ref<array>}
     */
    historyList,
    /**
     * 历史编辑列表
     *
     * @type {Vue.ref<array>}
     */
    historyEditList,
    /**
     * 最后一项
     *
     * @type {Vue.reactive<object>}
     * @property {string} name - 名称
     * @property {string} symbol - 标识
     * @property {string} value - 值
     * @property {string} text - 文本
     */
    lastItem,
    /**
     * 最后版本
     *
     * @type {Vue.ref<string>}
     */
    lastVersion,
    /**
     * 树形数据
     *
     * @type {Vue.ref<array>}
     */
    treeData,
    /**
     * 树形属性
     *
     * @type {object}
     */
    treeProps,
    /**
     * 默认展开的键
     *
     * @type {Vue.ref<array>}
     */
    defaultExpandedKeys,
    /**
     * 选中的值
     *
     * @type {Vue.ref<array>}
     */
    checkedValues,
    /**
     * 关闭对话框
     *
     * @function
     */
    close,
    /**
     * 改变图标
     *
     * @function
     * @param {string} item - 图标值
     */
    changeIcon,
    /**
     * 编辑为新模板
     *
     * @function
     * @param {Event} e - 事件对象
     */
    canEditToNewTemp,
    /**
     * 跳转到资产中心
     *
     * @function
     */
    goAssetCenterSeg,
    /**
     * 打开资产配置
     *
     * @function
     */
    openAssetconfig,
    /**
     * 选择模板
     *
     * @function
     * @param {string} symbol - 标识
     */
    onSelectSegmentTemp,
    /**
     * 选择标签
     *
     * @function
     * @param {array} item - 标签列表
     */
    onSelectTags,
    /**
     * 切换历史
     *
     * @function
     * @param {object} item - 历史项
     */
    toggleHistory,
    /**
     * 提交表单
     *
     * @function
     */
    onSubmit,
    /**
     * 检查变更
     *
     * @function
     * @param {object} node - 节点
     * @param {boolean} checked - 是否选中
     */
    onCheckChange,
    /**
     * 设置目录展开图标
     *
     * @function
     * @param {object} node - 节点
     */
    setDirectoryExpandIcon,
    /**
     * 设置目录折叠图标
     *
     * @function
     * @param {object} node - 节点
     */
    setDirectoryCollapseIcon,
    /**
     * 获取节点引用
     *
     * @function
     * @param {object} node - 节点
     * @returns {array} 引用列表
     */
    getNodeReferences,
    /**
     * 获取图标
     *
     * @function
     * @param {object} node - 节点
     * @returns {string} 图标名称
     */
    getIcon,
    /**
     * 获取文本名称
     *
     * @function
     * @param {object} node - 节点
     * @returns {string} 文本名称
     */
    getTextName,
    /**
     * 获取选中状态
     *
     * @function
     * @param {object} node - 节点
     * @param {array} allCheckedkeys - 所有选中的键
     * @returns {string} 选中状态
     */
    getCheckedState,
    /**
     * 全选
     *
     * @function
     * @param {Event} e - 事件对象
     * @param {object} node - 节点
     */
    onCheckAll,
    /**
     * 是否为图片
     *
     * @function
     * @param {string} icon - 图标
     * @param {string} connectorKind - 连接器类型
     * @returns {boolean} 是否为图片
     */
    isImage,
    /**
     * 获取连接器设置
     *
     * @function
     * @param {object} node - 节点
     * @returns {object} 连接器设置
     */
    getConnectorSetting,
    /**
     * 获取连接器包装图标
     *
     * @function
     * @param {object} node - 节点
     * @returns {string} 图标
     */
    getConnectorWrapperIcon
  } = inject("$context")

  if (!validateRules.tags) {
    validateRules.tags = [
      {
        required: true,
        message: "请选择模板分类",
        trigger: ["blur", "change"]
      }
    ]
  }
</script>

<style module>
  .dashline {
    border-top: 1px dashed
      var(--line-color-primary);
    margin: 8px 0 20px;
  }
  .left {
    border-right: 1px solid
      var(--depends-tree-view-border-color);
  }
  /* .left [class^='el-form-item'] {
  margin-bottom: 18px;
} */
  .left,
  .right {
    padding: 24px;
  }
  .right {
    padding-bottom: 0;
  }
  .topTitle {
    display: inline-flex;
    justify-content: space-between;
    width: 100%;
    padding-right: 15px;
  }

  .conceptIcon {
    vertical-align: -1px;
  }
  .nodeItem[disabled] .conceptIcon,
  .nodeItem[disabled] .uploadIcon {
    opacity: 0.6;
  }
  .scrollview {
    height: calc(100% - 50px);
    /* background: var(--depends-tree-view-background); */
    border-radius: 4px;
    background: var(--seg-tree-view-background);
    /* border: 1px solid var(--seg-tree-view-border-color); */
  }
  /* 为了横向滚动hover tree node的时候能够覆盖整条 */
  .scrollview
    [class^="f-scroll-view_wrap__"]
    > div {
    display: inline-block;
    min-width: 100%;
  }
  .tipwrap {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
  }
  .tipwrap .required {
    color: var(--error-color);
    margin-left: 4px;
  }
  .tipwrap .errmsg {
    color: var(--error-color);
    margin-left: 10px;
  }
  .tipwrap .iconinfo {
    margin-right: 2px;
  }
  .icontip {
    font-size: 12px;
    margin-left: 8px;
    vertical-align: 1px;
  }
  .icontip {
    font-size: 12px;
    margin-left: 8px;
    vertical-align: 1px;
    /* font-size: 16px; */
    cursor: pointer;
    color: var(--group-attr-panel-icon-color);
    line-height: 0;
  }
  .icontip:hover {
    color: var(
      --group-attr-panel-icon-color-hover
    );
  }
  .tip {
    width: 310px;
    font-size: 14px;
  }
  .loading {
    height: calc(100% - 50px);
    background: var(
      --depends-tree-view-background
    );
    border-radius: 4px;
    color: var(
      --depends-dialog-manage-empty-font-color
    );
    text-align: center;
    padding-top: 42px;
  }
  .loading .text {
    margin-top: 18px;
  }
  .reficon {
    font-size: 16px;
    margin-right: 2px;
    vertical-align: -1px;
  }
  .tooltip
    [class^="u-tooltip_body__"]::-webkit-scrollbar {
    width: 4px;
  }
  .tooltip [class^="u-tooltip_body__"] {
    padding: 6px;
  }
  .dreficon {
    /* composes: icontip; */
    /* color: var(--depends-export-tooltip-icon-color);
    font-size: 14px; */
    cursor: pointer;
    font-size: 12px;
    margin-left: 8px;
    vertical-align: 1px;
    /* font-size: 16px; */
    cursor: pointer;
    color: var(--group-attr-panel-icon-color);
    line-height: 0;
  }
  .dreficon:hover {
    /* color: #337EFF; */
    color: var(
      --group-attr-panel-icon-color-hover
    );
  }
  .submitbtn [class^="u-submit-button_error__"] {
    left: auto;
    right: 0;
    width: 752px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .version label,
  .tiptext {
    color: var(
      --depends-dialog-manage-font-color
    );
  }
  .symbolbox {
    display: flex;
    gap: 20px;
  }
  .histroy {
    position: absolute;
    top: 0;
    left: 263px;
    white-space: nowrap;
  }
  .tagcategory {
    position: absolute;
    top: -30px;
    right: 0;
    white-space: nowrap;
    line-height: 20px;
  }
  .tagcategory .toDetail {
    margin-left: 5px;
  }
  .modal [class^="u-popup_body__"] {
    padding: 0 !important;
  }
  .menu {
    padding: 8px 0;
  }
  .menuItem {
    width: 300px;
    height: 48px;
    padding: 10px 12px;
  }
  .menuName {
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 12px;
    color: #222222;
    max-width: 180px;
    overflow: hidden;
    word-wrap: normal;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .menuSymbol {
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 12px;
    color: #999999;
  }
  .menuItem:hover {
    background: #ededed;
  }
  .toplevel
    [class*="u-tree-view-node_checkbox_"] {
    display: none;
  }
  .lowlevel
    [class*="u-tree-view-node_checkbox_"] {
    display: inline-block;
  }
  .upload {
    width: 100%;
  }
  .upload [class^="el-upload-dragger"] {
    background-color: var(
      --uploader-draggable-background
    );
    padding: 19px;
  }
  .uploadArea {
    color: var(--uploader-draggable-color);
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }

  .uploadIcon {
    font-size: 24px;
  }
  .lastVersionTitle {
    position: absolute;
    top: -35px;
    left: 70px;
    color: #666;
  }
  .titleTipIcon {
    color: var(--icon-color-regular);
  }
  .hinticon {
    vertical-align: 4px;
    margin-left: 8px;
    color: var(--icon-color-regular);
  }
  .refwrap {
    max-width: 300px;
  }
  .refwrap [class^="s-upload-icon_root_"] {
    margin-right: 2px;
    vertical-align: -2px;
  }
  .configWrap {
    display: flex;
    flex-direction: column;
    margin-top: 2px;
  }
  .configWrap .main {
    display: flex;
    align-items: center;
  }
  .configWrap .desc {
    color: #999;
    margin-top: -5px;
  }
</style>
<style>
  .s-export-part-template-modal .el-dialog__body {
    padding: 0;
  }
  .treetag .el-select-dropdown__item {
    padding: 0 !important;
  }
</style>
