// 导入Tauri API相关功能
import { invoke } from '@tauri-apps/api/core';
// 导入应用服务类型定义
import { AppService } from '@/types/system';
// 导入Zustand的create函数用于创建状态管理store
import { create } from 'zustand';

// 窗口控制按钮的水平内边距
const WINDOW_CONTROL_PAD_X = 10.0;
// 窗口控制按钮的垂直内边距
const WINDOW_CONTROL_PAD_Y = 22.0;

// 交通灯（窗口控制按钮）状态接口定义
interface TrafficLightState {
  // 应用服务实例，可选
  appService?: AppService;
  // 交通灯是否可见
  isTrafficLightVisible: boolean;
  // 是否应该显示交通灯
  shouldShowTrafficLight: boolean;
  // 交通灯是否在全屏模式下
  trafficLightInFullscreen: boolean;
  // 初始化交通灯状态管理
  initializeTrafficLightStore: (appService: AppService) => void;
  // 设置交通灯可见性
  setTrafficLightVisibility: (visible: boolean, position?: { x: number; y: number }) => void;
  // 初始化交通灯相关事件监听器
  initializeTrafficLightListeners: () => Promise<void>;
  // 清理交通灯相关事件监听器
  cleanupTrafficLightListeners: () => void;
  // 退出全屏模式的事件监听器清理函数
  unlistenExitFullScreen?: () => void;
  // 进入全屏模式的事件监听器清理函数
  unlistenEnterFullScreen?: () => void;
}

// 创建交通灯状态管理store
export const useTrafficLightStore = create<TrafficLightState>((set, get) => {
  return {
    // 初始状态
    appService: undefined,
    isTrafficLightVisible: false,
    shouldShowTrafficLight: false,
    trafficLightInFullscreen: false,

    // 初始化交通灯状态管理
    initializeTrafficLightStore: (appService: AppService) => {
        set({
            appService: appService,
            isTrafficLightVisible: appService.hasTrafficLight,
            shouldShowTrafficLight: appService.hasTrafficLight,
        })
    },

    // 设置交通灯可见性函数
    setTrafficLightVisibility: async (visible: boolean, position?: { x: number; y: number }) => {
      // 动态导入窗口API以避免不必要的初始化开销
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const currentWindow = getCurrentWindow();
      // 检查当前窗口是否处于全屏模式
      const isFullscreen = await currentWindow.isFullscreen();
      
      // 更新状态
      set({
        isTrafficLightVisible: !isFullscreen && visible,
        shouldShowTrafficLight: visible,
        trafficLightInFullscreen: isFullscreen,
      });
      
      // 调用Tauri后端函数设置交通灯可见性和位置
      invoke('set_traffic_lights', {
        visible: visible,
        x: position?.x ?? WINDOW_CONTROL_PAD_X,
        y: position?.y ?? WINDOW_CONTROL_PAD_Y,
      });
    },

    // 初始化交通灯相关事件监听器
    initializeTrafficLightListeners: async () => {
      // 动态导入窗口API
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const currentWindow = getCurrentWindow();

      // 监听进入全屏模式事件
      const unlistenEnterFullScreen = await currentWindow.listen('will-enter-fullscreen', () => {
        // 进入全屏时隐藏交通灯
        set({ isTrafficLightVisible: false, trafficLightInFullscreen: true });
      });

      // 监听退出全屏模式事件
      const unlistenExitFullScreen = await currentWindow.listen('will-exit-fullscreen', () => {
        const { shouldShowTrafficLight } = get();
        // 退出全屏时根据shouldShowTrafficLight状态决定是否显示交通灯
        set({ isTrafficLightVisible: shouldShowTrafficLight, trafficLightInFullscreen: false });
      });

      // 保存事件监听器清理函数，以便后续可以清理它们
      set({ unlistenEnterFullScreen, unlistenExitFullScreen });
    },

    // 清理交通灯相关事件监听器
    cleanupTrafficLightListeners: () => {
      const { unlistenEnterFullScreen, unlistenExitFullScreen } = get();
      // 清理进入全屏模式的事件监听器
      if (unlistenEnterFullScreen) unlistenEnterFullScreen();
      // 清理退出全屏模式的事件监听器
      if (unlistenExitFullScreen) unlistenExitFullScreen();
      // 重置监听器清理函数状态
      set({ unlistenEnterFullScreen: undefined, unlistenExitFullScreen: undefined });
    },
  }
});