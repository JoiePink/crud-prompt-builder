<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { Delete, Plus } from '@element-plus/icons-vue'

/** 下拉：精简后的常用填写控件（中文说明 + 组件名） */
const fillFormKindOptions = [
  { label: '输入框 el-input', value: 'el-input' },
  { label: '多行文本 el-input（textarea）', value: 'el-input-textarea' },
  { label: '数字输入 el-input-number', value: 'el-input-number' },
  { label: '下拉选择 el-select', value: 'el-select' },
  { label: '日期时间选择 el-date-picker', value: 'el-date-picker' },
  { label: '时间选择 el-time-picker', value: 'el-time-picker' },
  { label: '固定时间点 el-time-select', value: 'el-time-select' },
  { label: '开关 el-switch', value: 'el-switch' },
  { label: '滑块 el-slider', value: 'el-slider' },
  { label: '评分 el-rate', value: 'el-rate' },
  { label: '颜色选择 el-color-picker', value: 'el-color-picker' },
  { label: '单选组 el-radio-group', value: 'el-radio-group' },
  { label: '复选框 el-checkbox', value: 'el-checkbox' },
  { label: '复选框组 el-checkbox-group', value: 'el-checkbox-group' },
  { label: '上传 el-upload', value: 'el-upload' },
] as const

type DialogFillFormKind = (typeof fillFormKindOptions)[number]['value']

const datePickerTypeOptions = [
  { label: 'date', value: 'date' },
  { label: 'datetime', value: 'datetime' },
  { label: 'daterange', value: 'daterange' },
  { label: 'datetimerange', value: 'datetimerange' },
  { label: 'month', value: 'month' },
  { label: 'year', value: 'year' },
  { label: 'week', value: 'week' },
] as const

type DialogDatePickerType = (typeof datePickerTypeOptions)[number]['value']

const colorFormatOptions = [
  { label: 'hex', value: 'hex' },
  { label: 'rgb', value: 'rgb' },
  { label: 'hsl', value: 'hsl' },
] as const

type DialogColorFormat = (typeof colorFormatOptions)[number]['value']

const uploadListTypeOptions = [
  { label: 'text', value: 'text' },
  { label: 'picture', value: 'picture' },
  { label: 'picture-card', value: 'picture-card' },
] as const

type DialogUploadListType = (typeof uploadListTypeOptions)[number]['value']

interface DialogFieldRow {
  paramEn: string
  paramZh: string
  fillFormKind: DialogFillFormKind
  /** el-select / el-radio-group，关联字典，非必填 */
  dictName: string
  /** el-date-picker */
  datePickerType: DialogDatePickerType | ''
  dateValueFormat: string
  dateDisplayFormat: string
  dateRangeSeparator: string
  /** el-time-picker（参考 date-picker：模式 + format） */
  timePickerMode: 'single' | 'range'
  timeValueFormat: string
  timeDisplayFormat: string
  timeRangeSeparator: string
  /** el-time-select：start/end/step */
  timeSelectStart: string
  timeSelectEnd: string
  timeSelectStep: string
  /** el-slider */
  sliderShowInput: boolean
  /** el-rate */
  rateMax: number
  rateAllowHalf: boolean
  rateShowText: boolean
  /** 逗号分隔，对应各星级文案（可选） */
  rateTexts: string
  /** el-color-picker */
  colorShowAlpha: boolean
  colorFormat: DialogColorFormat | ''
  /** el-upload */
  uploadLimit: number
  uploadMultiple: boolean
  uploadListType: DialogUploadListType
}

interface ListPageAddEditForm {
  /** 新增按钮 */
  addPermi: string
  /** 修改按钮 */
  editPermi: string
  dialogFieldsData: DialogFieldRow[]
}

const formRef = ref<FormInstance>()
const DEFAULT_FILL_KIND: DialogFillFormKind = 'el-input'

function isDatePickerRangeType(t: string) {
  return t === 'daterange' || t === 'datetimerange'
}

function dialogFieldExtensionDefaults(): Omit<DialogFieldRow, 'paramEn' | 'paramZh' | 'fillFormKind'> {
  return {
    dictName: '',
    datePickerType: '',
    dateValueFormat: '',
    dateDisplayFormat: '',
    dateRangeSeparator: '',
    timePickerMode: 'single',
    timeValueFormat: '',
    timeDisplayFormat: '',
    timeRangeSeparator: '',
    timeSelectStart: '',
    timeSelectEnd: '',
    timeSelectStep: '',
    sliderShowInput: false,
    rateMax: 5,
    rateAllowHalf: false,
    rateShowText: false,
    rateTexts: '',
    colorShowAlpha: false,
    colorFormat: 'hex',
    uploadLimit: 0,
    uploadMultiple: false,
    uploadListType: 'text',
  }
}

function applyExtensionDefaults(row: DialogFieldRow) {
  Object.assign(row, dialogFieldExtensionDefaults())
}

function handleFillFormKindChange(row: DialogFieldRow) {
  applyExtensionDefaults(row)
}

const form = ref<ListPageAddEditForm>({
  addPermi: '',
  editPermi: '',
  dialogFieldsData: [],
})

function createDialogFieldRow(): DialogFieldRow {
  return {
    paramEn: '',
    paramZh: '',
    fillFormKind: DEFAULT_FILL_KIND,
    ...dialogFieldExtensionDefaults(),
  }
}

function addDialogFieldRow() {
  form.value.dialogFieldsData.push(createDialogFieldRow())
}

function handleDeleteDialogFieldRow(index: number) {
  form.value.dialogFieldsData.splice(index, 1)
}

const rules = ref<FormRules<ListPageAddEditForm>>({
  dialogFieldsData: [
    { required: true, message: '请至少配置一条弹窗字段', trigger: 'change' },
  ],
})

/** 生成导出对象：去掉与当前控件无关的字段，并省略空值 / 默认值，避免干扰阅读 */
function buildDialogFieldExport(row: DialogFieldRow): Record<string, unknown> {
  const base: Record<string, unknown> = {
    paramEn: row.paramEn,
    paramZh: row.paramZh,
    fillFormKind: row.fillFormKind,
  }

  const kind = row.fillFormKind

  if ((kind === 'el-select' || kind === 'el-radio-group') && row.dictName.trim()) {
    base.dictName = row.dictName.trim()
  }

  if (kind === 'el-date-picker') {
    if (row.datePickerType) {
      base.datePickerType = row.datePickerType
    }
    if (row.dateValueFormat.trim()) {
      base.dateValueFormat = row.dateValueFormat.trim()
    }
    if (row.dateDisplayFormat.trim()) {
      base.dateDisplayFormat = row.dateDisplayFormat.trim()
    }
    if (
      row.datePickerType
      && isDatePickerRangeType(row.datePickerType)
      && row.dateRangeSeparator.trim()
    ) {
      base.dateRangeSeparator = row.dateRangeSeparator.trim()
    }
  }

  if (kind === 'el-time-picker') {
    if (row.timePickerMode === 'range') {
      base.timePickerMode = 'range'
    }
    if (row.timeValueFormat.trim()) {
      base.timeValueFormat = row.timeValueFormat.trim()
    }
    if (row.timeDisplayFormat.trim()) {
      base.timeDisplayFormat = row.timeDisplayFormat.trim()
    }
    if (row.timePickerMode === 'range' && row.timeRangeSeparator.trim()) {
      base.timeRangeSeparator = row.timeRangeSeparator.trim()
    }
  }

  if (kind === 'el-time-select') {
    if (row.timeSelectStart.trim()) {
      base.timeSelectStart = row.timeSelectStart.trim()
    }
    if (row.timeSelectEnd.trim()) {
      base.timeSelectEnd = row.timeSelectEnd.trim()
    }
    if (row.timeSelectStep.trim()) {
      base.timeSelectStep = row.timeSelectStep.trim()
    }
  }

  if (kind === 'el-slider' && row.sliderShowInput) {
    base.sliderShowInput = true
  }

  if (kind === 'el-rate') {
    if (row.rateMax !== 5) {
      base.rateMax = row.rateMax
    }
    if (row.rateAllowHalf) {
      base.rateAllowHalf = true
    }
    if (row.rateShowText) {
      base.rateShowText = true
    }
    if (row.rateTexts.trim()) {
      base.rateTexts = row.rateTexts.trim()
    }
  }

  if (kind === 'el-color-picker') {
    if (row.colorShowAlpha) {
      base.colorShowAlpha = true
    }
    if (row.colorFormat && row.colorFormat !== 'hex') {
      base.colorFormat = row.colorFormat
    }
  }

  if (kind === 'el-upload') {
    if (row.uploadLimit > 0) {
      base.uploadLimit = row.uploadLimit
    }
    if (row.uploadMultiple) {
      base.uploadMultiple = true
    }
    if (row.uploadListType !== 'text') {
      base.uploadListType = row.uploadListType
    }
  }

  return base
}

defineExpose({
  getFormData: () => {
    const payload: Record<string, unknown> = {
      dialogFieldsData: form.value.dialogFieldsData.map(buildDialogFieldExport),
    }
    if (form.value.addPermi.trim()) {
      payload.addPermi = form.value.addPermi.trim()
    }
    if (form.value.editPermi.trim()) {
      payload.editPermi = form.value.editPermi.trim()
    }
    return payload
  },
  validate: () => formRef.value?.validate(),
})
</script>

<template>
  <div class="mt6">
    <div class="flex items-center justify-center gap-4">
      <div class="text-center text-2xl">
        list-page-add-edit
      </div>
    </div>

    <div class="mt-4">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="180">
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="新增权限字符" prop="addPermi">
              <el-input
                v-model="form.addPermi"
                clearable
                placeholder="如 system:goods:add"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="修改权限字符" prop="editPermi">
              <el-input
                v-model="form.editPermi"
                clearable
                placeholder="如 system:goods:edit"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="24">
            <el-form-item label="新增/修改弹窗字段配置" prop="dialogFieldsData">
              <el-button type="primary" :icon="Plus" @click="addDialogFieldRow">
                新增字段
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="" prop="dialogFieldsData">
              <el-table
                :data="form.dialogFieldsData"
                style="width: 100%"
                preserve-expanded-content
                default-expand-all
                border
              >
                <el-table-column type="expand">
                  <template #default="{ row }">
                    <div class="p-3">
                      <el-row :gutter="12">
                        <!-- el-select：关联字典（非必填） -->
                        <el-col v-if="row.fillFormKind === 'el-select'" :span="24">
                          <el-form-item label="关联字典" label-width="140px" class="mb-0">
                            <el-input
                              v-model="row.dictName"
                              placeholder="可选：字典编码或数据源标识"
                              style="max-width: 360px"
                            />
                          </el-form-item>
                        </el-col>

                        <!-- el-date-picker -->
                        <template v-if="row.fillFormKind === 'el-date-picker'">
                          <el-col :span="24" class="mb-3">
                            <el-form-item label="日期类型" label-width="140px" class="mb-0">
                              <el-select
                                v-model="row.datePickerType"
                                placeholder="选择 date-picker type"
                                clearable
                                style="width: 260px"
                              >
                                <el-option
                                  v-for="opt in datePickerTypeOptions"
                                  :key="opt.value"
                                  :label="opt.label"
                                  :value="opt.value"
                                />
                              </el-select>
                            </el-form-item>
                          </el-col>
                          <template v-if="row.datePickerType">
                            <template v-if="isDatePickerRangeType(row.datePickerType)">
                              <el-col :span="12" class="mb-3">
                                <el-form-item label="绑定值格式（value-format）" label-width="200px" class="mb-0">
                                  <el-input
                                    v-model="row.dateValueFormat"
                                    placeholder="填日期类格式串，对应 v-model；例：YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss（与后端字段一致即可）"
                                  />
                                </el-form-item>
                              </el-col>
                              <el-col :span="12" class="mb-3">
                                <el-form-item label="输入框展示格式（format）" label-width="200px" class="mb-0">
                                  <el-input
                                    v-model="row.dateDisplayFormat"
                                    placeholder="填展示用格式串，可与上项不同；例：YYYY年MM月DD日"
                                  />
                                </el-form-item>
                              </el-col>
                              <el-col :span="12" class="mb-3">
                                <el-form-item label="区间中间文案（range-separator）" label-width="200px" class="mb-0">
                                  <el-input
                                    v-model="row.dateRangeSeparator"
                                    placeholder="两个日期中间的连接字；例：至、～、—（不写则一般用组件默认）"
                                  />
                                </el-form-item>
                              </el-col>
                            </template>
                            <template v-else>
                              <el-col :span="12" class="mb-3">
                                <el-form-item label="绑定值格式（value-format）" label-width="200px" class="mb-0">
                                  <el-input
                                    v-model="row.dateValueFormat"
                                    placeholder="填日期类格式串，对应 v-model；例：YYYY-MM-DD（日期）、YYYY-MM（月）、YYYY（年）"
                                  />
                                </el-form-item>
                              </el-col>
                              <el-col :span="12" class="mb-3">
                                <el-form-item label="输入框展示格式（format）" label-width="200px" class="mb-0">
                                  <el-input
                                    v-model="row.dateDisplayFormat"
                                    placeholder="填展示用格式串；可与 value-format 不同；例：YYYY年MM月DD日"
                                  />
                                </el-form-item>
                              </el-col>
                            </template>
                          </template>
                        </template>

                        <!-- el-time-picker -->
                        <template v-if="row.fillFormKind === 'el-time-picker'">
                          <el-col :span="24" class="mb-3">
                            <el-form-item label="模式" label-width="140px" class="mb-0">
                              <el-radio-group v-model="row.timePickerMode">
                                <el-radio-button value="single">
                                  单个时间
                                </el-radio-button>
                                <el-radio-button value="range">
                                  时间区间
                                </el-radio-button>
                              </el-radio-group>
                            </el-form-item>
                          </el-col>
                          <el-col :span="12" class="mb-3">
                            <el-form-item label="绑定值格式（value-format）" label-width="200px" class="mb-0">
                              <el-input
                                v-model="row.timeValueFormat"
                                placeholder="填时间与 v-model 一致的格式串；例：HH:mm:ss 或 hh:mm:ss A（12 小时）"
                              />
                            </el-form-item>
                          </el-col>
                          <el-col :span="12" class="mb-3">
                            <el-form-item label="输入框展示格式（format）" label-width="200px" class="mb-0">
                              <el-input
                                v-model="row.timeDisplayFormat"
                                placeholder="填时间展示格式；可与 value-format 不同；例：HH时mm分ss秒"
                              />
                            </el-form-item>
                          </el-col>
                          <el-col v-if="row.timePickerMode === 'range'" :span="12" class="mb-3">
                            <el-form-item label="区间中间文案（range-separator）" label-width="200px" class="mb-0">
                              <el-input
                                v-model="row.timeRangeSeparator"
                                placeholder="时间区间两处时间中间的文案；例：至、～（不写则用组件默认）"
                              />
                            </el-form-item>
                          </el-col>
                        </template>

                        <!-- el-time-select -->
                        <template v-if="row.fillFormKind === 'el-time-select'">
                          <el-col :span="24" class="mb-2 text-sm text-gray-500">
                            start / end / step（对应 el-time-select 属性）
                          </el-col>
                          <el-col :span="8" class="mb-3">
                            <el-form-item label="start" label-width="140px" class="mb-0">
                              <el-input v-model="row.timeSelectStart" placeholder="如 09:00" />
                            </el-form-item>
                          </el-col>
                          <el-col :span="8" class="mb-3">
                            <el-form-item label="end" label-width="140px" class="mb-0">
                              <el-input v-model="row.timeSelectEnd" placeholder="如 18:00" />
                            </el-form-item>
                          </el-col>
                          <el-col :span="8" class="mb-3">
                            <el-form-item label="step" label-width="140px" class="mb-0">
                              <el-input v-model="row.timeSelectStep" placeholder="如 00:30" />
                            </el-form-item>
                          </el-col>
                        </template>

                        <!-- el-slider -->
                        <el-col v-if="row.fillFormKind === 'el-slider'" :span="24">
                          <el-form-item label="show-input" label-width="140px" class="mb-0">
                            <el-switch v-model="row.sliderShowInput" />
                          </el-form-item>
                        </el-col>

                        <!-- el-rate -->
                        <template v-if="row.fillFormKind === 'el-rate'">
                          <el-col :span="12" class="mb-3">
                            <el-form-item label="max（几颗星）" label-width="140px" class="mb-0">
                              <el-input-number v-model="row.rateMax" :min="1" :max="20" :step="1" />
                            </el-form-item>
                          </el-col>
                          <el-col :span="12" class="mb-3">
                            <el-form-item label="allow-half" label-width="140px" class="mb-0">
                              <el-switch v-model="row.rateAllowHalf" />
                            </el-form-item>
                          </el-col>
                          <el-col :span="12" class="mb-3">
                            <el-form-item label="show-text" label-width="140px" class="mb-0">
                              <el-switch v-model="row.rateShowText" />
                            </el-form-item>
                          </el-col>
                          <el-col :span="24" class="mb-3">
                            <el-form-item label="文案 texts" label-width="140px" class="mb-0">
                              <el-input
                                v-model="row.rateTexts"
                                placeholder="可选：逗号分隔，对应星级展示文案（与 max 一致）"
                              />
                            </el-form-item>
                          </el-col>
                        </template>

                        <!-- el-color-picker -->
                        <template v-if="row.fillFormKind === 'el-color-picker'">
                          <el-col :span="12" class="mb-3">
                            <el-form-item label="show-alpha" label-width="140px" class="mb-0">
                              <el-switch v-model="row.colorShowAlpha" />
                            </el-form-item>
                          </el-col>
                          <el-col :span="12" class="mb-3">
                            <el-form-item label="color-format" label-width="140px" class="mb-0">
                              <el-select v-model="row.colorFormat" style="width: 180px">
                                <el-option
                                  v-for="opt in colorFormatOptions"
                                  :key="opt.value"
                                  :label="opt.label"
                                  :value="opt.value"
                                />
                              </el-select>
                            </el-form-item>
                          </el-col>
                        </template>

                        <!-- el-radio-group -->
                        <el-col v-if="row.fillFormKind === 'el-radio-group'" :span="24">
                          <el-form-item label="关联字典" label-width="140px" class="mb-0">
                            <el-input
                              v-model="row.dictName"
                              placeholder="可选：字典编码或数据源标识"
                              style="max-width: 360px"
                            />
                          </el-form-item>
                        </el-col>

                        <!-- el-upload -->
                        <template v-if="row.fillFormKind === 'el-upload'">
                          <el-col :span="12" class="mb-3">
                            <el-form-item label="limit" label-width="140px" class="mb-0">
                              <el-input-number v-model="row.uploadLimit" :min="0" :max="999" :step="1" />
                              <span class="ml-2 text-xs text-gray-500">0 表示不限（生成时可按需忽略）</span>
                            </el-form-item>
                          </el-col>
                          <el-col :span="12" class="mb-3">
                            <el-form-item label="multiple" label-width="140px" class="mb-0">
                              <el-switch v-model="row.uploadMultiple" />
                            </el-form-item>
                          </el-col>
                          <el-col :span="24" class="mb-3">
                            <el-form-item label="list-type" label-width="140px" class="mb-0">
                              <el-radio-group v-model="row.uploadListType">
                                <el-radio-button
                                  v-for="opt in uploadListTypeOptions"
                                  :key="opt.value"
                                  :value="opt.value"
                                >
                                  {{ opt.label }}
                                </el-radio-button>
                              </el-radio-group>
                            </el-form-item>
                          </el-col>
                        </template>

                        <!-- 无额外配置 -->
                        <el-col
                          v-if="
                            [
                              'el-input',
                              'el-input-textarea',
                              'el-input-number',
                              'el-switch',
                              'el-checkbox',
                              'el-checkbox-group',
                            ].includes(row.fillFormKind)
                          "
                          :span="24"
                          class="text-sm text-gray-500"
                        >
                          当前控件无需额外配置（或使用表头 paramEn / paramZh 即可）。
                        </el-col>
                      </el-row>
                    </div>
                  </template>
                </el-table-column>

                <el-table-column label="参数英文" prop="paramEn" min-width="140">
                  <template #default="{ row }">
                    <el-input v-model="row.paramEn" placeholder="字段英文名 / prop" />
                  </template>
                </el-table-column>
                <el-table-column label="参数中文" prop="paramZh" min-width="140">
                  <template #default="{ row }">
                    <el-input v-model="row.paramZh" placeholder="表单项标签文案" />
                  </template>
                </el-table-column>
                <el-table-column label="填写形式" prop="fillFormKind" min-width="260">
                  <template #default="{ row }">
                    <el-select
                      v-model="row.fillFormKind"
                      placeholder="选择弹窗控件"
                      filterable
                      style="width: 100%"
                      @change="handleFillFormKindChange(row)"
                    >
                      <el-option
                        v-for="opt in fillFormKindOptions"
                        :key="opt.value"
                        :label="opt.label"
                        :value="opt.value"
                      />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="90" align="center">
                  <template #default="{ $index }">
                    <el-tooltip content="删除行" placement="top">
                      <el-button
                        type="danger"
                        link
                        :icon="Delete"
                        @click="handleDeleteDialogFieldRow($index)"
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
