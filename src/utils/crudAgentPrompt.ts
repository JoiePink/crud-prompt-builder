/**
 * 根据当前选中的 Skill 与小工具导出的 payload，生成可粘贴到「带 .cursor/skills 的若依+EP 项目」里的单步 Agent 提示词。
 * 约定：查询 / 新增修改 / 展开行 分三次发送，不集中生成。
 *
 * 与各场景 SKILL 文件中 frontmatter 的 name 字段保持一致，便于在 Cursor 里 @ 技能。
 */

/** 入口 + 各场景 SKILL.md 的 `name:`，须与仓库 YAML 同步 */
const SKILL_ENTRY_NAME = '项目规范（入口）'
const SKILL_FILE_ENTRY = '.cursor/skills/01-project-conventions/SKILL.md'

function skillInvokeHint(skillPath: string, skillYamlName: string) {
  return [
    `- **文件**：\`${skillPath}\``,
    `- **技能名称（可 @）**：\`${skillYamlName}\``,
  ].join('\n')
}

export function buildCrudAgentPrompt(skillId: string, payload: Record<string, unknown>): string {
  const jsonBlock = JSON.stringify(payload, null, 2)

  const commonFooter = [
    '',
    '---',
    '## 路径与文件根目录',
    '- 以下为 JSON 顶层中的 `apiFileRoot`、`viewFileRoot`（若与目标仓库实际路径不一致，生成前请先与用户确认）。',
    '',
    '## 缺参与追问',
    '- 若 Skills 要求的关键信息（如权限字符 `v-hasPermi`、列表/详情/导出接口方法名、删除确认文案等）在 JSON 中未给出，请按 `.cursor/skills/_shared/SHARED_BLOCKS.md` 的 **S1** 先追问再生成代码，不要臆造。',
    '- **前提**：目标仓库需包含与本工具相同的 `.cursor/skills/` 布局；否则请先对齐 Skill 路径或改引用。',
    '',
    '## 附：本次结构化数据（完整 JSON）',
    '',
    '```json',
    jsonBlock,
    '```',
    '',
  ].join('\n')

  if (skillId === '02') {
    return [
      '# 【单步任务】标准列表页 — 搜索区 + 分页表格 +（按需）导出',
      '',
      '> **请勿在本对话中实现**：新增/修改弹窗、展开行详情、删除按钮逻辑；这些请用户在后续单独会话中携带对应 Skill 与数据完成。',
      '',
      '## 必须遵循的 Cursor Skills（请先加载再生成）',
      skillInvokeHint(SKILL_FILE_ENTRY, SKILL_ENTRY_NAME),
      skillInvokeHint('.cursor/skills/02-list-page-pagination-query/SKILL.md', '标准列表页分页查询'),
      '- 填空模板：`.cursor/skills/02-list-page-pagination-query/PROMPT_TEMPLATE.md`',
      '',
      '## 与本工具 JSON 的对应关系',
      '- `queryParamsData`：搜索区字段列表；`paramEn` / `paramZh` / `queryType`；若有 `operateType`：`1` 表示字典类扩展，`2` 表示时间参数扩展（含 `timeParamCount`、`timeParam1/2`）。',
      '- `tableParamsData`：表格列；`showType` 为展示形态（`text` / `image-preview` / `dict-tag` / `el-tag` / `el-switch`），展开配置仅在该类型下有意义。',
      '- `needExport` / `needPagination`：仅在 JSON 中出现时表示关闭导出或分页（默认Skills 侧按开启理解）。',
      '- `listPermi` / `exportPermi`：Ruoyi 列表（查询）接口、导出操作的权限字符串；仅非空时出现在 JSON。',
      '',
      commonFooter,
    ].join('\n')
  }

  if (skillId === '03') {
    return [
      '# 【单步任务】标准列表页 — 新增 / 修改共用弹窗（表单字段）',
      '',
      '> **请勿在本对话中实现**：列表搜索区、分页表格主体、展开行、删除；若列表页尚未就绪，请提示用户先完成「02-list-page-pagination-query」对应步骤。',
      '',
      '## 必须遵循的 Cursor Skills（请先加载再生成）',
      skillInvokeHint(SKILL_FILE_ENTRY, SKILL_ENTRY_NAME),
      skillInvokeHint('.cursor/skills/03-list-page-add-edit/SKILL.md', '标准列表页新增修改与权限控制'),
      '',
      '## 与本工具 JSON 的对应关系',
      '- `dialogFieldsData`：弹窗内字段；`paramEn` / `paramZh` / `fillFormKind`；其余键仅在对应控件类型下出现（如日期类的 `datePickerType`、`value-format` 等），请映射为 Element Plus 表单项及属性。',
      '- `addPermi` / `editPermi`：Ruoyi 新增、修改按钮的权限字符串；仅非空时出现在 JSON。',
      '- 权限字符以外的详情接口路径、表单校验细则若 JSON 未给出，按 Skills 执行 S1 追问。',
      '',
      commonFooter,
    ].join('\n')
  }

  if (skillId === '04') {
    return [
      '# 【单步任务】标准列表页 — 删除操作（行内删除）',
      '',
      '> **请勿在本对话中实现**：完整列表查询骨架、新增修改弹窗、展开行；仅聚焦删除按钮、`handleDelete`、权限与刷新列表。',
      '',
      '## 必须遵循的 Cursor Skills（请先加载再生成）',
      skillInvokeHint(SKILL_FILE_ENTRY, SKILL_ENTRY_NAME),
      skillInvokeHint('.cursor/skills/04-list-page-delete-action/SKILL.md', '标准列表页删除操作模板'),
      '',
      '## 与本工具 JSON 的对应关系',
      '- `removePermi`：Ruoyi 删除权限字符串；仅非空时出现在 JSON；用于 `el-button`、`handleDelete` 上的 `v-hasPermi`。若未导出则按 Skills S1 追问。',
      '- `deleteRowIdField`：`scope.row` 上作为单条删除入参的属性名（如 `productId`）；仅非空时出现在 JSON；生成 `handleDelete` 时从该行字段取值。未导出时默认按 `id`。',
      '- 其余请结合目标页面已有 `getList` / 操作列接入删除。',
      '',
      commonFooter,
    ].join('\n')
  }

  if (skillId === '05') {
    return [
      '# 【单步任务】标准列表页 — 行展开详情（二级表格 / 描述列表）',
      '',
      '> **请勿在本对话中实现**：完整搜索区与列表的首屏骨架（应已由 02 完成）、新增修改弹窗（03）、删除（04）；本步只做展开列及展开区内布局与展示。',
      '',
      '## 必须遵循的 Cursor Skills（请先加载再生成）',
      skillInvokeHint(SKILL_FILE_ENTRY, SKILL_ENTRY_NAME),
      skillInvokeHint('.cursor/skills/05-expand-row-detail/SKILL.md', '展开行详情规范'),
      '- 填空模板：`.cursor/skills/05-expand-row-detail/PROMPT_TEMPLATE.md`',
      '',
      '## 与本工具 JSON 的对应关系',
      '- `isNeedElTable` / `isNeedElDescriptions`：是否需要二级 `el-table` / `el-descriptions`（缺省表示需要该项）。',
      '- `tableRowColumnCount`：二级表格一行展示的列数思路（对应 Skill 中的 `detailTableColumns` 语义）；未导出时可按 Skill 默认。',
      '- `descriptionsRowColumnCount`：二级 `el-descriptions` 的 `:column`（对应 `detailDescColumns`）；未导出时可按 Skill 默认。',
      '- `tableData` / `descriptionsData`：两种展示形态下各自的字段与 `showType` 扩展，含义同列表主表的列展示规则。',
      '',
      commonFooter,
    ].join('\n')
  }

  return [
    '# 【通用】若依 + Element Plus CRUD 辅助数据',
    '',
    '当前未匹配到 02/03/04/05 专用模板；请将下方 JSON 与目标仓库 Skills 自行对齐。',
    '',
    commonFooter,
  ].join('\n')
}
