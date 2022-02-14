import React, { FC } from 'react';
import { useRoutes } from 'react-router-dom';

import List from '../pages/list';
import Login from '../pages/login';
import OutMain from '../pages/out-main';

const Route: FC = () => {
  const element = useRoutes([
    {
      path: '/',
      element: <OutMain />,
      children: [
        {
          path: 'list',
          element: <List />,
        },
        {
          path: 'login',
          element: <Login />,
        },
      ],
    },
  ]);
  return element;
};

export default Route;
