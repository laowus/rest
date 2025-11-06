import { AppPlatform, AppService, DistChannel, FileItem, OsPlatform, ResolvedPath, SelectDirectoryMode } from '@/types/system';
import { FileSystem, BaseDir, DeleteAction } from '@/types/system';

import { getOSPlatform } from '@/utils/misc';

export abstract class BaseAppService implements AppService {
  osPlatform: OsPlatform = getOSPlatform();
  appPlatform: AppPlatform = 'tauri';
  localBooksDir: string = '';
  isMobile = false;
  isMacOSApp = false;
  isLinuxApp = false;
  isAppDataSandbox = false;
  isAndroidApp = false;
  isIOSApp = false;
  isMobileApp = false;
  isPortableApp = false;
  isDesktopApp = false;
  hasTrafficLight = false;
  hasWindow = false;
  hasWindowBar = false;
  hasContextMenu = false;
  hasRoundedWindow = false;
  hasSafeAreaInset = false;
  hasHaptics = false;
  hasUpdater = false;
  hasOrientationLock = false;
  hasScreenBrightness = false;
  hasIAP = false;
  canCustomizeRootDir = false;
  distChannel = 'readest' as DistChannel;

  protected abstract fs: FileSystem;
  protected abstract resolvePath(fp: string, base: BaseDir): ResolvedPath;

  abstract init(): Promise<void>;

  async openFile(path: string, base: BaseDir): Promise<File> {
    return await this.fs.openFile(path, base);
  }

  async copyFile(srcPath: string, dstPath: string, base: BaseDir): Promise<void> {
    return await this.fs.copyFile(srcPath, dstPath, base);
  }

  async writeFile(path: string, base: BaseDir, content: string | ArrayBuffer | File) {
    return await this.fs.writeFile(path, base, content);
  }

  async createDir(path: string, base: BaseDir, recursive: boolean = true): Promise<void> {
    return await this.fs.createDir(path, base, recursive);
  }

  async deleteFile(path: string, base: BaseDir): Promise<void> {
    return await this.fs.removeFile(path, base);
  }

  async deleteDir(path: string, base: BaseDir, recursive: boolean = true): Promise<void> {
    return await this.fs.removeDir(path, base, recursive);
  }
}
