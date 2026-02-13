<template>
  <div class="app">
    <NavBar />
    <div class="main-container">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import NavBar from '@/components/layout/NavBar.vue';
</script>

<style>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main-container {
  flex: 1;
  overflow: auto;
}
</style>