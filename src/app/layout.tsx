import * as React from 'react';
// 导入环境上下文提供者组件，用于管理应用的环境配置
import { EnvProvider } from '@/context/EnvContext';
// 导入全局样式文件
import '../styles/globals.css';

export default function rootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang='en'>
      <head>
        <meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover' />
      </head>
      <body>
        <EnvProvider>{children}</EnvProvider>
      </body>
    </html>
  );
}
