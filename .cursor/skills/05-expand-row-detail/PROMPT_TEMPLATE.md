# 展开行详情（Expand Row Detail）AI 提示模板

> 用途：当页面需要“展开行”时，开发者用勾选 + 表格方式一次性传参，确保 AI 生成固定骨架与稳定交互。  
> 使用方式：复制整份模板，按实际业务填写后发给 AI。

---

## 1) 必须遵循的规范

- [x] `project-conventions`
- [x] `expand-row-detail`

---

## 2) 基本信息

| 项目 | 填写内容 |
| --- | --- |
| 业务名称 | 例如：订单列表管理 |
| 页面路径 | 例如：`src/views/order/orderList/index.vue` |
| 主表数据字段 | 例如：`orderList` |
| 展开详情字段 | 例如：`scope.row.orderProducts` |
| 仅修改范围 | 例如：仅修改当前页面 |

---

## 3) 展开行开关与骨架（必填）

| 项目 | 参数/写法 | 示例值 | 是否必填 | 说明 |
| --- | --- | --- | --- | --- |
| 启用展开行 | `enableExpand` | `true` | 是 | 明确告诉 AI 需要展开行 |
| 主表保留展开内容 | `preserve-expanded-content` | 启用 | 是 | `el-table` 必须加 |
| 默认展开状态 | `defaultExpandAllFlag` | `false` | 是 | 与总控按钮联动 |
| 行展开事件 | `handleExpandChange` | `handleExpandChange` | 是 | `@expand-change="handleExpandChange"` |
| 展开容器 | `<div style="padding: 10px 20px;">` | 启用 | 是 | 展开内容外层容器 |

---

## 4) 展开内容结构（可多选）

| 结构 | 是否启用 | 说明 |
| --- | --- | --- |
| 二级表格（`el-table`） | [ ] 是 [ ] 否 | 适合明细行数据 |
| 二级描述（`el-descriptions`） | [ ] 是 [ ] 否 | 适合 key-value 详情 |
| 二者组合 | [ ] 是 [ ] 否 | 可先表格后描述 |

---

## 5) 列数参数（分别控制）

| 项目 | 参数名 | 示例值 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| 二级表格列数 | `detailTableColumns` | `5` | `4` | 用于按列等分组织字段 |
| 二级描述列数 | `detailDescColumns` | `4` | `4` | 对应 `:column="detailDescColumns"` |

---

## 6) 展开行内字段显示模式（按需勾选）

| 显示模式 | 是否启用 | 需要补充的参数 |
| --- | --- | --- |
| 普通文字（text） | [ ] 是 [ ] 否 | 字段名/格式化规则 |
| 图片（image-preview） | [ ] 是 [ ] 否 | `src` 字段、宽高 |
| 标签（el-tag） | [ ] 是 [ ] 否 | 是否图标、图标名（可空）、样式 |
| 开关（el-switch） | [ ] 是 [ ] 否 | on/off 颜色、active/inactive 值与文案 |
| 自定义（custom） | [ ] 是 [ ] 否 | 插槽/渲染说明 |

### A. 图片回显（image-preview）

| 是否使用 | src 字段 | width | height | 备注 |
| --- | --- | --- | --- | --- |
| [ ] 是 [ ] 否 | 例如 `scope.row.imageUrl` | 50 | 50 | `src` 按业务字段确定 |

### B. el-tag 特殊展示

| 是否使用 el-tag | 主展示字段 | 是否带图标 | 图标名称（可空） | 样式说明 |
| --- | --- | --- | --- | --- |
| [ ] 是 [ ] 否 | 例如 `totalStock/lockStock` | [ ] 是 [ ] 否 | 例如 `Lock` | 例如主副 tag 配色 |

> 说明：图标可不传；不传时按纯文本 tag 展示。

### C. el-switch 状态展示

| 是否使用 el-switch | on-color | off-color | active-value | active-text | inactive-value | inactive-text |
| --- | --- | --- | --- | --- | --- | --- |
| [ ] 是 [ ] 否 |  |  |  |  |  |  |

> 如未填写，默认使用：  
> `--el-switch-on-color: #13ce66`、`--el-switch-off-color: #ff4949`、`active-value="0"`、`active-text="正常"`、`inactive-value="1"`、`inactive-text="停用"`。

---

## 7) 交互与方法约束

| 事项 | 固定要求 | 是否确认 |
| --- | --- | --- |
| 展开/折叠总控 | 保持 `defaultExpandAllFlag + toggleExpand` 写法 | [ ] |
| 总控实现 | 遍历 `tableRef.toggleRowExpansion(...)` | [ ] |
| 行展开事件方法 | `handleExpandChange` 仅处理展开事件 | [ ] |
| 仅改动范围 | 只改展开行相关代码 | [ ] |

---

## 8) 可直接发给 AI 的最终指令（示例）

```md
请按仓库技能规范实现展开行：
- 必须遵循：`project-conventions`、`expand-row-detail`

【基本信息】
- 页面：`src/views/order/orderList/index.vue`
- 主表数据字段：orderList
- 展开详情字段：scope.row.orderProducts

【展开行骨架】
- 启用展开行：是
- 主表必须加：`preserve-expanded-content`、`:default-expand-all="defaultExpandAllFlag"`、`@expand-change="handleExpandChange"`
- 展开容器：`<template #default="scope"><div style="padding: 10px 20px;">...</div></template>`

【展开结构】
- 二级表格：启用
- 二级 descriptions：启用
- 列数分别控制：`detailTableColumns=5`、`detailDescColumns=4`

【显示模式】
- text：启用
- image-preview：启用（src=scope.row.imageUrl, width=50, height=50）
- el-tag：启用（图标可空）
- el-switch：启用（未传参数走默认）

【强约束】
- `toggleExpand` 与 `defaultExpandAllFlag` 总控写法保持不变
- 只改与展开行相关代码
```

