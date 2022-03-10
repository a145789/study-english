import { AutoCenter, List } from 'antd-mobile';
import React, { FC, useContext, useEffect } from 'react';

import { VERSION } from '../../config';
import { RootContextData } from '../../store/ContextApp';
import classes from './index.module.css';

const { Item: ListItem } = List;

const Mine: FC = () => {
  const { navBar, userInfo, dispatch } = useContext(RootContextData);

  useEffect(() => {
    dispatch({
      type: 'navBar',
      payload: { ...navBar, title: '我的', backArrow: null },
    });
  }, []);
  return (
    <>
      <List mode="card" header="资料">
        <ListItem>账号：{userInfo?.username}</ListItem>
        <ListItem>邮箱：{userInfo?.email}</ListItem>
      </List>
      {/* <List mode="card" header="资料">
        <ListItem>账号：{userInfo?.username}</ListItem>
        <ListItem>邮箱：{userInfo?.email}</ListItem>
      </List> */}
      <AutoCenter className={classes.version}>版本号：v{VERSION}</AutoCenter>
    </>
  );
};

export default Mine;
