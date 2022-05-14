import { SpinLoading } from 'antd-mobile';
import React, { FC, lazy, Suspense, useMemo } from 'react';
import { useRoutes } from 'react-router-dom';

const Home = lazy(() => import('../pages/home'));
const WordBank = lazy(() => import('../pages/word-bank'));
const Login = lazy(() => import('../pages/login'));
const Word = lazy(() => import('../pages/word'));
const Mine = lazy(() => import('../pages/mine'));
const DictationSetting = lazy(() => import('../pages/dictation-setting'));
const Dictation = lazy(() => import('../pages/dictation'));
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
          path: 'word-bank',
          element: (
            <Suspense fallback={dotLoading}>
              <WordBank />
            </Suspense>
          ),
        },
        {
          path: 'word/:type/:wordTypeId',
          element: (
            <Suspense fallback={dotLoading}>
              <Word />
            </Suspense>
          ),
        },
        {
          path: 'dictation-setting',
          element: (
            <Suspense fallback={dotLoading}>
              <DictationSetting />
            </Suspense>
          ),
        },
        {
          path: 'dictation',
          element: (
            <Suspense fallback={dotLoading}>
              <Dictation />
            </Suspense>
          ),
        },
        {
          path: 'mine',
          element: (
            <Suspense fallback={dotLoading}>
              <Mine />
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
