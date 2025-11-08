import clsx from 'clsx';
import React, { useState, isValidElement, ReactElement, ReactNode, useRef } from 'react';
import { Overlay } from './Overlay';
import MenuItem from './MenuItem';

/**
 * Dropdown 组件的属性接口
 * @property {string} label - 下拉菜单的辅助功能标签
 * @property {string} [className] - 下拉菜单容器的 CSS 类名
 * @property {string} [menuClassName] - 菜单内容的 CSS 类名
 * @property {string} [buttonClassName] - 切换按钮的 CSS 类名
 * @property {React.ReactNode} toggleButton - 切换按钮的内容
 * @property {ReactElement} children - 下拉菜单的内容，需要包含 setIsDropdownOpen 属性
 * @property {(isOpen: boolean) => void} [onToggle] - 下拉菜单状态变化的回调函数
 */
interface DropdownProps {
  label: string;
  className?: string;
  menuClassName?: string;
  buttonClassName?: string;
  toggleButton: React.ReactNode;
  children: ReactElement<{
    setIsDropdownOpen: (isOpen: boolean) => void;
    menuClassName?: string;
    children: ReactNode;
  }>;
  onToggle?: (isOpen: boolean) => void;
}

/**
 * 增强菜单项：为所有 MenuItem 组件添加 setIsDropdownOpen 属性
 * @param {ReactNode} children - 需要处理的子节点
 * @param {(isOpen: boolean) => void} setIsDropdownOpen - 设置下拉菜单状态的函数
 * @returns {ReactNode} 处理后的子节点
 */
const enhanceMenuItems = (children: ReactNode, setIsDropdownOpen: (isOpen: boolean) => void): ReactNode => {
  /**
   * 递归处理单个节点
   * @param {ReactNode} node - 需要处理的节点
   * @returns {ReactNode} 处理后的节点
   */
  const processNode = (node: ReactNode): ReactNode => {
    // 如果不是有效的 React 元素，直接返回
    if (!isValidElement(node)) {
      return node;
    }

    const element = node as ReactElement;
    // 检查是否为 MenuItem 组件
    const isMenuItem = element.type === MenuItem || (typeof element.type === 'function' && element.type.name === 'MenuItem');

    // 如果是 MenuItem，为其添加 setIsDropdownOpen 属性
    const clonedElement = isMenuItem
      ? React.cloneElement(element, {
          setIsDropdownOpen,
          ...element.props,
        })
      : element;

    // 如果元素有子节点，递归处理子节点
    if (clonedElement.props?.children) {
      return React.cloneElement(clonedElement, {
        ...clonedElement.props,
        children: React.Children.map(clonedElement.props.children, processNode),
      });
    }

    return clonedElement;
  };

  // 处理所有子节点
  return React.Children.map(children, processNode);
};

/**
 * Dropdown 组件 - 可访问的下拉菜单组件
 * 支持键盘导航、触摸事件和辅助功能
 */
const Dropdown: React.FC<DropdownProps> = ({ label, className, menuClassName, buttonClassName, toggleButton, children, onToggle }) => {
  // 状态管理
  const [isOpen, setIsOpen] = useState(false); // 下拉菜单是否打开
  const [isFocused, setIsFocused] = useState(false); // 组件是否获得焦点

  // 引用管理
  const lastInteractionWasTapOrClick = useRef(false); // 记录最后一次交互是否为点击/触摸
  const containerRef = useRef<HTMLDivElement>(null); // 容器元素的引用

  /**
   * 设置下拉菜单的打开状态
   * @param {boolean} open - 是否打开下拉菜单
   */
  const setIsDropdownOpen = (open: boolean) => {
    setIsOpen(open);
    onToggle?.(open); // 调用外部回调函数
  };

  /**
   * 处理触摸或点击事件
   * 标记最后一次交互为点击/触摸，用于区分键盘焦点
   */
  const handleTouchOrClick = () => {
    lastInteractionWasTapOrClick.current = true;
    // 100ms 后重置标记，避免影响后续的键盘焦点事件
    setTimeout(() => (lastInteractionWasTapOrClick.current = false), 100);
  };

  /**
   * 处理焦点事件
   * 当通过键盘或辅助功能获得焦点时打开下拉菜单
   */
  const handleFocus = () => {
    setIsFocused(true);
    // 跳过触摸和指针触发的焦点，这仅用于键盘和辅助功能导航
    if (!lastInteractionWasTapOrClick.current) {
      setIsDropdownOpen(true);
    }
  };

  /**
   * 切换下拉菜单的打开状态
   */
  const toggleDropdown = () => {
    setIsFocused(!isOpen);
    setIsDropdownOpen(!isOpen);
  };

  /**
   * 处理失去焦点事件
   * 当焦点离开组件时关闭下拉菜单
   */
  const handleBlur = (e: React.FocusEvent) => {
    if (!containerRef.current) return;
    // 检查焦点是否移到了组件外部
    if (!containerRef.current.contains(e.relatedTarget as Node)) {
      setIsFocused(false);
      setIsDropdownOpen(false);
    }
  };

  /**
   * 处理键盘事件
   * 支持 Enter/Space 打开菜单，Escape 关闭菜单
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Enter 或 Space 键打开下拉菜单
      if (!isOpen) setIsDropdownOpen(true);
      e.stopPropagation(); // 阻止事件冒泡
    } else if (e.key === 'Escape') {
      // Escape 键关闭下拉菜单
      setIsDropdownOpen(false);
      e.stopPropagation(); // 阻止事件冒泡
    }
  };

  /**
   * 为子组件添加下拉菜单控制功能
   * 如果是 React 元素，为其添加 setIsDropdownOpen 和 menuClassName 属性
   */
  const childrenWithToggle = isValidElement(children)
    ? React.cloneElement(children, {
        // 只为非原生 HTML 元素添加自定义属性
        ...(typeof children.type !== 'string' && {
          setIsDropdownOpen,
          menuClassName,
        }),
        // 增强所有子菜单项
        children: enhanceMenuItems(children.props?.children, setIsDropdownOpen),
      })
    : children;

  return (
    <div className='dropdown-container flex'>
      {isOpen && <Overlay onDismiss={() => setIsDropdownOpen(false)} />}
      <div ref={containerRef} role='menu' tabIndex={-1} onBlur={handleBlur} onKeyDown={handleKeyDown} className={clsx('dropdown flex flex-col', className)}>
        <button aria-haspopup='menu' aria-expanded={isOpen} aria-label={label} title={label} className={clsx('dropdown-toggle', isFocused && isOpen && 'bg-base-300/50', buttonClassName)} onTouchStart={handleTouchOrClick} onPointerDown={handleTouchOrClick} onFocus={handleFocus} onClick={toggleDropdown}>
          {toggleButton}
        </button>
        <div role='none' className={clsx('flex items-center justify-center')}>
          {isOpen && childrenWithToggle}
        </div>
      </div>
    </div>
  );
};

export default Dropdown;
