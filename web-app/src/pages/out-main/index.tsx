import { NavBar, TabBar } from 'antd-mobile';
import { AppOutline } from 'antd-mobile-icons';
import React, { useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { ContextData } from '../../store/ContextApp';
import classes from './index.module.css';

const { Item: TabBarItem } = TabBar;

const OutMain = () => {
  const {
    navBar: { title, backArrow, onBack, right },
    isShowTabBar,
  } = useContext(ContextData);
  const navigate = useNavigate();

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
