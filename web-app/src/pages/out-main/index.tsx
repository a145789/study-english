import { Button, NavBar, TabBar } from 'antd-mobile';
import { AppOutline } from 'antd-mobile-icons';
import React, { memo, useContext, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { RootContextData } from '../../store/ContextApp';
import { useLogout } from '../../utils/hooks';
import classes from './index.module.css';

const { Item: TabBarItem } = TabBar;

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
    userInfo,
    dispatch,
  } = useContext(RootContextData);
  const navigate = useNavigate();
  const logout = useLogout();

  const logHandle = async () => {
    if (!isLogin || !userInfo) {
      navigate('/login');
    } else {
      logout();
    }
  };

  useEffect(() => {
    dispatch({
      type: 'navBar',
      payload: {
        title,
        backArrow,
        onBack,
        right: true,
      },
    });
  }, [isLogin]);
  return (
    <NavBar
      className={classes.nav_bar}
      backArrow={backArrow}
      onBack={onBack}
      right={
        <Button
          color="primary"
          fill="none"
          style={{ display: right ? '' : 'none' }}
          onClick={() => logHandle()}>
          {isLogin ? '退出' : '登录'}
        </Button>
      }>
      {title}
    </NavBar>
  );
}

function MainTabBar() {
  const { isShowTabBar, isLogin } = useContext(RootContextData);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const tabBarChange = (key: string) => {
    navigate(key);
  };

  return isShowTabBar ? (
    <TabBar
      safeArea
      activeKey={pathname}
      className={classes.tab_bar}
      onChange={tabBarChange}>
      <TabBarItem key="/" icon={<AppOutline />} title="首页" />
      {isLogin && <TabBarItem key="/mine" icon={<AppOutline />} title="我的" />}
    </TabBar>
  ) : null;
}

export default OutMain;
