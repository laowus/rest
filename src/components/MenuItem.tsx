import React from 'react';
import clsx from 'clsx';
import { IconType } from 'react-icons';
import { MdCheck } from 'react-icons/md';
import { useTranslation } from '@/hooks/useTranslation';
import { useResponsiveSize } from '@/hooks/useResponsiveSize';

/**
 * 菜单项组件的属性接口定义
 */
interface MenuItemProps {
  // 菜单项显示的标签文本
  label: string;
  // 菜单项的切换状态，用于表示开关类型的菜单项
  toggled?: boolean;
  // 菜单项的描述文本，显示在标签下方
  description?: string;
  // 鼠标悬停时显示的提示文本
  tooltip?: string;
  // 应用到按钮上的CSS类名
  buttonClass?: string;
  // 应用到标签上的CSS类名
  labelClass?: string;
  // 显示的快捷键文本
  shortcut?: string;
  // 是否禁用菜单项
  disabled?: boolean;
  // 是否不显示图标
  noIcon?: boolean;
  // 是否为瞬态菜单项，点击后自动关闭下拉菜单
  transient?: boolean;
  // 菜单项的图标组件或React节点
  Icon?: React.ReactNode | IconType;
  // 图标组件的CSS类名
  iconClassName?: string;
  // 子菜单内容
  children?: React.ReactNode;
  // 点击菜单项时触发的回调函数
  onClick?: () => void;
  // 设置下拉菜单打开状态的函数
  setIsDropdownOpen?: (isOpen: boolean) => void;
}

/**
 * 菜单项组件
 * 支持普通菜单项、带切换状态的菜单项、带子菜单的菜单项
 */
const MenuItem: React.FC<MenuItemProps> = ({ label, toggled, description, tooltip, buttonClass, labelClass, shortcut, disabled, noIcon = false, transient = false, Icon, iconClassName, children, onClick, setIsDropdownOpen }) => {
  // 翻译钩子，用于获取翻译文本
  const _ = useTranslation();
  // 根据屏幕尺寸获取响应式图标大小
  const iconSize = useResponsiveSize(16);
  // 确定要显示的图标类型，如果没有指定图标且有切换状态，则使用对勾图标
  const IconType = Icon || (toggled !== undefined ? (toggled ? MdCheck : undefined) : undefined);

  /**
   * 处理菜单项点击事件
   * 触发onClick回调，并在瞬态菜单项情况下关闭下拉菜单
   */
  const handleClick = () => {
    onClick?.();
    if (transient) {
      setIsDropdownOpen?.(false);
    }
  };

  /**
   * 菜单项按钮的内容部分
   * 包含图标、标签、描述和快捷键
   */
  const buttonContent = (
    <>
      <div className='flex w-full items-center justify-between'>
        <div className='flex min-w-0 items-center'>
          {/* 显示图标（如果有） */}
          {!noIcon && <span style={{ minWidth: `${iconSize}px` }}>{typeof IconType === 'function' ? <IconType className={clsx(disabled ? 'text-gray-400' : 'text-base-content', iconClassName)} size={iconSize} /> : IconType}</span>}
          {/* 显示标签 */}
          <span className={clsx('mx-2 flex-1 truncate text-base sm:text-sm', labelClass)} style={{ minWidth: 0 }}>
            {label}
          </span>
        </div>
        {/* 显示快捷键（如果有） */}
        {shortcut && <kbd className={clsx('hidden rounded-md border border-base-300/40 bg-base-300/75 shadow-sm sm:flex', 'shrink-0 px-1.5 py-0.5 text-xs font-medium', disabled ? 'text-gray-400' : 'text-neutral-content')}>{shortcut}</kbd>}
      </div>
      {/* 显示描述（如果有） */}
      <div className='flex w-full'>
        {description && (
          <span className='mt-1 truncate text-start text-xs text-gray-500' style={{ minWidth: 0, paddingInlineStart: noIcon ? '0' : `${iconSize + 8}px` }}>
            {description}
          </span>
        )}
      </div>
    </>
  );

  // 带子菜单的情况
  if (children) {
    return (
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
      <ul className='menu m-0 rounded-box p-0' role='menuitem' tabIndex={-1}>
        <li aria-label={label}>
          <details>
            <summary className={clsx('cursor-pointer rounded-md p-1 py-[10px] pr-3 text-base-content hover:bg-base-300', disabled && 'btn-disabled cursor-not-allowed text-gray-400', buttonClass)} title={tooltip ? tooltip : ''}>
              {buttonContent}
            </summary>
            {children}
          </details>
        </li>
      </ul>
    );
  }

  // 普通菜单项情况
  return (
    <button role={disabled ? 'none' : 'menuitem'} aria-label={toggled !== undefined ? `${label} - ${toggled ? _('ON') : _('OFF')}` : undefined} aria-live={toggled === undefined ? 'polite' : 'off'} tabIndex={disabled ? -1 : 0} className={clsx('flex w-full flex-col items-center justify-center rounded-md p-1 py-[10px] text-base-content hover:bg-base-300', disabled && 'btn-disabled text-gray-400', buttonClass)} title={tooltip ? tooltip : ''} onClick={handleClick} disabled={disabled}>
      {buttonContent}
    </button>
  );
};

export default MenuItem;
