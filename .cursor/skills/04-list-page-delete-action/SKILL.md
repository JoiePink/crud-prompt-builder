---
name: 标准列表页删除操作模板
description: 适用于 Ruoyi-Plus-Vue 标准列表页“删除按钮 + handleDelete”场景，统一删除入口、权限控制、确认交互与刷新流程。
---

# 标准列表页删除操作模板

## 30 秒上手（最小骨架）

> 通用说明继承：`../_shared/SHARED_BLOCKS.md` 的 `S3`、`S4`、`S5`。  
> 本场景必填增量：删除权限字符、删除接口方法名、删除文案（缺失时按 `S1` 先追问）。

```vue
<el-tooltip content="删除" placement="top">
  <el-button
    link
    type="primary"
    icon="Delete"
    @click="handleDelete(scope.row)"
    v-hasPermi="['请替换:remove权限字符']"
  />
</el-tooltip>
```

```ts
/** 删除按钮操作 */
const handleDelete = async (row?: any) => {
  /** 默认 `row?.id`；若结构化数据提供 `deleteRowIdField`，则改为 `row?.<该字段>` */
  const _id = row?.id
  if (!_id) {
    proxy?.$modal.msgError('缺少删除 id')
    return
  }
  await proxy?.$modal.confirm('是否确认删除该条数据？')
  await delApi(_id)
  proxy?.$modal.msgSuccess('删除成功')
  await getList()
}
```

## 适用场景

- 标准列表页（搜索区 + 表格区 + 分页区）的删除操作。
- 当前版本仅覆盖“行内单删”。

## 结构化配置与删除场景（给 Agent 读本节）

- **curd-prompt-builder** 等工具在「仅删除 Skill」步骤导出的 **`payload` 常为 `{}`、仅含 `removePermi` / `deleteRowIdField` 或仅含路径/技能号**，**不包含**“删除字段表”。因此：
  - **删除权限字符串**、`v-hasPermi` 值、`delApi` 方法名、确认框文案等，必须以用户口述、`apiFileRoot` 下的既有封装或 SHARED_BLOCKS **S1** 追问结果为准，不得从空 JSON 猜测。
- 若 `payload` 中含 `removePermi`，表示小工具已提供删除权限字符串，映射到删除按钮 `v-hasPermi`。
- 若 `payload` 中含 `deleteRowIdField`，表示删除入参取自 `row[deleteRowIdField]`（字符串须为合法属性标识）；生成代码时用该行给出的字面属性名（如 `row.productId`）。若未给出，默认 **`row.id`**。
- 若 `payload` 中含 `skillId`、`apiFileRoot`、`viewFileRoot`，只作「改哪个页面/接口文件」的定位线索；**不改变**本节规定的 `handleDelete` 调用顺序：`确认 -> 调用删除接口 -> 成功提示 -> 刷新列表`。

## 删除按钮与权限字符约定

- [MUST] 删除按钮放在操作列（`el-table-column label="操作"` 的 `template #default`）内，与修改等动作同级。
- [SHOULD] 删除按钮外层使用 `<el-tooltip content="删除" placement="top">`，保证交互提示一致。
- [MUST] 删除按钮点击事件使用 `@click="handleDelete(scope.row)"` 作为默认入口。
- [SHOULD] 删除按钮默认使用 `link type="primary" icon="Delete"`；若用户明确提供样式参数，以用户参数为准。
- [MUST] 用户必须提供删除权限字符，并配置到 `v-hasPermi`（例如：`v-hasPermi="['forest:product:remove']"`）。
- [MUST] 若用户未提供删除权限字符，先向用户索取后再生成代码，不得猜测权限值。

## handleDelete 固定流程约定

- [MUST] `handleDelete` 统一签名：`const handleDelete = async (row?: any) => { ... }`。
- [MUST] 删除 id 来源为当前行：若结构化数据含 `deleteRowIdField`，则 `_id = row?.[deleteRowIdField]`（生成的源码中为 `row?.xxx` 字面访问）；否则 **`const _id = row?.id`**。
- [MUST] 若 `_id` 为空，直接返回并提示参数缺失，不得调用删除接口。
- [MUST] 删除流程固定顺序：
  1. `proxy?.$modal.confirm(...)`
  2. `await delApi(_id)`
  3. `proxy?.$modal.msgSuccess(...)`
  4. `await getList()`
- [MUST] 删除确认与结果提示统一走 `proxy?.$modal` 封装，禁止直接使用 `ElMessageBox` / `ElMessage`。
- [MUST] `handleDelete` 仅调用 `src/api` 中的删除接口封装，页面层禁止直接 `axios` / `fetch`。
- [SHOULD] 删除确认文案由用户传入；未传时默认使用“是否确认删除该条数据？”。
- [SHOULD] 删除成功文案由用户传入；未传时默认使用“删除成功”。

## 异常与边界约定

- [MUST] 用户取消确认时视为正常中断，不提示“删除失败”，且不调用删除接口。
- [MUST] 删除接口异常时，不提示“删除成功”，且列表不应误刷新为成功态。
- [SHOULD] 删除失败提示统一使用 `proxy?.$modal.msgError(...)`；文案可按业务覆盖。
- [SHOULD] 若删除接口有并发防重需求，可按页面状态增加按钮禁用或 loading（由用户显式要求后实现）。

## 缺参提问模板（删除场景）

- [MUST] 通用缺参策略继承：`../_shared/SHARED_BLOCKS.md` 的 `S1`。
- [MUST] 若用户要求生成删除逻辑但关键参数缺失，先暂停生成并追问：
  1. 删除权限字符（`v-hasPermi` 值）。
  2. 删除接口方法名（如 `delProduct`）与入参格式（单 id）；若列表主键字段不是 `id`，应以 `deleteRowIdField` 或用户说明为准。
  3. 删除确认文案与删除成功文案。
- [MUST] 未提供上述信息时，不猜测权限值、接口名与入参结构。

## 提交前检查（继承通用约定）

- [MUST] 继承声明模板：`../_shared/SHARED_BLOCKS.md` 的 `S2`。

## 验收清单（5 条必测）

- [ ] 单条删除成功：点击行内删除后，确认 -> 调用删除接口 -> 成功提示 -> 刷新列表。
- [ ] 缺少 id 拦截：当行数据缺少 id 时会直接返回并提示，不调用删除接口。
- [ ] 取消确认不误删：在确认弹窗点击取消时，不调用删除接口且无成功提示。
- [ ] 删除失败不误提示：接口异常时出现错误提示，不出现“删除成功”，列表状态不被误更新。
- [ ] 权限显隐正确：删除按钮受 `v-hasPermi` 控制，无权限用户不可见。
