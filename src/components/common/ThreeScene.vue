<template>
    <div ref="container" class="three-scene" />
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';

const props = defineProps({
    backgroundColor: { type: String, default: '#f0f2f5' },
    rotationSpeed: { type: Number, default: 0.01 },
    modelColor: { type: String, default: '#409eff' }
});

const container = ref(null);
let scene, camera, renderer, cube;
let animationId;

onMounted(() => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(props.backgroundColor);
    camera = new THREE.PerspectiveCamera(75, container.value.clientWidth / container.value.clientHeight, 0.1, 1000);
    camera.position.z = 5;
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.value.clientWidth, container.value.clientHeight);
    container.value.appendChild(renderer.domElement);
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: props.modelColor });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    const light = new THREE.AmbientLight(0x404040);
    scene.add(light);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    const animate = () => {
        animationId = requestAnimationFrame(animate);
        cube.rotation.x += props.rotationSpeed;
        cube.rotation.y += props.rotationSpeed;
        renderer.render(scene, camera);
    };
    animate();
});

watch(() => props.backgroundColor, (val) => {
    if (scene) scene.background = new THREE.Color(val);
});
watch(() => props.modelColor, (val) => {
    if (cube) cube.material.color.set(val);
});

onUnmounted(() => {
    cancelAnimationFrame(animationId);
    renderer?.dispose();
});
</script>

<style scoped>
.three-scene {
    width: 100%;
    height: 100%;
    min-height: 200px;
}
</style>