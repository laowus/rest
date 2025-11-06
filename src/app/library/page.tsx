'use client';

import clsx from 'clsx';
import * as React from 'react';
import { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import { ReadonlyURLSearchParams, useRouter, useSearchParams } from 'next/navigation';
import LibraryHeader from './components/LibraryHeader';

const LibraryPageWithSearchParams = () => {
  const searchParams = useSearchParams();
  return <LibraryPageContent searchParams={searchParams} />;
};

const LibraryPageContent = ({ searchParams }: { searchParams: ReadonlyURLSearchParams | null }) => {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [isSelectNone, setIsSelectNone] = useState(false);
  return (
    <div aria-label='Your Library' className={clsx('library-page bg-base-200 text-base-content flex h-[100vh] flex-col overflow-hidden select-none')}>
      <div className='top-0 z-40 w-full' role='banner' tabIndex={-1} aria-label={'Library Header'}>
        <LibraryHeader isSelectMode={isSelectMode} isSelectAll={isSelectAll} onImportBooks={() => {}} onToggleSelectMode={() => {}} onSelectAll={() => {}} onDeselectAll={() => {}} />
      </div>
    </div>
  );
};

const LibraryPage = () => {
  return (
    <Suspense fallback={<div className='h-[100vh]' />}>
      <LibraryPageWithSearchParams />
    </Suspense>
  );
};

export default LibraryPage;
