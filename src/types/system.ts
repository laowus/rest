import { SystemSettings } from './settings';
import { Book, BookConfig, BookContent, ViewSettings } from './book';
import { BookMetadata } from '@/libs/document';
// 应用平台类型定义
// 'web'表示Web浏览器环境，'tauri'表示Tauri原生应用环境
export type AppPlatform = 'web' | 'tauri';

// 操作系统平台类型定义
export type OsPlatform = 'android' | 'ios' | 'macos' | 'windows' | 'linux' | 'unknown';

// 基础目录类型定义
// 指定文件操作的基础目录，用于文件系统抽象
// prettier-ignore
export type BaseDir = | 'Books' | 'Settings' | 'Data' | 'Fonts' | 'Images' | 'Log' | 'Cache' | 'Temp' | 'None';

// 删除操作类型
// 'cloud'仅删除云端数据，'local'仅删除本地数据，'both'同时删除两者
export type DeleteAction = 'cloud' | 'local' | 'both';

// 目录选择模式
// 'read'表示只读模式，'write'表示可写模式
export type SelectDirectoryMode = 'read' | 'write';

// 分发渠道类型
// 标识应用的来源渠道
export type DistChannel = 'readest' | 'playstore' | 'appstore' | 'unknown';

// 解析路径类型
// 包含基础目录信息和文件路径的完整解析结果
export type ResolvedPath = {
  baseDir: number; // 基础目录的数值标识
  basePrefix: () => Promise<string>; // 获取基础目录前缀路径的函数
  fp: string; // 文件路径
  base: BaseDir; // 基础目录类型
};

// 文件项类型
// 表示文件系统中的文件信息
export type FileItem = {
  path: string; // 文件路径
  size: number; // 文件大小（字节）
};

// 文件系统接口
// 定义了所有平台需要实现的文件操作方法
export interface FileSystem {
  resolvePath(path: string, base: BaseDir): ResolvedPath; // 解析文件路径
  getURL(path: string): string; // 获取文件的URL
  getBlobURL(path: string, base: BaseDir): Promise<string>; // 获取文件的Blob URL
  openFile(path: string, base: BaseDir, filename?: string): Promise<File>; // 打开文件
  copyFile(srcPath: string, dstPath: string, base: BaseDir): Promise<void>; // 复制文件
  readFile(path: string, base: BaseDir, mode: 'text' | 'binary'): Promise<string | ArrayBuffer>; // 读取文件内容
  writeFile(path: string, base: BaseDir, content: string | ArrayBuffer | File): Promise<void>; // 写入文件内容
  removeFile(path: string, base: BaseDir): Promise<void>; // 删除文件
  readDir(path: string, base: BaseDir): Promise<FileItem[]>; // 读取目录内容
  createDir(path: string, base: BaseDir, recursive?: boolean): Promise<void>; // 创建目录
  removeDir(path: string, base: BaseDir, recursive?: boolean): Promise<void>; // 删除目录
  exists(path: string, base: BaseDir): Promise<boolean>; // 检查文件或目录是否存在
  getPrefix(base: BaseDir): Promise<string>; // 获取基础目录的前缀路径
}

// 应用服务接口
// 定义了应用程序的核心功能接口，是整个应用的主要抽象层
export interface AppService {
  // 平台相关属性
  osPlatform: OsPlatform; // 当前操作系统平台
  appPlatform: AppPlatform; // 当前应用运行平台
  hasTrafficLight: boolean; // 是否有交通灯（macOS窗口控制按钮）
  hasWindow: boolean; // 是否有独立窗口
  hasWindowBar: boolean; // 是否有窗口栏
  hasContextMenu: boolean; // 是否有上下文菜单
  hasRoundedWindow: boolean; // 是否有圆角窗口
  hasSafeAreaInset: boolean; // 是否有安全区域边距（移动设备）
  hasHaptics: boolean; // 是否支持触觉反馈
  hasUpdater: boolean; // 是否支持应用更新
  hasOrientationLock: boolean; // 是否支持屏幕方向锁定
  hasScreenBrightness: boolean; // 是否支持屏幕亮度调节
  hasIAP: boolean; // 是否支持应用内购买
  isMobile: boolean; // 是否为移动设备
  isAppDataSandbox: boolean; // 应用数据是否在沙盒中
  isMobileApp: boolean; // 是否为移动应用
  isAndroidApp: boolean; // 是否为Android应用
  isIOSApp: boolean; // 是否为iOS应用
  isMacOSApp: boolean; // 是否为macOS应用
  isLinuxApp: boolean; // 是否为Linux应用
  isPortableApp: boolean; // 是否为便携应用
  isDesktopApp: boolean; // 是否为桌面应用
  canCustomizeRootDir: boolean; // 是否可以自定义根目录
  distChannel: DistChannel; // 应用分发渠道

  // 初始化与配置方法
  init(): Promise<void>;

  // 文件操作方法
  openFile(path: string, base: BaseDir): Promise<File>; // 打开文件
  copyFile(srcPath: string, dstPath: string, base: BaseDir): Promise<void>; // 复制文件
  writeFile(path: string, base: BaseDir, content: string | ArrayBuffer | File): Promise<void>; // 写入文件
  createDir(path: string, base: BaseDir, recursive?: boolean): Promise<void>; // 创建目录
  deleteFile(path: string, base: BaseDir): Promise<void>; // 删除文件
  deleteDir(path: string, base: BaseDir, recursive?: boolean): Promise<void>; // 删除目录

  // 设置相关方法
  getDefaultViewSettings(): ViewSettings; // 获取默认视图设置
  loadSettings(): Promise<SystemSettings>; // 加载系统设置
  saveSettings(settings: SystemSettings): Promise<void>;

  downloadBookCovers(books: Book[], redownload?: boolean): Promise<void>; // 批量下载图书封面
  isBookAvailable(book: Book): Promise<boolean>; // 检查图书是否可用
  getBookFileSize(book: Book): Promise<number | null>; // 获取图书文件大小
  loadBookConfig(book: Book, settings: SystemSettings): Promise<BookConfig>; // 加载图书配置
  fetchBookDetails(book: Book, settings: SystemSettings): Promise<BookMetadata>; // 获取图书详细信息
  saveBookConfig(book: Book, config: BookConfig, settings?: SystemSettings): Promise<void>; // 保存图书配置
  loadBookContent(book: Book, settings: SystemSettings): Promise<BookContent>; // 加载图书内容
  loadLibraryBooks(): Promise<Book[]>; // 加载图书馆所有图书
  saveLibraryBooks(books: Book[]): Promise<void>; // 保存图书馆图书列表
}
