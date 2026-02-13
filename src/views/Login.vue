<template>
    <div class="login-page">
        <!-- 登录面板 -->
        <el-card class="login-panel">
            <template #header>
                <h2> 加密登录演示</h2>
                <p style="color: #909399; font-size: 14px;">RSA + AES 混合加密</p>
            </template>

            <el-form :model="form" label-width="60px">
                <el-form-item label="用户名">
                    <el-input v-model="form.username" placeholder="admin" />
                </el-form-item>
                <el-form-item label="密码">
                    <el-input v-model="form.password" type="password" placeholder="123456" show-password />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleLogin" :loading="loading" block>
                        登录（加密传输）
                    </el-button>
                    <el-button @click="resetForm" style="margin-top: 12px;" block>
                        重置
                    </el-button>
                </el-form-item>
            </el-form>

            <!-- 模拟服务器响应区域 -->
            <div v-if="decryptResult" class="server-response">
                <p class="response-title"> 服务器解密结果</p>
                <pre>{{ decryptResult }}</pre>
            </div>
        </el-card>

        <!-- 加密过程可视化面板 -->
        <el-card class="crypto-panel">
            <template #header>
                <div class="panel-header">
                    <h3>加密流程实时展示</h3>
                    <el-tag type="info" size="small">AES-256 + RSA-1024</el-tag>
                </div>
            </template>

            <div class="crypto-steps">
                <!-- 原始数据 -->
                <div class="step">
                    <div class="step-title">
                        1. 原始登录数据
                    </div>
                    <el-input v-model="originalData" :rows="5" type="textarea" placeholder="等待登录" />
                </div>

                <!-- 生成AES密钥 -->
                <div class="step">
                    <div class="step-title">
                        2. 随机AES密钥（256位）
                    </div>
                    <el-input v-model="aesKey" :rows="2" type="textarea" placeholder="登录时生成" />
                </div>

                <!-- RSA加密AES密钥 -->
                <div class="step">
                    <div class="step-title">
                        3. RSA公钥加密AES密钥
                    </div>
                    <el-input v-model="encryptedAesKey" :rows="2" type="textarea" placeholder="等待加密" />
                </div>

                <!-- AES加密业务数据 -->
                <div class="step">
                    <div class="step-title">
                        4. AES加密登录数据
                    </div>
                    <el-input v-model="encryptedData" :rows="2" type="textarea" placeholder="等待加密" />

                </div>

                <!-- 服务器解密（模拟） -->
                <div class="step">
                    <div class="step-title">
                        5. 服务器解密还原
                    </div>
                    <el-input v-model="decryptResult" :rows="5" type="textarea" placeholder="登录后显示" />
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { hybridEncrypt, hybridDecrypt } from '@/utils/crypto';

// 登录表单
const form = reactive({
    username: 'admin',
    password: '123456'
});

const loading = ref(false);

// 加密过程可视化数据
const originalData = ref('');
const aesKey = ref('');
const encryptedAesKey = ref('');
const encryptedData = ref('');
const decryptResult = ref('');

// 登录处理
const handleLogin = async () => {
    if (!form.username || !form.password) {
        ElMessage.warning('请输入用户名和密码');
        return;
    }

    loading.value = true;

    // 1. 准备原始数据
    const loginData = {
        username: form.username,
        password: form.password,
        timestamp: Date.now()
    };
    originalData.value = JSON.stringify(loginData, null, 2);

    // 2. 混合加密（模拟前端加密）
    const encrypted = hybridEncrypt(loginData);
    aesKey.value = encrypted.aesKey;
    encryptedAesKey.value = encrypted.encryptedAesKey;
    encryptedData.value = encrypted.encryptedData;

    // 3. 模拟发送到服务器（延迟模拟网络）
    setTimeout(() => {
        try {
            const decrypted = hybridDecrypt(encrypted.encryptedAesKey, encrypted.encryptedData);
            decryptResult.value = JSON.stringify(decrypted, null, 2);

            // 模拟验证
            if (decrypted.username === 'admin' && decrypted.password === '123456') {
                ElMessage.success('登录成功！服务器解密数据匹配');
            } else {
                ElMessage.error('用户名或密码错误');
            }
        } catch (e) {
            ElMessage.error('解密失败');
        } finally {
            loading.value = false;
        }
    }, 600);
};

// 重置
const resetForm = () => {
    form.username = 'admin';
    form.password = '123456';
    originalData.value = '';
    aesKey.value = '';
    encryptedAesKey.value = '';
    encryptedData.value = '';
    decryptResult.value = '';
};
</script>

<style scoped>
.login-page {
    display: flex;
    align-items: stretch;
    justify-content: center;
    gap: 24px;
    width: 100%;
    height: 100%;
    padding: 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-sizing: border-box;
    overflow: hidden;
}

.login-panel,
.crypto-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    margin: 0;
    overflow: hidden;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.login-panel {
    width: 360px;
    flex-shrink: 0;
}

.crypto-panel {
    flex: 1;
    min-width: 480px;
    max-width: 700px;
}

:deep(.el-card__body) {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}

.el-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.el-button+.el-button {
    margin-left: 0 !important;
}

.el-button[block] {
    width: 100%;
}

.server-response {
    margin-top: 24px;
    padding: 16px;
    background-color: #f0f9eb;
    border-radius: 8px;
    border-left: 4px solid #67c23a;
}

.response-title {
    font-weight: 600;
    color: #67c23a;
    margin-bottom: 8px;
    font-size: 14px;
}

.server-response pre {
    background: #fff;
    padding: 12px;
    border-radius: 6px;
    font-size: 12px;
    overflow-x: auto;
    margin: 0;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.panel-header h3 {
    margin: 0;
    font-size: 16px;
    color: #303133;
}

.crypto-steps {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.step {
    background: #fafafa;
    border-radius: 8px;
    padding: 16px;
    border: 1px solid #ebeef5;
}

.step-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    color: #409eff;
    font-weight: 600;
    font-size: 14px;
}
</style>