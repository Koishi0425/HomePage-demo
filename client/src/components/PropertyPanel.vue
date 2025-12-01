<template>
  <div class="property-panel">
    <h3>属性编辑</h3>
    <el-form label-position="top" v-if="component">
      
      <!-- Text Properties -->
      <template v-if="component.type === 'text'">
        <el-form-item label="内容">
          <el-input v-model="component.props.content" type="textarea" />
        </el-form-item>
        <el-form-item label="字号">
          <el-input-number v-model="component.props.fontSize" :min="12" :max="72" />
        </el-form-item>
        <el-form-item label="对齐">
          <el-radio-group v-model="component.props.textAlign">
            <el-radio-button label="left">左</el-radio-button>
            <el-radio-button label="center">中</el-radio-button>
            <el-radio-button label="right">右</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="component.props.color" />
        </el-form-item>
      </template>

      <!-- Image Properties -->
      <template v-if="component.type === 'image'">
        <el-form-item label="图片链接">
          <el-input v-model="component.props.src" />
        </el-form-item>
        <el-form-item label="宽度">
          <el-input v-model="component.props.width" placeholder="e.g. 100% or 300px" />
        </el-form-item>
        <el-form-item label="圆角">
          <el-slider v-model="component.props.borderRadius" :max="100" />
        </el-form-item>
      </template>

      <!-- Video Properties -->
      <template v-if="component.type === 'video'">
        <el-form-item label="视频链接">
          <el-input v-model="component.props.src" />
        </el-form-item>
        <el-form-item label="宽度">
          <el-input v-model="component.props.width" />
        </el-form-item>
      </template>

      <!-- Link Properties -->
      <template v-if="component.type === 'link'">
        <el-form-item label="链接地址">
          <el-input v-model="component.props.href" />
        </el-form-item>
        <el-form-item label="显示文本">
          <el-input v-model="component.props.text" />
        </el-form-item>
        <el-form-item label="字号">
          <el-input-number v-model="component.props.fontSize" />
        </el-form-item>
      </template>

      <!-- Divider Properties -->
      <template v-if="component.type === 'divider'">
        <el-form-item label="样式">
          <el-select v-model="component.props.borderStyle">
            <el-option label="实线" value="solid" />
            <el-option label="虚线" value="dashed" />
            <el-option label="点线" value="dotted" />
          </el-select>
        </el-form-item>
      </template>

    </el-form>
    <div v-else class="no-selection">
      请选择一个组件进行编辑
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  component: any;
}>();
</script>

<style scoped>
.property-panel {
  padding: 20px;
  background: #fff;
  height: 100%;
  border-left: 1px solid #dcdfe6;
}
.no-selection {
  color: #909399;
  text-align: center;
  margin-top: 50px;
}
</style>
