'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { EnvConfigType } from '../services/environment';
import { AppService } from '@/types/system';
import env from '../services/environment';

// 环境上下文类型定义
// 包含环境配置和应用服务两个核心属性
interface EnvContextType {
  envConfig: EnvConfigType; // 环境配置对象
  appService: AppService | null; // 应用服务实例，提供平台相关的功能实现
}

// 创建环境上下文
// 初始值设为undefined，表示上下文尚未提供
const EnvContext = createContext<EnvContextType | undefined>(undefined);

// 环境提供者组件
// 将环境配置和应用服务注入到React组件树中
export const EnvProvider = ({ children }: { children: ReactNode }) => {
  // 初始化环境配置状态
  const [envConfig] = useState<EnvConfigType>(env);
  // 初始化应用服务状态，默认为null
  const [appService, setAppService] = useState<AppService | null>(null);

  // 组件挂载时获取应用服务实例
  // 并添加全局错误事件监听器
  React.useEffect(() => {
    // 异步获取应用服务实例并设置到状态中
    envConfig.getAppService().then((service) => setAppService(service));

    // 添加全局错误事件监听器
    // 处理 ResizeObserver 循环限制超出的错误
    window.addEventListener('error', (e) => {
      if (e.message === 'ResizeObserver loop limit exceeded') {
        // 阻止错误继续传播
        e.stopImmediatePropagation();
        // 阻止默认行为
        e.preventDefault();
        return true;
      }
      return false;
    });
  }, [envConfig]);

  // 提供环境上下文值给子组件
  return <EnvContext.Provider value={{ envConfig, appService }}>{children}</EnvContext.Provider>;
};

// 环境上下文钩子
// 用于在组件中访问环境配置和应用服务
// 如果在EnvProvider外使用会抛出错误
export const useEnv = (): EnvContextType => {
  const context = useContext(EnvContext);
  if (!context) throw new Error('useEnv must be used within EnvProvider');
  return context;
};
