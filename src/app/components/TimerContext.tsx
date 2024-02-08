'use client'

import { signOut, useSession } from 'next-auth/react';
import { createContext, useContext, useEffect, useState } from 'react';
import { signOutHandler } from '../utils/utils';

// const TimerContext = createContext();
const TimerContext = createContext({
  startTimer: (duration: number, notifyBeforeTimeoutInMinutes: number) => {},
  resetTimer: () => {},
  count: 0,
  running: false,
  showNotification: false
});

type TimerProviderProps = {
  children: string | JSX.Element | JSX.Element[] | React.ReactNode
}

export function TimerProvider({ children }: TimerProviderProps) {
  const [count, setCount] = useState<number>(0);
  const [running, setRunning] = useState<boolean>(false);
  const [notifyBeforeTimeoutInMinutes, setNotifyBeforeTimeoutInMinutes] = useState<number>(120);
  const [showNotification, setShowNotification] = useState<boolean>(false)

  const { data: sessionData } = useSession();

  useEffect(() => {
    let secondTimer: any;
    let minuteTimer: any;
    let tempCount = count;

    if (running && count > 0) {
      secondTimer = setInterval(() => {
        tempCount -= 1;
        if (tempCount <= notifyBeforeTimeoutInMinutes) {
          if (tempCount % 60 === 0 || tempCount < 2) {
            setCount(tempCount)
          }
        }
      }, 1000);
    }

    if (count <= notifyBeforeTimeoutInMinutes && !showNotification && running) {
      setShowNotification(true)
    }

    if (count <= 0 && running) {
      clearInterval(secondTimer);
      clearInterval(minuteTimer);
      signOutClickHandle()
    }

    return () => {
      clearInterval(secondTimer);
      clearInterval(minuteTimer);
    };
  }, [running, count]);

  const startTimer = (duration: number, notifyBeforeTimeoutInMinutes: number) => {
    setRunning(true);
    setCount(prev => (prev === duration ? duration + 1 : duration))
    setNotifyBeforeTimeoutInMinutes(notifyBeforeTimeoutInMinutes)
  };

  const resetTimer = () => {
    setRunning(false);
    setCount(0);
    setShowNotification(false)
  };

  const signOutClickHandle = async () => {
    resetTimer()
    const redirectTo = await signOutHandler({accessToken: sessionData?.user?.accessToken, cookies: sessionData?.user?.cookies})
    signOut({callbackUrl: redirectTo})
  }

  return (
    <TimerContext.Provider value={{ count, running, startTimer, resetTimer, showNotification }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  return useContext(TimerContext);
}
