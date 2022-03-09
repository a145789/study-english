import { useContext, useMemo } from 'react';

import { RootContextData } from '../store/ContextApp';

const useLoadingCb = () => {
  const { dispatch } = useContext(RootContextData);
  const loadingCb = useMemo(
    () => ({
      beforeCb: () => dispatch({ type: 'isLoading', payload: true }),
      resolveCb: () => dispatch({ type: 'isLoading', payload: false }),
      rejectCb: () => dispatch({ type: 'isLoading', payload: false }),
    }),
    [dispatch],
  );
  return loadingCb;
};

export { useLoadingCb };
