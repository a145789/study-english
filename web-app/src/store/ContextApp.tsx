import React, { createContext, FC, useReducer } from 'react';

type ActionType<T extends object> = {
  [key in keyof T]: {
    type: key;
    payload: T[key];
  };
}[keyof T];

interface ContextStateType {
  title: string;
  isLoading: boolean;
  dispatch: (action: ActionType<Omit<ContextStateType, 'dispatch'>>) => void;
}

export const ContextData = createContext<ContextStateType>(null as any);

function reducer(
  state: Omit<ContextStateType, 'dispatch'>,
  action: ActionType<Omit<ContextStateType, 'dispatch'>>,
) {
  switch (action.type) {
    case 'title':
      return { ...state, title: action.payload };
    case 'isLoading':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

const ContextApp: FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, { title: '学英语', isLoading: false });

  return (
    <ContextData.Provider value={{ ...state, dispatch }}>{children}</ContextData.Provider>
  );
};

export default ContextApp;
