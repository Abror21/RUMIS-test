'use client';

import { useSearchParams } from 'next/navigation';
import NextTopLoader from 'nextjs-toploader';
import nProgress from 'nprogress';
import { useEffect } from 'react';

const NextProgressBar = ({ children }: { children: React.ReactNode }) => {
    const searchParams = useSearchParams();
    
    useEffect(() => {
        window.addEventListener("popstate", () => {
            nProgress.start()
        });
    }, [])
    useEffect(() => {
        nProgress.done()
    }, [searchParams])

    return (
        <>
            <NextTopLoader showSpinner={false} />
            {children}
        </>
    );
};

export default NextProgressBar;