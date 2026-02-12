<template>
    <aside class="components-panel">
        <h3>组件库</h3>
        <el-input v-model="componentFilter" placeholder="搜索组件..." size="small" class="component-search" />
        <div class="components-list">
            <div class="component-item" v-for="component in filteredComponents" draggable="true"
                @dragstart="handleDragStart($event, component)" @dragend="handleDragEnd($event, component)">
                <div class="component-icon">
                    <el-icon>
                        <component :is="component.icon" />
                    </el-icon>
                </div>
                <span class="component-name">{{ component.name }}</span>
            </div>
        </div>
    </aside>
</template>
<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue';
import { useEditorStore } from '@/stores/editor';
import {
    Document,
    PieChart,
    Grid,
    Box,
    Connection
} from '@element-plus/icons-vue';
const props = defineProps({
    dragPreview: {
        type: Object,
        required: true
    }
});
const emits = defineEmits(['updateDragPreview']);
const editorStore = useEditorStore();
const componentFilter = ref('');
// 过滤组件
const filteredComponents = computed(() => {
    if (!componentFilter.value) return editorStore.componentTypes;
    return editorStore.componentTypes.filter(c =>
        c.name.indexOf(componentFilter.value) !== -1
    );
});

// 拖拽开始
const handleDragStart = (event, component) => {
    // 设置拖拽数据
    event.dataTransfer.setData('componentType', component.type);
    event.dataTransfer.setData('defaultWidth', component.defaultSize.width);
    event.dataTransfer.setData('defaultHeight', component.defaultSize.height);
    // 设置拖拽效果
    event.dataTransfer.effectAllowed = 'copy';
    // 添加拖拽开始样式
    event.target.classList.add('dragging');
    editorStore.selectedComponent = null;
    editorStore.setDraggingComponent({
        type: component.type,
        width: component.defaultSize.width,
        height: component.defaultSize.height,
        name: component.name
    });
};

// 拖拽结束
const handleDragEnd = (event, component) => {
    event.target.classList.remove('dragging');
    editorStore.selectedComponent = null;
    editorStore.clearDraggingComponent();
    emits('updateDragPreview', { show: false });
};
</script>

<style scoped>
.components-panel {
    width: 280px;
    background: #fafafa;
    border-right: 1px solid #e8e8e8;
    padding: 20px;
    overflow-y: auto;
}

.component-search {
    margin-bottom: 12px;
    margin-top: 12px;
}

.components-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.component-item {
    display: flex;
    align-items: center;
    padding: 12px;
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 6px;
    cursor: move;
    transition: all 0.3s;
    user-select: none;
}

.component-item:hover {
    border-color: #409eff;
    background: #f0f9ff;
    transform: translateX(2px);
}

.component-item.dragging {
    opacity: 0.4;
    background: #e6f7ff;
    border-color: #91d5ff;
}

.component-icon {
    margin-right: 12px;
    font-size: 20px;
    color: #409eff;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
}

.component-name {
    font-size: 14px;
    color: #333;
}
</style>