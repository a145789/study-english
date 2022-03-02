import { SpinLoading } from 'antd-mobile';
import React, { FC, lazy, Suspense, useMemo } from 'react';
import { useRoutes } from 'react-router-dom';

const Home = lazy(() => import('../pages/home'));
const LearnEnglish = lazy(() => import('../pages/learn-english'));
const Login = lazy(() => import('../pages/login'));
const Word = lazy(() => import('../pages/word'));
import OutMain from '../pages/out-main';

const Route: FC = () => {
  const dotLoading = useMemo(
    () => (
      <div className="wait_loading">
        <SpinLoading color="primary" />
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
          path: 'learn-english',
          element: (
            <Suspense fallback={dotLoading}>
              <LearnEnglish />
            </Suspense>
          ),
        },
        {
          path: 'word/:type/:_id',
          element: (
            <Suspense fallback={dotLoading}>
              <Word />
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
