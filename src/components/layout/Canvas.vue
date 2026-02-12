<template>
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
                <el-dropdown @command="handleAlignCommand">
                    <el-button size="small">
                        自动对齐
                        <el-icon class="el-icon--right">
                            <ArrowDown />
                        </el-icon>
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="all">所有组件</el-dropdown-item>
                            <el-dropdown-item command="selected">仅选中组件</el-dropdown-item>
                            <el-dropdown-item divided command="grid">对齐网格</el-dropdown-item>
                            <el-dropdown-item command="left">左对齐</el-dropdown-item>
                            <el-dropdown-item command="right">右对齐</el-dropdown-item>
                            <el-dropdown-item command="top">顶部对齐</el-dropdown-item>
                            <el-dropdown-item command="bottom">底部对齐</el-dropdown-item>
                            <el-dropdown-item command="center-h">水平居中</el-dropdown-item>
                            <el-dropdown-item command="center-v">垂直居中</el-dropdown-item>
                            <el-dropdown-item command="distribute-h">水平均匀分布</el-dropdown-item>
                            <el-dropdown-item command="distribute-v">垂直均匀分布</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
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
                }" @mousedown="startDrag($event, component)" @click="selectComponent(component.id)">
                <component :is="getComponentByName(component.type)" v-bind="component.props" :id="component.id"
                    @select="selectComponent(component.id)" />
                <!-- 选中时的边框和操作点 -->
                <div class="selection-border" v-if="selectedComponentId && selectedComponentId === component.id"></div>
                <div class="resize-handle" @mousedown.stop="startResize(component.id, $event)"></div>
            </div>
            <!-- 拖拽预览组件 -->
            <div class="component-item drag-preview" v-if="props.dragPreview.show" :style="{
                left: props.dragPreview.x + 'px',
                top: props.dragPreview.y + 'px',
                width: props.dragPreview.width + 'px',
                height: props.dragPreview.height + 'px'
            }">
                <div class="component-icon">
                    <el-icon>
                        <component :is="props.dragPreview.icon" />
                    </el-icon>
                </div>
                <span class="component-name">{{ props.dragPreview.name }}</span>
            </div>
        </div>

    </main>
</template>
<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue';
import { useEditorStore } from '@/stores/editor';
import { checkCollision, hasCollision, findNonOverlapPosition } from '@/utils/collision';
import { Upload, ArrowDown } from '@element-plus/icons-vue';
import TextComponent from '@/components/common/Text.vue';
const props = defineProps({
    dragPreview: {
        type: Object,
        required: true
    }
});
const emits = defineEmits(['updateDragPreview']);
const editorStore = useEditorStore();
const canvasRef = ref(null);
const snapToGrid = ref(true);
const isDragOver = ref(false);
const dragX = ref(0);
const dragY = ref(0);
// 画布内拖拽状态
const isDragging = ref(false);
const dragId = ref(null);
const dragOffset = ref({ x: 0, y: 0 });
const components = computed(() => editorStore.components);
// 当前选中组件
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

const selectComponent = (id) => {
    editorStore.selectedComponent = id;
};

// 清空画布
const clearCanvas = () => {
    editorStore.clearCanvas();
};

// 拖拽预览
const updateDragPreview = (event, component) => {
    const rect = canvasRef.value.getBoundingClientRect();
    const x = event.clientX - rect.left - component.defaultSize.width / 2;
    const y = event.clientY - rect.top - component.defaultSize.height / 2;
    const newPreview = {
        show: true,
        x: snapToGrid.value ? Math.round(x / 10) * 10 : x,
        y: snapToGrid.value ? Math.round(y / 10) * 10 : y,
        width: component.defaultSize.width,
        height: component.defaultSize.height,
        type: component.type,
        name: component.name,
        icon: component.icon
    };
    emits('updateDragPreview', newPreview);
};

// 画布内拖拽
const startDrag = (e, component) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.button !== 0) return;
    isDragging.value = true;
    dragId.value = component.id;
    editorStore.selectedComponent = component.id;
    const rect = e.currentTarget.getBoundingClientRect();
    dragOffset.value = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
    // 添加全局监听
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
};

// 拖拽移动
const onDragMove = (e) => {
    if (!isDragging.value) return;
    const component = editorStore.components.find(c => c.id === dragId.value);
    if (!component) return;
    const canvasRect = canvasRef.value.getBoundingClientRect();
    let newX = e.clientX - dragOffset.value.x - canvasRect.left;
    let newY = e.clientY - dragOffset.value.y - canvasRect.top;

    // 边界限制
    newX = Math.max(0, Math.min(newX, canvasRect.width - component.size.width));
    newY = Math.max(0, Math.min(newY, canvasRect.height - component.size.height));
    newX = Math.round(newX / 10) * 10;
    newY = Math.round(newY / 10) * 10;
    const hasCollisionWithOthers = hasCollision(
        editorStore.components,
        newX,
        newY,
        component.size.width,
        component.size.height,
        dragId.value
    );
    if (!hasCollisionWithOthers) {
        editorStore.updateComponentProps(dragId.value, {
            position: { x: newX, y: newY }
        });
    }
};

// 拖拽结束
const onDragEnd = () => {
    isDragging.value = false;
    dragId.value = null;
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
};

// 从画布外拖拽
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

    if (!editorStore.draggingComponent) return;
    const component = editorStore.componentTypes.find(c => c.type === editorStore.draggingComponent.type);
    if (component) {
        updateDragPreview(event, component);
    }

};

const canvasDragLeave = () => {
    isDragOver.value = false;
};

const canvasDrop = (event) => {
    isDragOver.value = false;
    // 获取拖拽数据
    const componentType = event.dataTransfer.getData('componentType');
    const defaultWidth = parseInt(event.dataTransfer.getData('defaultWidth')) || 200;
    const defaultHeight = parseInt(event.dataTransfer.getData('defaultHeight')) || 150;

    if (!componentType) return;

    // 计算放置位置
    const rect = canvasRef.value.getBoundingClientRect();
    let x = event.clientX - rect.left - defaultWidth / 2;
    let y = event.clientY - rect.top - defaultHeight / 2;

    // 边界检查
    x = Math.max(0, Math.min(x, rect.width - defaultWidth));
    y = Math.max(0, Math.min(y, rect.height - defaultHeight));

    // 网格对齐
    if (snapToGrid.value) {
        x = Math.round(x / 10) * 10;
        y = Math.round(y / 10) * 10;
    }
    // 查找不重叠的位置
    const nonOverlapPosition = findNonOverlapPosition(
        components.value,
        { x, y, width: defaultWidth, height: defaultHeight },
        rect.width,
        rect.height
    );

    // 添加新组件
    const newComponent = editorStore.addComponent(componentType);
    editorStore.updateComponentProps(newComponent.id, {
        position: nonOverlapPosition,
        size: { width: defaultWidth, height: defaultHeight }
    });

    // 选中新添加的组件
    editorStore.selectedComponent = newComponent.id;
};

// 调整大小
const isResizing = ref(false);
const startResize = (componentId, event) => {
    isResizing.value = true;

    const component = components.value.find(c => c.id === componentId);
    if (!component) return;

    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = component.size.width;
    const startHeight = component.size.height;

    const onMouseMove = (e) => {
        if (!isResizing.value) return;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        const newWidth = Math.max(50, startWidth + deltaX);
        const newHeight = Math.max(50, startHeight + deltaY);

        // 网格对齐
        let finalWidth = newWidth;
        let finalHeight = newHeight;

        if (snapToGrid.value) {
            finalWidth = Math.round(newWidth / 10) * 10;
            finalHeight = Math.round(newHeight / 10) * 10;
        }

        editorStore.updateComponentProps(componentId, {
            size: { width: finalWidth, height: finalHeight }
        });
    };

    const onMouseUp = () => {
        isResizing.value = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
};

//对齐
const handleAlignCommand = (command) => {
    console.log('对齐命令:', command);
};
</script>
<style scoped>
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
    transition: none;
    user-select: none;
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

.drag-preview {
    position: absolute;
    border: 2px dashed #409eff;
    background: rgba(64, 158, 255, 0.1);
    border-radius: 4px;
    pointer-events: none;
    z-index: 1000;
    will-change: transform;
}

.preview-content {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #409eff;
}
</style>