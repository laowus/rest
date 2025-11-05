import * as React from 'react';
// 导入全局样式文件
import '../styles/globals.css';

export default function rootLayout({ children }: React.PropsWithChildren) {
  return (
    <html>
      <head></head>
      <body>{children}</body>
    </html>
  );
}
