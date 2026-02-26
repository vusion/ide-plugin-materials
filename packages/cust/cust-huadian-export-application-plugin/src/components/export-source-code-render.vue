<template>
  <div>
    <el-dialog
      :model-value="visible"
      @update:model-value="setVisible"
      title="导出应用"
      :class="[$style.dialog, !showLog ? $style.formDialog : '']"
      align-center
      destroy-on-close
      append-to-body
      :close-on-click-modal="false"
      :width="showLog ? '1000px' : '600px'"
      @close="close"
      v-bind="$attrs"
    >
      <s-log
        v-if="showLog"
        :events="logEvents"
        :flowLogs="flowLogs"
        :jobId="jobId"
        :exportStatus="exportStatus"
        :isRemoteDeploy="false"
        :terminate="terminate"
      ></s-log>
      <div v-else :class="$style.modalBox">
        <el-form
          ref="formEl"
          :model="model"
          label-position="top"
          require-asterisk-position="right"
          scroll-to-error
          :class="$style.form"
        >
          <!-- <el-form-item
            label="环境选择"
            prop="envKind"
            required
            :class="$style.itemBox"
          >
            <el-radio-group
              :model-value="model.envKind"
              @change="setModelEnvKind"
            >
              <el-radio
                :disabled="isExporting"
                :value="item.env"
                v-for="item in dbDataSource"
                :key="item.env"
              >
                {{ item.envName }}
              </el-radio>
            </el-radio-group>
            <p>注：按选择的环境导出参数配置等信息</p>
          </el-form-item> -->
          <el-form-item
            label="导出方式"
            prop="method"
            required
            :class="$style.itemBox"
          >
            <el-radio-group
              :disabled="isExporting"
              :model-value="model.method"
              @change="setModelMethod"
            >
              <el-radio :value="ExportMethod.SOURCE_CODE">源码</el-radio>
              <el-radio :value="ExportMethod.COMPILED_CODE">制品</el-radio>
            </el-radio-group>
          </el-form-item>
          <template v-if="model.method === ExportMethod.COMPILED_CODE">
            <el-form-item label="制品形式" required :class="$style.itemBox">
              <el-radio-group
                :disabled="isExporting"
                :model-value="model.exportKind"
                @change="setModelExportKind"
              >
                <el-radio v-if="!isPureFeMode" value="oldDocker">镜像</el-radio>
                <el-radio
                  v-if="!isPureFeMode"
                  :value="ExportType.BOTH_FRONTED_BACKEND"
                  >jar包</el-radio
                >
                <el-radio :value="ExportType.ONLY_FRONT">前端静态文件</el-radio>
                <el-radio
                  v-if="!isPureFeMode"
                  :value="ExportType.BOTH_FRONTED_BACKEND_SRC"
                  >jar包+前端静态文件</el-radio
                >
              </el-radio-group>
            </el-form-item>
            <div
              v-if="!!lastVersion && model.exportKind !== ExportType.ONLY_FRONT"
              :class="$style.appendBox"
            >
              <el-form-item style="margin-bottom: 6px">
                <el-checkbox
                  v-show="model.exportKind !== ExportType.ONLY_FRONT"
                  :model-value="isComparedBackupVersion"
                  @change="setIsComparedBackupVersion"
                  >导出增量SQL</el-checkbox
                >
                <div :class="$style.comparedIncrementConfigWrap">
                  <el-checkbox
                    v-show="model.exportKind !== ExportType.ONLY_FRONT"
                    :model-value="isComparedIncrementConfig"
                    @change="setIsComparedIncrementConfig"
                    >导出增量配置信息</el-checkbox
                  >
                </div>
                <div
                  v-if="isComparedBackupVersion || isComparedIncrementConfig"
                  :class="$style.comparedBackupVersionWrap"
                >
                  <el-form-item
                    label="备份版本"
                    prop="comparedBackupVersion"
                    required
                    :class="$style.itemBox"
                    :rules="[
                      {
                        required: true,
                        message: '请选择备份版本',
                        trigger: ['change', 'blur'],
                      },
                    ]"
                  >
                    <el-select
                      style="width: 100%"
                      :model-value="model.comparedBackupVersion || null"
                      @change="handleUpdateComparedBackupVersion"
                    >
                      <el-option
                        v-for="option in filteredBackupVersionList"
                        :key="option.id"
                        :value="option.version"
                        :label="option.version"
                      >
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <p
                    v-show="exportKindComputed !== ExportType.ONLY_FRONT"
                    :class="$style.backupVersionHint"
                  >
                    说明：选择备份版本跟当前应用进行对比后生成增量数据
                  </p>
                </div>
              </el-form-item>
            </div>
          </template>
          <template v-if="model.method === ExportMethod.SOURCE_CODE">
            <el-form-item
              label="源码形式"
              required
              :class="[$style.itemBox, $style.sourceOptions]"
            >
              <el-radio-group
                :disabled="isExporting"
                :model-value="model.exportKindSrc"
                @change="setModelExportKindSrc"
              >
                <div
                  :class="$style.sourceOptionWrap"
                  :active="model.exportKindSrc === ExportType.ONLY_FRONT"
                  @click="handleSelectSourceOption(ExportType.ONLY_FRONT)"
                >
                  <el-radio
                    :value="ExportType.ONLY_FRONT"
                    :class="$style.sourceOptionRadio"
                    :style="{
                      fontWeight: 500,
                      color: '#1d2129',
                      height: '24px',
                    }"
                    >仅前端源码</el-radio
                  >
                  <div :class="$style.sourceOptionDescription">
                    导出纯前端项目源码（如Vue、React等），需要自行开发或对接后端API接口。包含前端框架源码、样式文件、静态资源（图片等）、路由配置、API请求示例/占位符。适用只需定制UI界面。
                  </div>
                </div>
                <div
                  v-if="!isPureFeMode"
                  :class="$style.sourceOptionWrap"
                  :active="model.exportKindSrc === ExportType.ONLY_BACKEND"
                  @click="handleSelectSourceOption(ExportType.ONLY_BACKEND)"
                >
                  <el-radio
                    :value="ExportType.ONLY_BACKEND"
                    :class="$style.sourceOptionRadio"
                    :style="{
                      fontWeight: 500,
                      color: '#1d2129',
                      height: '24px',
                    }"
                    >仅后端源码</el-radio
                  >
                  <div :class="$style.sourceOptionDescription">
                    导出纯后端项目源码（如Java），需要自行开发或对接前端界面。包含后端框架源码、数据库模型、API接口定义、业务逻辑代码、中间件配置。适用需要深度定制业务逻辑或集成现有系统。
                  </div>
                </div>
                <div
                  v-if="!isPureFeMode"
                  :class="$style.sourceOptionWrap"
                  :active="
                    model.exportKindSrc === ExportType.BOTH_FRONTED_BACKEND
                  "
                  @click="
                    handleSelectSourceOption(ExportType.BOTH_FRONTED_BACKEND)
                  "
                >
                  <el-radio
                    :value="ExportType.BOTH_FRONTED_BACKEND"
                    :class="$style.sourceOptionRadio"
                    :style="{
                      fontWeight: 500,
                      color: '#1d2129',
                      height: '24px',
                    }"
                  >
                    后端源码+前端静态文件
                  </el-radio>
                  <div :class="$style.sourceOptionDescription">
                    导出服务器端完整源码及编译的客户端静态资源包，客户端资源为可直接运行的打包文件（非源代码），整体下载后无需额外编译即可部署运行。包含后端源码+内嵌的前端模版/页面+静态资源（CSS，JS，图片）。适用无需修改客户端界面及逻辑，仅需部署使用或调整后端业务规则。
                  </div>
                </div>
                <div
                  v-if="!isPureFeMode"
                  :class="$style.sourceOptionWrap"
                  :active="
                    model.exportKindSrc === ExportType.BOTH_FRONTED_BACKEND_SRC
                  "
                  @click="
                    handleSelectSourceOption(
                      ExportType.BOTH_FRONTED_BACKEND_SRC
                    )
                  "
                >
                  <el-radio
                    :value="ExportType.BOTH_FRONTED_BACKEND_SRC"
                    :class="$style.sourceOptionRadio"
                    :style="{
                      fontWeight: 500,
                      color: '#1d2129',
                      height: '24px',
                    }"
                  >
                    前端源码+后端源码
                  </el-radio>
                  <div :class="$style.sourceOptionDescription">
                    导出完整的前端项目和后端项目源码。可选择源码存储目录，通过API接口进行通信，开箱即可分别部署。使用需要获得全部源码并进行独立部署。
                  </div>
                </div>
              </el-radio-group>
              <p v-show="exportKindComputed !== ExportType.ONLY_FRONT">
                注：导出后端源码，同时会导出相关的建表SQL脚本
              </p>
            </el-form-item>
            <div :class="$style.appendBox">
              <!-- <el-form-item v-if="canUploadCodeBase" style="margin-bottom: 6px">
                <el-checkbox
                  :model-value="uploadCodeBase"
                  @change="setUploadCodeBase"
                  >生成源码后自动上传到代码仓库</el-checkbox
                >
              </el-form-item> -->
              <el-form-item v-if="!isSourceFe" style="margin-bottom: 6px">
                <el-checkbox
                  :model-value="model.includeJar"
                  @change="setModelIncludeJar"
                >
                  导出后端源码依赖的非公开JAR包
                  <el-tooltip
                    trigger="hover"
                    placement="right"
                    :show-after="500"
                  >
                    <s-others-icon
                      name="info"
                      :class="$style.iconInfo"
                    ></s-others-icon>
                    <template #content>
                      <slot name="tooltip">
                        初次编译源码时需要将非公开JAR包导入到构建仓库，参考使用说明。
                      </slot>
                    </template>
                  </el-tooltip>
                </el-checkbox>
              </el-form-item>
              <el-form-item
                v-if="!!lastVersion && !isSourceFe"
                style="margin-bottom: 6px"
              >
                <el-checkbox
                  :model-value="isComparedBackupVersion"
                  @change="setIsComparedBackupVersion"
                  >导出增量SQL</el-checkbox
                >
                <div :class="$style.comparedIncrementConfigWrap">
                  <el-checkbox
                    :model-value="isComparedIncrementConfig"
                    @change="setIsComparedIncrementConfig"
                    >导出增量配置信息</el-checkbox
                  >
                </div>
                <div
                  v-if="isComparedBackupVersion || isComparedIncrementConfig"
                  :class="$style.comparedBackupVersionWrap"
                >
                  <el-form-item
                    label="备份版本"
                    prop="comparedBackupVersion"
                    required
                    :class="$style.itemBox"
                    :rules="[
                      {
                        required: true,
                        message: '请选择备份版本',
                        trigger: ['change', 'blur'],
                      },
                    ]"
                  >
                    <el-select
                      style="width: 100%"
                      :model-value="model.comparedBackupVersion || null"
                      @change="handleUpdateComparedBackupVersion"
                    >
                      <el-option
                        v-for="option in filteredBackupVersionList"
                        :key="option.id"
                        :value="option.version"
                        :label="option.version"
                      >
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <p
                    v-show="exportKindComputed !== ExportType.ONLY_FRONT"
                    :class="$style.backupVersionHint"
                  >
                    说明：选择备份版本跟当前应用进行对比后生成增量数据
                  </p>
                </div>
              </el-form-item>
            </div>
          </template>

          <el-form-item
            label="源码目录"
            v-if="
              model.method === ExportMethod.SOURCE_CODE &&
              model.exportKindSrc === ExportType.BOTH_FRONTED_BACKEND_SRC
            "
            required
            :class="$style.itemBox"
          >
            <el-radio-group
              :model-value="model.separation"
              @change="setModelSeparation"
              :disabled="isExporting"
            >
              <el-radio
                :value="item.value"
                v-for="item in [
                  { value: false, title: '合并目录' },
                  { value: true, title: '拆分目录' },
                ]"
                :key="item.value"
              >
                {{ item.title }}
              </el-radio>
            </el-radio-group>
            <p v-if="model.separation === false">
              注：前端源码作为后端源码子目录存放
            </p>
            <p v-if="model.separation === true">注：前后端源码按独立目录存放</p>
          </el-form-item>

          <div
            v-if="uploadCodeBase"
            :class="$style.appendBox"
            style="padding-bottom: 8px"
          >
            <el-form-item label="仓库地址">
              <div v-if="model.changeSplitFloder" :class="$style.gitTitle">
                前端仓库：
              </div>
              <div style="display: flex; align-items: center">
                {{ model.repoDomain }}
                {{ model.repoDomain.endsWith("/") ? "" : "/" }}
                <el-input
                  v-if="model.changeRepoAddress"
                  :model-value="model.repoGroup"
                  @input="(val) => setModelRepoGroup(val)"
                  style="width: 96px; height: 24px; margin: 0 4px"
                ></el-input>
                <span v-else>{{ model.repoGroup }}</span>
                <span>/</span>
                <el-input
                  v-if="model.changeRepoAddress"
                  :model-value="model.repoProject"
                  @input="(val) => setModelRepoProject(val)"
                  style="width: 96px; height: 24px; margin: 0 4px"
                >
                </el-input>
                <span v-else>{{ model.repoProject }}</span
                >.git
              </div>
              <div
                style="display: flex; margin-left: 16px; align-items: center"
              >
                上传分支
                <el-input
                  v-if="model.changeRepoBranch"
                  style="width: 61px; height: 24px; margin: 0 4px"
                  :model-value="model.repoBranch"
                  @input="(val) => setModelRepoBranch(val)"
                ></el-input>
                <span v-else>{{ model.repoBranch }}</span>
              </div>
              <template v-if="model.changeSplitFloder">
                <div :class="$style.gitTitle">后端仓库：</div>
                <div style="display: flex; align-items: center">
                  {{ model.repoDomain }}
                  {{ model.repoDomain.endsWith("/") ? "" : "/" }}
                  <el-input
                    v-if="model.changeRepoAddress"
                    :model-value="model.repoGroupBackend"
                    @input="(val) => setModelRepoGroupBackend(val)"
                    style="width: 96px; height: 24px; margin: 0 4px"
                  ></el-input>
                  <span v-else>{{ model.repoGroupBackend }}</span>
                  <span>/</span>
                  <el-input
                    v-if="model.changeRepoAddress"
                    style="width: 96px; height: 24px; margin: 0 4px"
                    :model-value="model.repoProjectBackend"
                    @input="(val) => setModelRepoProjectBackend(val)"
                  >
                  </el-input>
                  <span v-else>{{ model.repoProjectBackend }}</span
                  >.git
                </div>
                <div
                  style="display: flex; margin-left: 16px; align-items: center"
                >
                  上传分支
                  <el-input
                    v-if="model.changeRepoBranch"
                    style="width: 61px; height: 24px; margin: 0 4px"
                    :model-value="model.repoBranchBackend"
                    @input="(val) => setModelRepoBranchBackend(val)"
                  ></el-input>
                  <span v-else>{{ model.repoBranchBackend }}</span>
                </div>
              </template>
            </el-form-item>
            <div :class="$style.gitExtra">
              <el-checkbox
                v-if="model.separation === true"
                :model-value="model.changeSplitFloder"
                @change="setModelChangeSplitFloder"
                >拆分源码仓库</el-checkbox
              >
              <el-checkbox
                :model-value="model.changeRepoAddress"
                @change="setModelChangeRepoAddress"
                >自定义仓库地址</el-checkbox
              >
              <el-checkbox
                :model-value="model.changeRepoBranch"
                @change="setModelChangeRepoBranch"
                >自定义分支名称</el-checkbox
              >
              <skeleton-render
                name="views/head/export-git-sert/index"
                :model-value="model"
                @update:model-value="updateModel"
                :default-credential-id="platformCredentialId"
              />
            </div>
            <skeleton-render
              ref="gitCustomRef"
              name="views/head/export-git-custom/index"
              :default-configs="defaultCustomConfigs"
            />
          </div>

          <el-form-item
            label="后端代码构建方式"
            v-if="
              !isSourceFe &&
              showBackCodeConstructMethod &&
              model.method === ExportMethod.SOURCE_CODE
            "
            required
            :class="$style.itemBox"
          >
            <el-tooltip
              trigger="hover"
              placement="right"
              :show-after="500"
              content="根据构建方式导出对应的构件配置文件"
            >
              <s-others-icon
                name="info"
                :class="[$style.iconInfo, $style.backendCodeConstructIcon]"
              ></s-others-icon>
            </el-tooltip>
            <el-radio-group
              :model-value="constructMethod"
              @change="setConstructMethod"
              :disabled="isExporting"
            >
              <el-radio
                :value="item.value"
                v-for="item in ConstructMethods"
                :key="item.value"
              >
                {{ item.title }}
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item style="margin-bottom: 20px">
            <el-checkbox
              :disabled="!canBackup"
              :model-value="model.backupSwitch"
              @change="setModelBackupSwitch"
              >应用导出成功后自动生成备份记录</el-checkbox
            >
            <div v-if="model.backupSwitch" :class="$style.backupVersionWrap">
              <skeleton-render
                name="views/head/version-select/index"
                @change="handleVersionUpdate"
                :lastVersion="lastVersion"
              />
            </div>
          </el-form-item>
          <el-form-item
            v-if="uploadCodeBase"
            label="备注"
            prop="commitMessage"
            :rules="[
              {
                required: true,
                message: '备注信息必填',
                trigger: ['blur', 'change'],
              },
            ]"
          >
            <el-input
              type="textarea"
              required
              :rows="3"
              :model-value="model.commitMessage"
              @input="(val) => setModelCommitMessage(val)"
            ></el-input>
          </el-form-item>
          <skeleton-render
            v-if="showSystemTablePrefix"
            ref="systemTablePrefixRef"
            name="views/head/system-table-prefix/index"
            position="export"
          />
        </el-form>
      </div>
      <template #footer v-if="!showLog">
        <el-row justify="end">
          <el-button v-show="!isExporting" @click="close()">取 消</el-button>
          <el-button
            :disabled="isExporting || showLog"
            :loading="isExporting"
            type="primary"
            @click="prepareSubmit"
          >
            {{ useSourceModeAndCodeBase ? "上传到仓库" : "导 出" }}
          </el-button>
        </el-row>
      </template>
    </el-dialog>
    <!-- 结束对话框 -->
    <el-dialog
      v-bind="$attrs"
      :model-value="finishVisible"
      @update:model-value="setFinishVisible"
      title="提示"
      :class="$style.modalDescription"
      align-center
      destroy-on-close
      append-to-body
      :close-on-click-modal="false"
      width="400px"
    >
      {{ useSourceModeAndCodeBase ? "源码上传" : "导出应用"
      }}{{ submitSuccess ? "成功" : "失败" }}！
      <p
        v-if="finishDescription?.length > 0"
        style="margin: 8px 0 0 0; word-break: break-all"
      >
        {{ finishDescription }}
      </p>
      <p
        v-if="finishDescription2?.length > 0"
        style="margin: 8px 0 0 0; word-break: break-all"
      >
        {{ finishDescription2 }}
      </p>
      <template #footer>
        <div
          :style="{
            display: 'flex',
            justifyContent:
              submitSuccess && useSourceModeAndCodeBase
                ? 'space-between'
                : 'flex-end',
          }"
        >
          <template v-if="submitSuccess">
            <el-button
              v-if="useSourceModeAndCodeBase && !model.changeSplitFloder"
              style="align-self: flex-start"
              @click="() => copyToClipboard(codeBaseUrl)"
              >复制仓库地址</el-button
            >

            <el-button
              v-if="useSourceModeAndCodeBase && model.changeSplitFloder"
              style="align-self: flex-start"
              @click="() => copyToClipboard(codeBaseUrlFe)"
              >复制前端仓库地址</el-button
            >
            <el-button
              v-if="useSourceModeAndCodeBase && model.changeSplitFloder"
              style="align-self: flex-start"
              @click="() => copyToClipboard(codeBaseUrlBe)"
              >复制后端仓库地址</el-button
            >

            <el-button
              type="primary"
              style="margin-left: 20px"
              @click="closeFinishModal"
              >完 成</el-button
            >
          </template>
          <template v-else>
            <el-button @click="closeFinishModal">关 闭</el-button>
            <el-button
              type="primary"
              style="margin-left: 20px"
              @click="reExport"
              >重新导出</el-button
            >
          </template>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { inject } from "vue";

// 从逻辑组件暴露的变量和方法
const {
  /**
   * 导出对话框是否可见
   *
   * @type {Vue.ref<boolean>}
   */
  visible,
  /**
   * 导出完成结果对话框是否可见
   *
   * @type {Vue.ref<boolean>}
   */
  finishVisible,
  /**
   * 导出/源码上传 是否成功
   *
   * @type {boolean}
   */
  submitSuccess,
  /**
   * 导出结果主描述文案
   *
   * @type {string}
   */
  finishDescription,
  /**
   * 导出结果补充描述文案
   *
   * @type {string}
   */
  finishDescription2,
  /**
   * 代码仓库地址（单仓库场景）
   *
   * @type {string}
   */
  codeBaseUrl,
  /**
   * 前端代码仓库地址（拆分仓库场景）
   *
   * @type {string}
   */
  codeBaseUrlFe,
  /**
   * 后端代码仓库地址（拆分仓库场景）
   *
   * @type {string}
   */
  codeBaseUrlBe,
  /**
   * 关闭导出结果对话框方法，关闭后如果上传成功，则关闭导出弹窗
   *
   * @function
   */
  closeFinishModal,
  /**
   * 重新导出方法（关闭结果弹窗并重新打开主弹窗）
   *
   * @function
   */
  reExport,
  /**
   * 复制文本到剪贴板方法
   *
   * @function
   * @param {string} text - 需要复制的文本
   */
  copyToClipboard,
  /**
   * 是否正在导出中
   *
   * @type {boolean}
   */
  isExporting,
  /**
   * 是否展示导出日志视图
   *
   * @type {boolean}
   */
  showLog,
  /**
   * 准备并提交导出请求方法，
   * 点击上传到仓库或导出按钮时调用，进行前置校验，校验通过后正式提交
   *
   * @function
   */
  prepareSubmit,
  /**
   * 关闭导出弹窗方法
   *
   * @function
   */
  close,
  /**
   * 当前应用是否为纯前端模式
   *
   * @type {boolean}
   */
  isPureFeMode,
  /**
   * 是否仅导出前端源码
   * 导出方式为“源码”且源码类型为“仅前端源码”时为true
   *
   * @type {boolean}
   */
  isSourceFe,
  /**
   * 当前导出的最终类型
   * 如果导出方式为“制品”，则返回“制品形式”的值
   * 如果导出方式为“源码”，则返回“源码形式”的值
   *
   * @type {string}
   */
  exportKindComputed,
  /**
   * 是否展示“生成源码后自动上传到代码仓库”选项
   *
   * @type {boolean}
   */
  canUploadCodeBase,
  /**
   * 是否处于“导出源码并上传仓库”模式
   * 导出方式为“源码”且勾选了“生成源码后自动上传到代码仓库”时为true
   *
   * @type {boolean}
   */
  useSourceModeAndCodeBase,
  /**
   * 是否展示系统表前缀配置区域
   * 导出方式为“源码”且导出类型为“仅后端源码”、“后端源码+前端静态文件”、“前端源码+后端源码”时为true
   *
   * @type {boolean}
   */
  showSystemTablePrefix,
  /**
   * 过滤后的备份版本列表（受勾选项影响）
   * 如果勾选了"导出增量配置信息"，只显示 supportIncrementCodeCompare=true 的版本
   * 否则显示所有版本
   *
   * @type {Array<object>}
   * @property {string} id - 版本记录ID
   * @property {string} version - 备份版本号
   */
  filteredBackupVersionList,
  /**
   * 后端代码构建方式（如 MAVEN 等）
   *
   * @type {string}
   */
  constructMethod,
  /**
   * 后端代码构建方式枚举列表
   * MAVEN：Maven构建
   * GRADLE：Gradle构建
   *
   * @type {Array<object>}
   * @property {string} value - 构建方式值
   * @property {string} title - 构建方式展示名称
   */
  ConstructMethods,
  /**
   * 自定义构建配置默认值
   *
   * @type {object|null}
   */
  defaultCustomConfigs,
  /**
   * 导出表单实例引用
   *
   * @type {Vue.ref<HTMLElement>}
   */
  formEl,
  /**
   * 自定义 Git 配置弹窗组件引用
   *
   * @type {Vue.ref<HTMLElement>}
   */
  gitCustomRef,
  /**
   * 系统表前缀配置组件引用
   *
   * @type {Vue.ref<HTMLElement>}
   */
  systemTablePrefixRef,
  /**
   * 导出配置表单数据模型
   *
   * @type {object}
   * @property {string} repoGroupBackend - 后端仓库组
   * @property {string} repoProjectBackend - 后端仓库项目
   * @property {string} repoBranchBackend - 后端仓库分支
   * @property {boolean} separation - 是否拆分源码目录
   * @property {string} repoCategory - 仓库分类
   * @property {string} repoDomain - 仓库域名
   * @property {string} repoGroup - 仓库组
   * @property {string} repoProject - 仓库项目
   * @property {string} repoBranch - 仓库分支
   * @property {boolean} changeSplitFloder - 是否拆分源码仓库
   * @property {boolean} changeRepoAddress - 是否自定义仓库地址
   * @property {boolean} changeRepoBranch - 是否自定义仓库分支
   * @property {string} credentialId - 凭证ID
   * @property {string} commitMessage - 备注
   * @property {string} method - 导出方式
   * @property {string} exportKind - 制品形式 value值
   * @property {string} exportKindSrc - 源码形式 value值
   * @property {string} envKind - 环境编码
   * @property {string} includeJar - 是否包含二方包和jar包,源码导出时有用
   * @property {string} comparedBackupVersion - 增量SQL，若为空或者版本不存在，则无需输出增量SQL
   * @property {boolean} backupSwitch - 是否备份
   * @property {string} backupVersion - 备份版本
   */
  model,
  /**
   * 导出方式枚举（源码 / 制品）
   * SOURCE_CODE: 源码
   * COMPILED_CODE: 制品
   *
   * @type {object}
   */
  ExportMethod,
  /**
   * 导出类型枚举
   *
   * 源码形式时：
   * ONLY_FRONT: 仅前端源码
   * ONLY_BACKEND: 仅后端源码
   * BOTH_FRONTED_BACKEND: 同时导出后端源码 + 前端静态文件
   * BOTH_FRONTED_BACKEND_SRC: 同时导出前端源码 + 后端源码
   *
   * 制品形式时：
   * ONLY_FRONT: 前端静态文件
   * BOTH_FRONTED_BACKEND: jar包
   * BOTH_FRONTED_BACKEND_SRC: jar包+前端静态文件
   * @type {object}
   */
  ExportType,
  /**
   * 环境数据源列表
   *
   * @type {Array<object>}
   * @property {string} env - 环境编码
   * @property {string} envName - 环境名称
   */
  dbDataSource,
  /**
   * 上一次导出的版本号
   *
   * @type {string}
   */
  lastVersion,
  /**
   * 是否勾选“导出增量 SQL”
   *
   * @type {boolean}
   */
  isComparedBackupVersion,
  /**
   * 是否勾选“导出增量配置信息”
   *
   * @type {boolean}
   */
  isComparedIncrementConfig,
  /**
   * 是否勾选“生成源码后自动上传到代码仓库”
   *
   * @type {boolean}
   */
  uploadCodeBase,
  /**
   * 是否展示“后端代码构建方式”配置
   *
   * @type {boolean}
   */
  showBackCodeConstructMethod,
  /**
   * 是否允许生成备份记录（由后端或业务规则控制）
   *
   * @type {boolean}
   */
  canBackup,
  /**
   * 导出过程中的事件日志列表
   *
   * @type {Array<object>}
   */
  logEvents,
  /**
   * 导出流程日志（流程节点日志）
   *
   * @type {Array<object>|null}
   */
  flowLogs,
  /**
   * 当前导出任务 ID
   *
   * @type {string}
   */
  jobId,
  /**
   * 当前导出状态（如 准备中 / 进行中 / 完成 等）
   *
   * @type {string}
   */
  exportStatus,
  /**
   * 是否允许终止当前导出流程
   *
   * @type {boolean}
   */
  terminate,
  /**
   * 默认凭证 ID（用于 Git 仓库认证）
   *
   * @type {string}
   */
  platformCredentialId,
  /**
   * 备份版本选择下拉变更回调
   *
   * @function
   * @param {string} version - 选中的备份版本号
   */
  handleUpdateComparedBackupVersion,
  /**
   * 源码导出形式切换回调
   *
   * @function
   * @param {string} exportType - 选中的导出类型
   */
  handleSelectSourceOption,
  /**
   * 备份版本选择组件回调（设置 model.backupVersion）
   *
   * @function
   * @param {string} version - 选中的备份版本号
   */
  handleVersionUpdate,
  /**
   * 导出增量配置信息勾选回调
   *
   * @function
   * @param {boolean} value - 是否勾选
   */
  handleChangeIsComparedIncrementConfig,
  /**
   * 设置导出对话框是否可见
   *
   * @function
   * @param {boolean} value - 是否可见
   */
  setVisible,
  /**
   * 设置导出完成结果对话框是否可见
   *
   * @function
   * @param {boolean} value - 是否可见
   */
  setFinishVisible,
  /**
   * 设置环境编码
   *
   * @function
   * @param {string} value - 环境编码
   */
  setModelEnvKind,
  /**
   * 设置导出方式
   *
   * @function
   * @param {string} value - 导出方式值
   */
  setModelMethod,
  /**
   * 设置制品形式
   *
   * @function
   * @param {string} value - 制品形式值
   */
  setModelExportKind,
  /**
   * 设置是否勾选"导出增量 SQL"
   *
   * @function
   * @param {boolean} value - 是否勾选
   */
  setIsComparedBackupVersion,
  /**
   * 设置是否勾选"导出增量配置信息"
   *
   * @function
   * @param {boolean} value - 是否勾选
   */
  setIsComparedIncrementConfig,
  /**
   * 设置源码形式
   *
   * @function
   * @param {string} value - 源码形式值
   */
  setModelExportKindSrc,
  /**
   * 设置是否勾选"生成源码后自动上传到代码仓库"
   *
   * @function
   * @param {boolean} value - 是否勾选
   */
  setUploadCodeBase,
  /**
   * 设置是否包含JAR包
   *
   * @function
   * @param {boolean} value - 是否包含
   */
  setModelIncludeJar,
  /**
   * 设置是否拆分源码目录
   *
   * @function
   * @param {boolean} value - 是否拆分
   */
  setModelSeparation,
  /**
   * 设置仓库组
   *
   * @function
   * @param {string} value - 仓库组
   */
  setModelRepoGroup,
  /**
   * 设置仓库项目
   *
   * @function
   * @param {string} value - 仓库项目
   */
  setModelRepoProject,
  /**
   * 设置仓库分支
   *
   * @function
   * @param {string} value - 仓库分支
   */
  setModelRepoBranch,
  /**
   * 设置后端仓库组
   *
   * @function
   * @param {string} value - 后端仓库组
   */
  setModelRepoGroupBackend,
  /**
   * 设置后端仓库项目
   *
   * @function
   * @param {string} value - 后端仓库项目
   */
  setModelRepoProjectBackend,
  /**
   * 设置后端仓库分支
   *
   * @function
   * @param {string} value - 后端仓库分支
   */
  setModelRepoBranchBackend,
  /**
   * 设置是否拆分源码仓库
   *
   * @function
   * @param {boolean} value - 是否拆分
   */
  setModelChangeSplitFloder,
  /**
   * 设置是否自定义仓库地址
   *
   * @function
   * @param {boolean} value - 是否自定义
   */
  setModelChangeRepoAddress,
  /**
   * 设置是否自定义分支名称
   *
   * @function
   * @param {boolean} value - 是否自定义
   */
  setModelChangeRepoBranch,
  /**
   * 设置后端代码构建方式
   *
   * @function
   * @param {string} value - 构建方式值
   */
  setConstructMethod,
  /**
   * 设置是否备份
   *
   * @function
   * @param {boolean} value - 是否备份
   */
  setModelBackupSwitch,
  /**
   * 设置备注信息
   *
   * @function
   * @param {string} value - 备注信息
   */
  setModelCommitMessage,
  /**
   * 更新整个 model 对象
   *
   * @function
   * @param {object} value - 要更新的 model 对象属性
   */
  updateModel,
} = inject("$context") || {};

// 确保“环境选择”和“生成源码后自动上传到代码仓库”的默认值符合预期
model.value.envKind = "dev";
uploadCodeBase.value = false;
</script>

<style module>
.form {
  padding: 16px 0px 0;
}

.form .itemBox {
  color: var(--designer-forty-color);
}

.form .itemBox p {
  color: var(--designer-font-third-color);
  font-size: 12px;
  margin-top: 0px;
  margin-bottom: 0px;
  width: 100%;
}

.dialog :global(.el-dialog__body) {
  margin: 0;
}

.formDialog :global(.el-dialog__body) {
  padding: 0 24px !important;
  max-height: calc(90vh - 40px - 53px);
  overflow-y: auto;
}

.dialog :global(.el-radio__label) {
  padding-left: 4px;
}

.dialog :global(.el-dialog__body)::before {
  content: "";
  height: 48px;
  width: 48px;
  background-size: 100% 100%;
  top: -15px;
}

::local(.dialog) {
  --form-item-margin-bottom-large: 20px;
}

.modalRemindbox {
  padding: 8px;
  width: 352px;
  background: rgba(51, 126, 255, 0.1);
  box-sizing: border-box;
  border-radius: 4px;
  margin-bottom: 5px;
  color: var(--designer-forty-first-color);
  display: flex;
  gap: 4px;
  justify-content: space-between;
}

.underline {
  text-decoration: none;
  margin-left: 3px;
}

.link {
  vertical-align: text-top;
}

.sourceOptions {
  display: flex;
}

.sourceOptionWrap {
  width: 266px;
  border-radius: 6px;
  border: 1px solid #e6e7eb;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sourceOptionWrap[active="true"] {
  border: 1px solid #1a5fff;
}

.sourceOptionWrap:nth-child(2),
.sourceOptionWrap:nth-child(4) {
  margin-left: 8px;
}

.sourceOptionWrap:nth-child(3),
.sourceOptionWrap:nth-child(4) {
  height: 198px;
  margin-top: 8px;
}

.sourceOptionDescription {
  line-height: 20px;
  font-size: 12px;
  color: #4e5969;
}

.sourceOptionRadio :global(.el-radio__label) {
  line-height: 24px;
}

.sourceOptionText {
  color: #1d2129;
  font-weight: 500;
}

.appendBox {
  padding: 6px 14px;
  margin-bottom: 24px;
  border-radius: 4px;
  opacity: 1;
  box-sizing: border-box;
  border: 1px dashed #e0e0e0;
}

.appendBox:empty {
  border: none;
  display: none;
}

.form .appendBox :global(.el-form-item) {
  margin-bottom: 8px;
}

.form .appendBox :global(.el-form-item .el-form-item__label) {
  margin-bottom: 4px;
}

.gitExtra {
  margin-bottom: 8px;
}

.gitExtra :global(.el-checkbox) {
  width: 100%;
  margin: 0;
}

.updateIcon {
  cursor: pointer;
  margin-left: 4px;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
}

.iconInfo {
  font-size: 16px;
  vertical-align: text-top;
  color: #666;
}

.backendCodeConstructIcon {
  position: absolute;
  top: -34px;
  left: 108px;
}

.comparedBackupVersionWrap,
.backupVersionWrap {
  width: 100%;
}

.backupVersionHint {
  margin-top: 4px;
  margin-bottom: 0;
  margin-left: 0;
  padding-left: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}

/* 当有错误提示时，说明文案需要下移，避免重叠 */
.comparedBackupVersionWrap
  :global(.el-form-item.is-error)
  + .backupVersionHint {
  margin-top: 20px;
}

.comparedIncrementConfigWrap {
  width: 100%;
  margin-top: 6px;
}

.uploadCodeBaseInfo {
  font-size: 12px;
  font-weight: normal;
  color: var(--designer-font-first-color);
  margin: 0;
  opacity: 0.5;
  margin-top: 4px;
  letter-spacing: 0em;
}

.codeStorePathTitle {
  font-size: 12px;
  line-height: 12px;
  color: var(--text-color-secondary);
  margin-bottom: 10px;
}

.codeStorePathInfo {
  margin: 10px 0 14px;
}

.loading {
  position: absolute;
  display: inline-block;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: fit-content;
  text-align: center;
}

.loading .text {
  font-size: 14px;
  line-height: 14px;
  color: var(--designer-font-second-color);
}

.gitTitle {
  display: flex;
  color: grey;
  width: 100%;
  font-size: 12px;
}
</style>
