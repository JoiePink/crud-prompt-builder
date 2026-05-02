---
name: 标准列表页新增修改与权限控制
description: 适用于 Ruoyi-Plus-Vue 标准列表页中的“新增/修改共用弹窗”场景，覆盖新增按钮、权限控制（如 v-hasPermi/checkPermi）与新增修改弹窗，统一结构、字段组织和交互流程。
---

# 标准列表页新增修改与权限控制

## 30 秒上手（最小骨架）

> 通用说明继承：`../_shared/SHARED_BLOCKS.md` 的 `S3`、`S4`、`S5`。  
> 本场景必填增量：新增/修改权限字符、字段转换规则（缺失时按 `S1` 先追问）。

```vue
<!-- 工具栏新增按钮 -->
<el-button
  type="primary"
  plain
  icon="Plus"
  @click="handleAdd"
  v-hasPermi="['请替换:add权限字符']"
>新增</el-button>

<!-- 新增/修改共用弹窗 -->
<el-dialog
  :title="dialog.title"
  @close="cancel"
  v-model="dialog.visible"
  width="900px"
  append-to-body
  destroy-on-close
>
  <el-form ref="operateFormRef" :model="form" :rules="rules" label-width="100">
    <!-- TODO: 按用户提供的字段规则补充表单项 -->
  </el-form>
  <template #footer>
    <el-button type="primary" :loading="buttonLoading" @click="submitForm">确 定</el-button>
    <el-button @click="cancel">取 消</el-button>
  </template>
</el-dialog>
```

```ts
const operateFormRef = ref<ElFormInstance>()
const buttonLoading = ref(false)
const dialog = reactive<any>({ visible: false, title: '' })
const addTitle = '添加信息'
const editTitle = '修改信息'

const initFormData = { id: undefined }
const data = reactive({
  form: { ...initFormData },
  queryParams: { pageNum: 1, pageSize: 10 },
  rules: {
    // TODO: 按业务补充 required/触发时机/复杂校验
  }
})
const { queryParams, form, rules } = toRefs(data)

const resetAddForm = () => {
  data.form = { ...initFormData }
}

const cancel = () => {
  resetAddForm()
  dialog.visible = false
}

const handleAdd = () => {
  resetAddForm()
  dialog.visible = true
  dialog.title = addTitle
}

const handleUpdate = async (row: any) => {
  resetAddForm()
  try {
    const res = await getDetail(row.id)
    const detailData = res.data
    // TODO: 按用户规则处理回显值（类型转换/映射）
    Object.assign(form.value, detailData)
    dialog.visible = true
    dialog.title = editTitle
  } catch (error) {
    dialog.visible = false
    proxy?.$modal.msgError('获取详情失败，请稍后重试')
  }
}

const submitForm = () => {
  operateFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return
    buttonLoading.value = true
    try {
      // TODO: 业务前置处理（如禁用字段只读值回填、子表清洗）
      form.value.id ? await updateApi(form.value) : await addApi(form.value)
      proxy?.$modal.msgSuccess('操作成功')
      dialog.visible = false
      getList()
    } finally {
      buttonLoading.value = false
    }
  })
}
```

## 结构化配置里的 `dialogFieldsData`（给 Agent 读本节）

> 以下键名来自 **小工具/用户提供的 JSON**，**不是**若依页面里必须保留的运行时数组名；生成后表单数据模型仍为本文 Skill 规定的 `form`、`initFormData`。

### `dialogFieldsData`（数组）

- **含义**：描述 **新增/修改共用弹窗** 中要出现哪些表单项，以及每项使用哪种 **Element Plus 表单控件** 及与该控件相关的可选属性。
- **映射到页面**：
  - `paramEn` → 写入 `initFormData`/`form` 的 **字段名**（camelCase，与后端新增/修改 DTO 一致）。
  - `paramZh` → `<el-form-item>` 的 **label**。
  - `fillFormKind` → 控件种类（例如 `el-input`、`el-input-textarea`、`el-select`、`el-date-picker`、`el-time-picker`、`el-switch`、`el-upload` 等）；若工具枚举与 EP 写法需转换（如 `el-input-textarea` → `<el-input type="textarea">`），按项目习惯实现。
  - JSON 中出现的 **扩展键**（如 `dictName`、`datePickerType`、`dateValueFormat`、`timePickerMode`、`uploadListType` 等）只对应当条记录所选控件有意义；出现时绑定到控件 props或业务封装；省略时沿用组件默认值，关键业务规则缺失按 **`S1` 追问**。
- **`apiFileRoot` / `viewFileRoot`**（若出现在顶层 JSON）：仅作接口文件与视图路径线索；**不参与**表单字段推导。
- **`addPermi` / `editPermi`**（若出现在顶层 JSON）：小工具可为 **新增** / **修改**按钮导出的 Ruoyi 权限字符串；出现时映射到工具栏新增、表格操作列修改的 `v-hasPermi`；未出现时按上文「新增按钮与权限字符」「修改按钮与权限字符」节 **`S1` 追问**。**获取详情 `:query`** 等为接口层权限：本 Skill **不依赖** JSON 中的独立 `query` 权限键；若需在 `handleUpdate` 的请求层体现，以用户口述或目标项目后端约定为准。

### 与本文固定约定的关系

- 不得因存在 `dialogFieldsData` 而改写 `handleAdd`、`handleUpdate`、`submitForm`、`resetAddForm`、`operateFormRef`、`dialog.visible` 等固定流程与方法命名；结构化数据仅用于 **生成 `el-form-item` 子树、`rules`、`initFormData` 形状**。

## 新增按钮与权限字符约定

- [MUST] 当用户提示“要新增”时，新增按钮应放在标准列表页工具栏按钮区（搜索区下方、表格上方），与页面已有操作按钮保持同级布局（如 `el-row`/`el-col` 内）。
- [MUST] 新增按钮使用 `@click="handleAdd"` 作为默认点击事件入口。
- [MUST] 新增按钮默认样式为 `type="primary" plain icon="Plus"`；若用户明确提供新的按钮样式参数，则以用户传入值覆盖默认值。
- [MUST] 用户必须提供“按钮权限字符”，并将其作为 `v-hasPermi` 的值（例如：`v-hasPermi="['forest:product:add']"`）。
- [MUST] 若用户未提供权限字符，先向用户索取后再生成按钮代码，不得擅自猜测权限值。
- [MUST] 该 Skill 默认新增与修改共用同一个弹窗（同一套 `el-dialog` + `el-form`），通过状态变量区分“新增/修改”模式。

## 修改按钮与权限字符约定

- [MUST] 修改按钮应放在表格“操作列”中（`el-table-column label="操作"` 的 `template #default` 内），与删除等行级操作同级。
- [SHOULD] 修改按钮外层默认使用 `<el-tooltip content="修改" placement="top">` 包裹，保持操作列交互提示一致。
- [MUST] 修改按钮点击事件使用 `@click="handleUpdate(scope.row)"` 作为默认入口。
- [MUST] 修改按钮默认样式为 `link type="primary" icon="Edit"`；若用户明确提供新的按钮样式参数，则以用户传入值覆盖默认值。
- [MUST] 用户必须提供“修改按钮权限字符”，并将其作为 `v-hasPermi` 的值（例如：`v-hasPermi="['forest:product:edit']"`）。
- [MUST] 若用户未提供修改按钮权限字符，先向用户索取后再生成按钮代码，不得擅自猜测权限值。

## 新增修改弹窗方法命名约定

- [MUST] 新页面中，新增/修改弹窗内用于清空表单的方法，统一命名为 `resetAddForm`。
- [MUST] 表单声明默认使用：`<el-form ref="operateFormRef" :model="form" :rules="rules" label-width="100">`。
- [MUST] 弹窗状态对象保持固定结构：`const dialog = reactive<any>({ visible: false, title: '' })`。
- [MUST] 取消方法保持固定流程：`const cancel = () => { resetAddForm(); dialog.visible = false; }`。
- [MUST] 弹窗底部按钮保持固定结构：确认按钮 `@click="submitForm"`，取消按钮 `@click="cancel"`。
- [MUST] `handleAdd` 固定三步：`resetAddForm()` -> `dialog.visible = true` -> `dialog.title = addTitle`。
- [MUST] `handleAdd` 的 `addTitle` 由用户传入，未传时默认 `"添加信息"`。
- [MUST] `handleUpdate` 固定流程：先 `resetAddForm()` -> 再根据主键 id 调用详情接口 -> 中间执行数据处理 -> `Object.assign(form.value, detailData)` -> `dialog.visible = true` -> `dialog.title = editTitle`。
- [MUST] `handleUpdate` 的 `editTitle` 由用户传入，未传时默认 `"修改信息"`。
- [MUST] `Object.assign(form.value, detailData)`、`dialog.visible = true`、`dialog.title = editTitle` 视为固定收尾步骤，不应改动顺序。
- [MUST] `handleUpdate` 中“中间数据处理”由用户自定义实现；若用户未提供处理规则，生成代码时必须保留 `TODO` 注释提醒用户补充（如字段类型转换、回显映射）。
- [MUST] 涉及“新增/修改”表单字段处理时，用户必须逐字段提供“组件类型 + 值转换规则”（含新增默认值、编辑回显值、提交值），不得默认猜测；`el-select/el-radio-group`、`el-input/el-input-number`、`image-upload` 仅作为基础示例。若为复杂业务组件（如级联选择、动态子表、组合字段、远程搜索等），必须按用户自定义规则实现新增初始化、编辑回显与提交转换，并预留二次开发点（`TODO`/可扩展方法）。
- [MUST] `handleUpdate` 调用详情接口时必须包含异常兜底：接口失败时不得打开弹窗（保持 `dialog.visible = false`），并统一给出错误提示（如 `proxy?.$modal.msgError('获取详情失败，请稍后重试')`）；仅在详情成功后才允许执行固定收尾步骤。
- [MUST] `submitForm` 默认固定流程：`operateFormRef.validate` -> `buttonLoading = true` ->（可选业务前置处理）-> `form.id ? update : add` -> 成功提示 -> 关闭弹窗 -> 刷新列表。
- [MUST] 编辑态存在禁用字段时，`submitForm` 提交前必须保留禁用字段并按只读值提交；不得仅依赖前端 `disabled` 而不做提交层处理，避免禁用字段被误改或误传。
- [MUST] `submitForm` 中除“业务前置处理块”外，其余流程与顺序保持固定。
- [MUST] 接口调用后的 `buttonLoading` 必须在 `finally` 中复位为 `false`，避免按钮卡住。
- [MUST] “业务前置处理块”由用户自定义（例如 `balanceFlag == 1` 时遍历 `skus` 并重置字段）；若用户未提供规则，生成代码时保留 `TODO` 注释提醒补充。

## 新增修改对话框风格与布局约定

- [MUST] 新增/修改“基本信息”对话框默认沿用以下风格：`<el-dialog :title="dialog.title" @close="cancel" v-model="dialog.visible" width="..." append-to-body destroy-on-close>`。
- [MUST] `width` 允许用户按页面复杂度自定义。
- [MUST] 除 `width` 外，其余关键属性保持不变：`:title="dialog.title"`、`@close="cancel"`、`v-model="dialog.visible"`、`append-to-body`、`destroy-on-close`。
- [SHOULD] 对话框内表单布局优先使用 `el-row + el-col + el-form-item` 组合，便于多列字段编排与响应式对齐。
- [MUST] 表单栅格参数 `gutter` 与 `span` 允许用户自定义。
- [SHOULD] 若用户未提供，默认使用 `el-row :gutter="10"` 与 `el-col :span="8"`（常见三列布局）。

## data / form / rules 固定骨架约定

- [MUST] `initFormData + data + toRefs` 的组织方式保持固定：先定义 `initFormData`，再在 `data` 中声明 `form: { ...initFormData }`、`queryParams`、`rules`，最后固定使用 `const { queryParams, form, rules } = toRefs(data)`。
- [MUST] `form: { ...initFormData }` 为固定写法；`form` 字段由用户按业务决定，但默认都应包含 `id` 字段（用于 `submitForm` 的新增/修改分支判断）。
- [MUST] `queryParams` 字段由用户按业务决定（保留分页字段与业务筛选字段），不在本 Skill 内写死。
- [MUST] `rules` 默认按“字段非空”策略生成（`required: true`），由用户再按业务调整触发时机、校验文案与复杂校验逻辑。
- [MUST] 需要支持“新增/编辑差异校验”约定：允许按 `form.id`（或显式 `isEdit` 状态）动态生成/切换校验规则；典型场景包括“仅新增必填”“编辑态不可修改字段（禁用或移除校验）”。若用户未提供差异规则，生成代码时必须保留 `TODO` 注释提醒补充。

## 提交前检查（继承通用约定）

- [MUST] 继承声明模板：`../_shared/SHARED_BLOCKS.md` 的 `S2`。

## 提交前检查（本场景增量）

- [ ] 新增与修改按钮权限字符已核对：`v-hasPermi` 与接口权限前缀一致，且新增/修改按钮均已配置。
- [ ] `handleUpdate` 已包含详情接口异常兜底：失败时不打开弹窗（`dialog.visible = false`）且使用 `proxy?.$modal.msgError(...)` 提示。
- [ ] 回显字段转换方案已核对：`el-select/el-radio-group`、`el-input-number`、`image-upload` 仅作为基础示例；遇到复杂业务组件（如级联选择、动态子表、组合字段、远程搜索等）必须按用户自定义规则实现回显与提交转换，并预留二次开发点（`TODO`/可扩展方法）。
- [ ] 编辑态禁用字段已按“保留禁用字段并按只读值提交”策略处理，未仅依赖前端 `disabled`。
- [ ] `submitForm` 的 `buttonLoading` 已在接口调用 `finally` 中复位，成功后可关闭弹窗并刷新列表。

## 验收清单（5 条必测）

- [ ] 新增成功：点击“新增”后可打开弹窗，提交走 `add` 分支，成功提示后关闭弹窗并刷新列表。
- [ ] 编辑成功：点击“修改”后可正确回显详情，提交走 `update` 分支，成功提示后关闭弹窗并刷新列表。
- [ ] 详情失败不弹窗：`handleUpdate` 详情接口异常时保持 `dialog.visible = false`，并出现错误提示。
- [ ] 禁用字段提交正确：编辑态禁用字段在提交前已按只读值保留并随请求提交，未丢失/未被误改。
- [ ] loading 复位：`submitForm` 无论成功或失败，`buttonLoading` 都会在 `finally` 中恢复为 `false`。

