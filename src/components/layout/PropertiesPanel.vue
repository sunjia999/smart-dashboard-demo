<template>
    <aside class="properties-panel">
        <h3>属性配置</h3>
        <div v-if="!selectedComponent" class="no-selection">
            <el-empty description="请选择画布中的组件" :image-size="100" />
        </div>
        <div v-else class="properties-form">
            <el-form :model="formData" label-position="left" label-width="auto" @submit.prevent>
                <el-form-item label="ID">
                    <el-input v-model="selectedComponent.id" disabled />
                </el-form-item>
                <el-form-item label="类型">
                    <el-input v-model="selectedComponent.type" disabled />
                </el-form-item>
                <el-collapse class="properties-form-collapse">
                    <el-collapse-item title="位置与大小">
                        <div class="properties-grid">
                            <el-form-item label="X">
                                <el-input-number v-model="formData.position.x" :min="0" :step="10"
                                    @change="updateComponent" />
                            </el-form-item>
                            <el-form-item label="Y">
                                <el-input-number v-model="formData.position.y" :min="0" :step="10"
                                    @change="updateComponent" />
                            </el-form-item>

                            <el-form-item label="宽度">
                                <el-input-number v-model="formData.size.width" :min="50" :step="10"
                                    @change="updateComponent" />
                            </el-form-item>
                            <el-form-item label="高度">
                                <el-input-number v-model="formData.size.height" :min="50" :step="10"
                                    @change="updateComponent" />
                            </el-form-item>
                        </div>
                    </el-collapse-item>
                </el-collapse>
                <div v-for="(value, key) in formData.props" :key="key">
                    <el-form-item :label="formatLabel(key)">
                        <el-input v-if="key === 'content'" v-model="formData.props[key]" type="textarea" :rows="3"
                            @input="updateComponent" />
                        <el-input-number v-else-if="typeof value === 'number'" v-model="formData.props[key]"
                            @change="updateComponent" />
                        <el-switch v-else-if="typeof value === 'boolean'" v-model="formData.props[key]"
                            @change="updateComponent" />
                        <el-color-picker v-else-if="key.includes('color') || key.includes('Color')"
                            v-model="formData.props[key]" @change="updateComponent" />
                        <el-select v-else-if="key === 'align'" v-model="formData.props[key]" @change="updateComponent">
                            <el-option label="左对齐" value="left" />
                            <el-option label="居中" value="center" />
                            <el-option label="右对齐" value="right" />
                        </el-select>
                    </el-form-item>
                </div>
            </el-form>
        </div>
    </aside>
</template>
<script setup>
import { computed, watch, ref } from 'vue';
import { useEditorStore } from '@/stores/editor';
import Text from '@/components/common/Text.vue';
const componentMap = {
    text: Text
};
const formData = ref({
    position: { x: 0, y: 0 },
    size: { width: 100, height: 100 },
    props: {}
});
const editorStore = useEditorStore();
const selectedComponent = computed(() => {
    if (!editorStore.selectedComponent) return null;
    return editorStore.components.find(c => c.id === editorStore.selectedComponent);
});
// 监听选中的组件变化
watch(selectedComponent, (newVal) => {
    if (newVal) {
        formData.value = {
            position: { ...newVal.position },
            size: { ...newVal.size },
            props: JSON.parse(JSON.stringify(newVal.props))
        };
    }
}, { immediate: true, deep: true });

// 更新组件
const updateComponent = () => {
    if (!selectedComponent.value) return;
    editorStore.updateComponentProps(selectedComponent.value.id, {
        position: formData.value.position,
        size: formData.value.size,
        props: formData.value.props
    });
};

// 格式化标签
const formatLabel = (key) => {
    const labels = {
        content: '内容',
        fontSize: '字体',
        color: '颜色',
        align: '对齐',
        title: '标题',
        data: '数据',
        width: '宽度',
        height: '高度',
        backgroundColor: '背景',
        rotationSpeed: '转速',
        modelColor: '模型颜色' 
    };
    return labels[key] || key;
};
</script>
<style scoped>
.properties-panel {
    width: 280px;
    background: #fafafa;
    height: 100%;
    border-right: 1px solid #e8e8e8;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    position: relative;
}


.no-selection {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.properties-form {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
    overflow-y: auto;
    margin-top: 20px;
}

.properties-form-collapse {
    margin-bottom: 18px;
    background-color: #fafafa !important;
}

:deep(.el-input-number) {
    width: 100% !important;
}

:deep(.el-color-picker) {
    width: 100% !important;
}

:deep(.el-collapse-item__wrap) {
    background-color: #fafafa !important;
}

:deep(.el-collapse-item__header) {
    background-color: #fafafa !important;

}
</style>