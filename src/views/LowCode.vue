<template>
    <div class="editor-container">
        <!-- 顶部导航 -->
        <header class="editor-header">
            <div class="logo">低代码组件演示</div>
            <div class="toolbar">
                <el-button type="primary" size="small">保存</el-button>
                <el-button size="small">预览</el-button>
                <el-button size="small">导入</el-button>
                <el-button size="small">导出</el-button>
            </div>
        </header>
        <div class="editor-main">
            <!-- 组件列表 -->
            <ComponentsPanel v-model:dragPreview="dragPreview" @updateDragPreview="updateDragPreview" />
            <!-- 中央画布 -->
            <Canvas v-model:dragPreview="dragPreview" @updateDragPreview="updateDragPreview" />
            <!-- 属性面板 -->
            <PropertiesPanel />
        </div>
    </div>
</template>

<script setup>
import { reactive } from 'vue';
import ComponentsPanel from '@/components/layout/ComponentsPanel.vue';
import Canvas from '@/components/layout/Canvas.vue';
import PropertiesPanel from '@/components/layout/PropertiesPanel.vue';
const dragPreview = reactive({
    show: false,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    type: '',
    name: '',
    icon: ''
});
const updateDragPreview = (data) => {
    Object.assign(dragPreview, data);
};
</script>
<style scoped>
.editor-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.editor-header {
    height: 60px;
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
}

.editor-main {
    flex: 1;
    display: flex;
    overflow: hidden;
}
</style>