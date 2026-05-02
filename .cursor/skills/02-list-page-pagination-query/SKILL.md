---
name: 标准列表页分页查询
description: 适用于 Ruoyi-Plus-Vue 标准列表页（搜索+表格+分页），统一命名、结构和分页查询流程。
---

# List Page Pagination Query

## 30 秒上手（最小骨架）

> 通用说明继承：`../_shared/SHARED_BLOCKS.md` 的 `S3`、`S4`、`S5`。  
> 本场景必填增量：权限字符、时间字段、导出接口参数（缺失时按 `S1` 先追问）。

```vue
<!-- 搜索区 -->
<el-form ref="queryFormRef" :model="queryParams" :inline="true">
  <el-form-item label="关键词" prop="keyword">
    <el-input v-model="queryParams.keyword" clearable @keyup.enter="handleQuery" />
  </el-form-item>
  <el-form-item>
    <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
    <el-button icon="Refresh" @click="resetQuery">重置</el-button>
  </el-form-item>
</el-form>

<!-- 工具栏 -->
<right-toolbar v-model:showSearch="showSearch" @queryTable="handleQuery" />

<!-- 表格 -->
<el-table v-loading="tableLoading" :data="tableList">
  <el-table-column label="ID" align="center" prop="id" />
  <el-table-column label="名称" align="center" prop="name" />
  <!-- TODO: 操作列按业务补充，并接入 v-hasPermi / checkPermi -->
</el-table>

<!-- 分页 -->
<pagination
  v-show="total > 0"
  :total="total"
  v-model:page="queryParams.pageNum"
  v-model:limit="queryParams.pageSize"
  @pagination="getList"
/>
```

```ts
const queryFormRef = ref<ElFormInstance>()
const showSearch = ref(true)
const tableLoading = ref(false)
const tableList = ref<any[]>([])
const total = ref(0)
const dateRange = ref<[string, string] | []>([])

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: undefined
})

const getList = async () => {
  tableLoading.value = true
  try {
    // TODO: 按用户提供的时间字段 key 注入（示例：beginTime/endTime）
    const params = proxy?.reconstructDateRange(queryParams, dateRange.value)
    const res = await listApi(params)
    tableList.value = res.rows ?? []
    total.value = res.total ?? 0
  } finally {
    tableLoading.value = false
  }
}

const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

const resetQuery = () => {
  queryFormRef.value?.resetFields()
  dateRange.value = []
  handleQuery()
}
```
## 适用场景

- 主列表页包含搜索区、表格区、分页区。

## 结构化配置里的 `queryParamsData` / `tableParamsData`（给 Agent 读本节）

> 说明：下面两个名字来自 **小工具 / 用户提供的 JSON 载荷**（例如 `curd-prompt-builder` 导出的 `payload`），**不是**若依页面运行时里必须保留的变量名。生成代码时应把它们**落实**为 SKILL 规定的 `queryParams`、`el-table-column` 等。

### `queryParamsData`（数组）

- **含义**：描述 **搜索区** 要渲染哪些条件、每个条件用什么查询控件。
- **映射到页面**：
  - `paramEn` → 写入 `queryParams` 的 **字段名**（camelCase，与后端列表接口查询参数一致）。
  - `paramZh` → `<el-form-item>` 的 **label**。
  - `queryType` → 控件类型（如 `el-input`、`el-select`、`el-date-picker`），按 Element Plus 生成对应表单项。
  - `operateType === '1'` → 该条件走 **字典**：用 `dictName`（字典类型编码）挂 `useDict` / `<dict-tag>` 数据源等约定（按项目既有写法）。
  - `operateType === '2'` → 该条件为 **时间范围**：用 `timeParamCount`、`timeParam1`、`timeParam2` 作为拆入 `queryParams` 的 **begin/end 字段名**；组装请求时必须走 `proxy?.reconstructDateRange`（或项目等价封装），勿手写重复拆分逻辑。
  - `operateType` 为空且无扩展 → 仅普通表单项，不把 `dictName`/时间键写入参数。
- **`needExport` / `needPagination`**（若出现在 JSON 顶层）：仅当取值为关闭语义时才会出现；分别表示是否生成导出、分页区域（默认开启时 JSON 里常省略）。
- **`listPermi` / `exportPermi`**（若出现在 JSON 顶层）：小工具导出、非空时对 **列表查询**与**导出**能力分别配置的 Ruoyi 权限字符串；映射到列表区/导出入口的 `v-hasPermi`（或项目等价封装）；未给出时仍按 SHARED_BLOCKS **`S1`** 追问。**获取详情 `:query`** 等与「修改弹窗回填」相关的权限不归本 Skill 表单字段导出，若在对话中需提供，应由用户口述或在其它步骤补齐。

### `tableParamsData`（数组）

- **含义**：描述 **表格每一列** 的业务字段与 **展示形态**（不等于接口返回字段以外的多余结构）。
- **映射到页面**：
  - `paramEn` → `el-table-column` 的 **prop**（对齐接口行数据字段）。
  - `paramZh` → 列 **label**。
  - `showType` → 列渲染方式：`text`（默认文本）、`image-preview`（图片缩略）、`dict-tag`（字典标签）、`el-tag`（自定义标签，可配 `iconName`、`elTagTheme`）、`el-switch`（开关展示，使用各 `switch*` 配色与 active/inactive 文案等）。
- 仅当某种 `showType` 需要时，才读取该行上的扩展字段；其余可忽略。

### 与页面固定命名的关系

- JSON 里的数组负责 **列清单与控件类型**；生成后的页面仍必须遵守上文 **命名速查**：搜索绑定对象叫 `queryParams`，列表数据叫 `tableList`，查询入口叫 `handleQuery`，拉数方法叫 `getList` 等。

## 命名速查（标准列表页）

- 搜索表单实例：`queryFormRef`
- 表格实例：`tableRef`
- 表格加载态：`tableLoading`（无历史包袱的新页面优先）
- 表格数据源：`tableList`（无历史包袱的新页面优先）
- 列表查询方法：`getList`
- 搜索方法：`handleQuery`
- 重置搜索方法：`resetQuery`
- 导出方法：`handleExport`
- 展开/折叠总控方法：`toggleExpand`
- 行展开事件方法：`handleExpandChange`
- 搜索显隐状态：`showSearch`
- 列表查询参数对象：`queryParams`
- 时间范围状态（单个）：`dateRange`

## 命名边界说明

### 作用域声明

- [MUST] 本节命名仅适用于“标准列表页”（同时具备搜索区、表格区、分页区）。
- [MUST] 非标准列表页（仅详情、仅弹窗、仅统计看板、无分页等）不强制使用本节命名。

### 搜索区域命名（仅标准列表页）

- [MUST] 搜索表单实例使用 `queryFormRef`。
- [MUST] 搜索参数对象使用 `queryParams`，且仅用于主列表搜索区域。
- [MUST] 搜索方法使用 `handleQuery`，重置方法使用 `resetQuery`。
- [MUST] 搜索显隐状态使用 `showSearch`。
- [SHOULD] 单一时间范围状态使用 `dateRange`；多时间范围按语义命名（如 `createTimeRange`、`payTimeRange`）。
- [SHOULD] 若页面存在弹窗内筛选、子表筛选，使用语义化命名：`dialogQueryParams`、`detailQueryParams`、`subTableQueryParams`。

### 表格与分页区域命名（仅标准列表页）

- [MUST] 表格实例使用 `tableRef`。
- [SHOULD] 新页面表格加载态使用 `tableLoading`，表格数据源使用 `tableList`。
- [MUST] 列表数据查询方法使用 `getList`。
- [MUST] `getList` 作为底层拉取方法；用户交互触发入口（搜索、重置、工具栏刷新）统一走 `handleQuery`。
- [SHOULD] 导出方法使用 `handleExport`。
- [SHOULD] 展开/折叠总控方法使用 `toggleExpand`，行展开事件方法使用 `handleExpandChange`。
- [MUST] 分页字段与后端约定保持 `pageNum`、`pageSize`、`total`。
- [MUST] `getList` 仅调用 `src/api` 中的接口封装，页面层禁止直接使用 `axios` / `fetch` 发请求。
- [SHOULD] 旧页面若已稳定使用 `loading`、`list`，可保持不改；新增页面统一采用上述标准命名。

## 页面结构约定

- [MUST] 搜索表单使用 `<el-form ref="queryFormRef" :model="queryParams" :inline="true" ...>`。
- [MUST] 搜索区按钮同时存在“搜索”和“重置”，分别绑定 `@click="handleQuery"` 与 `@click="resetQuery"`。
- [MUST] 同时具有搜索区和列表区时，定义 `const showSearch = ref(true)`。
- [MUST] 同时具有搜索区和列表区时，工具栏包含 `right-toolbar`，用于搜索区显隐与主动刷新。
- [SHOULD] 新页面统一使用 `<right-toolbar v-model:showSearch="showSearch" @queryTable="handleQuery" />`（推荐驼峰事件）。
- [SHOULD] 旧页面兼容写法 `<right-toolbar v-model:show-search="showSearch" @query-table="getList|handleQuery" />`，无需为统一写法做无关重构。
- [SHOULD] 工具栏常见三项动作保持稳定命名：`toggleExpand`、`handleExport`、`handleQuery`（`right-toolbar` 触发）；若页面无导出或无展开，可按业务裁剪。
- [SHOULD] 列表主体（表格 + 分页 + 工具栏）使用 `<el-card shadow="never">` 包裹。
- [SHOULD] 搜索 `el-form` 外层包裹 `<el-card shadow="hover">`。

## 搜索与查询流程

- [MUST] 搜索区内 `el-input` 带 `clearable`，并绑定 `@keyup.enter="handleQuery"`。
- [MUST] `handleQuery`：先重置页码 `queryParams.pageNum = 1`，再执行 `getList()`。
- [MUST] `resetQuery`：先执行 `queryFormRef.resetFields()`，若定义 `dateRange` 再清空，最后调用 `handleQuery()`。
- [SHOULD] 列表页内删除确认、执行结果提示等交互统一使用 `proxy.$modal` 封装（如 `confirm`、`msgSuccess`），不直接调用 `ElMessage` / `ElMessageBox`。

## 导出约定

- [SHOULD] 导出交互入口方法命名为 `handleExport`。
- [MUST] 导出与下载统一复用全局下载封装（`proxy.download` / `$download`），禁止在页面自行实现 `Blob + FileSaver`。
- [SHOULD] 导出前的二次确认沿用 `proxy.$modal.confirm`，确保页面提示风格一致。

## 时间范围与入参

- [SHOULD] 搜索区单一时间条件时，`el-date-picker` 使用 `daterange`，`value-format="YYYY-MM-DD"`，状态命名为 `dateRange`。
- [SHOULD] 搜索区存在多个时间条件时，每个时间范围按业务语义命名，不使用通用 `dateRange` 兜底命名（如 `createTimeRange`、`payTimeRange`、`refundTimeRange`）。
- [MUST] 时间范围参数统一通过 `proxy?.reconstructDateRange` 注入查询参数，不手写 begin/end 拆分逻辑。
- [MUST] 多时间范围场景需对每个时间条件分别调用 `reconstructDateRange`，并传入对应 `beginKey/endKey`（如 `createTimeBegin/createTimeEnd`、`payTimeBegin/payTimeEnd`）。

## 表格与分页约定

- [SHOULD] 普通字段列优先使用 `<el-table-column label="字段名" align="center" prop="field" />`。
- [SHOULD] 表格中图片回显统一使用 `image-preview` 组件（如 `<image-preview :src="scope.row.imageUrl" :width="50" :height="50" />`），其中 `:src` 字段按具体业务数据结构确定。
- [MUST] 若表格需要使用 `el-tag` 做特殊信息展示（如“总库存/锁定库存”），开发者需明确告知 AI：是否使用 `el-tag`；图标为可选项，可传入图标组件（例如 `Lock`），也可不使用图标。
- [MUST] 若表格需要使用 `el-switch` 做状态展示，开发者需明确告知 AI：是否使用 `el-switch`；可传入完整开关参数（如 `--el-switch-on-color`、`--el-switch-off-color`、`active-value`、`active-text`、`inactive-value`、`inactive-text`）。若用户未传，使用默认值：`--el-switch-on-color: #13ce66`、`--el-switch-off-color: #ff4949`、`active-value="0"`、`active-text="正常"`、`inactive-value="1"`、`inactive-text="停用"`。
- [SHOULD] 操作列定义使用 `fixed="right"` 与 `class-name="small-padding fixed-width"`。
- [MUST] 操作列按钮显隐需接入权限控制（如 `v-hasPermi` / `checkPermi`），并与接口权限前缀保持一致。
- [SHOULD] 可展开行场景推荐命名：`:default-expand-all="defaultExpandAll"` 与 `@expand-change="handleExpandChange"`。
- [MUST] 分页字段与后端约定保持 `pageNum`、`pageSize`，总数字段使用 `total`。
- [MUST] 分页组件使用：

```vue
<pagination
  v-show="total > 0"
  :total="total"
  v-model:page="queryParams.pageNum"
  v-model:limit="queryParams.pageSize"
  @pagination="getList"
/>
```

## 例外

- 纯详情页、统计看板或非分页场景，可不使用本 Skill 的 `getList` 命名与分页模板。
- 页面无搜索区但存在分页表格时，可仅复用 `getList + pagination` 相关约定。

## 提交前检查（继承通用约定）

- [MUST] 继承声明模板：`../_shared/SHARED_BLOCKS.md` 的 `S2`。

## 验收清单（5 条必测）

- [ ] 搜索回第一页：任意筛选后点击“搜索”会先执行 `queryParams.pageNum = 1`，再触发 `getList()`。
- [ ] 重置链路正确：点击“重置”会执行 `queryFormRef.resetFields()`，清空时间范围后再走 `handleQuery()`。
- [ ] 回车可查询：搜索输入框支持 `@keyup.enter="handleQuery"`，行为与点击“搜索”一致。
- [ ] 时间入参注入正确：查询参数通过 `proxy?.reconstructDateRange` 注入时间范围，不手写 begin/end 拆分。
- [ ] 分页联动正确：分页组件通过 `v-model:page`、`v-model:limit` 绑定 `queryParams`，并在 `@pagination` 触发 `getList()`。
