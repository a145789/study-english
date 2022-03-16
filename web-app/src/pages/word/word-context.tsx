import React, { createContext, FC, useCallback, useReducer } from 'react';

import { ActionType } from '../../store/ContextApp';
import { getHandle } from '../../utils/fetch';
import { useLoadingCb } from '../../utils/hooks';
import { WordStatus } from './constants';
import { WordType } from './interface';

export interface WordListType {
  _id: string;
  word: string;
}

interface ContextStateType {
  word: WordType;
  wordDialogVisible: boolean;
  pageOptions: ReturnType<typeof initWordStatus>;
  wordStatus: WordStatus;
  wordList: WordListType[];
  wordIndex: {
    preIndex: number | null;
    currentIndex: number;
    nextIndex: number | null;
  };
  wordListTabCount: {
    [WordStatus.unfamiliar]: number | null;
    [WordStatus.will]: number | null;
    [WordStatus.mastered]: number | null;
    [WordStatus.familiar]: number | null;
  };
  dispatch: (action: WordActionType) => void;
}

type WordActionType =
  | ActionType<Omit<ContextStateType, 'dispatch'>>
  | { type: 'unfamiliarCount'; payload: number }
  | {
      type: 'otherWordListCount';
      payload: {
        [WordStatus.will]: number | null;
        [WordStatus.mastered]: number | null;
        [WordStatus.familiar]: number | null;
      };
    };

const initWordStatus = () => ({
  skip: 0,
  limit: 18,
  hasMore: false,
});

export const WordContextData = createContext<
  ContextStateType & {
    getWord: (index: number) => void;
    restPageOptions: () => void;
  }
>(null as any);

function reducer(state: Omit<ContextStateType, 'dispatch'>, action: WordActionType) {
  switch (action.type) {
    case 'word':
      return { ...state, word: action.payload };
    case 'wordDialogVisible':
      return { ...state, wordDialogVisible: action.payload };
    case 'pageOptions':
      return { ...state, pageOptions: action.payload };
    case 'wordIndex':
      return { ...state, wordIndex: action.payload };
    case 'wordListTabCount':
      return { ...state, wordListTabCount: action.payload };
    case 'unfamiliarCount':
      return {
        ...state,
        wordListTabCount: {
          ...state.wordListTabCount,
          [WordStatus.unfamiliar]: action.payload,
        },
      };
    case 'otherWordListCount':
      return {
        ...state,
        wordListTabCount: {
          ...state.wordListTabCount,
          ...action.payload,
        },
      };
    case 'wordStatus':
      return { ...state, wordStatus: action.payload };
    case 'wordList':
      return { ...state, wordList: action.payload };
    default:
      return state;
  }
}

const WordContext: FC = ({ children }) => {
  const loadingCb = useLoadingCb();
  const [state, dispatch] = useReducer(reducer, {
    word: {} as WordType,
    wordDialogVisible: false,
    pageOptions: initWordStatus(),
    wordStatus: WordStatus.unfamiliar,
    wordList: [],
    wordIndex: {
      preIndex: null,
      currentIndex: 0,
      nextIndex: null,
    },
    wordListTabCount: {
      [WordStatus.unfamiliar]: null,
      [WordStatus.will]: null,
      [WordStatus.mastered]: null,
      [WordStatus.familiar]: null,
    },
  });

  const getWord = useCallback(
    async (index: number) => {
      dispatch({
        type: 'wordIndex',
        payload: {
          preIndex: index === 0 ? null : index - 1,
          currentIndex: index,
          nextIndex:
            index + 1 === state.wordListTabCount[state.wordStatus] ? null : index + 1,
        },
      });
      if (!state.wordList[index]) {
        dispatch({ type: 'wordDialogVisible', payload: false });
        return;
      }

      const { _id } = state.wordList[index];
      const { err, data } = await getHandle<WordType>('word', { _id }, loadingCb);
      if (err) {
        dispatch({ type: 'wordDialogVisible', payload: false });
        return;
      }
      dispatch({ type: 'word', payload: data });
      dispatch({ type: 'wordDialogVisible', payload: true });
    },
    [state.wordListTabCount, state.wordStatus, state.wordList],
  );

  const restPageOptions = useCallback(() => {
    dispatch({ type: 'pageOptions', payload: initWordStatus() });
  }, []);

  return (
    <WordContextData.Provider value={{ ...state, getWord, restPageOptions, dispatch }}>
      {children}
    </WordContextData.Provider>
  );
};

export default WordContext;
