<template>
    <div class="text-component" :style="{
        fontSize: props.fontSize + 'px',
        color: props.color,
        textAlign: props.align,
        padding: '10px',
        cursor: 'move'
    }" @click="$emit('select')">
        {{ props.content }}
    </div>
</template>

<script setup>
const props = defineProps({
    id: String,
    content: {
        type: String,
        default: '文本内容'
    },
    fontSize: {
        type: Number,
        default: 16
    },
    color: {
        type: String,
        default: '#333333'
    },
    align: {
        type: String,
        default: 'left'
    }
});

defineEmits(['select']);
</script>

<style scoped>
.text-component{
    width: 100%;
    height: 100%;
}
.text-component.selected {
    border-color: #409eff;
    background-color: rgba(64, 158, 255, 0.1);
}
</style>