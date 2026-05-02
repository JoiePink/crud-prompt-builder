<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import {
  CircleClose,
  Collection,
  Delete,
  Plus,
  Timer,
} from '@element-plus/icons-vue'

interface QueryParamsRow {
  paramEn: string
  paramZh: string
  queryType: string
  operateType: '' | '1' | '2' // '' 不需要，1 字典，2 时间
  dictName: string
  timeParamCount: 0 | 1 | 2 // 0 不需要，1 一个时间参数，2 两个时间参数
  timeParam1: string
  timeParam2: string
}

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

const formRef = ref<FormInstance>()

// Total:查询参数表单
const form = ref({
  queryParamsData: [] as QueryParamsRow[],
  tableParamsData: [] as TableParamsRow[],
  needExport: '1' as '1' | '0',
  needPagination: '1' as '1' | '0',
  /** Ruoyi v-hasPermi：列表/查询，如 system:goods:list */
  listPermi: '',
  /** 导出按钮，如 system:goods:export */
  exportPermi: '',
})

// Total:查询参数表单验证规则
const rules = ref({
  queryParamsData: [
    { required: true, message: '请选择查询参数', trigger: 'change' },
  ],
  tableParamsData: [
    { required: true, message: '请选择分页列表参数', trigger: 'change' },
  ],
})

// Part1: 查询参数模块数据
const queryMoudleData = ref({
  queryTypeOptions: [
    'el-input',
    'el-select',
    'el-date-picker',
  ] as QueryParamsRow['queryType'][],
})

// Part1: 新增查询参数行
function addQueryParamsRow() {
  form.value.queryParamsData.push({
    paramEn: '',
    paramZh: '',
    queryType: 'el-input',
    operateType: '',
    dictName: '',
    timeParamCount: 0,
    timeParam1: '',
    timeParam2: '',
  })
}

// Part1: 添加行关联字典
function handleAddDict(row: QueryParamsRow) {
  row.operateType = '1'
  row.timeParamCount = 0
  row.timeParam1 = ''
  row.timeParam2 = ''
}

// Part1: 添加行时间参数
function handleAddTimeParam(row: QueryParamsRow) {
  row.operateType = '2'
  row.dictName = ''
}

// Part1: 取消行操作
function handleCancelOperate(row: QueryParamsRow) {
  row.operateType = ''
  row.queryType = ''
  row.dictName = ''
  row.timeParamCount = 0
  row.timeParam1 = ''
  row.timeParam2 = ''
}

// Part1: 删除行数据
function handleDeleteRow(index: number) {
  form.value.queryParamsData.splice(index, 1)
}

// ================================================

// Part2: 分页列表参数模块数据
const DEFAULT_TABLE_SHOW_TYPE: TableParamsRow['showType'] = 'text'

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

// Part2: 新增分页列表参数行
function addTableParamsRow() {
  form.value.tableParamsData.push({
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

// Part2: 展示形式变更回调
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

// Part2: 删除分页列表参数行
function handleDeleteTableRow(index: number) {
  form.value.tableParamsData.splice(index, 1)
}

/** 导出查询参数行：去掉无关项与空值默认 */
function buildQueryParamsExport(row: QueryParamsRow): Record<string, unknown> {
  const base: Record<string, unknown> = {
    paramEn: row.paramEn,
    paramZh: row.paramZh,
    queryType: row.queryType,
  }

  if (row.operateType === '1') {
    base.operateType = '1'
    if (row.dictName.trim()) {
      base.dictName = row.dictName.trim()
    }
  }
  else if (row.operateType === '2') {
    base.operateType = '2'
    if (row.timeParamCount > 0) {
      base.timeParamCount = row.timeParamCount
    }
    if (row.timeParamCount >= 1 && row.timeParam1.trim()) {
      base.timeParam1 = row.timeParam1.trim()
    }
    if (row.timeParamCount === 2 && row.timeParam2.trim()) {
      base.timeParam2 = row.timeParam2.trim()
    }
  }

  return base
}

/** 导出表格列参数行：按 showType 只保留有意义字段，省略空串与默认 theme */
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

/** 对外导出：与 list-page-add-edit 一致，省略默认与无关字段 */
function getFormData(): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    queryParamsData: form.value.queryParamsData.map(buildQueryParamsExport),
    tableParamsData: form.value.tableParamsData.map(buildTableParamsExport),
  }

  if (form.value.needExport !== '1') {
    payload.needExport = form.value.needExport
  }
  if (form.value.needPagination !== '1') {
    payload.needPagination = form.value.needPagination
  }

  if (form.value.listPermi.trim()) {
    payload.listPermi = form.value.listPermi.trim()
  }
  if (form.value.exportPermi.trim()) {
    payload.exportPermi = form.value.exportPermi.trim()
  }

  return payload
}

defineExpose({
  getFormData,
  validate: () => formRef.value?.validate(),
})
</script>

<template>
  <div class="mt6">
    <div class="flex items-center justify-center gap-4">
      <div class="text-center text-2xl">
        01-list-page-pagination-query
      </div>
    </div>
    <div class="mt-4">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="150">
        <el-row :gutter="10">
          <el-col :span="24">
            <el-form-item label="查询参数设置" prop="queryParamsData">
              <el-button type="primary" :icon="Plus" @click="addQueryParamsRow">
                新增
              </el-button>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item>
              <el-table
                :data="form.queryParamsData"
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
                          v-if="scopeRow.row.operateType === '1'"
                          :span="24"
                        >
                          <el-form-item
                            label="关联字典名称"
                            label-width="110px"
                            class="mb-3"
                          >
                            <el-input
                              v-model="scopeRow.row.dictName"
                              placeholder="请输入关联字典名称"
                              style="width: 320px"
                            />
                          </el-form-item>
                        </el-col>

                        <el-col
                          v-if="scopeRow.row.operateType === '2'"
                          :span="24"
                        >
                          <el-form-item
                            label="时间参数设置"
                            label-width="110px"
                          >
                            <div class="flex items-center gap-3">
                              <el-radio-group
                                v-model="scopeRow.row.timeParamCount"
                              >
                                <el-radio-button :value="1">
                                  1个
                                </el-radio-button>
                                <el-radio-button :value="2">
                                  2个
                                </el-radio-button>
                              </el-radio-group>
                              <div
                                v-if="scopeRow.row.timeParamCount > 0"
                                class="flex items-center gap-3"
                              >
                                <el-input
                                  v-model="scopeRow.row.timeParam1"
                                  placeholder="请输入时间参数1"
                                  style="width: 220px"
                                />
                                <el-input
                                  v-if="scopeRow.row.timeParamCount === 2"
                                  v-model="scopeRow.row.timeParam2"
                                  placeholder="请输入时间参数2"
                                  style="width: 220px"
                                />
                              </div>
                            </div>
                          </el-form-item>
                        </el-col>
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

                <el-table-column label="查询形式" prop="queryType">
                  <template #default="scopeRow">
                    <el-select v-model="scopeRow.row.queryType">
                      <el-option
                        v-for="item in queryMoudleData.queryTypeOptions"
                        :key="item"
                        :label="item"
                        :value="item"
                      />
                    </el-select>
                  </template>
                </el-table-column>

                <el-table-column label="操作">
                  <template #default="scopeRow">
                    <div class="flex items-center justify-between">
                      <div>
                        <el-tooltip content="添加字典" placement="top">
                          <el-button
                            type="primary"
                            link
                            :icon="Collection"
                            @click="handleAddDict(scopeRow.row)"
                          />
                        </el-tooltip>
                        /
                        <el-tooltip content="添加时间参数" placement="top">
                          <el-button
                            type="primary"
                            link
                            :icon="Timer"
                            @click="handleAddTimeParam(scopeRow.row)"
                          />
                        </el-tooltip>
                        /
                        <el-tooltip content="取消操作" placement="top">
                          <el-button
                            type="warning"
                            link
                            :icon="CircleClose"
                            @click="handleCancelOperate(scopeRow.row)"
                          />
                        </el-tooltip>
                      </div>
                      <el-tooltip content="删除行" placement="top">
                        <el-button
                          type="danger"
                          link
                          :icon="Delete"
                          @click="handleDeleteRow(scopeRow.$index)"
                        />
                      </el-tooltip>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="分页列表参数设置" prop="tableParamsData">
              <el-button type="primary" :icon="Plus" @click="addTableParamsRow">
                新增
              </el-button>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item>
              <el-table
                :data="form.tableParamsData"
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
                    <div class="flex items-center justify-between">
                      <div>
                        <el-tooltip content="删除行" placement="top">
                          <el-button
                            type="danger"
                            link
                            :icon="Delete"
                            @click="handleDeleteTableRow(scopeRow.$index)"
                          />
                        </el-tooltip>
                      </div>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="列表查询权限字符" prop="listPermi">
              <el-input
                v-model="form.listPermi"
                clearable
                placeholder="如 system:goods:list，写入 v-hasPermi"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="导出权限字符" prop="exportPermi">
              <el-input
                v-model="form.exportPermi"
                clearable
                placeholder="如 system:goods:export；无导出可留空"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否需要导出" prop="needExport">
              <el-radio-group v-model="form.needExport">
                <el-radio-button value="1">
                  需要
                </el-radio-button>
                <el-radio-button value="0">
                  不需要
                </el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否需要分页" prop="needPagination">
              <el-radio-group v-model="form.needPagination">
                <el-radio-button value="1">
                  需要
                </el-radio-button>
                <el-radio-button value="0">
                  不需要
                </el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>
