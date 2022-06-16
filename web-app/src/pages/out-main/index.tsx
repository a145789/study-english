import { Button, NavBar, TabBar } from 'antd-mobile';
import { AppOutline } from 'antd-mobile-icons';
import React, { memo, useContext, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { RootContextData } from '../../store/ContextApp';
import { useLogout } from '../../utils/hooks';
import Loading from '../loading';
import classes from './index.module.css';

const { Item: TabBarItem } = TabBar;

const OutMain = memo(function OutMain() {
  const { isLogin, darkMode, getUserInfo, dispatch } = useContext(RootContextData);
  const navigate = useNavigate();
  const logout = useLogout();

  useEffect(() => {
    if (isLogin) {
      getUserInfo();
    } else {
      logout({ isShowToast: false });
      dispatch({
        type: 'partialNavBar',
        payload: {
          right: (
            <Button color="primary" fill="none" onClick={() => navigate('/login')}>
              登录
            </Button>
          ),
        },
      });
    }
  }, [isLogin]);
  useEffect(() => {
    const darkMode = Boolean(localStorage.getItem('darkMode'));
    dispatch({
      type: 'darkMode',
      payload: darkMode,
    });
  }, []);
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-prefers-color-scheme', 'dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.removeAttribute('data-prefers-color-scheme');
      localStorage.removeItem('darkMode');
    }
  }, [darkMode]);
  return (
    <>
      <MainNavBar />
      <div className={classes.center}>
        <Outlet />
      </div>
      <MainTabBar />
      <Loading />
    </>
  );
});

function MainNavBar() {
  const {
    navBar: { title, backArrow, onBack, right },
  } = useContext(RootContextData);

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
