<template>
  <el-dialog
    v-model="visible"
    class="s-export-app-template-modal"
    width="500px"
    align-center
    destroy-on-close
    append-to-body
    :close-on-click-modal="false"
    @close="close()">
    <template #header>
      <span style="margin-right: 8px">
        发布为应用模板
      </span>
    </template>
    <el-form
      ref="form"
      :model="model"
      @validate="setValid($event.valid)"
      label-position="top"
      require-asterisk-position="right"
      :class="$style.form">
      <div :class="$style.iconbox">
        <s-upload-img
          ref="uploadImgRef"
          @changeIcon="changeIcon"
          :can-edit="canEditIcon"
          :prop-icon="model.icon"></s-upload-img>
        <el-form-item
          label="模板名称"
          style="width: 100%; margin-left: 10px"
          required
          :rules="validateRules.name"
          prop="name"
          for="none">
          <el-input
            v-model="model.name"
            placeholder="请输入模板名称"
            :disabled="exported"
            @compositionstart="onStart"
            @compositionend="onEnd"></el-input>
        </el-form-item>
      </div>

      <el-form-item
        label="模板分类(资产中心展示)"
        :class="$style.longlabel"
        style="position: relative"
        :rules="validateRules.tags"
        required
        layout="block"
        prop="tags"
        for="none">
        <div :class="$style.tagcategory">
          <el-tooltip
            v-if="!checkPermission"
            :content="'暂无操作权限'"
            trigger="hover"
            placement="top"
            :hover-delay="500">
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
          </el-tooltip>
          <el-link
            v-if="checkPermission"
            @click="openAssetconfig">
            分类管理
            <s-others-icon
              name="check-detail"
              :class="
                $style.toDetail
              "></s-others-icon>
          </el-link>
        </div>
        <el-tree-select
          class="treetag"
          placeholder="请选择模板分类"
          v-model="model.tags"
          style="width: 100%"
          :data="taglist"
          multiple
          :render-after-expand="false"
          show-checkbox
          node-key="id"
          :default-expanded-keys="['全部分类']"
          @change="onSelectTags"
          :props="{
            children: 'child',
            label: 'tag',
            disabled: 'disable'
          }" />
      </el-form-item>
      <el-form-item
        label="发布版本"
        required
        :rules="validateRules.checkVersion"
        layout="block"
        prop="version">
        <span :class="$style.lastVersionTitle">
          (上次导出的版本：{{
            lastVersion ? lastVersion : "暂无"
          }}
          )
        </span>
        <s-version
          v-model:value="model.version"
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
          placeholder="请输入"></el-input>
      </el-form-item>

      <el-form-item
        label="模板配图"
        layout="block"
        for="none">
        <s-uploader
          v-model:file-list="files"
          multiple
          list-type="picture"
          drag
          :on-success="onUploadSuccess"
          action="/api/v1/userIcon/upload"
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
      <el-form-item
        label="下载选择："
        :class="$style.formlabelinline"
        for="none">
        <el-radio-group
          :model-value="needPreview"
          @change="setNeedPreview($event)">
          <el-radio :value="true">
            下载模板+资产中心预览效果
          </el-radio>
          <el-radio :value="false">
            仅下载模板
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-space
        style="
          display: flex;
          justify-content: space-between;
        "
        justify="end">
        <el-space>
          <el-button
            @click="showMockModal()"
            v-if="needPreview">
            编辑预览数据
          </el-button>
        </el-space>

        <el-space justify="end">
          <el-button @click="close()">
            取 消
          </el-button>
          <el-button
            type="primary"
            @click="onSubmit"
            :loading="submiting">
            导 出
          </el-button>
        </el-space>
      </el-space>
    </template>
    <skeleton-render
      name="views/modules/edit-mock-data-modal/index"
      @currentRole="currentRole"
      @getMockList="getMockList"
      ref="mockDataModal" />
  </el-dialog>
</template>

<script setup>
  import { inject } from "vue"

  const {
    /**
     * 表单节点引用
     *
     * @type {Vue.ref<HTMLElement>}
     */
    form,
    /**
     * 图片上传组件引用
     *
     * @type {Vue.ref<HTMLElement>}
     */
    uploadImgRef,
    /**
     * Mock数据模态框组件引用
     *
     * @type {Vue.ref<HTMLElement>}
     */
    mockDataModal,
    /**
     * 对话框是否可见
     *
     * @type {Vue.ref<boolean>}
     */
    visible,
    /**
     * 关闭对话框方法
     *
     * @function
     */
    close,
    /**
     * 表单数据模型
     *
     * @type {object}
     * @property {string} name - 模板名称
     * @property {string} icon - 模板图标
     * @property {Array} tags - 模板分类标签
     * @property {string} version - 发布版本
     * @property {string} description - 版本描述
     */
    model,
    /**
     * 表单验证状态
     *
     * @type {boolean}
     */
    valid,
    /**
     * 图标变更回调方法
     *
     * @function
     * @param {string} icon - 新的图标值
     */
    changeIcon,
    /**
     * 是否可编辑图标
     *
     * @type {boolean}
     */
    canEditIcon,
    /**
     * 表单验证规则
     *
     * @type {object}
     * @property {Array} name - 名称验证规则
     * @property {Array} checkVersion - 版本验证规则
     * @property {Array} description - 描述验证规则
     */
    validateRules,
    /**
     * 是否已导出
     *
     * @type {boolean}
     */
    exported,
    /**
     * 输入法开始事件处理
     *
     * @function
     */
    onStart,
    /**
     * 输入法结束事件处理
     *
     * @function
     */
    onEnd,
    /**
     * 是否有操作权限
     *
     * @type {boolean}
     */
    checkPermission,
    /**
     * 打开资产配置方法
     *
     * @function
     */
    openAssetconfig,
    /**
     * 标签列表数据
     *
     * @type {Array<object>}
     * @property {string} id - 标签ID
     * @property {string} tag - 标签名称
     * @property {Array} child - 子标签列表
     * @property {boolean} disable - 是否禁用
     */
    taglist,
    /**
     * 选择标签回调方法
     *
     * @function
     * @param {Array} tags - 选中的标签值
     */
    onSelectTags,
    /**
     * 上次导出的版本号
     *
     * @type {string}
     */
    lastVersion,
    /**
     * 上传文件列表
     *
     * @type {Array<object>}
     */
    files,
    /**
     * 上传成功回调方法
     *
     * @function
     * @param {object} response - 上传响应数据
     */
    onUploadSuccess,
    /**
     * 是否需要预览
     *
     * @type {boolean}
     */
    needPreview,
    /**
     * 显示Mock数据模态框方法
     *
     * @function
     */
    showMockModal,
    /**
     * 提交表单方法
     *
     * @function
     */
    onSubmit,
    /**
     * 是否正在提交中
     *
     * @type {boolean}
     */
    submiting,
    /**
     * 当前角色回调方法
     *
     * @function
     * @param {string} role - 当前角色
     */
    currentRole,
    /**
     * 获取Mock数据列表方法
     *
     * @function
     * @param {Array} list - Mock数据列表
     */
    getMockList,
    /**
     * 设置表单验证状态方法
     *
     * @function
     * @param {boolean} valid - 验证状态
     */
    setValid,
    /**
     * 设置是否需要预览方法
     *
     * @function
     * @param {boolean} value - 是否需要预览
     */
    setNeedPreview
  } = inject("$context")

  if (!validateRules.value.tags) {
    validateRules.value.tags = [
      {
        required: true,
        message: "请选择模板分类",
        trigger: ["blur", "change"]
      }
    ]
  }
</script>

<style module>
  .form {
    padding: 8px;
  }

  .tagcategory {
    position: absolute;
    top: -28px;
    right: 0px;
    white-space: nowrap;
  }

  .iconbox {
    display: flex;
    justify-content: space-between;
    /*    margin-bottom:20px;*/
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
  .formlabelinline {
    display: flex !important;
    margin-bottom: 0;
  }
  .formlabelinline
    > [class^="el-form-item__label"] {
    display: flex !important;
    align-items: center;
    margin-bottom: 0 !important;
  }
</style>
