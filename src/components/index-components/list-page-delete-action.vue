<script setup lang="ts">
interface ListPageDeleteActionForm {
  /** Ruoyi：删除权限，如 system:goods:remove */
  removePermi: string
  /**
   * 行数据上作为删除入参的属性名；留空表示 `id`。
   * 例：列表行为 `row.productId` 时填 `productId`。
   */
  deleteRowIdField: string
}

const form = ref<ListPageDeleteActionForm>({
  removePermi: '',
  deleteRowIdField: '',
})

defineExpose({
  getFormData: () => {
    const payload: Record<string, unknown> = {}
    if (form.value.removePermi.trim()) {
      payload.removePermi = form.value.removePermi.trim()
    }
    if (form.value.deleteRowIdField.trim()) {
      payload.deleteRowIdField = form.value.deleteRowIdField.trim()
    }
    return payload
  },
  validate: async () => true,
})
</script>

<template>
  <div class="mt6">
    <div class="flex items-center justify-center gap-4">
      <div class="text-center text-2xl">
        list-page-delete-action
      </div>
    </div>
    <div class="mx-auto mt-4 max-w-xl">
      <el-form label-width="160">
        <el-form-item label="删除权限字符">
          <el-input
            v-model="form.removePermi"
            clearable
            placeholder="如 system:goods:remove"
          />
        </el-form-item>
        <el-form-item label="删除依据字段">
          <el-input
            v-model="form.deleteRowIdField"
            clearable
            placeholder="行数据主键属性，默认 id；如 productId"
          />
        </el-form-item>
      </el-form>
      <p class="text-sm text-gray-500">
        非空时在「生成数据」中并入
        <code class="rounded bg-gray-100 px-1 text-xs dark:bg-neutral-800">removePermi</code>
        、
        <code class="rounded bg-gray-100 px-1 text-xs dark:bg-neutral-800">deleteRowIdField</code>
        ，分别对照
        <code class="rounded bg-gray-100 px-1 text-xs dark:bg-neutral-800">v-hasPermi</code>
        与
        <code class="rounded bg-gray-100 px-1 text-xs dark:bg-neutral-800">handleDelete</code>
        中取参属性。
      </p>
    </div>
  </div>
</template>
