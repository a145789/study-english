import { Toast } from 'antd-mobile';
import qs from 'qs';

import { ResponseCode } from '../constants';

interface Response<T> {
  code: ResponseCode;
  data: T;
  message: string;
}

interface CallBackType<T> {
  beforeCb?: () => void;
  resolveCb?: (data: T) => void;
  rejectCb?: () => void;
}

const TIME_OUT = 6500; // 超时时间

const fetchHandle = async <T = any>(
  url: string,
  method: 'POST' | 'GET',
  params?: any,
  callback?: CallBackType<T>,
) => {
  const { beforeCb, resolveCb, rejectCb } = callback || {};
  beforeCb?.();
  const headers = {
    'Content-Type': 'application/json;charset=UTF-8',
    Accept: 'application/json',
    credentials: 'same-origin',
  };

  const options: { [key: string]: any } = {
    method,
    headers,
  };
  if (params && method === 'GET') {
    url = url + '?' + qs.stringify(params);
  }
  if (params && method === 'POST') {
    options.body = JSON.stringify(params);
  }

  const response = await Promise.race([
    new Promise<Response<T>>((resolve, reject) => {
      setTimeout(() => {
        resolve({
          code: ResponseCode.timeout,
          message: '请求超时',
          data: null as any,
        });
      }, TIME_OUT);
    }),
    new Promise<Response<T>>((resolve, reject) => {
      fetch(`/api/${url}`, options).then(
        async (responseJson) => {
          resolve(await responseJson.json());
        },
        (error) => {
          reject(error);
        },
      );
    }),
  ]);

  const { code, data, message } = response;

  let err = false;
  if (code !== ResponseCode.success) {
    if (code === ResponseCode.unLogin) {
      Toast.show({
        icon: 'fail',
        content: message || '登录过期',
      });
    } else {
      Toast.show({
        icon: 'fail',
        content: message || '系统错误',
      });
    }
    err = true;
    rejectCb?.();
  }
  if (!err) {
    resolveCb?.(data);
  }
  return { err, code, data };
};

const postHandle = <T>(url: string, data?: any, callback?: CallBackType<T>) =>
  fetchHandle<T>(url, 'POST', data, callback);
const getHandle = <T>(url: string, data?: any, callback?: CallBackType<T>) =>
  fetchHandle<T>(url, 'GET', data, callback);

export { getHandle, postHandle };
