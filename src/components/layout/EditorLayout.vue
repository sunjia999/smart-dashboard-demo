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
                <div class="canvas-header">
                    <div class="canvas-info">
                        <span>组件数量：{{ editorStore.components ? editorStore.components.length : 0 }}</span>
                        <span>当前选中：{{ selectedComponentId ? '已选中' : '未选中' }}</span>
                    </div>
                    <div class="canvas-tools">
                        <el-button size="small" @click="clearCanvas">清空</el-button>
                        <el-button size="small" @click="snapToGrid = !snapToGrid">
                            {{ snapToGrid ? '关闭网格' : '开启网格' }}
                        </el-button>
                    </div>
                </div>
                <div class="canvas-wrapper" @dragover.prevent="canvasDragOver" @dragleave="canvasDragLeave"
                    @drop.prevent="canvasDrop" :class="{ grid: snapToGrid }" ref="canvasRef">
                    <!-- 拖拽区域 -->
                    <div class="empty-tip" v-if="editorStore.components.length === 0">
                        <el-empty description="从左侧拖拽组件到此处开始创作" :image-size="120">
                            <template #image>
                                <el-icon :size="120" color="#c0c4cc">
                                    <Upload />
                                </el-icon>
                            </template>
                        </el-empty>
                    </div>

                    <div v-for="component in components" :key="component.id" class="canvas-component"
                        :class="{ selected: editorStore.selectedComponent === component.id }" :style="{
                            position: 'absolute',
                            left: component.position.x + 'px',
                            top: component.position.y + 'px',
                            width: component.size.width + 'px',
                            height: component.size.height + 'px'
                        }" @click="selectComponent(component.id)">
                        <component :is="getComponentByName(component.type)" v-bind="component.props" :id="component.id"
                            @select="selectComponent(component.id)" />
                        <!-- 选中时的边框和操作点 -->
                        <div class="selection-border" v-if="selectedComponentId === component.id"></div>
                        <div class="resize-handle" @mousedown.stop="startResize(component.id, $event)"></div>
                    </div>
                    <!-- 拖拽引导线 -->
                    <div class="drag-guides" v-if="showDragGuides">
                        <div class="guide-line horizontal" :style="{ top: dragY + 'px' }"></div>
                        <div class="guide-line vertical" :style="{ left: dragX + 'px' }"></div>
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
import { ref, computed, reactive, onMounted } from 'vue';
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
const canvasRef = ref(null);
const dropZone = ref(null);
const componentFilter = ref('');
const snapToGrid = ref(true);
const showDragGuides = ref(false);
const isDragOver = ref(false);
const dragX = ref(0);
const dragY = ref(0);

const components = computed(() => editorStore.components);
//当前选中组件
const selectedComponentId = computed(() => editorStore.selectedComponent);
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

const selectComponent = (id) => {
    editorStore.selectedComponent = id;
};

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
};

// 拖拽结束
const handleDragEnd = (event, component) => {
    event.target.classList.remove('dragging');
    editorStore.selectedComponent = null;
};

// 清空画布
const clearCanvas = () => {
    editorStore.clearCanvas();
};

// 画布组件拖拽
// 拖拽事件处理
const canvasDragOver = (event) => {
    isDragOver.value = true;

    // 计算网格对齐位置
    const rect = canvasRef.value.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    // 网格对齐
    if (snapToGrid.value) {
        dragX.value = Math.round(offsetX / 10) * 10;
        dragY.value = Math.round(offsetY / 10) * 10;
    } else {
        dragX.value = offsetX;
        dragY.value = offsetY;
    }

    showDragGuides.value = true;
};

const canvasDragLeave = () => {
    isDragOver.value = false;
    showDragGuides.value = false;
};

const canvasDrop = (event) => {
    isDragOver.value = false;
    showDragGuides.value = false;
    console.log(1);
    // 获取拖拽数据
    const componentType = event.dataTransfer.getData('componentType');
    console.log(componentType, 'componentType');
    const defaultWidth = parseInt(event.dataTransfer.getData('defaultWidth')) || 200;
    const defaultHeight = parseInt(event.dataTransfer.getData('defaultHeight')) || 150;

    if (!componentType) return;

    // 计算放置位置
    const rect = canvasRef.value.getBoundingClientRect();
    let x = event.clientX - rect.left - defaultWidth / 2;
    let y = event.clientY - rect.top - defaultHeight / 2;
    console.log(x, y);

    // 边界检查
    x = Math.max(0, Math.min(x, rect.width - defaultWidth));
    y = Math.max(0, Math.min(y, rect.height - defaultHeight));

    // 网格对齐
    if (snapToGrid.value) {
        x = Math.round(x / 10) * 10;
        y = Math.round(y / 10) * 10;
    }

    // 添加新组件
    const newComponent = editorStore.addComponent(componentType);
    editorStore.updateComponentProps(newComponent.id, {
        position: { x, y },
        size: { width: defaultWidth, height: defaultHeight }
    });

    // 选中新添加的组件
    editorStore.selectedComponent = newComponent.id;
}

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
    height: 100%;
    display: flex;
    flex-direction: column;
}

.canvas-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    margin-bottom: 20px;
}

.canvas-info {
    display: flex;
    gap: 20px;
    font-size: 14px;
    color: #666;
}

.canvas-info span {
    display: flex;
    align-items: center;
}

.canvas-tools {
    display: flex;
    gap: 8px;
}

.canvas-wrapper {
    min-height: 600px;
    height: 100%;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    overflow: auto;
    position: relative;
}


.grid {
    background-image:
        linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
    background-size: 10px 10px;
}

.drop-zone {
    /* min-height: 600px; */
}

.canvas-component {
    border: 1px dashed transparent;
    transition: border-color 0.3s;
}

.canvas-component:hover {
    border-color: #409eff;
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

.selection-border {
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border: 2px solid #409eff;
    pointer-events: none;
}

.resize-handle {
    position: absolute;
    right: -4px;
    bottom: -4px;
    width: 8px;
    height: 8px;
    background: #409eff;
    border-radius: 50%;
    cursor: nwse-resize;
    opacity: 0;
    transition: opacity 0.3s, transform 0.3s;
}

.drag-guides {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 10;
}

.guide-line {
    position: absolute;
    background-color: #409eff;
    opacity: 0.5;
}

.guide-line.horizontal {
    height: 1px;
    left: 0;
    right: 0;
}

.guide-line.vertical {
    width: 1px;
    top: 0;
    bottom: 0;
}
</style>