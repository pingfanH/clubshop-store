<template>
  <a-modal
    class="noborder"
    :title="title"
    :width="520"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :maskClosable="false"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-form-item label="手机号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input
            placeholder="请输入手机号"
            v-decorator="['mobile', { rules: [{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }] }]"
          />
        </a-form-item>
        <a-form-item label="昵称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input
            placeholder="请输入昵称 (可选)"
            v-decorator="['nick_name']"
          />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import * as Api from '@/api/user'

export default {
  data () {
    return {
      title: '新建用户',
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
      visible: false,
      confirmLoading: false,
      form: this.$form.createForm(this)
    }
  },
  methods: {
    add () {
      this.visible = true
      this.form.resetFields()
    },

    handleSubmit (e) {
      e.preventDefault()
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          this.confirmLoading = true
          Api.add({ form: values })
            .then(result => {
              this.$message.success(result.message, 1.5)
              this.visible = false
              this.$emit('handleSubmit')
            })
            .finally(() => {
              this.confirmLoading = false
            })
        }
      })
    },

    handleCancel () {
      this.visible = false
    }
  }
}
</script>
