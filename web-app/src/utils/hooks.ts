import { Toast } from 'antd-mobile';
import Cookies from 'js-cookie';
import { useContext, useMemo } from 'react';

import { RootContextData } from '../store/ContextApp';
import { postHandle } from './fetch';

const { show: ToastShow } = Toast;

const useLoadingCb = () => {
  const { dispatch } = useContext(RootContextData);
  const loadingCb = useMemo(
    () => ({
      beforeCb: () => dispatch({ type: 'isLoading', payload: true }),
      resolveCb: () => dispatch({ type: 'isLoading', payload: false }),
      rejectCb: () => dispatch({ type: 'isLoading', payload: false }),
    }),
    [dispatch],
  );
  return loadingCb;
};

const useLogout = () => {
  const { userInfo, setUserInfo, dispatch } = useContext(RootContextData);
  const loadingCb = useLoadingCb();

  return async () => {
    const { err } = await postHandle('logout', userInfo, loadingCb);
    if (err) {
      return;
    }
    dispatch({ type: 'isLogin', payload: false });
    setUserInfo(null);
    ToastShow({
      icon: 'success',
      content: '请重新登录',
    });
  };
};

export { useLoadingCb, useLogout };
