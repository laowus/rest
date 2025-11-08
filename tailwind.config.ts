// 导入Tailwind配置类型定义
import type { Config } from 'tailwindcss';
// 导入自定义主题配置
import { themes } from './src/styles/themes';
// 导入daisyui插件 - 提供组件库和主题系统
import daisyui from 'daisyui';
// 导入typography插件 - 提供排版工具类
import typography from '@tailwindcss/typography';

// Tailwind配置对象
const config: Config = {
  // 内容路径配置 - Tailwind会在此路径下扫描并处理类名
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}', // 页面文件
    './src/components/**/*.{js,ts,jsx,tsx,mdx}', // 组件文件
    './src/app/**/*.{js,ts,jsx,tsx,mdx}', // 应用文件
  ],
  // 安全列表 - 指定总是生成的CSS类，即使未在代码中使用
  safelist: [
    { pattern: /bg-./ }, // 所有背景色类
    { pattern: /text-./ }, // 所有文本颜色类
    { pattern: /fill-./ }, // 所有填充色类
    { pattern: /decoration-./ }, // 所有装饰类
    { pattern: /tooltip-./ }, // 所有提示框类
  ],
  // 主题扩展配置
  theme: {
    extend: {
      // 自定义颜色变量
      colors: {
        background: 'var(--background)', // 背景色变量
        foreground: 'var(--foreground)', // 前景色变量
      },
    },
  },
  // 启用的Tailwind插件
  plugins: [daisyui, typography],
  // daisyui插件配置
  daisyui: {
    // 主题配置 - 通过reduce方法将自定义主题转换为daisyui所需的格式
    themes: themes.reduce(
      (acc, { name, colors }) => {
        // 为每个主题添加亮色版本
        acc.push({
          [`${name}-light`]: colors.light,
        });
        // 为每个主题添加暗色版本
        acc.push({
          [`${name}-dark`]: colors.dark,
        });
        return acc;
      },
      // 初始值 - 包含默认的light和dark主题
      ['light', 'dark'] as (Record<string, unknown> | string)[],
    ),
  },
};

// 导出配置对象
export default config;
