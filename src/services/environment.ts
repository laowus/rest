// 导入应用服务类型定义
import { AppService } from '@/types/system';
// 导入基础URL常量
import { READEST_NODE_BASE_URL, READEST_WEB_BASE_URL } from './constants';

// 全局窗口对象扩展声明
declare global {
  interface Window {
    __READEST_CLI_ACCESS?: boolean; // 命令行访问权限标志
  }
}

/**
 * 检测当前是否为 Tauri 应用平台
 * 通过检查环境变量 NEXT_PUBLIC_APP_PLATFORM 是否等于 'tauri'
 * @returns {boolean} 当前是否为 Tauri 平台
 */
export const isTauriAppPlatform = () => process.env['NEXT_PUBLIC_APP_PLATFORM'] === 'tauri';

/**
 * 检测当前是否为 Web 应用平台
 * 通过检查环境变量 NEXT_PUBLIC_APP_PLATFORM 是否等于 'web'
 * @returns {boolean} 当前是否为 Web 平台
 */
export const isWebAppPlatform = () => process.env['NEXT_PUBLIC_APP_PLATFORM'] === 'web';

/**
 * 检测是否具有命令行访问权限
 * 通过检查窗口对象中的 __READEST_CLI_ACCESS 标志
 * @returns {boolean} 是否具有命令行访问权限
 */
export const hasCli = () => window.__READEST_CLI_ACCESS === true;

/**
 * 检测当前是否以渐进式Web应用(PWA)模式运行
 * 通过媒体查询检查 display-mode 是否为 standalone
 * @returns {boolean} 当前是否为 PWA 模式
 */
export const isPWA = () => window.matchMedia('(display-mode: standalone)').matches;

/**
 * 获取应用基础URL
 * 优先使用环境变量 NEXT_PUBLIC_API_BASE_URL，否则使用默认的 READEST_WEB_BASE_URL
 * @returns {string} 应用基础URL
 */
export const getBaseUrl = () => process.env['NEXT_PUBLIC_API_BASE_URL'] ?? READEST_WEB_BASE_URL;

/**
 * 获取Node服务基础URL
 * 优先使用环境变量 NEXT_PUBLIC_NODE_BASE_URL，否则使用默认的 READEST_NODE_BASE_URL
 * @returns {string} Node服务基础URL
 */
export const getNodeBaseUrl = () => process.env['NEXT_PUBLIC_NODE_BASE_URL'] ?? READEST_NODE_BASE_URL;

/**
 * 检测是否为Web开发模式
 * 判断条件：开发环境(NODE_ENV=development)且为Web应用平台
 * @returns {boolean} 是否为Web开发模式
 */
const isWebDevMode = () => process.env['NODE_ENV'] === 'development' && isWebAppPlatform();

/**
 * 获取API基础URL
 * 在Web开发模式下使用相对路径 '/api'
 * 其他情况下使用完整的生产环境Web API URL
 * @returns {string} API基础URL
 */
export const getAPIBaseUrl = () => (isWebDevMode() ? '/api' : `${getBaseUrl()}/api`);

/**
 * 获取Node.js API基础URL
 * 主要用于当前在某些边缘运行时中不支持的Node.js API
 * @returns {string} Node.js API基础URL
 */
export const getNodeAPIBaseUrl = () => (isWebDevMode() ? '/api' : `${getNodeBaseUrl()}/api`);

/**
 * 环境配置类型接口
 * 定义了获取应用服务的方法
 */
export interface EnvConfigType {
  getAppService: () => Promise<AppService>;
}

// 原生应用服务实例缓存
let nativeAppService: AppService | null = null;
/**
 * 获取原生应用服务实例（延迟加载）
 * 使用单例模式，仅在首次调用时初始化
 * @returns {Promise<AppService>} 原生应用服务实例
 */
const getNativeAppService = async () => {
  if (!nativeAppService) {
    const { NativeAppService } = await import('@/services/nativeAppService');
    nativeAppService = new NativeAppService();
    await nativeAppService.init();
  }
  return nativeAppService;
};

// Web应用服务实例缓存
let webAppService: AppService | null = null;
/**
 * 获取Web应用服务实例（延迟加载）
 * 使用单例模式，仅在首次调用时初始化
 * @returns {Promise<AppService>} Web应用服务实例
 */
const getWebAppService = async () => {
  if (!webAppService) {
    const { WebAppService } = await import('@/services/webAppService');
    webAppService = new WebAppService();
    await webAppService.init();
  }
  return webAppService;
};

/**
 * 环境配置对象
 * 根据当前运行平台提供相应的应用服务
 */
const environmentConfig: EnvConfigType = {
  getAppService: async () => {
    console.log('getAppService', isTauriAppPlatform());
    // 根据当前平台返回对应的应用服务
    if (isTauriAppPlatform()) {
      return getNativeAppService();
    } else {
      return getWebAppService();
    }
  },
};

export default environmentConfig;
