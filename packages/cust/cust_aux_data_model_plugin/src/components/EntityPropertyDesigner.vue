<template>
  <div>
    <div
      v-if="!isViewEntity"
      class="topIconGroup"
      :class="$style.body"
      style="margin-top: 0px; margin-bottom: 0px; border-bottom: 0px; height: 40px"
    >
      <!-- 添加实体属性 -->
      <s-others-icon name="add" tooltip="添加属性" button @click="handleAddItem"></s-others-icon>
      <!-- 删除实体属性 -->
      <s-others-icon
        name="remove"
        button
        :tooltip="getRemoveTooltip()"
        :disabled="
          !selectedItem ||
          !selectedItem.naslNode ||
          selectedItem.loading ||
          selectedItem.naslNode.primaryKey ||
          isOfficalEntityProperty(selectedItem)
        "
        @click="removeItem(selectedItem)"
      ></s-others-icon>
      <div :class="$style.icondivider">|</div>
      <!-- 上移实体属性 -->
      <s-others-icon
        name="position-up"
        button
        :tooltip="
          !selectedItem ||
          !selectedItem.naslNode ||
          selectedItem.loading ||
          renderList[0].naslNode.name === selectedItem.naslNode.name
            ? '当前属性已置顶'
            : '上移'
        "
        :disabled="
          !selectedItem ||
          !selectedItem.naslNode ||
          selectedItem.loading ||
          renderList[0].naslNode.name === selectedItem.naslNode.name
        "
        @click="moveUpItem"
      ></s-others-icon>
      <!-- 下移实体属性 -->
      <s-others-icon
        name="position-down"
        button
        :tooltip="
          !selectedItem ||
          !selectedItem.naslNode ||
          selectedItem.loading ||
          renderList[renderList.length - 1].naslNode.name === selectedItem.naslNode.name
            ? '当前属性已置底'
            : '下移'
        "
        :disabled="
          !selectedItem ||
          !selectedItem.naslNode ||
          selectedItem.loading ||
          renderList[renderList.length - 1].naslNode.name === selectedItem.naslNode.name
        "
        @click="moveDownItem"
      ></s-others-icon>
      <!-- 一键添加到备选字段库 -->
      <el-button v-if="showReflowBtn" :loading="reflowLoading" @click="addReflowField">一键添加到备选字段库</el-button>
    </div>
    <div :class="$style.body" style="margin-top: 0px">
      <div :class="$style.bodywrap" class="tableCell">
        <el-table
          ref="tableviewRef"
          :data="renderList"
          highlight-current-row
          :style="`min-width:950px;${tableHeight}`"
          style="width: 100%"
          :class="
            renderList.length > 8
              ? [$style.table, $style.tablescroll, 's-data-table-edit']
              : [$style.table, 's-data-table-edit']
          "
          :value="selectedItem && selectedItem.naslNode.name"
          value-field="name"
          :header-row-style="{ height: '40px' }"
          :cell-style="{ padding: '0px' }"
          :row-style="{ height: '42px' }"
          :row-class-name="setRowClassName"
          empty-text="暂无数据"
          @row-contextmenu="onContextMenuRow"
          @row-click="onSelectRowWithDataType"
          @header-dragend="handleDragend"
          @click.right.prevent
          :border="true"
        >
          <!-- 主键/关联属性的icon -->
          <el-table-column width="38" prop="primaryKey" :resizable="false">
            <template #default="{ row: item, $index }">
              <template v-if="$index === -1" />
              <template v-else>
                <s-others-icon
                  v-if="item.naslNode.primaryKey"
                  name="key"
                  :class="[$style.iconBase, $style.iconKey]"
                ></s-others-icon>
                <s-others-icon
                  v-if="item.naslNode.relationProperty"
                  name="link"
                  :class="[$style.iconBase, $style.iconLink]"
                ></s-others-icon>
              </template>
            </template>
          </el-table-column>
          <!-- 标题 -->
          <el-table-column prop="label" min-width="107" label="字段注释">
            <template #header>
              <div class="theadLable">字段注释</div>
            </template>
            <template #default="{ row: item, $index }">
              <template v-if="$index === -1" />
              <!-- 非禁用状态 -->
              <template v-else-if="!item.loading && !item.naslNode.parentNode.loading && !isViewEntity">
                <!-- 展示态 -->
                <div
                  v-if="item.edit !== 'label'"
                  :class="$style.edit"
                  @dblclick="onSetItemEdit(item, 'label', true)"
                  tabindex="0"
                  @keyup="onKeyUp($event, item, 'label')"
                  :title="item.naslNode.label"
                >
                  <div :class="$style.text">
                    <span :class="$style.textContent">{{ item.naslNode.label }}</span>
                    <s-others-icon
                      v-show="!isOfficalEntityProperty(item)"
                      name="edit"
                      :class="[$style.iconBase, $style.iconEdit]"
                      @click="onSetItemEdit(item, 'label', true)"
                    ></s-others-icon>
                  </div>
                </div>
                <!-- 编辑态 -->
                <div v-else :class="$style.editwrap">
                  <!-- value 传入的是被验证的值 -->
                  <!-- validate-result 来调整 是否存在非法项 -->
                  <u-validator
                    ref="labelValidatorRef"
                    v-slot="slotProps"
                    :value="item.naslNode.label"
                    rules="maxLength(63)"
                    :class="$style.validator"
                    error-display="appear"
                    error-append-to-body
                    @blur-valid="onBlurLabel(item, $event.value)"
                    @blur-invalid="errorScrollIntoView"
                    @validate-result="hasInvalid = !$event.valid"
                  >
                    <s-input
                      placeholder="请输入标题"
                      :model-value="item.naslNode.label"
                      ref="labelEditor"
                      :class="$style.input"
                      @focus="handleLabelFocus(item.naslNode.label)"
                      @blur:value="handleLabelBlur($event, slotProps, item)"
                      @input="handleLabelInput($event, slotProps)"
                      @keyup.enter="$event.target.blur()"
                    ></s-input>
                  </u-validator>
                </div>
              </template>
              <!-- 禁用状态 -->
              <div v-else :class="$style.text">
                <!-- 之前仅仅为 item.label 但是实际上在item 对象中没有label属性，恐在特殊情况下存在，故范围限制为 区分 viewEntity -->
                <span>{{ isViewEntity ? item.naslNode.label : item.label }}</span>
              </div>
            </template>
          </el-table-column>
          <!-- 名称 -->
          <el-table-column label="字段名" prop="name" min-width="87">
            <template #header>
              <div class="theadLable">字段名</div>
            </template>
            <template #default="{ row: item, $index }">
              <template v-if="$index === -1" />
              <!-- 非禁用状态 -->
              <template v-else-if="!getDisable(item)">
                <!-- 展示态 -->
                <div
                  v-if="item.edit !== 'name'"
                  tabindex="0"
                  :class="$style.edit"
                  :title="item.naslNode.name"
                  @dblclick="onSetItemEdit(item, 'name', true)"
                  @keyup="onKeyUp($event, item, 'name')"
                >
                  <div :class="$style.text">
                    <span :class="$style.textContent">{{ item.naslNode.name }}</span>
                    <s-others-icon
                      name="edit"
                      :class="[$style.iconBase, $style.iconEdit]"
                      @click="onSetItemEdit(item, 'name', true)"
                    ></s-others-icon>
                  </div>
                </div>
                <!-- 编辑态 -->
                <div v-else :class="$style.editwrap">
                  <!-- value 传入的是被验证的值 -->
                  <!-- validate-result 来调整 是否存在非法项 -->
                  <u-validator
                    v-slot="slotProps"
                    :value="item.naslNode.name"
                    :rules="getEntityPropertyRules(item.naslNode)"
                    :class="$style.validator"
                    error-display="appear"
                    error-append-to-body
                    @blur-valid="onBlurName(item, $event.value)"
                    @blur-invalid="errorScrollIntoView"
                    @validate-result="hasInvalid = !$event.valid"
                  >
                    <!-- “属性名”为空是显示提示信息 -->
                    <el-tooltip
                      :visible="tooltipOpened === 'entityAttribute' && !itemNameValue"
                      placement="top-start"
                      content="属性为英文字母、数字和下划线，且首字母小写"
                    >
                      <s-input
                        :placeholder="entityPropertyPlaceholder"
                        :model-value="item.naslNode.name"
                        ref="nameEditor"
                        :class="$style.input"
                        @focus="onFocusName(item)"
                        @blur:value="slotProps.blurFn($event)"
                        @input="slotProps.inputChange($event)"
                        @keyup.enter="$event.target.blur()"
                        @update:modelValue="itemNameValue = $event"
                      ></s-input>
                    </el-tooltip>
                  </u-validator>
                </div>
              </template>
              <!-- 禁用状态 -->
              <div v-else :class="$style.text">
                <span>{{ item.naslNode.name }}</span>
              </div>
            </template>
          </el-table-column>
          <!-- 数据类型 -->
          <el-table-column label="数据类型" min-width="247">
            <template #header>
              <div class="theadLable">数据类型</div>
            </template>
            <template #default="{ row: item, $index }">
              <template v-if="$index === -1" />
              <template v-else>
                <el-tooltip v-if="isAppDeploying" content="应用发布中，暂不能修改" placement="bottom-start">
                  <div :class="$style.text">
                    <span>{{ showDatatype(item) }}</span>
                  </div>
                </el-tooltip>
                <!-- 禁用状态 / 已经发布过的复合类型 -->
                <template v-else-if="getDisable(item) || isPublishedComplexType(item)">
                  <div :class="$style.text">
                    <span>{{ showDatatype(item) }}</span>
                  </div>
                </template>
                <!-- 非禁用状态 -->
                <template v-else>
                  <!-- 展示态 -->
                  <div
                    v-if="item.edit !== 'datatype'"
                    tabindex="0"
                    :class="$style.edit"
                    :ref="`datatype${item.naslNode.id}`"
                    :title="showDatatype(item)"
                    @dblclick="onDblClickDatatype(item, $event)"
                    @keyup="onKeyUp($event, item, 'datatype')"
                  >
                    <div :class="$style.text">
                      <span :class="$style.textContent">{{ showDatatype(item) }}</span>
                      <s-others-icon
                        name="edit"
                        :class="[$style.iconBase, $style.iconEdit]"
                        @click="(getDataTypeList(), onSetItemEdit(item, 'datatype', false))"
                      ></s-others-icon>
                    </div>
                  </div>
                  <!-- 编辑态 -->
                  <div v-else :class="$style.editwrap">
                    <el-tooltip :content="`${isAppDeploying ? '应用发布中，暂不能修改' : ''}`" placement="bottom-start">
                      <s-datatype-select
                        :unionable="false"
                        :no-union-subtype="true"
                        :data-type-list="item.naslNode.lastVersion ? dataTypeList : undefined"
                        :last-version="item.naslNode.lastVersion"
                        :type-annotation="item.naslNode.typeAnnotation"
                        :concept="item.naslNode.entity.concept"
                        :show-system-types="false"
                        :show-generic-types="true"
                        :show-entity="true"
                        :show-structures="true"
                        :emptyable="false"
                        :hasAnonymousStructure="true"
                        :disabled="item.naslNode.readonly || isAppDeploying || isPublishedComplexType(item)"
                        @blur="handleBlur(item)"
                        @change="onChangeDatatype"
                      ></s-datatype-select>
                    </el-tooltip>
                  </div>
                </template>
              </template>
            </template>
          </el-table-column>
          <!-- 是否必填 -->
          <el-table-column label="是否必填" width="70" prop="required" :resizable="false">
            <template #default="{ row: item, $index }">
              <template v-if="$index === -1" />
              <div v-else style="margin-left: 16px">
                <el-checkbox
                  v-model="item.naslNode.required"
                  :disabled="getDisable(item) || isComplexType(item) || isOfficalEntity(item)"
                  :tabindex="item.editable === false || item.loading || item.naslNode.parentNode.loading ? -1 : 0"
                  :class="$style.checkbox"
                  @change="requireInput(item, $event)"
                ></el-checkbox>
              </div>
            </template>
          </el-table-column>
          <!-- 默认值 -->
          <el-table-column label="默认值" prop="defaultValue" width="120" :resizable="false">
            <template #default="{ row: item }">
              <div v-if="['createdTime', 'updatedTime'].includes(item.naslNode.name)" :class="$style.text">
                <span>自动生成</span>
              </div>
              <div v-else-if="['createdBy', 'updatedBy'].includes(item.naslNode.name)" :class="$style.text">
                <span>（无）</span>
              </div>
              <template v-else-if="!canSetDefaultValue(item)">
                <div :class="$style.text">
                  <span>（无）</span>
                </div>
              </template>
              <template
                v-else-if="
                  item.loading || item.naslNode.parentNode.loading || item.naslNode.generationRule !== 'manual'
                "
              >
                <div :class="$style.text">
                  <div :class="$style.text" v-if="item.naslNode.generationRule === 'auto'">
                    <span>自动生成</span>
                  </div>
                  <span v-else>{{ item.naslNode.defaultValue }}</span>
                </div>
              </template>
              <template v-else>
                <s-attr-input
                  title="默认值绑定"
                  node-concept="defaultValue"
                  :name="item.naslNode.name"
                  :parent-node="item.naslNode"
                  :node="item.naslNode.defaultValue"
                  :class="{
                    [$style.typeError]: IsError(item.naslNode),
                  }"
                ></s-attr-input>
              </template>
            </template>
          </el-table-column>
          <!-- 显示在表格 -->
          <el-table-column width="100" prop="display.inTable" :resizable="false">
            <template #header>
              <el-checkbox
                label="显示在表格"
                :class="$style.checkbolabel"
                :model-value="inTable"
                @change="toggleSelectAll($event, 'inTable')"
              ></el-checkbox>
            </template>
            <template #default="{ row: item, $index }">
              <template v-if="$index === -1" />
              <div v-else :data-item-id="item.id">
                <el-checkbox
                  :model-value="item.naslNode.display.inTable"
                  :disabled="item.loading || item.naslNode.parentNode.loading"
                  :class="$style.checkbox"
                  @change="setDisplay(item, $event, 'inTable')"
                ></el-checkbox>
              </div>
            </template>
          </el-table-column>
          <!-- 显示在筛选 -->
          <el-table-column width="100" prop="display.inFilter" :resizable="false">
            <template #header>
              <el-checkbox
                label="显示在筛选"
                :class="$style.checkbolabel"
                :model-value="inFilter"
                @change="toggleSelectAll($event, 'inFilter')"
              ></el-checkbox>
            </template>
            <template #default="{ row: item, $index }">
              <template v-if="$index === -1" />
              <div v-else :data-item-id="item.id">
                <el-checkbox
                  :model-value="item.naslNode.display.inFilter"
                  :disabled="item.loading || item.naslNode.parentNode.loading || isComplexType(item)"
                  :class="$style.checkbox"
                  @change="setDisplay(item, $event, 'inFilter')"
                ></el-checkbox>
              </div>
            </template>
          </el-table-column>
          <!-- 显示在表单 -->
          <el-table-column width="100" prop="display.inForm" :resizable="false">
            <template #header>
              <el-checkbox
                label="显示在表单"
                :class="$style.checkbolabel"
                :model-value="inForm"
                @change="toggleSelectAll($event, 'inForm')"
              ></el-checkbox>
            </template>
            <template #default="{ row: item, $index }">
              <template v-if="$index === -1" />
              <div v-else :data-item-id="item.id">
                <el-checkbox
                  :model-value="item.naslNode.display.inForm"
                  :class="$style.checkbox"
                  :disabled="item.loading || item.naslNode.parentNode.loading || isComplexType(item)"
                  @change="setDisplay(item, $event, 'inForm')"
                ></el-checkbox>
              </div>
            </template>
          </el-table-column>
          <!-- 显示在详情 -->
          <el-table-column width="100" prop="display.inDetail" :resizable="false">
            <template #header>
              <el-checkbox
                label="显示在详情"
                :class="$style.checkbolabel"
                :model-value="inDetail"
                @change="toggleSelectAll($event, 'inDetail')"
              ></el-checkbox>
            </template>
            <template #default="{ row: item, $index }">
              <template v-if="$index === -1" />
              <div v-else :data-item-id="item.id">
                <el-checkbox
                  :model-value="item.naslNode.display.inDetail"
                  :disabled="item.loading || item.naslNode.parentNode.loading"
                  :class="$style.checkbox"
                  @change="setDisplay(item, $event, 'inDetail')"
                ></el-checkbox>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <!-- 右键点击 -->
        <el-popover
          :disabled-scroll="true"
          trigger="click"
          ref="menuPopper"
          :popper-options="popperOptions"
          v-if="menuSelectedItem && popperExistMap[menuSelectedItem.id]"
          v-model:visible="popperVisibleMap[menuSelectedItem && menuSelectedItem.id]"
          :virtual-ref="triggerRef"
          :placement="placement"
          :show-arrow="false"
          @hide="onMenuPopperHide"
        >
          <el-menu :class="$contextmenu.menu" @click="onMenuClick">
            <el-menu-item-group :class="$contextmenu.group" title="属性">
              <el-menu-item :class="$contextmenu.item" @click="onMenuFindUsage">查找引用</el-menu-item>
              <el-menu-item
                :class="$contextmenu.item"
                @click="onMenuDelete(removeItem)"
                :disabled="
                  (menuSelectedItem && menuSelectedItem.primaryKey) ||
                  isOfficalEntityProperty({
                    naslNode: menuSelectedItem,
                  }) ||
                  isViewEntity
                "
              >
                删除
              </el-menu-item>
            </el-menu-item-group>
          </el-menu>
        </el-popover>
      </div>
      <template v-if="selectedItem">
        <div :class="[$style.flexgrid, $style.bodywrap1]">
          <div :class="$style.gridcolumn" class="extraForm">
            <el-form
              ref="selectedItemForm"
              :model="selectedItem"
              :class="[$style.reffrom, $style.blockFromLayout, 's-data-attr-designer-form']"
              label-width="85px"
              label-position="right"
              :inline="true"
            >
              <!-- 最 大/小 值/长度 -->
              <skeleton-render
                name="views/data/components/entity-field-rules/index"
                :property="selectedItem.naslNode"
                :key="'rules_' + selectedItem.naslNode.name"
                :disabled="
                  selectedItem.loading ||
                  selectedItem.naslNode.parentNode.loading ||
                  selectedItem.naslNode.editable === false ||
                  isViewEntity
                "
                :is-view-entity="isViewEntity"
                direction="horizontal"
                :class="$style.rules"
              />
              <!-- 小数位数 -->
              <el-form-item v-if="typeName === 'Decimal'" label="小数位数">
                <el-input-number
                  placeholder="请输入小数位数"
                  :color="scaleErrorMsg ? 'error' : ''"
                  v-model="model.scale"
                  :min="scaleOption.min"
                  :max="scaleOption.max"
                  controls-position="right"
                  :disabled="decimalDisabled(selectedItem) || isViewEntity"
                  :value-on-clear="0"
                  @keyup.enter="$event.target.blur()"
                  @change="setScale"
                ></el-input-number>
                <div v-if="scaleErrorMsg" :class="$style.scaleErrorMsg">
                  <s-others-icon name="solid-hint"></s-others-icon>
                  {{ scaleErrorMsg }}
                </div>
              </el-form-item>
              <!-- 关联属性 -->
              <el-form-item :key="selectedItem.naslNode.name">
                <template #label>
                  <div style="display: flex; align-items: center">
                    关联属性
                    <s-others-icon name="link2" :class="$style.iconLink2"></s-others-icon>
                  </div>
                </template>
                <skeleton-render
                  name="views/data/entity-reference/index"
                  :entity="entity"
                  :property="selectedItem.naslNode"
                  :value="entityReference"
                  :disabled="selectedItem.loading || selectedItem.naslNode.parentNode.loading || isViewEntity"
                  :data-type-list="selectedItem.naslNode.lastVersion ? dataTypeList : undefined"
                  :error="isReleationEntityError(selectedItem.naslNode)"
                  @save="onSaveReference"
                  @clear="onClearReference"
                />
              </el-form-item>
              <!-- 属性记录 -->
              <el-form-item
                label="关联属性实体记录删除规则"
                v-if="selectedItem.naslNode.relationProperty"
                layout="block"
                class="relationDelRule"
              >
                <el-select
                  style="width: 240px"
                  v-model="selectedItem.naslNode.deleteRule"
                  placeholder="请选择"
                  :disabled="selectedItem.loading || selectedItem.naslNode.parentNode.loading || isViewEntity"
                  @change="setDeleteRule"
                >
                  <el-option label="不允许删除" value="protect"></el-option>
                  <el-option label="允许删除且同时删除本实体记录" value="cascade"></el-option>
                </el-select>
              </el-form-item>
              <!-- 主键生成规则 -->
              <el-form-item v-if="selectedItem.naslNode.primaryKey" label="主键生成规则" placement="bottom">
                <skeleton-render
                  name="views/data/components/entity-primarykey-rules/index"
                  :disabled="isViewEntity"
                  :entity="entity"
                  :selected-item="selectedItem.naslNode"
                  @changeErrorMsgs="changeErrorMsgs"
                />
              </el-form-item>
              <!-- 数据库列名 -->
              <el-form-item label="数据库列名" placement="bottom">
                <u-validator
                  ref="columnNameValidatorRef"
                  style="width: 100%"
                  :rules="entityPropertyColumnNameRules"
                  :value="selectedItem.naslNode.columnName || selectedItem.naslNode.name"
                  @blur-dirty-valid="selectedItem.naslNode.setColumnName($event.value)"
                  v-slot="slotProps"
                >
                  <s-input
                    :placeholder="entityPropertyColumnNamePlaceholder"
                    :model-value="selectedItem.naslNode.columnName || selectedItem.naslNode.name"
                    :disabled="isTableOrExcelOrigin || isViewEntity"
                    @change="slotProps.blurChange"
                    @input="slotProps.inputChange($event)"
                    @keyup.enter.stop="$event.target.blur()"
                  ></s-input>
                </u-validator>
              </el-form-item>
              <!-- 描述 -->
              <el-form-item label="描述" prop="description">
                <u-validator
                  v-slot="slotProps"
                  :value="selectedItem.naslNode.description"
                  rules="maxLength(63)"
                  :class="$style.validator"
                  @blur-valid="onBlurDescription(selectedItem, $event.value)"
                  @blur-invalid="errorScrollIntoView"
                  @validate-result="hasInvalid = !$event.valid"
                >
                  <s-input
                    type="textarea"
                    ref="descriptionEditor"
                    placeholder="请输入描述"
                    :model-value="selectedItem.naslNode.description"
                    :disabled="selectedItem.loading || selectedItem.naslNode.parentNode.loading || isViewEntity"
                    @blur:value="slotProps.blurFn($event)"
                    @keyup.enter="slotProps.blurFn()"
                    @input="slotProps.inputChange($event)"
                  ></s-input>
                </u-validator>
              </el-form-item>
            </el-form>
          </div>
        </div>
        <div :class="$style.advancedWrap" v-if="showDatabasetype">
          <el-form :disabled="isViewEntity" label-width="80px" gap="small" class="s-data-attr-designer-form">
            <skeleton-render
              name="views/data/components/entity-property-databasetype/index"
              :property="selectedItem.naslNode"
            />
          </el-form>
        </div>
      </template>
      <div :class="$style.bodywrap1" v-show="errorMsgs.length || sourceSyncErrMsgs.length">
        <div v-for="errorMsg in errorMsgs" :key="errorMsg" :class="$propertyDesigner.errorMsg">
          <i :class="$propertyDesigner.infoicon"></i>
          <span>{{ errorMsg }}</span>
        </div>
        <!-- 实体在同步数据源时产生的错误信息 -->
        <div v-for="errorMsg in sourceSyncErrMsgs" :key="errorMsg" :class="$propertyDesigner.errorMsg">
          <i :class="$propertyDesigner.infoicon"></i>
          <span>{{ errorMsg }}</span>
        </div>
      </div>
    </div>
    <!-- 查询弹出框 -->
    <el-popover
      :visible="reflowPopoverVisible"
      :virtual-ref="labelEditor"
      :show-arrow="false"
      placement="bottom-start"
      :width="340"
      virtual-triggering
    >
      <div class="reflowPopover" v-loading="reflowPopoverLoading">
        <div class="reflowPopoverEmpty" v-if="fieldList.length === 0">
          <s-others-icon name="hint" class="centerFlex" style="font-size: 28px; margin-bottom: 20px"></s-others-icon>
          <span class="centerFlex">暂无推荐字段</span>
        </div>
        <div v-else>
          <el-scrollbar height="250px">
            <div
              class="reflowPopoverItem"
              v-for="item in fieldList"
              :key="item.id"
              @mouseenter="activeItem = item"
              @mouseleave="activeItem = null"
            >
              <el-row :gutter="10">
                <el-col :span="9" class="sle">
                  <el-tooltip :content="item.name" placement="top" :show-after="500" :disabled="!isTextOverflow">
                    <div
                      class="tooltip-trigger"
                      v-html="getFieldName(item.name, item.matchedNames)"
                      @mouseenter="checkOverflow"
                    ></div>
                  </el-tooltip>
                </el-col>
                <el-col class="sle" :span="8">
                  <el-tooltip
                    :content="getFieldTypeTitle(item)"
                    placement="top"
                    :show-after="500"
                    :disabled="!isTextOverflow"
                  >
                    <div class="tooltip-trigger" @mouseenter="checkOverflow">{{ getFieldTypeTitle(item) }}</div>
                  </el-tooltip>
                </el-col>
                <el-col :span="4">
                  {{ item.required ? '必填' : '非必填' }}
                </el-col>
                <el-col :span="3" v-show="activeItem?.id === item.id" style="color: #2383ff">使用</el-col>
              </el-row>
            </div>
          </el-scrollbar>
        </div>
        <div style="height: 18px; margin-top: 10px">
          <s-others-icon name="hint" class="warningIcon"></s-others-icon>
          <span>输入_，可进行词根匹配</span>
        </div>
      </div>
    </el-popover>
    <!-- 添加至备选数据库字段库弹窗 -->
    <el-dialog v-model="reflowDialogVisible" title="一键添加到备选字段库" width="50%">
      <el-table
        ref="reflowTableRef"
        :data="reflowFieldList"
        @select="handleSelectReflowField"
        @select-all="handleSelectReflowField"
      >
        <el-table-column type="selection" width="40" />
        <el-table-column label="字段注释" prop="label" />
        <el-table-column label="字段名" prop="name" />
        <el-table-column label="数据类型" prop="type" />
        <el-table-column label="是否必填" prop="required">
          <template #default="scope">
            <span>{{ scope.row.required ? '是' : '否' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="字段长度" prop="length">
          <template #default="scope">
            <span>{{ getReflowFieldLength(scope.row) }}</span>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <div class="reflowDialogFooter">
          <el-button
            type="primary"
            :disabled="reflowConfirmBtnDisabled"
            :loading="confirmLoading"
            @click="handleUploadReflowField"
          >
            确 定
          </el-button>
          <el-button @click="reflowDialogVisible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import { inject, onMounted, ref, nextTick } from 'vue';
  import { ElMessage, ClickOutside as vClickOutside } from 'element-plus';
  import { requestApi, getIsReflowField, getFieldList, getReflowFieldList, uploadReflowField } from '../apis';
  import { debounce } from '../utils';

  const props = defineProps({
    entity: Object,
  });

  const handleAddItem = () => {
    addItem();
    nextTick(() => {
      onSetItemEdit(selectedItem.value, 'label', true);
    });
  };

  const showReflowBtn = ref(false);

  const reflowPopoverVisible = ref(false);
  const fieldList = ref([]);
  const reflowQuery = ref('');
  const abortController = ref(null);
  const requestId = ref(0); // 用于标识当前请求

  const debounceQueryFieldList = debounce(() => {
    // 设置loading状态
    reflowPopoverLoading.value = true;

    // 取消之前的请求
    if (abortController.value) {
      abortController.value.abort();
    }

    // 创建新的 AbortController 和请求ID
    abortController.value = new AbortController();
    const currentRequestId = ++requestId.value;

    getFieldList({ query: reflowQuery.value }, abortController.value.signal)
      .then(res => {
        // 只有当前请求是最新的才更新数据
        if (currentRequestId === requestId.value) {
          fieldList.value = res.result || [];
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      })
      .finally(() => {
        // 只有当前请求是最新的才更新加载状态
        if (currentRequestId === requestId.value) {
          abortController.value = null;
          reflowPopoverLoading.value = false;
        }
      });
  }, 400);

  const reflowPopoverLoading = ref(false);
  const activeItem = ref(null);

  const getFieldName = (name, matchedNames) => {
    if (!name || typeof name !== 'string') return '';
    if (!Array.isArray(matchedNames)) return `<span style="color: red; font-weight: bold;">${name}</span>`;

    const matchedSet = new Set(matchedNames.filter(item => item && typeof item === 'string'));
    const parts = name.split(/(_+)/);

    return parts
      .map(part => {
        if (part.startsWith('_')) return part;
        return matchedSet.has(part) ? part : `<span style="color: red; font-weight: bold;">${part}</span>`;
      })
      .join('');
  };

  const getFieldTypeTitle = item => {
    if (item.type === 'String') {
      const stringLabel = getStringLabel(item.length);
      return item.type + (stringLabel ? `  (${stringLabel})` : '');
    }
    return item.type;
  };

  const columnNameValidatorRef = ref(null);

  const handleUseField = item => {
    const target = selectedItem.value?.naslNode;
    if (target?.concept === 'EntityProperty') {
      target.app.emit('collect:start', { actionMsg: '数据建模插件更新字段名' });
      const newName = target.parentNode?.getPropertyUniqueName?.(item.name) || item.name; // 保证字段名唯一
      const typeName = item.type === 'Integer' ? 'Long' : item.type;
      const updateData = {
        name: newName,
        columnName: newName,
        required: item.required,
        typeAnnotation: {
          concept: 'TypeAnnotation',
          typeKind: 'primitive',
          typeNamespace: 'nasl.core',
          typeName,
        },
      };
      if (item.type === 'String' && item.length) {
        const minRule = target.toJSON().rules.find(rule => rule.startsWith('minLength'));
        Object.assign(updateData, {
          databaseTypeAnnotation: {
            concept: 'DatabaseTypeAnnotation',
            typeName: 'varchar',
            arguments: {
              length: item.length,
            },
          },
          rules: [minRule, `maxLength(${item.length})`].filter(Boolean),
        });
      }
      target.update(updateData);
      setTimeout(() => {
        // 延迟收集，把外层onBlurLabel的change也收集到这次的batchInstruct中
        target.app.emit('collect:end');
      });

      nextTick(async () => {
        try {
          const res = await columnNameValidatorRef.value?.validate();
        } catch (error) {
          // console.error(error);
          // 新设置的字段名不符合规则，主动聚焦到输入框
          onSetItemEdit(selectedItem.value, 'name', true);
        }
      });
    }
  };

  const handleLabelFocus = label => {
    reflowQuery.value = label;
  };

  const handleLabelBlur = async (event, slotProps, item) => {
    reflowPopoverVisible.value = false;
    reflowQuery.value = '';
    fieldList.value = [];

    event = event.replace(/_/g, ''); // event 去除掉_

    slotProps.blurFn(event); // 触发模版中原来的失焦逻辑
    if (activeItem.value) {
      handleUseField(activeItem.value);
      activeItem.value = null;
    }
  };

  const handleLabelInput = (event, slotProps) => {
    reflowPopoverVisible.value = true;
    reflowQuery.value = event;
    slotProps.inputChange(event); // 触发模版中原有的修改逻辑
    // 外置设置防抖查询loading状态
    reflowPopoverLoading.value = true;
    debounceQueryFieldList();
  };

  onMounted(() => {
    getIsReflowField({}).then(res => {
      showReflowBtn.value = res.result;
    });
  });

  // 一键添加到备选字段库
  const reflowLoading = ref(false);
  const reflowFieldList = ref([]);

  const addReflowField = () => {
    reflowLoading.value = true;

    const filterList = ['id', 'createdTime', 'updatedTime', 'createdBy', 'updatedBy'];
    const filterRegex = /^property\d+$|^.*[\u4e00-\u9fa5].*$/;

    const properties = props.entity?.toJSON()?.properties || [];
    const tempReflowFieldList = [];
    const nameSet = new Set();
    properties.forEach(property => {
      if (
        !property.label ||
        filterList.includes(property.name) ||
        filterRegex.test(property.name) ||
        property.typeAnnotation?.typeKind !== 'primitive'
      ) {
        return;
      }
      let type = property.typeAnnotation?.typeName || 'String';
      if (type === 'Long') type = 'Integer'; // 整数类型需要重命名为Integer
      const propertyName = property.name.replace(/\d+$/, '') || '';
      if (nameSet.has(propertyName)) {
        return;
      }
      nameSet.add(propertyName);
      tempReflowFieldList.push({
        name: propertyName,
        label: property.label || '',
        required: property.required || false,
        type,
        length: type === 'String' ? property.databaseTypeAnnotation?.arguments?.length || 255 : void 0,
      });
    });
    reflowFieldList.value = tempReflowFieldList;
    if (reflowFieldList.length === 0) {
      reflowLoading.value = false;
      showMessage();
      return;
    }

    // 备选库不需要校验字段唯一性，直接打开弹窗
    requestApi(
      getReflowFieldList,
      {
        list: tempReflowFieldList.map(item => ({
          name: item.name,
          label: item.label,
        })),
      },
      res => {
        if (res.result?.length === 0) {
          showMessage();
          return;
        } else {
          // 只有在res.result中的name，在tempReflowFieldList中存在，才显示
          const set = new Set(res.result);
          reflowFieldList.value = tempReflowFieldList.filter(item => set.has(item.name));
          reflowDialogVisible.value = true;
          nextTick(() => {
            reflowConfirmBtnDisabled.value = false;
            reflowTableRef.value.toggleAllSelection();
          });
        }
      },
      err => {
        console.error(err);
      },
      () => {
        reflowLoading.value = false;
      }
    );
    // reflowDialogVisible.value = true;
    // reflowLoading.value = false;
    // nextTick(() => {
    //   reflowConfirmBtnDisabled.value = false;
    //   reflowTableRef.value.toggleAllSelection();
    // });
  };

  // 显示[暂无可回流到备选数据库的字段]消息
  const showMessage = (type = 'warning', msg = '暂无可回流到备选数据库的字段') => {
    ElMessage.closeAll();
    ElMessage[type](msg);
  };

  const reflowDialogVisible = ref(false);
  const reflowTableRef = ref(null);

  const getStringLabel = length => {
    const map = {
      255: '短 255',
      4000: '中 4000',
      16777215: '长 16777215',
    };
    return map[length] || length;
  };
  const getReflowFieldLength = row => {
    return row.type === 'String' ? getStringLabel(row.length) : '-';
  };

  const reflowConfirmBtnDisabled = ref(false);
  const isTextOverflow = ref(false);

  // 检测文本是否溢出
  const checkOverflow = event => {
    const element = event.target;
    isTextOverflow.value = element.scrollWidth > element.clientWidth;
  };
  const handleSelectReflowField = (selection, row) => {
    reflowConfirmBtnDisabled.value = selection.length === 0;
  };

  const confirmLoading = ref(false);
  const handleUploadReflowField = () => {
    confirmLoading.value = true;
    const selectedList = reflowTableRef.value.getSelectionRows();
    requestApi(
      uploadReflowField,
      {
        list: selectedList,
      },
      res => {
        if (res.result) {
          showMessage('success', '添加成功');
          reflowDialogVisible.value = false;
        } else {
          showMessage('error', res.msg || '添加失败');
        }
      },
      err => {
        // console.error(err);
        showMessage('error', err);
      },
      () => {
        confirmLoading.value = false;
      }
    );
  };

  const {
    /**
     * 名称输入框节点
     *
     * @type {Vue.ref<HTMLElement>}
     */
    nameEditor,
    /**
     * 标题输入框节点
     *
     * @type {Vue.ref<HTMLElement>}
     */
    labelEditor,
    /**
     * 描述输入框节点
     *
     * @type {Vue.ref<HTMLElement>}
     */
    descriptionEditor,
    /**
     * 表格节点
     *
     * @type {Vue.ref<HTMLElement>}
     */
    tableviewRef,
    /**
     * 数据库视图导入生成的实体
     * entity 的 origin 属性是否是 view
     *
     * @type {Vue.computed<boolean>}
     */
    isViewEntity,
    /**
     * 添加实体属性
     *
     * @function
     */
    addItem,
    /**
     * 生成移除按钮的提示
     *
     * @function
     * @return string
     */
    getRemoveTooltip,
    /**
     * 表格选中的行元素
     *
     * @type {Vue.computed<object>}
     */
    selectedItem,
    /**
     * 是否是官方实体属性
     *
     * @function
     * @param entityProperty - 实体属性
     * @return boolean
     */
    isOfficalEntityProperty,
    /**
     * 移除实体索引
     *
     * @function
     * @param item - 需要删除的行元素
     */
    removeItem,
    /**
     * 表格的渲染数据
     *
     * @type {Vue.computed<array>}
     */
    renderList,
    /**
     * 上移当前选中的实体索引
     *
     * @function
     */
    moveUpItem,
    /**
     * 下移当前选中的实体索引
     *
     * @function
     */
    moveDownItem,
    /**
     * 表格高度
     *
     * @type {Vue.computed<number>}
     */
    tableHeight,
    /**
     * 设置表单列的样式
     *
     * @function
     */
    setRowClassName,
    /**
     * 右键选中表格行元素
     *
     * @function
     */
    onContextMenuRow,
    /**
     * 选中行元素时触发
     *
     * @function
     * @param item - 行元素
     */
    onSelectRowWithDataType,
    /**
     * 拖拽调整表格列宽度
     *
     * @function
     * @param newWidth - 新宽度
     * @param oldWidth - 旧宽度
     * @param column - 列元素
     */
    handleDragend,
    /**
     * 是否禁止编辑行元素
     *
     * @function
     * @param item - 行元素
     */
    getDisable,
    /**
     * 设置表格列元素编辑状态
     *
     * @function
     * @param item - 当前行元素
     * @param name - 属性名称
     * @param focus - 是否选中输入框
     */
    onSetItemEdit,
    /**
     * Tab 键跳转切换下一个属性
     *
     * @function
     * @param event - 原生键盘事件
     * @param item - 行元素
     * @param name - 属性名称
     */
    onKeyUp,
    /**
     * 名称输入框失焦并保存数据
     *
     * @function
     * @param item - 当前行元素
     * @param name - 需要保存的名称
     */
    onBlurName,
    /**
     * 验证不通过时滚动到错误元素
     */
    errorScrollIntoView,
    /**
     * 存在错误
     *
     * @type {Vue.ref<boolean>}
     */
    hasInvalid,
    /**
     * 显示输入框的提示
     *
     * @type {Vue.ref<string>}
     */
    tooltipOpened,
    /**
     * 属性名，暂时存储属性名，用于输入框输入等操作
     *
     * @type {Vue.ref<string>}
     */
    itemNameValue,
    /**
     * 输入框获取焦点时触发
     *
     * 1. 设置tooltipOpened的值
     * 2. 设置itemNameValue
     *
     * @function
     * @param item - 当前行元素
     */
    onFocusName,
    /**
     * 标题输入框失焦并保存数据
     *
     * @function
     * @param item - 当前行元素
     * @param name - 需要保存的标题
     */
    onBlurLabel,
    /**
     * 是否应用正在发布
     *
     * @type {Vue.computed<boolean>}
     */
    isAppDeploying,
    /**
     * 是否实体已经发布过并且是复合类型
     *
     * 1. 实体已经发布过，在app下的depEntities可以找到该实体
     * 2. 实体是复合类型：'Map', 'List'，或者typeKind是reference并且namespace是'entities', 'structures'
     *
     * @function
     * @param property - 实体属性
     * @return boolean
     */
    isPublishedComplexType,
    /**
     * 数据类型的标题
     *
     * @function
     * @param item - 行元素
     * @return string
     */
    showDatatype,
    /**
     * 双击编辑数据类型输入框
     *
     * @function
     * @param item - 行元素
     * @param event - 原生事件
     */
    onDblClickDatatype,
    /**
     * 获取可选类型
     *
     * @function
     * @return 可选类型
     */
    getDataTypeList,
    /**
     * 失焦时取消当前行元素编辑状态
     *
     * @function
     * @param item - 行元素
     */
    handleBlur,
    /**
     * 修改实体属性类型
     *
     * @function
     * @param event - event.value 实际使用数据
     */
    onChangeDatatype,
    /**
     * 是否属于官方实体
     *
     * @function
     * @param entityProperty - 实体属性
     * @return boolean
     */
    isOfficalEntity,
    /**
     * 复合类型
     *
     * @function
     * @param property - 实体属性
     * @return boolean
     */
    isComplexType,
    /**
     * 修改是否必填
     *
     * @function
     * @param item - 行元素
     * @param event - el-checkbox 原生事件
     */
    requireInput,
    /**
     * 能否设置默认值
     *
     * @function
     * @param property - 实体属性
     * @return boolean
     */
    canSetDefaultValue,
    /**
     * 对应节点是否有错误
     *
     * @function
     * @param node - 节点
     * @return boolean
     */
    IsError,
    /**
     * 显示在表格
     *
     * @type {Vue.computed<boolean>}
     */
    inTable,
    /**
     * 全部勾选或者取消全部勾选
     *
     * @function
     * @param event - el-checkhox 原生事件
     * @param key - 属性名
     */
    toggleSelectAll,
    /**
     * 设置显示属性
     *
     * @function
     * @param item - 行元素
     * @param event - el-checkhox 原生事件
     * @param key - 属性名
     */
    setDisplay,
    /**
     * 显示在筛选
     *
     * @type {Vue.computed<boolean>}
     */
    inFilter,
    /**
     * 显示在表格
     *
     * @type {Vue.computed<boolean>}
     */
    inForm,
    /**
     * 显示在详情
     *
     * @type {Vue.computed<boolean>}
     */
    inDetail,
    /**
     * ElementPlus 的 popper 配置
     */
    popperOptions,
    /**
     * 右键菜单选中项
     *
     * @type {Vue.ref<object>}
     */
    menuSelectedItem,
    /**
     * 项对应的右键菜单是否存在
     */
    popperExistMap,
    /**
     * 项对应的右键菜单是否显示
     */
    popperVisibleMap,
    /**
     * 右键菜单的触发节点
     */
    triggerRef,
    /**
     * 右键菜单的出现位置
     */
    placement,
    /**
     * 右键菜单隐藏时的处理函数
     */
    onMenuPopperHide,
    /**
     * 菜单点击时
     */
    onMenuClick,
    /**
     * 菜单-查找引用
     *
     * @function
     */
    onMenuFindUsage,
    /**
     * 菜单-删除
     *
     * @function
     */
    onMenuDelete,
    /**
     * 实体属性数据类型
     *
     * @type {Vue.computed<string>}
     */
    typeName,
    /**
     * 小数位数的校验错误信息
     *
     * @type {Vue.computed<string>}
     */
    scaleErrorMsg,
    /**
     * 属性的响应式数据
     *
     * @type {Vue.reactive<object>}
     * @property scale - 小数位数
     */
    model,
    /**
     * 小数位数的范围
     *
     * @type {Vue.computed<object>}
     * @property min - 最小值
     * @property max - 最大值
     */
    scaleOption,
    /**
     * 是否禁用小数位数
     *
     * @function
     * @param item - 行元素
     * @return boolean
     */
    decimalDisabled,
    /**
     * 修改小数位数
     *
     * @function
     */
    setScale,
    /**
     * 关联属性
     *
     * @type {Vue.ref<string>}
     */
    entityReference,
    /**
     * 类型列表
     *
     * @type {Vue.ref<array>}
     */
    dataTypeList,
    /**
     * 关联实体存在错误
     *
     * @function
     * @param node - 节点
     * @return boolean
     */
    isReleationEntityError,
    /**
     * 设置关联属性
     *
     * @function
     * @param event - event.value 表示实际数据
     */
    onSaveReference,
    /**
     * 清除关联属性
     *
     * @function
     */
    onClearReference,
    /**
     * 设置关联属性实体记录删除规则
     *
     * @function
     * @param event - 选中事件对象
     */
    setDeleteRule,
    /**
     * 设置错误信息
     *
     * @function
     * @param errorMsgs - 错误信息
     */
    changeErrorMsgs,
    /**
     * 是否来源于数据库表/excel
     *
     * @type {Vue.computed<boolean>}
     */
    isTableOrExcelOrigin,
    /**
     * 描述输入框失焦并保存数据
     *
     * @function
     * @param item - 当前行元素
     * @param name - 需要保存的描述
     */
    onBlurDescription,
    /**
     * 是否显示数据库高级设置
     *
     * 1.没有设置数据源
     * 2.实体是excel导入或者数据源反向导入
     * 3.权限实体（贤宇说一直是以LCAP开头来判断的）
     * 这3种情况不显示数据库设置
     *
     * @type {Vue.computed<boolean>}
     */
    showDatabasetype,
    /**
     * 实体在同步数据源时产生的错误信息
     *
     * @type {Vue.computed<array>}
     */
    sourceSyncErrMsgs,
    /**
     * 错误信息
     *
     * @type {Vue.computed<array>}
     */
    errorMsgs,
    /**
     * 数据库列名校验规则
     *
     * @type {Vue.computed<object>}
     */
    entityPropertyColumnNameRules,
    /**
     * 数据库列名输入框占位符
     *
     * @type {Vue.computed<string>}
     */
    entityPropertyColumnNamePlaceholder,
    /**
     * 生成名称校验规则
     *
     * @function
     * @param node - 节点
     * @return 名称校验规则
     */
    getEntityPropertyRules,
    /**
     * 名称输入框占位符
     *
     * @type {Vue.computed<string>}
     */
    entityPropertyPlaceholder,
    /**
     * 设置选中行的数据类型
     *
     * @function
     * @param value - 数据类型
     */
    setDataType,
  } = inject('$context');
</script>

<style module="$propertyDesigner">
  .errorMsg {
    color: var(--designer-font-second-color);
    margin: 0 46px;
  }

  .errorMsg + .errorMsg {
    margin-top: 10px;
  }

  .infoicon {
    display: inline-block;
    height: 12px;
    width: 12px;
    background: var(--assets-warning-info-svg) no-repeat;
    background-size: 100% 100%;
    vertical-align: -1px;
    margin-right: 5px;
  }
</style>

<style module>
  div.table [class^='u-input__']:focus,
  div.table [class^='u-input__'][focus],
  div.table [class^='u-input__']:hover,
  div.table [class^='u-select__']:focus,
  div.table [class^='u-select__'][focus],
  div.table [class^='u-select__'][opened],
  div.table [class^='u-select__']:hover {
    border-color: var(--entity-designer-table-input-focus-border-color);
    box-shadow: var(--entity-designer-table-input-focus-box-shadow);
  }

  .head {
    margin: 16px;
    padding: 16px;
    background: var(--entity-designer-panel-background-color);
    border: 1px solid var(--entity-designer-border-color);
  }

  div.head [class^='u-input__'] {
    height: 32px;
    line-height: 30px;
  }

  .body {
    margin: 16px;
    background: var(--entity-designer-panel-background-color);
    border: 1px solid var(--entity-designer-border-color);
    overflow: hidden;
  }

  .entityListIcon {
    width: 16px;
    height: 16px;
    display: inline-block;
    vertical-align: middle;
  }

  .edit {
    display: inline-block;
    width: 100%;
    line-height: 38px;
  }

  .edit:hover {
    cursor: pointer;
  }

  .edit:focus {
    outline: none;
  }

  .edit .text > span {
    color: var(--entity-designer-table-color);
  }

  .edit .text {
    display: inline-block;
    vertical-align: middle;
  }

  .editwrap {
    margin-left: -9px;
  }

  .editwrap [class^='s-datatype-select__'] {
    vertical-align: middle;
  }

  .text {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-break: break-all;
  }

  .textContent {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-break: break-all;
    max-width: calc(100% - 28px);
    margin-right: 8px;
  }
  .textContent:empty {
    display: none;
  }

  .text > span {
    display: inline-block;
    color: var(--entity-designer-table-disabled-color);
    vertical-align: middle;
  }

  .validator {
    width: 100%;
  }

  .btnnav {
    border-bottom: 1px solid var(--entity-designer-border-color);
    border-top: 1px solid var(--entity-designer-border-color);
    padding: 5px 24px;
  }

  div.btnnav[direction='horizontal'][gap='small'] > :not(:last-child) {
    margin-right: 8px;
  }

  .btnnav1 {
    border-top: none;
    background-color: var(--entity-designer-btnnav-background);
  }

  .bodywrap {
    padding: 16px 24px 0;
    overflow-x: auto;
    overflow-y: hidden;
    margin-bottom: 24px;
  }

  div.bodywrap [class^='u-grid-layout_column__'] {
    padding-bottom: 0;
  }

  .bodywrap1 {
    padding: 16px 24px;
    background-color: var(--entity-designer-body-background);
  }

  .advancedWrap {
    padding: 10px 24px 25px 24px;
    background-color: var(--entity-designer-body-background);
  }

  .entityfrom [class^='u-form_item_label__'] {
    width: 36px !important;
  }

  div.input {
    width: 100%;
    margin-right: 12px;
  }

  .iconBase {
    display: inline-block;
    width: 20px;
    height: 38px;
    line-height: 38px;
    text-align: center;
    font-size: var(--font-size-large);
    font-size: 14px;
  }

  .iconKey {
    color: var(--designer-table-edit-icon-key-color);
  }

  .iconLink {
    color: var(--designer-table-edit-icon-link-color);
  }

  .iconEdit {
    color: var(--color-base);
    opacity: 0;
  }

  .iconLink2 {
    display: inline-block;
    width: 16px;
    height: 16px;
    line-height: 16px;
    font-size: var(--font-size-huge);
    color: var(--brand-primary);
    cursor: pointer;
    position: relative;
    top: 2px;
    left: 4px;
  }

  .edit:hover .iconEdit {
    opacity: 0.6;
    cursor: pointer;
  }

  .edit:hover .iconEdit:hover {
    opacity: 1;
  }

  .icon {
    width: 14px;
    height: 14px;
    display: inline-block;
    vertical-align: middle;
    background-repeat: no-repeat;
  }

  div.normalfrom [class^='u-form_item_label__'] {
    width: 60px !important;
  }

  div.normalfrom > div {
    margin-bottom: 16px;
  }

  div.normalfrom [class^='u-input__'],
  div.normalfrom [class^='u-select__'],
  div.normalfrom [class^='u-form_item_field__'],
  div.normalfrom [class^='u-form_item_wrap__'] {
    width: 240px;
    max-width: 240px;
  }

  div.normalfrom [class^='u-input__'] {
    height: 32px;
    line-height: 30px;
  }

  div.reffrom [class^='u-form_item_label__'] {
    width: 94px !important;
  }

  div.reffrom [class^='u-input__'],
  div.reffrom [class^='u-tree-select__'],
  div.reffrom [class^='u-select__'],
  div.reffrom [class^='u-form_item_field__'],
  div.reffrom [class^='u-form_item_wrap__'] {
    width: 240px;
    max-width: 240px;
  }

  div.reffrom [class^='u-input__'] {
    height: 32px;
    line-height: 30px;
  }

  div.reffrom .text {
    opacity: 0.3;
  }

  div.reffrom [class^='u-form_item_extra__'] {
    width: 12px;
  }

  .flexgrid {
    display: flex;
  }

  .gridcolumn {
    width: auto;
  }

  .gridcolumn:not(:last-child) {
    margin-right: 24px;
  }

  div.fixedwidthinput,
  div.textarea {
    width: 240px;
    max-width: 240px;
  }

  .icondivider {
    color: var(--entity-designer-border-color);
  }

  .advanced {
    padding-top: 10px;
  }

  .scaleErrorMsg {
    position: absolute;
    color: rgb(242, 73, 87);
  }
  .typeError {
    border-radius: 4px;
    border: 1px solid var(--input-border-color-error);
  }
  .checkbox [class='el-checkbox__label'] {
    line-height: 23px;
    font-size: 12px;
    text-overflow: ellipsis;
    text-align: left;
    font-weight: 600;
    color: var(--el-table-header-text-color);
  }
  .checkbolabel [class='el-checkbox__label'] {
    line-height: 23px !important;
    font-size: 12px !important;
    text-overflow: ellipsis !important;
    text-align: left !important;
    font-weight: 600 !important;
    color: var(--el-table-header-text-color) !important;
  }
  .checkbox {
    height: 23px;
    line-height: 23px;
  }
</style>
<style module="$contextmenu">
  .menu {
    margin-top: 0 !important;
  }

  .menu .group [class^='el-menu-item-group__title'] {
    --el-menu-text-color: var(--el-menu-top-title-text-color);
    height: 32px;
    font-weight: bold;
    border-bottom: 1px solid var(--line-color-regular);
    background: var(--fill-color-thead);
    color: var(--el-menu-text-color);
    cursor: auto;
  }
</style>

<style scoped>
  .tableCell :deep(.cell) {
    padding: 0;
    line-height: 20px;
    padding-left: 6px;
  }
  .theadLable {
    overflow: visible;
    width: 100%;
    padding-left: 6px;
    border-right: 1px solid var(--entity-designer-property-dragger-border-color);
  }
  .topIconGroup {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    background-color: var(--entity-designer-icon-group-background-color);
    padding: 5px 24px;
    border-bottom: 1px solid var(--entity-designer-icon-group-border-color);
    position: sticky;
    z-index: 9;
    top: 64px;
  }

  .icon {
    margin-right: 8px;
  }

  .extraForm :deep(.el-form-item__label) {
    font-size: 12px;
  }

  :deep(.row-style) {
    border: 1px solid #4d87fe;
  }

  :deep(.cell-style) {
    border-bottom: 1px solid #409eff;
  }

  .elFormFlex {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
  }
</style>

<style scoped>
  .reflowPopover {
    width: 340px;
    padding: 8px;
  }

  .reflowPopoverEmpty {
    padding: 20px 0 30px;
  }

  .reflowPopoverItem {
    height: 48px;
    line-height: 48px;
    padding: 0 12px;
    border-radius: 4px;
    cursor: pointer;
    &:hover {
      background-color: #edf2f9;
    }
  }

  .warningIcon {
    margin-right: 4px;
  }

  .reflowDialogFooter {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* 居中对齐flex布局 */
  .centerFlex {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* 单行文本溢出省略号 */
  .sle,
  [sle] {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* tooltip触发器样式 */
  .tooltip-trigger {
    width: 100%;
    height: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
