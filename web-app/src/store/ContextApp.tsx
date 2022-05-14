import Cookies from 'js-cookie';
import React, { createContext, FC, ReactNode, useCallback, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';

import { UserInfo } from '../interface';
import { getHandle } from '../utils/fetch';

export type ActionType<T extends object> = {
  [key in keyof T]: {
    type: key;
    payload: T[key];
  };
}[keyof T];

type RootActionType =
  | ActionType<Omit<ContextStateType, 'dispatch'>>
  | {
      type: 'partialNavBar';
      payload: Partial<ContextStateType['navBar']>;
    };

interface ContextStateType {
  navBar: {
    title: ReactNode;
    backArrow: ReactNode;
    right: ReactNode;
    onBack: () => void;
  };
  isLoading: boolean;
  isShowTabBar: boolean;
  isLogin: boolean;
  userInfo: UserInfo | null;
  dictationSetting: {
    count: number;
    mode: number;
    wordBank: string[];
    wordStatus: string[];
  } | null;
  dispatch: (action: RootActionType) => void;
}

export const RootContextData = createContext<
  ContextStateType & {
    setUserInfo: (userInfo: UserInfo | null) => void;
    getUserInfo: () => void;
  }
>(null as any);

function reducer(state: Omit<ContextStateType, 'dispatch'>, action: RootActionType) {
  switch (action.type) {
    case 'navBar':
      return { ...state, navBar: action.payload };
    case 'partialNavBar':
      return { ...state, navBar: { ...state.navBar, ...action.payload } };
    case 'isLoading':
      return { ...state, isLoading: action.payload };
    case 'isShowTabBar':
      return { ...state, isShowTabBar: action.payload };
    case 'isLogin':
      return { ...state, isLogin: action.payload };
    case 'userInfo':
      return { ...state, userInfo: action.payload };
    case 'dictationSetting':
      return { ...state, dictationSetting: action.payload };
    default:
      return state;
  }
}

const ContextApp: FC = ({ children }) => {
  const navigate = useNavigate();

  const [state, dispatch] = useReducer(reducer, {
    navBar: {
      title: '学英语',
      backArrow: null,
      right: null,
      onBack: () => {
        navigate(-1);
      },
    },
    isLoading: false,
    isLogin: Boolean(JSON.parse(Cookies.get('userInfo') || 'null')),
    isShowTabBar: true,
    userInfo: JSON.parse(Cookies.get('userInfo') || 'null'),
    dictationSetting: null,
  });

  const setUserInfo = useCallback((userInfo: UserInfo | null) => {
    if (userInfo) {
      Cookies.set('userInfo', JSON.stringify(userInfo), {
        expires: 7,
      });
    } else {
      Cookies.remove('userInfo');
    }
    dispatch({ type: 'userInfo', payload: userInfo });
  }, []);

  const getUserInfo = useCallback(async () => {
    const { err, data } = await getHandle<UserInfo>('user_info');
    if (err) {
      return;
    }
    setUserInfo(data);
  }, []);

  return (
    <RootContextData.Provider value={{ ...state, dispatch, setUserInfo, getUserInfo }}>
      {children}
    </RootContextData.Provider>
  );
};

export default ContextApp;
