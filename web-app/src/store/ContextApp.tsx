import Cookies from 'js-cookie';
import React, { createContext, FC, ReactNode, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';

import { UserInfo } from '../interface';

export type ActionType<T extends object> = {
  [key in keyof T]: {
    type: key;
    payload: T[key];
  };
}[keyof T];

interface ContextStateType {
  navBar: {
    title: ReactNode;
    backArrow: ReactNode;
    right: boolean;
    onBack: () => void;
  };
  isLoading: boolean;
  isShowTabBar: boolean;
  isLogin: boolean;
  userInfo: UserInfo | null;
  dispatch: (action: ActionType<Omit<ContextStateType, 'dispatch'>>) => void;
}

export const RootContextData = createContext<
  ContextStateType & {
    setUserInfo: (userInfo: UserInfo | null) => void;
  }
>(null as any);

function reducer(
  state: Omit<ContextStateType, 'dispatch'>,
  action: ActionType<Omit<ContextStateType, 'dispatch'>>,
) {
  switch (action.type) {
    case 'navBar':
      return { ...state, navBar: action.payload };
    case 'isLoading':
      return { ...state, isLoading: action.payload };
    case 'isShowTabBar':
      return { ...state, isShowTabBar: action.payload };
    case 'isLogin':
      return { ...state, isLogin: action.payload };
    case 'userInfo':
      return { ...state, userInfo: action.payload };
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
      right: false,
      onBack: () => {
        navigate(-1);
      },
    },
    isLoading: false,
    isLogin: Boolean(JSON.parse(Cookies.get('userInfo') || 'null')),
    isShowTabBar: true,
    userInfo: JSON.parse(Cookies.get('userInfo') || 'null'),
  });

  const setUserInfo = (userInfo: UserInfo | null) => {
    if (userInfo) {
      Cookies.set('userInfo', JSON.stringify(userInfo), {
        expires: 7,
      });
    } else {
      Cookies.remove('userInfo');
    }
    dispatch({ type: 'userInfo', payload: userInfo });
  };

  return (
    <RootContextData.Provider value={{ ...state, dispatch, setUserInfo }}>
      {children}
    </RootContextData.Provider>
  );
};

export default ContextApp;
