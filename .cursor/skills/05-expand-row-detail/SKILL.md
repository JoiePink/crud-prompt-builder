---
name: 展开行详情规范
description: 规范 el-table 展开行结构与总控交互，适用于订单明细等复杂信息展示。
---

# Expand Row Detail

## 30 秒上手（最小骨架）

> 通用说明继承：`../_shared/SHARED_BLOCKS.md` 的 `S3`、`S4`、`S5`。  
> 本场景必填增量：是否启用展开行、展开详情字段、展开结构（二级表格/描述/组合）、列数参数、字段显示模式（缺失时按 `S1` 先追问）。

## 适用场景

- 表格每行需要展示更多详情，且信息层级超过普通列承载能力时。

## 结构化配置里的展开区字段（给 Agent 读本节）

> 下列键名来自 **curd-prompt-builder** 等工具的 **`payload`**。落实代码时需同时满足上文 **骨架与命名**（如 `preserve-expanded-content`、`defaultExpandAllFlag`、`toggleExpand`、`handleExpandChange`），以及本节与 **`detailTableColumns`/`detailDescColumns`** 的对应关系。

### `isNeedElTable` / `isNeedElDescriptions`

- **`'0'`**：用户明确关掉该形态；生成展开内容时 **不要**再包含对应二级 **`el-table`** 或 **`el-descriptions`** 整块。
- **键不出现**或与 **`'1'`**：需要该形态（与工具默认值一致）。

### `tableRowColumnCount` / `descriptionsRowColumnCount`

- **`tableRowColumnCount`** → 对应本文中的 **`detailTableColumns`**（用于组织展开区内二级表格的列排版/栅格）。
- **`descriptionsRowColumnCount`** → 对应 **`detailDescColumns`**（赋给 `<el-descriptions :column="...">`）。
- JSON 省略列数时使用本文 **默认值建议**（如两类均为 4），除非业务另有说明。

### `tableData` / `descriptionsData`（数组）

- **`tableData`**：决定在展开区的 **二级 `el-table`** 中展示哪些列；每行结构与列表 Skill 里的 **`tableParamsData`** **语义对齐**：`paramEn`（明细行数据字段/prop）、`paramZh`（列标题）、`showType`（`text`/`image-preview`/`dict-tag`/`el-tag`/`el-switch`）及各类扩展字段（图标、字典名、开关颜色与文案等）。
- **`descriptionsData`**：决定在展开区的 **`el-descriptions`** 中展示哪些项；**单行字段含义与 `tableData` 同行的约定相同**，差别仅为最终渲染为 descriptions 条目而非表格列。
- **运行时数据源**：一般由 `scope.row` 下的某明细数组字段提供（如 `scope.row.orderItems`）；若用户 JSON 未说明该字段名，按 **`S1` 追问** 后再接线，严禁随意假定 prop。

## 规则

- [MUST] 当用户提示词明确“需要展开行”时，主表格 `el-table` 必须包含：`preserve-expanded-content`、`:default-expand-all="defaultExpandAllFlag"`、`@expand-change="handleExpandChange"`。
- [MUST] 展开列使用固定结构：`<el-table-column type="expand">` + `<template #default="scope">`。
- [MUST] 展开内容外层使用容器包裹（如 `padding`），保证视觉层级清晰。
- [SHOULD] 展开区内容可按业务选择 `el-table` 或 `el-descriptions`，也可在同一展开区内组合使用（例如先二级表格再描述信息），整体信息密度保持“按列数等分”思路。
- [MUST] 二级 `el-table` 与二级 `el-descriptions` 的列数参数分开控制，不共用同一个参数。
- [MUST] 二级 `el-table` 使用独立参数（例如 `detailTableColumns = 5`）控制列数等分；二级 `el-descriptions` 使用独立参数（例如 `detailDescColumns = 4`）控制 `:column`。
- [SHOULD] 未传入列数参数时，默认值分别为：`detailTableColumns = 4`、`detailDescColumns = 4`。
- [MUST] 展开区字段显示模式支持：普通文字（text）、`image-preview`、`el-tag`、`el-switch`、自定义插槽；参数填写方式遵循 `./PROMPT_TEMPLATE.md`。
- [SHOULD] 页面提供“展开/折叠”总控按钮，统一管理所有行展开状态。
- [MUST] 展开/折叠总控实现保持稳定：`defaultExpandAllFlag` + `toggleExpand` 遍历 `tableRef.toggleRowExpansion(...)` 的写法不变；`handleExpandChange` 仅做行展开事件处理。

## 推荐结构

```html
<el-table
  ref="tableRef"
  :data="tableList"
  preserve-expanded-content
  :default-expand-all="defaultExpandAllFlag"
  @expand-change="handleExpandChange"
>
<el-table-column type="expand">
  <template #default="scope">
    <div style="padding: 10px 20px;">
      <!-- 方案A：仅二级表格（按 detailTableColumns 等分） -->
      <!-- 方案B：仅描述列表（:column="detailDescColumns"） -->
      <!-- 方案C：二级表格 + 描述列表（允许在展开区侵入一个二级表格） -->
      <!-- 字段显示模式：text / image-preview / el-tag / el-switch / custom -->
      <!-- 假设 detailTableColumns = 5，则可视宽度按五份分配 -->
      <el-table :data="scope.row.detailList">
        <el-table-column label="字段A" prop="fieldA" />
        <el-table-column label="字段B" prop="fieldB" />
        <el-table-column label="字段C" prop="fieldC" />
        <el-table-column label="字段D" prop="fieldD" />
        <el-table-column label="字段E" prop="fieldE" />
      </el-table>
      <el-descriptions :column="detailDescColumns" label-width="120">
        <el-descriptions-item label="字段A">...</el-descriptions-item>
        <el-descriptions-item label="字段B">...</el-descriptions-item>
        <el-descriptions-item label="字段C">...</el-descriptions-item>
        <el-descriptions-item label="字段D">...</el-descriptions-item>
        <el-descriptions-item label="字段E">...</el-descriptions-item>
      </el-descriptions>
    </div>
  </template>
</el-table-column>
</el-table>
```

## 例外

- 表格不存在扩展信息时，不要求提供展开列与总控按钮。
- 当字段信息极少（少于 4 项）或受移动端布局限制时，可不强制“四列等分”，但需保持页面内风格一致。

## 缺参提问模板（展开行场景）

- [MUST] 通用缺参策略继承：`../_shared/SHARED_BLOCKS.md` 的 `S1`。
- [MUST] 若用户要求生成展开行逻辑但关键参数缺失，先暂停生成并追问：
  1. 是否启用展开行，以及展开详情字段（如 `scope.row.detailList`）。
  2. 展开结构选择：二级表格 / 二级描述 / 二者组合。
  3. 列数参数：`detailTableColumns` 与 `detailDescColumns`（可使用默认值）。
  4. 字段显示模式与关键参数：`text/image-preview/el-tag/el-switch/custom`。

## 提交前检查（继承通用约定）

- [MUST] 继承声明模板：`../_shared/SHARED_BLOCKS.md` 的 `S2`。
