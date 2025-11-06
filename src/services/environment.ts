import { AppService } from '@/types/system';

declare global {
  interface Window {
    __READEST_CLI_ACCESS?: boolean;
  }
}

export const isTauriAppPlatform = () => process.env['NEXT_PUBLIC_APP_PLATFORM'] === 'tauri';
export const isWebAppPlatform = () => process.env['NEXT_PUBLIC_APP_PLATFORM'] === 'web';

export interface EnvConfigType {
  getAppService: () => Promise<AppService>;
}

let nativeAppService: AppService | null = null;
const getNativeAppService = async () => {
  if (!nativeAppService) {
    const { NativeAppService } = await import('@/services/nativeAppService');
    nativeAppService = new NativeAppService();
    await nativeAppService.init();
  }
  return nativeAppService;
};

const environmentConfig: EnvConfigType = {
  getAppService: async () => {
    return getNativeAppService();
    // if (isTauriAppPlatform()) {
    //   return getNativeAppService();
    // } else {
    //   return getWebAppService();
    // }
  },
};

export default environmentConfig;
