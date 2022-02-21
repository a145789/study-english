import { Button } from 'antd-mobile';
import React, { FC, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { CertificationProcess } from '../../constants';
import { ContextData } from '../../store/ContextApp';

const Home: FC = () => {
  const { navBar, isLogin, dispatch } = useContext(ContextData);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch({
      type: 'navBar',
      payload: {
        ...navBar,
        right: (
          <Button color="primary" fill="none" onClick={() => navigate('/login')}>
            {isLogin ? '退出' : '登录'}
          </Button>
        ),
      },
    });
  }, [isLogin]);
  return (
    <div>
      1212
      <Button
        color="danger"
        onClick={() => navigate(`/login/${CertificationProcess.updatePassword}`)}>
        修改密码
      </Button>
    </div>
  );
};

export default Home;
