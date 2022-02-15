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
    isLogin: false,
    isShowTabBar: true,
  });

  return (
    <ContextData.Provider value={{ ...state, dispatch }}>{children}</ContextData.Provider>
  );
};

export default ContextApp;
