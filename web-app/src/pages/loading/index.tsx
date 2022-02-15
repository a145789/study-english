import { Mask, SpinLoading } from 'antd-mobile';
import React, { useContext } from 'react';

import { ContextData } from '../../store/ContextApp';
import classes from './index.module.css';

const Loading = () => {
  const { isLoading } = useContext(ContextData);
  return (
    <Mask visible={isLoading} color="white">
      <SpinLoading color="primary" className={classes.loading_content} />
    </Mask>
  );
};

export default Loading;
