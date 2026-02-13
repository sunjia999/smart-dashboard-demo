<template>
  <el-menu mode="horizontal" :router="true" :default-active="$route.path">
    <el-menu-item index="/login">
      <el-icon>
        <Lock />
      </el-icon>
      <span>加密登录演示</span>
    </el-menu-item>
    <el-menu-item index="/lowcode">
      <el-icon>
        <Grid />
      </el-icon>
      <span>低代码编辑器</span>
    </el-menu-item>
    <el-menu-item index="/websocket">
      <el-icon>
        <Connection />
      </el-icon>
      <span>WebSocket加密通信</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { Grid, Connection, Lock } from '@element-plus/icons-vue';
</script>