---
name: 项目规范（入口）
description: 本仓库的入口 Skill。仅包含必须遵守的底线规范，并提供场景 Skill 导航。开发前先加载本 Skill，再按页面类型加载子 Skill。
---

# Project Conventions (Entry)

## 适用范围

- 当涉及新增功能、重构、修复缺陷、代码评审时，必须先遵守本入口规范。

## 规则等级说明

- `MUST`：必须遵守。除非有明确业务或技术阻塞，并在需求/备注中记录原因。
- `SHOULD`：默认遵守。若场景不适用可调整，但需说明例外条件与原因。
- `MAY`：可选建议。用于提升一致性与可维护性，不作为阻塞项。

## 冲突处理优先级

- 当规则冲突时，按以下优先级执行：`用户需求 > 入口 Skill > 场景 Skill`。
- 若用户需求与既有约定冲突，应先满足用户需求，并在提交说明中记录偏离原因。

## 术语规范

- 本文档统一使用“标准列表页”作为主术语，指包含搜索区、表格区、分页区的页面。
- “列表页”“分页列表”等表述视为“标准列表页”的同义词。

## 结构化 JSON 与各场景 Skill（给 Agent）

> 用户使用 **curd-prompt-builder** 等工具时，`payload` 里会出现固定键名。它们**不是**入口 Skill 定义的页面运行时变量，**含义与映射到 Vue 代码的方式**由各**场景 Skill** 的专节说明。**禁止**仅凭键名字面在入口臆测生成逻辑。

| 载荷中的键（常见） | 场景 Skill | 一句说明 |
| --- | --- | --- |
| `queryParamsData`、`tableParamsData`，及 `needExport`、`needPagination` | `02-list-page-pagination-query` | 搜索区条件 + 主表列展示形态 |
| `dialogFieldsData` | `03-list-page-add-edit` | 新增/修改弹窗内表单项与控件类型 |
| `removePermi`；可选 `deleteRowIdField`（行主键属性名，缺省 `id`） | `04-list-page-delete-action` | 其余如 `delApi`、确认文案等多靠读 `apiFileRoot` 或 **S1** 追问 |
| `tableData`、`descriptionsData`，及 `isNeedElTable`、`isNeedElDescriptions`、`tableRowColumnCount`、`descriptionsRowColumnCount` | `05-expand-row-detail` | 展开区内二级表格/描述列表的配置 |

请跳转阅读对应 SKILL 中带 **「结构化配置」**标题的小节获取逐字段释义。

## 框架依赖声明

- [MUST] 本套 Skill 约定基于 `Ruoyi-Plus-Vue + Vue 3 + TypeScript + Element Plus` 项目形态。
- [MUST] 默认依赖并优先复用以下既有封装：`@/utils/request`、`@/plugins/modal.ts`、`@/plugins/auth.ts`、`@/plugins/cache.ts`、`globalHeaders()`、`proxy.download/$download`、`proxy?.reconstructDateRange`。
- [MUST] 若目标仓库与上述框架/封装不一致，必须先确认“映射关系或替代方案”后再生成代码，禁止直接照搬导致不可运行实现。
- [SHOULD] 场景 Skill 中框架相关通用描述统一继承 `../_shared/SHARED_BLOCKS.md` 的 `S4`，避免重复维护。

## 开发底线约定

- [MUST] 新增接口统一放在 `src/api`，禁止在页面内直接散落请求逻辑。
- [MUST] 页面/组件禁止直接发 HTTP（`axios`/`fetch`），统一走 `src/api` + `@/utils/request` 封装链路。
- [MUST] 消息提示统一使用 `@/plugins/modal.ts` 的封装能力，不重复造提示方法。
- [MUST] 页面层禁止直接调用 `ElMessage` / `ElNotification` / `ElMessageBox`，统一走 `proxy.$modal` 封装。
- [MUST] 用户权限相关逻辑优先在 `@/plugins/auth.ts` 中查找是否已有封装方法；若已有则直接复用。
- [MUST] 会话级缓存与本地缓存统一使用 `@/plugins/cache.ts`，避免直接散落操作浏览器存储。
- [MUST] 优先复用 `src/plugins/index.ts` 已挂载到 `app.config.globalProperties` 的全局方法；仅在现有封装无法满足需求时再新增实现。
- [MUST] 涉及上传/下载鉴权头时，统一复用 `globalHeaders()`，禁止手写 `Authorization`/`clientid`。
- [MUST] 下载与导出统一走全局下载封装（`proxy.download` / `$download`），禁止页面自行 `Blob + FileSaver`。
- [MUST] 页面代码不得依赖 axios 原始响应结构，统一按拦截器后的业务对象（`code/data/rows/total`）处理。
- [MUST] 仅修改与需求相关文件，不顺手重构无关模块。
- [MUST] 保持现有代码风格与命名习惯一致。
- [SHOULD] 页面模板默认使用 `<div class="p-2">` 作为根容器以保持统一间距。
- [SHOULD] 公共能力优先沉淀到 `src/components` 或 `src/utils`，避免重复实现。

## 场景 Skill 导航

- 标准列表页骨架与查询流程：`../02-list-page-pagination-query/SKILL.md`
- 导出规范与模板：`../02-list-page-pagination-query/SKILL.md`（见“导出约定”章节）
- 新增/修改弹窗：`../03-list-page-add-edit/SKILL.md`
- 删除动作模板：`../04-list-page-delete-action/SKILL.md`
- 展开行明细：`../05-expand-row-detail/SKILL.md`

## CRUD 使用顺序（推荐）

- 查：先加载 `../02-list-page-pagination-query/SKILL.md`，完成搜索、分页、重置、时间范围注入与导出。
- 增改：再加载 `../03-list-page-add-edit/SKILL.md`，完成新增按钮、修改按钮、共用弹窗与提交分支。
- 删：最后加载 `../04-list-page-delete-action/SKILL.md`，完成行内删除、确认交互、成功提示与刷新。
- 展开明细（可选）：需要二级信息展示时再加载 `../05-expand-row-detail/SKILL.md`。

## Skill Router（触发词路由）

- 出现“列表页、搜索、分页、重置、查询参数、工具栏” -> 加载 `../02-list-page-pagination-query/SKILL.md`。
- 出现“导出、下载、Excel、文件名、导出参数” -> 加载 `../02-list-page-pagination-query/SKILL.md`。
- 出现“新增、添加、修改、编辑、弹窗表单、submitForm” -> 加载 `../03-list-page-add-edit/SKILL.md`。
- 出现“删除、handleDelete、remove、删除确认” -> 加载 `../04-list-page-delete-action/SKILL.md`。
- 出现“展开行” -> 加载 `../05-expand-row-detail/SKILL.md`。
- 出现“展开明细、二级表格、详情面板” -> 加载 `../05-expand-row-detail/SKILL.md`。
<!-- 、明细、二级表格、详情面板 -->

## 非功能边界（Do / Ask / Never）

- Do：读取与修改需求相关文件、运行 lint/类型检查、复用现有封装与公共组件。
- Ask：新增/删除依赖、删除文件、调整脚手架或构建配置、改动跨模块公共基建。
- Never：提交密钥或凭证文件（如 `.env`）、绕过权限封装、在无需求时修改无关模块。

## 目录约定（精简）

- `src/views`：页面级视图（业务开发主入口）
- `src/api`：接口请求封装（页面不可直连请求）
- `src/components`：可复用公共组件（优先复用，避免页面重复实现）
- `src/plugins`：全局方法与能力挂载（`modal/auth/cache/download/useDict` 等）
- `src/utils`：底层工具与请求基础能力（如 `request.ts`、`ruoyi.ts`）
- `src/router`：路由配置
- `src/store`：全局状态管理

## 提交前检查（通用）

- [ ] 已通过 `lint` / 类型检查，且无新增告警。
- [ ] 已按任务触发词加载对应场景 Skill，且未与入口约定冲突。
- [ ] 变更范围已核对：仅修改需求相关文件，无无关重构。
- [ ] 已优先复用现有封装（`modal/auth/cache/download/useDict/request`），无重复造轮子。
- [ ] 文档与配置变更已同步（如接口字段、页面约定、Skill 规则）。
