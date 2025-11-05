'use client';

import clsx from 'clsx';
import * as React from 'react';
import { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import { ReadonlyURLSearchParams, useRouter, useSearchParams } from 'next/navigation';

const LibraryPageWithSearchParams = () => {
  const searchParams = useSearchParams();
  return <LibraryPageContent searchParams={searchParams} />;
};

const LibraryPageContent = ({ searchParams }: { searchParams: ReadonlyURLSearchParams | null }) => {
  return (
    <div className={clsx('h-[100vh]', 'data-[page=library]:bg-base-200')}>
      <div className='container mx-auto px-4'>
        <div className='flex justify-between items-center'>
          <h1 className='text-3xl font-bold'>Library</h1>
        </div>
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