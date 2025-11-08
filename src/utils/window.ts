import { getCurrentWindow } from '@tauri-apps/api/window';
import { emitTo, TauriEvent } from '@tauri-apps/api/event';
import { exit } from '@tauri-apps/plugin-process';
import { type as osType } from '@tauri-apps/plugin-os';
import { eventDispatcher } from './event';

/**
 * 获取窗口的逻辑位置
 * 逻辑位置是考虑了显示器缩放因素的位置坐标
 * @returns 包含x和y坐标的对象
 */
export const tauriGetWindowLogicalPosition = async () => {
  const currentWindow = getCurrentWindow();
  // 获取显示器的缩放因子
  const factor = await currentWindow.scaleFactor();
  // 获取物理位置（未考虑缩放）
  const physicalPos = await currentWindow.outerPosition();
  // 计算逻辑位置并返回
  return { x: physicalPos.x / factor, y: physicalPos.y / factor };
};

/**
 * 处理窗口最小化操作
 */
export const tauriHandleMinimize = async () => {
  getCurrentWindow().minimize();
};

/**
 * Linux系统下的工作区，用于在切换全屏/最大化时重置透明背景
 * 这是一个解决Linux系统下透明背景渲染问题的临时方案
 */
const linuxWindowRestoreTransparentBg = async () => {
  const currentWindow = await getCurrentWindow().innerSize();
  // 缩小窗口尺寸1像素
  currentWindow.width -= 1;
  currentWindow.height -= 1;
  await getCurrentWindow().setSize(currentWindow);

  // 100毫秒后恢复原始尺寸，触发重绘以解决透明背景问题
  setTimeout(async () => {
    const currentWindow = await getCurrentWindow().innerSize();
    currentWindow.width += 1;
    currentWindow.height += 1;
    await getCurrentWindow().setSize(currentWindow);
  }, 100);
};

/**
 * 处理窗口最大化/还原切换操作
 */
export const tauriHandleToggleMaximize = async () => {
  const currentWindow = getCurrentWindow();
  const isFullscreen = await currentWindow.isFullscreen();

  // 如果当前是全屏状态，则先退出全屏再取消最大化
  if (isFullscreen) {
    await currentWindow.setFullscreen(false);
    await currentWindow.unmaximize();
  } else {
    // 切换窗口的最大化状态
    await currentWindow.toggleMaximize();
  }

  // 对于Linux系统，执行透明背景修复
  if ((await osType()) === 'linux') {
    linuxWindowRestoreTransparentBg();
  }
};

/**
 * 处理窗口关闭操作
 */
export const tauriHandleClose = async () => {
  getCurrentWindow().close();
};

/**
 * 处理窗口关闭请求事件
 * @param callback 窗口关闭前要执行的回调函数
 * @returns 事件监听器对象，可用于后续移除监听
 */
export const tauriHandleOnCloseWindow = async (callback: () => void) => {
  const currentWindow = getCurrentWindow();

  // 监听窗口关闭请求事件
  return currentWindow.listen(TauriEvent.WINDOW_CLOSE_REQUESTED, async () => {
    // 执行用户提供的回调函数
    await callback();

    // 根据窗口标签执行不同的关闭逻辑
    if (currentWindow.label.startsWith('reader')) {
      // 如果是阅读器窗口，向主窗口发送关闭信号，延迟300毫秒后销毁窗口
      await emitTo('main', 'close-reader-window', { label: currentWindow.label });
      setTimeout(() => currentWindow.destroy(), 300);
    } else if (currentWindow.label === 'main') {
      // 如果是主窗口，直接销毁
      await currentWindow.destroy();
    }
  });
};

/**
 * 处理窗口全屏模式切换
 */
export const tauriHandleToggleFullScreen = async () => {
  const currentWindow = getCurrentWindow();
  const isFullscreen = await currentWindow.isFullscreen();
  const isMaximized = await currentWindow.isMaximized();

  // 如果当前是最大化状态，先取消最大化
  if (isMaximized) {
    await currentWindow.unmaximize();
  } else {
    // 切换全屏状态
    await currentWindow.setFullscreen(!isFullscreen);
  }

  // 对于Linux系统，执行透明背景修复
  if ((await osType()) === 'linux') {
    linuxWindowRestoreTransparentBg();
  }
};

/**
 * 设置窗口是否总在最上层显示
 * @param isAlwaysOnTop 是否总在最上层
 */
export const tauriHandleSetAlwaysOnTop = async (isAlwaysOnTop: boolean) => {
  const currentWindow = getCurrentWindow();
  await currentWindow.setAlwaysOnTop(isAlwaysOnTop);
};

/**
 * 获取窗口是否总在最上层显示的状态
 * @returns 当前窗口是否总在最上层
 */
export const tauriGetAlwaysOnTop = async () => {
  const currentWindow = getCurrentWindow();
  return await currentWindow.isAlwaysOnTop();
};

/**
 * 监听窗口获得焦点事件
 * @param callback 窗口获得焦点时要执行的回调函数
 * @returns 事件监听器对象，可用于后续移除监听
 */
export const tauriHandleOnWindowFocus = async (callback: () => void) => {
  const currentWindow = getCurrentWindow();

  // 监听窗口焦点事件
  return currentWindow.listen(TauriEvent.WINDOW_FOCUS, async () => {
    await callback();
  });
};

/**
 * 退出应用程序
 * 先触发quit-app事件，然后以退出码0正常退出
 */
export const tauriQuitApp = async () => {
  await eventDispatcher.dispatch('quit-app');
  await exit(0);
};
