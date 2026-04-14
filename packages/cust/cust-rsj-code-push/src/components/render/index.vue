<template>
  <div :class="$style.pushButton" @click="onClick">
    <s-others-icon name="release" :class="$style.pushIcon" @click="onClick">
    </s-others-icon>
    <div :class="$style.pushButtonText">推送</div>
  </div>
  <el-dialog
    v-model="isActive"
    title="代码提交"
    width="500"
    append-to-body
    destroy-on-close
    @closed="onDialogClosed"
  >
    <el-form
      :class="$style.form"
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="80px"
    >
      <el-form-item label="应用" prop="appId">
        <el-select v-model="form.appId" placeholder="请选择">
          <el-option
            v-for="item in appList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="需求" prop="demandId">
        <el-select v-model="form.demandId" placeholder="请选择" clearable>
          <el-option
            v-for="item in demandList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div :class="$style.footer">
      <el-button type="primary" :loading="isSubmitting" @click="onSubmit"
        >推动GIT仓库</el-button
      >
    </div>
  </el-dialog>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";

// 获取应用名称
const appName =
  window.$data.app?.title ||
  window.$data.app?.name ||
  window.appData?.appId ||
  "";
const appId = window.$data.app?.id || "";

const appList = ref([
  {
    id: appId,
    name: appName,
  },
]);
const demandList = ref([]);
const DEFAULT_FORM = {
  appId: appId || "",
  demandId: "",
};
const form = ref({ ...DEFAULT_FORM });

const rules = ref({
  appId: [{ required: true, message: "请选择应用", trigger: "change" }],
  demandId: [{ required: true, message: "请选择需求", trigger: "change" }],
});
const formRef = ref(null);
const isActive = ref(false);
const isSubmitting = ref(false);
const API_BASE_URL = "http://git.gzrsj.rsj.com";
const API_ENDPOINTS = {
  demand: "/rest/getAppInfoById",
  push: "/rest/pushGit",
};

const resetFormState = () => {
  form.value = { ...DEFAULT_FORM };
  demandList.value = [];
};

const parsePushResult = (raw) => {
  if (typeof raw === "boolean") {
    return raw;
  }
  if (typeof raw === "string") {
    const value = raw.trim().toLowerCase();
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
  }
  return null;
};

const fetchDemandList = async () => {
  if (!appId) {
    demandList.value = [];
    form.value.demandId = "";
    return;
  }

  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.demand}?appId=${encodeURIComponent(appId)}`;
    const response = await fetch(url, { method: "POST" });
    if (!response.ok) {
      throw new Error(`加载需求列表失败: ${response.status}`);
    }

    const data = await response.json();
    const list = Array.isArray(data) ? data : [];
    demandList.value = list.map((item) => ({
      id: item.demandId,
      name: item.demandTitle || item.demandSubtitle || item.demandId,
    }));

    const hasCurrentDemand = demandList.value.some(
      (item) => item.id === form.value.demandId
    );
    if (!hasCurrentDemand) {
      form.value.demandId = "";
    }
  } catch (error) {
    console.error("获取需求列表失败", error);
    demandList.value = [];
    form.value.demandId = "";
  }
};

const onClick = () => {
  isActive.value = !isActive.value;
  if (isActive.value) {
    fetchDemandList();
  }
};

const onDialogClosed = () => {
  resetFormState();
};

const onSubmit = async () => {
  if (!formRef.value || isSubmitting.value) {
    return;
  }
  try {
    await formRef.value.validate();
    await pushGit();
  } catch (error) {
    // 表单未通过校验时不继续提交
  }
};

const pushGit = async () => {
  isSubmitting.value = true;
  try {
    const params = new URLSearchParams({
      appId: form.value.appId,
      workOrderIds: form.value.demandId,
    });
    const url = `${API_BASE_URL}${API_ENDPOINTS.push}?${params.toString()}`;
    const response = await fetch(url, { method: "POST" });
    if (!response.ok) {
      throw new Error(`推送失败: ${response.status}`);
    }

    const raw = await response.text();
    let result = parsePushResult(raw);
    if (result === null) {
      try {
        result = parsePushResult(JSON.parse(raw));
      } catch (error) {
        // 非 JSON 响应，沿用 text 解析结果
      }
    }

    if (result === true) {
      ElMessage.success("推送成功");
      isActive.value = false;
      return;
    }
    if (result === false) {
      ElMessage.error("推送失败：仓库地址或源码资源有空项，请检查配置");
      return;
    }
    ElMessage.warning("推送结果未知，请稍后查看日志");
  } catch (error) {
    console.error("推送仓库失败", error);
    ElMessage.error("推送失败，请稍后重试");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style module>
.pushButton {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--designer-navbar-tab-text-color);
  cursor: pointer;
  padding: 8px 0;
  transition: color 0.2s;
  gap: 2px;
}
.pushButton:hover {
  background-color: var(--designer-navbar-tab-background-hover);
}
.pushButtonText {
  font-weight: 500;
  line-height: 1;
}
.pushIcon {
  color: var(--designer-navbar-tab-icon-color);
  display: block;
  font-size: 18px;
  height: 18px;
  transition: color 0.2s;
}

.pushIcon svg {
  display: block;
}

.form {
  font-size: 14px;
  --el-form-label-font-size: 14px;
}
.form [class^="el-form-item__label"] {
  padding-right: 20px;
}
.form [class^="el-select__wrapper"] {
  font-size: 14px;
}

.footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 10px;
}
</style>
