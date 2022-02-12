import { Button } from 'antd-mobile';
import React, { FC, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { ContextData } from '../../store/ContextApp';

const List: FC = () => {
  const { dispatch } = useContext(ContextData);
  const navigate = useNavigate();
  const handle = () => {
    dispatch({ type: 'isLoading', payload: true });
    setTimeout(() => {
      dispatch({ type: 'isLoading', payload: false });
    }, 1000);
  };
  return (
    <div>
      <Button color="danger" onClick={() => handle()}>
        click
      </Button>
      <div>list</div>
      <Button
        color="danger"
        onClick={() => {
          navigate('/login');
        }}>
        go login
      </Button>
    </div>
  );
};

export default List;
