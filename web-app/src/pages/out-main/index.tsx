import { Button, NavBar, TabBar, Toast } from 'antd-mobile';
import { AppOutline } from 'antd-mobile-icons';
import Cookies from 'js-cookie';
import React, { memo, useContext, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { ContextData } from '../../store/ContextApp';
import { getLoadingCb } from '../../utils';
import { postHandle } from '../../utils/fetch';
import classes from './index.module.css';

const { Item: TabBarItem } = TabBar;
const { show: ToastShow } = Toast;

const OutMain = memo(function OutMain() {
  return (
    <>
      <MainNavBar />
      <div className={classes.center}>
        <Outlet />
      </div>
      <MainTabBar />
    </>
  );
});

function MainNavBar() {
  const {
    navBar: { title, backArrow, onBack, right },
    isLogin,
    dispatch,
  } = useContext(ContextData);
  const navigate = useNavigate();

  const loadingCb = getLoadingCb(dispatch);

  const logHandle = async () => {
    const userInfo = JSON.parse(Cookies.get('userInfo') || 'null');
    if (!isLogin || !userInfo) {
      navigate('/login');
    } else {
      const { err } = await postHandle('logout', userInfo, loadingCb);
      if (err) {
        return;
      }
      Cookies.remove('userInfo');
      dispatch({ type: 'isLogin', payload: false });
      dispatch({ type: 'userInfo', payload: null });
      ToastShow({
        icon: 'success',
        content: '退出成功',
      });
    }
  };

  useEffect(() => {
    dispatch({
      type: 'navBar',
      payload: {
        title,
        backArrow,
        onBack,
        right: (
          <Button color="primary" fill="none" onClick={() => logHandle()}>
            {isLogin ? '退出' : '登录'}
          </Button>
        ),
      },
    });
  }, [isLogin]);
  return (
    <NavBar
      className={classes.nav_bar}
      backArrow={backArrow}
      onBack={onBack}
      right={right}>
      {title}
    </NavBar>
  );
}

function MainTabBar() {
  const { isShowTabBar } = useContext(ContextData);

  return isShowTabBar ? (
    <TabBar safeArea className={classes.tab_bar}>
      {[<TabBarItem key="Home" icon={<AppOutline />} title="首页" />]}
    </TabBar>
  ) : null;
}

export default OutMain;
