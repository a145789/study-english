import { ContentOutline, EditSFill } from 'antd-mobile-icons';
import { FC, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { RootContextData } from '../../store/ContextApp';
import classes from './index.module.css';

const Home: FC = () => {
  const { darkMode, dispatch } = useContext(RootContextData);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch({
      type: 'partialNavBar',
      payload: { title: '学英语', backArrow: null },
    });
  }, []);

  return (
    <div className={classes.home}>
      <div className={classes.home_line}>
        <div
          aria-hidden="true"
          className={classes.card}
          onClick={() => navigate('word-bank')}>
          <ContentOutline color={darkMode ? '' : '#feada6'} className={classes.icon} />
          <div className={classes.font}>背单词</div>
        </div>
      </div>

      <div className={classes.home_line}>
        <div
          aria-hidden="true"
          className={classes.card}
          onClick={() => navigate('dictation-setting')}>
          <EditSFill color={darkMode ? '' : '#f6d365'} className={classes.icon} />
          <div className={classes.font}>听写</div>
        </div>
      </div>
    </div>
  );
};

export default Home;
