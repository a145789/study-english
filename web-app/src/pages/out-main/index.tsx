import { Button, NavBar, TabBar } from 'antd-mobile';
import { AppOutline } from 'antd-mobile-icons';
import Cookies from 'js-cookie';
import React, { useContext, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { ContextData } from '../../store/ContextApp';
import { postHandle } from '../../utils/fetch';
import classes from './index.module.css';

const { Item: TabBarItem } = TabBar;

const OutMain = () => {
  const {
    navBar: { title, backArrow, onBack, right },
    isShowTabBar,
    isLogin,
    dispatch,
  } = useContext(ContextData);
  const navigate = useNavigate();

  const logHandle = async () => {
    const userInfo = JSON.parse(Cookies.get('userInfo') || 'null');
    if (!isLogin || !userInfo) {
      navigate('/login');
    } else {
      dispatch({ type: 'isLoading', payload: true });
      const { err } = await postHandle('logout', userInfo);
      if (err) {
        dispatch({ type: 'isLoading', payload: false });
        return;
      }
      Cookies.remove('userInfo');
      dispatch({ type: 'isLogin', payload: false });
      dispatch({ type: 'userInfo', payload: null });
      dispatch({ type: 'isLoading', payload: false });
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
    <>
      <NavBar
        className={classes.nav_bar}
        backArrow={backArrow}
        onBack={onBack}
        right={right}>
        {title}
      </NavBar>
      <div className={classes.center}>
        <Outlet />
      </div>
      {isShowTabBar && (
        <TabBar safeArea className={classes.tab_bar}>
          {[<TabBarItem key="Home" icon={<AppOutline />} title="首页" />]}
        </TabBar>
      )}
    </>
  );
};

export default OutMain;
