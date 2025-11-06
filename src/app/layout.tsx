import * as React from 'react';
// 导入环境上下文提供者组件，用于管理应用的环境配置
import { EnvProvider } from '@/context/EnvContext';
// 导入全局样式文件
import '../styles/globals.css';

export default function rootLayout({ children }: React.PropsWithChildren) {
  return (
    <html>
      <head></head>
      <body>
        <EnvProvider>{children}</EnvProvider>
      </body>
    </html>
  );
}
