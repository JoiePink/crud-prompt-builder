<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { Delete, Plus } from '@element-plus/icons-vue'

/** 与 list-page-pagination-query 中 TableParamsRow 一致，便于展示形式变更逻辑复用 */
interface TableParamsRow {
  paramEn: string
  paramZh: string
  showType: 'text' | 'image-preview' | 'dict-tag' | 'el-tag' | 'el-switch'
  iconName: string
  elTagTheme: '' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  dictName: string
  switchOnColor: string
  switchOffColor: string
  switchActiveValue: string
  switchActiveText: string
  switchInactiveValue: string
  switchInactiveText: string
}

interface ExpandRowDetailForm {
  isNeedElTable: '1' | '0'
  tableRowColumnCount: number
  tableData: TableParamsRow[]
  isNeedElDescriptions: '1' | '0'
  descriptionsRowColumnCount: number
  descriptionsData: TableParamsRow[]
}

const formRef = ref<FormInstance>()
const DEFAULT_TABLE_SHOW_TYPE: TableParamsRow['showType'] = 'text'

const form = ref<ExpandRowDetailForm>({
  isNeedElTable: '1', // 1 需要，0 不需要
  tableRowColumnCount: 4,
  tableData: [],
  isNeedElDescriptions: '1',
  descriptionsRowColumnCount: 4,
  descriptionsData: [],
})

const tableMoudleData = ref({
  showTypeOptions: [
    'text',
    'image-preview',
    'dict-tag',
    'el-tag',
    'el-switch',
  ] as TableParamsRow['showType'][],
  elTagThemeOptions: [
    { label: 'primary', value: 'primary' },
    { label: 'Success', value: 'success' },
    { label: 'Warning', value: 'warning' },
    { label: 'Danger', value: 'danger' },
    { label: 'Info', value: 'info' },
  ] as { label: string, value: TableParamsRow['elTagTheme'] }[],
})

function handleTableShowTypeChange(row: TableParamsRow) {
  if (row.showType === 'el-tag' && !row.elTagTheme) {
    row.elTagTheme = 'primary'
  }
  else {
    row.iconName = ''
    row.elTagTheme = ''
  }
  if (row.showType !== 'dict-tag') {
    row.dictName = ''
  }
  if (row.showType !== 'el-switch') {
    row.switchOnColor = ''
    row.switchOffColor = ''
    row.switchActiveValue = ''
    row.switchActiveText = ''
    row.switchInactiveValue = ''
    row.switchInactiveText = ''
  }
}

function addTableDataRow() {
  form.value.tableData.push({
    paramEn: '',
    paramZh: '',
    showType: DEFAULT_TABLE_SHOW_TYPE,
    iconName: '',
    elTagTheme: '',
    dictName: '',
    switchOnColor: '',
    switchOffColor: '',
    switchActiveValue: '',
    switchActiveText: '',
    switchInactiveValue: '',
    switchInactiveText: '',
  })
}

function handleDeleteTableDataRow(index: number) {
  form.value.tableData.splice(index, 1)
}

function addDescriptionsDataRow() {
  form.value.descriptionsData.push({
    paramEn: '',
    paramZh: '',
    showType: DEFAULT_TABLE_SHOW_TYPE,
    iconName: '',
    elTagTheme: '',
    dictName: '',
    switchOnColor: '',
    switchOffColor: '',
    switchActiveValue: '',
    switchActiveText: '',
    switchInactiveValue: '',
    switchInactiveText: '',
  })
}

function handleDeleteDescriptionsDataRow(index: number) {
  form.value.descriptionsData.splice(index, 1)
}

const rules = ref<FormRules<ExpandRowDetailForm>>({
  isNeedElTable: [
    {
      required: true,
      message: '请选择是否需要 el-table 组件',
      trigger: 'change',
    },
  ],
  tableRowColumnCount: [
    {
      required: true,
      message: '请填写表格每行分成几列',
      trigger: 'blur',
    },
    {
      type: 'number',
      min: 1,
      message: '列数至少为 1',
      trigger: 'change',
    },
  ],
  isNeedElDescriptions: [
    {
      required: true,
      message: '请选择是否需要 el-descriptions 组件',
      trigger: 'change',
    },
  ],
  descriptionsRowColumnCount: [
    {
      required: true,
      message: '请填写描述信息每行显示几列',
      trigger: 'blur',
    },
    {
      type: 'number',
      min: 1,
      message: '列数至少为 1',
      trigger: 'change',
    },
  ],
})

/** 与 list-page-pagination-query 中 buildTableParamsExport 一致：按 showType 省略无关与空值 */
function buildTableParamsExport(row: TableParamsRow): Record<string, unknown> {
  const base: Record<string, unknown> = {
    paramEn: row.paramEn,
    paramZh: row.paramZh,
    showType: row.showType,
  }

  const st = row.showType

  if (st === 'el-tag') {
    if (row.iconName.trim()) {
      base.iconName = row.iconName.trim()
    }
    if (row.elTagTheme && row.elTagTheme !== 'primary') {
      base.elTagTheme = row.elTagTheme
    }
  }

  if (st === 'dict-tag' && row.dictName.trim()) {
    base.dictName = row.dictName.trim()
  }

  if (st === 'el-switch') {
    if (row.switchOnColor.trim()) {
      base.switchOnColor = row.switchOnColor.trim()
    }
    if (row.switchOffColor.trim()) {
      base.switchOffColor = row.switchOffColor.trim()
    }
    if (row.switchActiveValue.trim()) {
      base.switchActiveValue = row.switchActiveValue.trim()
    }
    if (row.switchActiveText.trim()) {
      base.switchActiveText = row.switchActiveText.trim()
    }
    if (row.switchInactiveValue.trim()) {
      base.switchInactiveValue = row.switchInactiveValue.trim()
    }
    if (row.switchInactiveText.trim()) {
      base.switchInactiveText = row.switchInactiveText.trim()
    }
  }

  return base
}

/** 与 `05-expand-row-detail` SKILL 默认列数（4）及表单初始值一致；用于「相等则省略导出」 */
const DEFAULT_ROW_COLUMN_COUNT = 4

/** 导出：省略「需要」默认值与初始列数 2，表格/描述行按展示类型精简 */
function buildExpandRowDetailExport(): Record<string, unknown> {
  const f = form.value
  const payload: Record<string, unknown> = {}

  if (f.isNeedElTable === '0') {
    payload.isNeedElTable = '0'
  }
  else {
    if (f.tableRowColumnCount !== DEFAULT_ROW_COLUMN_COUNT) {
      payload.tableRowColumnCount = f.tableRowColumnCount
    }
    payload.tableData = f.tableData.map(buildTableParamsExport)
  }

  if (f.isNeedElDescriptions === '0') {
    payload.isNeedElDescriptions = '0'
  }
  else {
    if (f.descriptionsRowColumnCount !== DEFAULT_ROW_COLUMN_COUNT) {
      payload.descriptionsRowColumnCount = f.descriptionsRowColumnCount
    }
    payload.descriptionsData = f.descriptionsData.map(buildTableParamsExport)
  }

  return payload
}

defineExpose({
  getFormData: () => buildExpandRowDetailExport(),
  validate: () => formRef.value?.validate(),
})
</script>

<template>
  <div class="mt6">
    <div class="flex items-center justify-center gap-4">
      <div class="text-center text-2xl">
        02-expand-row-detail
      </div>
    </div>

    <div class="mt-4">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="140">
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="el-table" prop="isNeedElTable">
              <el-radio-group
                v-model="form.isNeedElTable"
                text-color="#fff"
                fill="#6c6cff"
              >
                <el-radio-button value="1">
                  需要
                </el-radio-button>
                <el-radio-button value="0">
                  不需要
                </el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col v-if="form.isNeedElTable === '1'" :span="12">
            <el-form-item label="列数" prop="tableRowColumnCount">
              <el-input-number
                v-model="form.tableRowColumnCount"
                :min="1"
                :max="24"
                :step="1"
                size="small"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="form.isNeedElTable === '1'" :gutter="10">
          <el-col :span="24">
            <el-form-item label="表格列参数设置" prop="tableData">
              <el-button type="primary" :icon="Plus" @click="addTableDataRow">
                新增
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="form.isNeedElTable === '1'">
          <el-col :span="24">
            <el-form-item label="" prop="tableData">
              <el-table
                :data="form.tableData"
                style="width: 100%"
                preserve-expanded-content
                default-expand-all
                border
              >
                <el-table-column type="expand">
                  <template #default="scopeRow">
                    <div class="p-3">
                      <el-row :gutter="12">
                        <!-- 与 list-page-pagination-query 一致的展示形式扩展配置 -->
                        <el-col
                          v-if="scopeRow.row.showType === 'el-tag'"
                          :span="24"
                        >
                          <div class="flex items-start gap-3">
                            <el-form-item
                              label="iconName"
                              label-width="110px"
                              class="mb-3 min-w-0 flex-1"
                            >
                              <el-input
                                v-model="scopeRow.row.iconName"
                                placeholder="请输入 iconName"
                                style="width: 100%"
                              />
                            </el-form-item>
                            <el-form-item
                              label="theme"
                              label-width="110px"
                              class="mb-3 min-w-0 flex-1"
                            >
                              <el-select
                                v-model="scopeRow.row.elTagTheme"
                                placeholder="请选择 theme"
                                style="width: 100%"
                              >
                                <el-option
                                  v-for="item in tableMoudleData.elTagThemeOptions"
                                  :key="item.value"
                                  :label="item.label"
                                  :value="item.value"
                                />
                              </el-select>
                            </el-form-item>
                          </div>
                        </el-col>

                        <el-col
                          v-if="scopeRow.row.showType === 'dict-tag'"
                          :span="24"
                        >
                          <el-form-item
                            label="关联字典"
                            label-width="110px"
                            class="mb-3"
                          >
                            <el-input
                              v-model="scopeRow.row.dictName"
                              placeholder="请输入关联字典"
                              style="width: 320px"
                            />
                          </el-form-item>
                        </el-col>

                        <template v-if="scopeRow.row.showType === 'el-switch'">
                          <el-col :span="12" class="mb-3">
                            <el-form-item
                              label="--el-switch-on-color"
                              label-width="170px"
                              class="mb-3"
                            >
                              <el-input
                                v-model="scopeRow.row.switchOnColor"
                                placeholder="请输入 --el-switch-on-color"
                              />
                            </el-form-item>
                          </el-col>
                          <el-col :span="12" class="mb-3">
                            <el-form-item
                              label="--el-switch-off-color"
                              label-width="170px"
                              class="mb-3"
                            >
                              <el-input
                                v-model="scopeRow.row.switchOffColor"
                                placeholder="请输入 --el-switch-off-color"
                              />
                            </el-form-item>
                          </el-col>
                          <el-col :span="12" class="mb-3">
                            <el-form-item
                              label="active-value"
                              label-width="170px"
                              class="mb-3"
                            >
                              <el-input
                                v-model="scopeRow.row.switchActiveValue"
                                placeholder="请输入 active-value"
                              />
                            </el-form-item>
                          </el-col>
                          <el-col :span="12" class="mb-3">
                            <el-form-item
                              label="active-text"
                              label-width="170px"
                              class="mb-3"
                            >
                              <el-input
                                v-model="scopeRow.row.switchActiveText"
                                placeholder="请输入 active-text"
                              />
                            </el-form-item>
                          </el-col>
                          <el-col :span="12" class="mb-3">
                            <el-form-item
                              label="inactive-value"
                              label-width="170px"
                              class="mb-3"
                            >
                              <el-input
                                v-model="scopeRow.row.switchInactiveValue"
                                placeholder="请输入 inactive-value"
                              />
                            </el-form-item>
                          </el-col>
                          <el-col :span="12" class="mb-3">
                            <el-form-item
                              label="inactive-text"
                              label-width="170px"
                              class="mb-3"
                            >
                              <el-input
                                v-model="scopeRow.row.switchInactiveText"
                                placeholder="请输入 inactive-text"
                              />
                            </el-form-item>
                          </el-col>
                        </template>
                      </el-row>
                    </div>
                  </template>
                </el-table-column>

                <el-table-column label="参数英文" prop="paramEn">
                  <template #default="scopeRow">
                    <el-input v-model="scopeRow.row.paramEn" />
                  </template>
                </el-table-column>
                <el-table-column label="参数中文" prop="paramZh">
                  <template #default="scopeRow">
                    <el-input v-model="scopeRow.row.paramZh" />
                  </template>
                </el-table-column>
                <el-table-column label="展示形式" prop="showType">
                  <template #default="scopeRow">
                    <el-select
                      v-model="scopeRow.row.showType"
                      @change="handleTableShowTypeChange(scopeRow.row)"
                    >
                      <el-option
                        v-for="item in tableMoudleData.showTypeOptions"
                        :key="item"
                        :label="item"
                        :value="item"
                      />
                    </el-select>
                  </template>
                </el-table-column>

                <el-table-column label="操作">
                  <template #default="scopeRow">
                    <el-tooltip content="删除行" placement="top">
                      <el-button
                        type="danger"
                        link
                        :icon="Delete"
                        @click="handleDeleteTableDataRow(scopeRow.$index)"
                      />
                    </el-tooltip>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="el-descriptions" prop="isNeedElDescriptions">
              <el-radio-group
                v-model="form.isNeedElDescriptions"
                text-color="#fff"
                fill="#6c6cff"
              >
                <el-radio-button value="1">
                  需要
                </el-radio-button>
                <el-radio-button value="0">
                  不需要
                </el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col v-if="form.isNeedElDescriptions === '1'" :span="12">
            <el-form-item label="列数" prop="descriptionsRowColumnCount">
              <el-input-number
                v-model="form.descriptionsRowColumnCount"
                :min="1"
                :max="24"
                :step="1"
                size="small"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="form.isNeedElDescriptions === '1'" :gutter="10">
          <el-col :span="24">
            <el-form-item label="描述列参数设置" prop="descriptionsData">
              <el-button type="primary" :icon="Plus" @click="addDescriptionsDataRow">
                新增
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="form.isNeedElDescriptions === '1'">
          <el-col :span="24">
            <el-form-item label="" prop="descriptionsData">
              <el-table
                :data="form.descriptionsData"
                style="width: 100%"
                preserve-expanded-content
                default-expand-all
                border
              >
                <el-table-column type="expand">
                  <template #default="scopeRow">
                    <div class="p-3">
                      <el-row :gutter="12">
                        <el-col
                          v-if="scopeRow.row.showType === 'el-tag'"
                          :span="24"
                        >
                          <div class="flex items-start gap-3">
                            <el-form-item
                              label="iconName"
                              label-width="110px"
                              class="mb-3 min-w-0 flex-1"
                            >
                              <el-input
                                v-model="scopeRow.row.iconName"
                                placeholder="请输入 iconName"
                                style="width: 100%"
                              />
                            </el-form-item>
                            <el-form-item
                              label="theme"
                              label-width="110px"
                              class="mb-3 min-w-0 flex-1"
                            >
                              <el-select
                                v-model="scopeRow.row.elTagTheme"
                                placeholder="请选择 theme"
                                style="width: 100%"
                              >
                                <el-option
                                  v-for="item in tableMoudleData.elTagThemeOptions"
                                  :key="item.value"
                                  :label="item.label"
                                  :value="item.value"
                                />
                              </el-select>
                            </el-form-item>
                          </div>
                        </el-col>

                        <el-col
                          v-if="scopeRow.row.showType === 'dict-tag'"
                          :span="24"
                        >
                          <el-form-item
                            label="关联字典"
                            label-width="110px"
                            class="mb-3"
                          >
                            <el-input
                              v-model="scopeRow.row.dictName"
                              placeholder="请输入关联字典"
                              style="width: 320px"
                            />
                          </el-form-item>
                        </el-col>

                        <template v-if="scopeRow.row.showType === 'el-switch'">
                          <el-col :span="12" class="mb-3">
                            <el-form-item
                              label="--el-switch-on-color"
                              label-width="170px"
                              class="mb-3"
                            >
                              <el-input
                                v-model="scopeRow.row.switchOnColor"
                                placeholder="请输入 --el-switch-on-color"
                              />
                            </el-form-item>
                          </el-col>
                          <el-col :span="12" class="mb-3">
                            <el-form-item
                              label="--el-switch-off-color"
                              label-width="170px"
                              class="mb-3"
                            >
                              <el-input
                                v-model="scopeRow.row.switchOffColor"
                                placeholder="请输入 --el-switch-off-color"
                              />
                            </el-form-item>
                          </el-col>
                          <el-col :span="12" class="mb-3">
                            <el-form-item
                              label="active-value"
                              label-width="170px"
                              class="mb-3"
                            >
                              <el-input
                                v-model="scopeRow.row.switchActiveValue"
                                placeholder="请输入 active-value"
                              />
                            </el-form-item>
                          </el-col>
                          <el-col :span="12" class="mb-3">
                            <el-form-item
                              label="active-text"
                              label-width="170px"
                              class="mb-3"
                            >
                              <el-input
                                v-model="scopeRow.row.switchActiveText"
                                placeholder="请输入 active-text"
                              />
                            </el-form-item>
                          </el-col>
                          <el-col :span="12" class="mb-3">
                            <el-form-item
                              label="inactive-value"
                              label-width="170px"
                              class="mb-3"
                            >
                              <el-input
                                v-model="scopeRow.row.switchInactiveValue"
                                placeholder="请输入 inactive-value"
                              />
                            </el-form-item>
                          </el-col>
                          <el-col :span="12" class="mb-3">
                            <el-form-item
                              label="inactive-text"
                              label-width="170px"
                              class="mb-3"
                            >
                              <el-input
                                v-model="scopeRow.row.switchInactiveText"
                                placeholder="请输入 inactive-text"
                              />
                            </el-form-item>
                          </el-col>
                        </template>
                      </el-row>
                    </div>
                  </template>
                </el-table-column>

                <el-table-column label="参数英文" prop="paramEn">
                  <template #default="scopeRow">
                    <el-input v-model="scopeRow.row.paramEn" />
                  </template>
                </el-table-column>
                <el-table-column label="参数中文" prop="paramZh">
                  <template #default="scopeRow">
                    <el-input v-model="scopeRow.row.paramZh" />
                  </template>
                </el-table-column>
                <el-table-column label="展示形式" prop="showType">
                  <template #default="scopeRow">
                    <el-select
                      v-model="scopeRow.row.showType"
                      @change="handleTableShowTypeChange(scopeRow.row)"
                    >
                      <el-option
                        v-for="item in tableMoudleData.showTypeOptions"
                        :key="item"
                        :label="item"
                        :value="item"
                      />
                    </el-select>
                  </template>
                </el-table-column>

                <el-table-column label="操作">
                  <template #default="scopeRow">
                    <el-tooltip content="删除行" placement="top">
                      <el-button
                        type="danger"
                        link
                        :icon="Delete"
                        @click="handleDeleteDescriptionsDataRow(scopeRow.$index)"
                      />
                    </el-tooltip>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>
