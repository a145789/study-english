const getLoadingCb = (dispatch: any) => ({
  beforeCb: () => dispatch({ type: 'isLoading', payload: true }),
  resolveCb: () => dispatch({ type: 'isLoading', payload: false }),
  rejectCb: () => dispatch({ type: 'isLoading', payload: false }),
});

export { getLoadingCb };
