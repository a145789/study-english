import { NavBar, TabBar } from 'antd-mobile';
import { AppOutline } from 'antd-mobile-icons';
import React, { useContext } from 'react';
import { Link, Outlet } from 'react-router-dom';

import { ContextData } from '../../store/ContextApp';

const { Item: TabBarItem } = TabBar;

const OutMain = () => {
  const { title } = useContext(ContextData);
  return (
    <>
      <NavBar back={null}>{title}</NavBar>
      <div style={{ flex: 1 }}>
        <Link to="/list">list</Link>
        <Link to="/login">login</Link>
        <Outlet></Outlet>
      </div>
      <TabBar>{[<TabBarItem key="Home" icon={<AppOutline />} title="首页" />]}</TabBar>
    </>
  );
};

export default OutMain;
