import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';
import { PiSelectionAllDuotone } from 'react-icons/pi';
import { PiDotsThreeCircle } from 'react-icons/pi';
import { MdOutlineMenu, MdArrowBackIosNew } from 'react-icons/md';
import { IoMdCloseCircle } from 'react-icons/io';
import { useResponsiveSize } from '@/hooks/useResponsiveSize';
import WindowButtons from '@/components/WindowButtons';
import { useTrafficLightStore } from '@/store/trafficLightStore';
import { useEnv } from '@/context/EnvContext';
import { useTranslation } from '@/hooks/useTranslation';
import Dropdown from '@/components/Dropdown';
import ViewMenu from './ViewMenu';

interface LibraryHeaderProps {
  isSelectMode: boolean;
  isSelectAll: boolean;
  onImportBooks: () => void;
  onToggleSelectMode: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

const LibraryHeader: React.FC<LibraryHeaderProps> = ({ isSelectMode, isSelectAll, onImportBooks, onToggleSelectMode, onSelectAll, onDeselectAll }) => {
  const _ = useTranslation();
  const searchParams = useSearchParams();
  const { appService } = useEnv();
  const { isTrafficLightVisible, initializeTrafficLightStore, initializeTrafficLightListeners, setTrafficLightVisibility, cleanupTrafficLightListeners } = useTrafficLightStore();

  useEffect(() => {
    if (!appService?.hasTrafficLight) return;

    initializeTrafficLightStore(appService);
    initializeTrafficLightListeners();
    setTrafficLightVisibility(true);
    return () => {
      cleanupTrafficLightListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appService?.hasTrafficLight]);

  const windowButtonVisible = appService?.hasWindowBar && !isTrafficLightVisible;
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') ?? '');

  const isInGroupView = !!searchParams?.get('group');

  const headerRef = useRef<HTMLDivElement>(null);
  const iconSize18 = useResponsiveSize(18);
  const iconSize20 = useResponsiveSize(20);

  return (
    <div
      ref={headerRef}
      className={clsx(
        'titlebar z-10 flex h-[52px] w-full items-center py-2 pr-4 sm:h-[48px]', // 基础样式
        windowButtonVisible ? 'sm:pr-4' : 'sm:pr-6', // 根据窗口按钮可见性调整右边距
        isTrafficLightVisible ? 'pl-16' : 'pl-0 sm:pl-2', // 根据交通灯可见性调整左边距
      )}
      style={{
        // 设置顶部边距，适应安全区域和系统UI
        marginTop: '0px',
      }}
    >
      <div className='flex w-full items-center justify-between space-x-6 sm:space-x-12'>
        <div className='exclude-title-bar-mousedown relative flex w-full items-center pl-4'>
          {isInGroupView && (
            <button className='ml-[-6px] mr-4 flex h-7 min-h-7 w-7 items-center p-0'>
              <div className='lg:tooltip lg:tooltip-bottom' data-tip={'返回'}>
                <MdArrowBackIosNew size={iconSize20} />
              </div>
            </button>
          )}
          <div className='relative flex h-9 w-full items-center sm:h-7'>
            <span className='absolute left-3 text-gray-500'>
              <FaSearch className='h-4 w-4' />
            </span>
            <input type='text' spellCheck='false' className={clsx('input h-9 w-full rounded-badge bg-base-300/45 pl-10 pr-10 sm:h-7', 'font-sans text-sm font-light', 'border-none focus:outline-none focus:ring-0')} />
          </div>
          <div className='absolute right-4 flex items-center space-x-2 text-gray-500 sm:space-x-4'>
            {searchQuery && (
              <button type='button' className='pe-1 text-gray-400 hover:text-gray-600' aria-label={'清除搜索'}>
                <IoMdCloseCircle className='h-4 w-4' />
              </button>
            )}
            <span className='mx-2 h-4 w-[0.5px] bg-base-content/50'></span>
            {appService?.isMobile ? null : (
              <button onClick={onToggleSelectMode} aria-label={'选择书籍'} title={'选择书籍'} className='h-6'>
                <PiSelectionAllDuotone role='button' className={`h-6 w-6 ${isSelectMode ? 'fill-gray-400' : 'fill-gray-500'}`} />
              </button>
            )}
          </div>
        </div>
        {isSelectMode ? (
          <div className={clsx('flex h-full items-center', 'w-max-[72px] w-min-[72px] sm:w-max-[80px] sm:w-min-[80px]')}>
            <button onClick={isSelectAll ? onDeselectAll : onSelectAll} className='btn btn-ghost h-8 min-h-8 w-[72px] p-0 text-base-content/85 sm:w-[80px]' aria-label={isSelectAll ? _('Deselect') : _('Select All')}>
              <span className='font-sans text-base font-normal sm:text-sm'>{isSelectAll ? _('Deselect') : _('Select All')}</span>
            </button>
          </div>
        ) : (
          <div className='flex h-full items-center gap-x-2 sm:gap-x-4'>
            <Dropdown label={_('View Menu')} className='exclude-title-bar-mousedown dropdown-end dropdown-bottom' buttonClassName='btn btn-ghost h-8 min-h-8 w-8 p-0' toggleButton={<PiDotsThreeCircle role='none' size={String(iconSize18)} />}>
              <ViewMenu />
            </Dropdown>
            {appService?.hasWindowBar && <WindowButtons headerRef={headerRef} showMinimize={windowButtonVisible} showMaximize={windowButtonVisible} showClose={windowButtonVisible} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryHeader;
