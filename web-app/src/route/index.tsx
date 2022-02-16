import React, { FC } from 'react';
import { useRoutes } from 'react-router-dom';

import Home from '../pages/home';
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
          path: '/',
          element: <Home />,
        },
        {
          path: 'list',
          element: <List />,
        },
        {
          path: 'login',
          element: <Login />,
        },
        {
          path: 'login/:process',
          element: <Login />,
        },
      ],
    },
  ]);
  return element;
};

export default Route;
