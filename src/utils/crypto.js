import CryptoJS from 'crypto-js'

// 模拟 RSA 密钥对（实际应来自服务器，这里用固定字符串演示）
export const RSA = {
  publicKey: '-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCdJcQh6k/...\n-----END PUBLIC KEY-----',
  privateKey: '-----BEGIN PRIVATE KEY-----\nMIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAJ0lxCHqT/...\n-----END PRIVATE KEY-----'
}

/**
 * AES 加密
 * @param {any} data - 要加密的数据（自动 JSON 序列化）
 * @param {string} key - AES 密钥（16/32 字节）
 * @returns {string} Base64 密文
 */
export const aesEncrypt = (data, key) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString()
}

/**
 * AES 解密
 * @param {string} ciphertext - Base64 密文
 * @param {string} key - AES 密钥
 * @returns {any} 解密后的对象
 */
export const aesDecrypt = (ciphertext, key) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key)
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
}

/**
 * 模拟 RSA 加密（实际使用公钥加密，这里简单用 AES 模拟）
 * @param {string} data - 要加密的字符串
 * @returns {string} 密文
 */
export const rsaEncrypt = (data) => {
  // 演示目的：使用 AES 加密，密钥为公钥哈希（仅用于展示流程）
  return CryptoJS.AES.encrypt(data, RSA.publicKey).toString()
}

/**
 * 模拟 RSA 解密
 */
export const rsaDecrypt = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, RSA.publicKey)
  return bytes.toString(CryptoJS.enc.Utf8)
}

/**
 * 混合加密（客户端 → 服务器）
 * 1. 生成随机 AES 密钥
 * 2. 用 RSA 公钥加密 AES 密钥
 * 3. 用 AES 密钥加密业务数据
 * @returns {Object} { encryptedAesKey, encryptedData }
 */
export const hybridEncrypt = (data) => {
  // 1. 生成 256 位随机 AES 密钥
  const aesKey = CryptoJS.lib.WordArray.random(256 / 8).toString()
  
  // 2. 用 RSA 公钥“加密”AES 密钥（模拟）
  const encryptedAesKey = rsaEncrypt(aesKey)
  
  // 3. 用 AES 密钥加密业务数据
  const encryptedData = aesEncrypt(data, aesKey)
  
  return {
    encryptedAesKey,
    encryptedData,
    aesKey // 仅用于演示展示，实际不应发送
  }
}

/**
 * 混合解密（服务器 → 客户端）
 * 模拟服务器解密流程
 */
export const hybridDecrypt = (encryptedAesKey, encryptedData) => {
  // 1. RSA 私钥解密获得 AES 密钥
  const aesKey = rsaDecrypt(encryptedAesKey)
  // 2. AES 解密获得原始数据
  const decryptedData = aesDecrypt(encryptedData, aesKey)
  
  return decryptedData
}