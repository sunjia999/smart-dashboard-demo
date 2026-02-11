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
            <!-- 中央画布 -->
            <main class="canvas-area">
                <div class="canvas-wrapper">
                    <!-- 拖拽区域 -->
                    <div class="drop-zone" ref="dropZone" @dragover.prevent="onDragOver" @drop="onDrop">
                        <div class="empty-tip" v-if="editorStore.components.length === 0">
                            <el-empty description="从左侧拖拽组件到此处开始创作" :image-size="120">
                                <template #image>
                                    <el-icon :size="120" color="#c0c4cc">
                                        <Upload />
                                    </el-icon>
                                </template>
                            </el-empty>
                        </div>

                        <div v-for="component in editorStore.components" :key="component.id" class="canvas-component"
                            :class="{ selected: editorStore.selectedComponent === component.id }" :style="{
                                position: 'absolute',
                                left: component.position.x + 'px',
                                top: component.position.y + 'px',
                                width: component.size.width + 'px',
                                height: component.size.height + 'px'
                            }" @click="selectComponent(component.id)">
                            <component :is="getComponentByName(component.type)" v-bind="component.props"
                                :id="component.id" @select="selectComponent(component.id)" />
                        </div>
                    </div>
                </div>
            </main>
            <!-- 属性面板 -->
            <aside class="properties-panel">
                <h3>属性配置</h3>
                <div class="properties-form">
                    <!-- 动态属性表单将在这里渲染 -->
                </div>
            </aside>
        </div>

    </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useEditorStore } from '@/stores/editor';
import {
    Document,
    PieChart,
    Grid,
    Box,
    Connection,
    Upload
} from '@element-plus/icons-vue';
import TextComponent from '@/components/common/Text.vue';

const editorStore = useEditorStore();
const components = ref([]);
const dropZone = ref(null);
const componentFilter = ref('');
// 组件映射
const componentMap = {
    text: TextComponent,
    // chart: ChartComponent,
    // table: TableComponent,
    // three: ThreeScene,
    // realtime: RealtimeData
};
const getComponentByName = (type) => {
    return componentMap[type] || TextComponent;
};
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
    // event.dataTransfer.setData('defaultWidth', component.defaultSize.width);
    // event.dataTransfer.setData('defaultHeight', component.defaultSize.height);

    // 设置拖拽效果
    event.dataTransfer.effectAllowed = 'copy';

    // 设置拖拽预览图像（可选）
    const dragImage = event.target.cloneNode(true);
    dragImage.style.position = 'absolute';
    dragImage.style.left = '-1000px';
    dragImage.style.opacity = '0.5';
    document.body.appendChild(dragImage);
    event.dataTransfer.setDragImage(dragImage, 10, 10);

    // 延迟移除预览图像
    setTimeout(() => {
        document.body.removeChild(dragImage);
    }, 0);

    // 添加拖拽开始样式
    event.target.classList.add('dragging');
};

// 拖拽结束
const handleDragEnd = (event, component) => {
    editorStore.addComponent(component.type);
    event.target.classList.remove('dragging');

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

.components-panel,
.properties-panel {
    width: 280px;
    background: #fafafa;
    border-right: 1px solid #e8e8e8;
    padding: 20px;
    overflow-y: auto;
}

.properties-panel {
    border-right: none;
    border-left: 1px solid #e8e8e8;
}

.canvas-area {
    flex: 1;
    padding: 20px;
    background: #f0f2f5;
    overflow: auto;
}

.canvas-wrapper {
    min-height: 800px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    position: relative;
}

.drop-zone {
    min-height: 800px;
}

.empty-tip {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #999;
    font-size: 16px;
    display: flex;
    align-items: center;
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