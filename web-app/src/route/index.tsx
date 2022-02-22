import { DotLoading } from 'antd-mobile';
import React, { FC, lazy, Suspense, useMemo } from 'react';
import { useRoutes } from 'react-router-dom';

const Home = lazy(() => import('../pages/home'));
const List = lazy(() => import('../pages/list'));
const Login = lazy(() => import('../pages/login'));
import OutMain from '../pages/out-main';

const Route: FC = () => {
  const dotLoading = useMemo(
    () => (
      <div className="wait_loading">
        <DotLoading />
      </div>
    ),
    [],
  );
  const login = useMemo(() => {
    return (
      <Suspense fallback={dotLoading}>
        <Login />
      </Suspense>
    );
  }, []);
  const element = useRoutes([
    {
      path: '/',
      element: <OutMain />,
      children: [
        {
          path: '/',
          element: (
            <Suspense fallback={dotLoading}>
              <Home />
            </Suspense>
          ),
        },
        {
          path: 'list',
          element: (
            <Suspense fallback={dotLoading}>
              <List />
            </Suspense>
          ),
        },
        {
          path: 'login',
          element: login,
        },
        {
          path: 'login/:process',
          element: login,
        },
      ],
    },
  ]);
  return element;
};

export default Route;
