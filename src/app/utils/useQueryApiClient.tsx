import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

import useHandleError from '@/app/utils/useHandleError';
import { useTimer } from '../components/TimerContext';
import { signOutHandler } from './utils';

interface InvalidRequestResponse {
  status_code: number;
  message: string;
}

interface RequestProps {
  url: string;
  data?: any;
  method?: RequestMethod;
  mustRetry?: boolean;
  multipart?: boolean;
  enableOnMount?: boolean;
  disableOnMount?: boolean;
}

interface UseQueryApiClientProps {
  request: RequestProps;
  onSuccess?: (response: any) => void;
  onError?: (response: any) => void;
  onFinally?: () => void;
  enabled?: boolean;
  handleDefaultError?: boolean;
}

interface ErrorProps {
  [key: string]: string[] | string;
}

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// DON'T TOUCH IF YOU DON'T UNDERSTAND
function useQueryApiClient({
  request,
  onSuccess,
  onError,
  onFinally,
  enabled = true,
  handleDefaultError = true
}: UseQueryApiClientProps) {
  const method = request?.method || 'GET';
  const [receivedData, setReceivedData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(
    enabled ? method === 'GET' && !request?.disableOnMount : false,
  );
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const { count, running, startTimer, resetTimer } = useTimer();
  
  const { data: sessionData } = useSession();

  const [handleError] = useHandleError();

  const enableOnMount = request?.enableOnMount; // For methods except 'GET'
  const disableOnMount = request?.disableOnMount; // For method 'GET'

  useEffect(() => {
    // Enable or disable on mount fetch
    if (sessionData != undefined && !disableOnMount && (enableOnMount || method === 'GET')) {
      actualCall(
        request.url,
        request?.data,
        request?.method,
        request?.mustRetry,
        request?.multipart,
      );
    }
  }, [enabled, disableOnMount, enableOnMount]); // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = () => {
    setIsRefetching(true);
    actualCall(
      request.url,
      request?.data,
      method,
      request?.mustRetry,
      request?.multipart,
    );
  };

  const parsedError = (response: InvalidRequestResponse) => {
    return {
      status: response.status_code,
      message: response.message,
    };
  };

  const appendData = (data?: any, urlParams?: any) => {
    let { url } = request;

    if (urlParams) {
      Object.entries(urlParams).forEach((entry: any) => {
        const key = entry[0];
        const value = entry[1];
        url = url.replace(`:${key}`, value);
      });
    }

    actualCall(
      url,
      data,
      request?.method,
      request?.mustRetry,
      request?.multipart,
    );
  };

  const actualCall: any = async (
    url: string,
    data: any = {},
    method: RequestMethod = 'GET',
    mustRetry: boolean = true,
    multipart: boolean = false,
  ) => {
    if (!enabled) {
      return;
    }

    setIsLoading(true);

    const requestConfig: AxiosRequestConfig = {
      url,
      method,
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      responseType: multipart ? 'blob' : 'json',
      headers: {
        Authorization: `Bearer ${sessionData?.user?.accessToken}`,
        'Content-Type': multipart ? 'multipart/form-data' : 'application/json',
        'X-FRONTEND-ROUTE': window.location.pathname,
        'Profile': sessionData?.user?.profileToken
      },
      withCredentials: true
    };

    // set data in right place
    if (method === 'GET') {
      requestConfig.params = data;
      requestConfig.paramsSerializer = {
        indexes: null, // no brackets at all
      };
    } else {
      requestConfig.data = data;
    }
    try {
      // call request
      const response = await axios.request(requestConfig);

      const responseContent = response.data;

      // if status code is error type, throw error
      if (responseContent && responseContent.status_code > 299) {
        throw parsedError(responseContent);
      }

      const notifyBeforeTimeoutInMinutes = sessionData?.user?.notifyBeforeTimeoutInMinutes ?? 2
      const sessionIdleTimeoutInMinutes = sessionData?.user?.sessionIdleTimeoutInMinutes ?? 15
      startTimer(sessionIdleTimeoutInMinutes * 60, notifyBeforeTimeoutInMinutes * 60)

      setReceivedData(responseContent);
      setIsSuccess(true);
      onSuccess && onSuccess(responseContent); // Call onSuccess if set

      return responseContent;
    } catch (e: any) {
      const { response } = e;
      if (
        response &&
        (
          (response.status === 401) ||
          (response.status >= 401 && response.statusText === 'Unauthorized') ||
          (response.status === 403 && response?.data?.message === 'currentUserProfile.invalidTokenProvided')
        )
      ) {
        resetTimer();
        const redirectTo = await signOutHandler({accessToken: sessionData?.user?.accessToken, cookies: sessionData?.user?.cookies})
        signOut({callbackUrl: redirectTo})
      }
      
       setIsError(true);

      const actualError: ErrorProps =
        typeof response === 'object' && response.hasOwnProperty('data')
          ? (response.data as ErrorProps)
          : (e as ErrorProps);

      onError && onError(actualError); // Call onSuccess if set
      if (handleError && handleDefaultError) {
        if (actualError instanceof Blob) {
          handleError(JSON.parse(await actualError.text()));
        } else {
          handleError(actualError); // hook for global handling of errors
        }
      }

      throw actualError;
    } finally {
      onFinally && onFinally(); // Call onFinally if set
      setIsRefetching(false);
      setIsLoading(false);
    }
  };

  return {
    data: receivedData,
    isLoading,
    isSuccess,
    refetch,
    isError,
    isRefetching,
    appendData,
  };
}

export default useQueryApiClient;
