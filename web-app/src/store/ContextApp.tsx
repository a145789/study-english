import Cookies from 'js-cookie';
import React, { createContext, FC, ReactNode, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';

type ActionType<T extends object> = {
  [key in keyof T]: {
    type: key;
    payload: T[key];
  };
}[keyof T];

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
  userInfo: {
    userId: string;
    username: string;
    email: string;
  } | null;
  dispatch: (action: ActionType<Omit<ContextStateType, 'dispatch'>>) => void;
}

export const ContextData = createContext<ContextStateType>(null as any);

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
      if (action.payload) {
        Cookies.set('userInfo', JSON.stringify(action.payload), {
          maxAge: 60 * 60 * 24 * 7,
        });
      }
      return { ...state, userInfo: action.payload };
    default:
      return state;
  }
}

const ContextApp: FC = ({ children }) => {
  const navigate = useNavigate();
  console.log(
    Cookies.get('userInfo') !== undefined || Cookies.get('userInfo') !== 'null',
  );
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
    userInfo: null,
  });

  return (
    <ContextData.Provider value={{ ...state, dispatch }}>{children}</ContextData.Provider>
  );
};

export default ContextApp;
