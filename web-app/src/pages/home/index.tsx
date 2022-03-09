import { Toast } from 'antd-mobile';
import { ContentOutline, EditSFill } from 'antd-mobile-icons';
import React, { FC, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { RootContextData } from '../../store/ContextApp';
import classes from './index.module.css';

const { show: ToastShow } = Toast;

const Home: FC = () => {
  const { navBar, dispatch } = useContext(RootContextData);
  const navigate = useNavigate();

  const goDictation = () => {
    ToastShow({ content: '开发中...' });
  };

  useEffect(() => {
    dispatch({
      type: 'navBar',
      payload: { ...navBar, title: '学英语', backArrow: null },
    });
  }, []);

  return (
    <div className={classes.home}>
      <div className={classes.home_line}>
        <div
          aria-hidden="true"
          className={classes.card}
          onClick={() => navigate('learn-english')}>
          <ContentOutline color="#feada6" className={classes.icon} />
          <div className={classes.font}>背单词</div>
        </div>
      </div>

      <div className={classes.home_line}>
        <div aria-hidden="true" className={classes.card} onClick={() => goDictation()}>
          <EditSFill color="#f6d365" className={classes.icon} />
          <div className={classes.font}>听写</div>
        </div>
      </div>
    </div>
  );
};

export default Home;
