// Utilitários de criptografia para senhas
import CryptoJS from 'crypto-js';

// Chave secreta para criptografia (em produção, deve vir de variável de ambiente)
const SECRET_KEY = process.env.NEXT_PUBLIC_CRYPTO_KEY || 'biblioteca-multiempresa-2025-secure-key';

/**
 * Criptografa uma senha usando AES
 */
export function encryptPassword(password: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Erro ao criptografar senha:', error);
    throw new Error('Falha na criptografia');
  }
}

/**
 * Descriptografa uma senha usando AES
 */
export function decryptPassword(encryptedPassword: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
  } catch (error) {
    console.error('Erro ao descriptografar senha:', error);
    throw new Error('Falha na descriptografia');
  }
}

/**
 * Gera um hash seguro da senha para validação
 */
export function hashPassword(password: string): string {
  try {
    const hash = CryptoJS.SHA256(password + SECRET_KEY).toString();
    return hash;
  } catch (error) {
    console.error('Erro ao gerar hash da senha:', error);
    throw new Error('Falha no hash');
  }
}

/**
 * Valida se uma senha corresponde ao hash
 */
export function validatePassword(password: string, hash: string): boolean {
  try {
    const passwordHash = hashPassword(password);
    return passwordHash === hash;
  } catch (error) {
    console.error('Erro ao validar senha:', error);
    return false;
  }
}

/**
 * Criptografa dados sensíveis para transporte
 */
export function encryptSensitiveData(data: any): string {
  try {
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Erro ao criptografar dados:', error);
    throw new Error('Falha na criptografia de dados');
  }
}

/**
 * Descriptografa dados sensíveis recebidos
 */
export function decryptSensitiveData(encryptedData: string): any {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Erro ao descriptografar dados:', error);
    throw new Error('Falha na descriptografia de dados');
  }
}