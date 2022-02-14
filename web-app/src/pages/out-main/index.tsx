import { NavBar, TabBar } from 'antd-mobile';
import { AppOutline } from 'antd-mobile-icons';
import React, { useContext } from 'react';
import { Link, Outlet } from 'react-router-dom';

import { ContextData } from '../../store/ContextApp';
import classes from './index.module.css';

const { Item: TabBarItem } = TabBar;

const OutMain = () => {
  const { title, isShowTabBar } = useContext(ContextData);
  return (
    <>
      <NavBar className="b-b-2" back={null}>
        {title}
      </NavBar>
      <div className={classes.center}>
        <Outlet />
      </div>
      {isShowTabBar && (
        <TabBar safeArea className="b-t-2">
          {[<TabBarItem key="Home" icon={<AppOutline />} title="首页" />]}
        </TabBar>
      )}
    </>
  );
};

export default OutMain;
