import { Badge, Empty, InfiniteScroll, List, Tabs } from 'antd-mobile';
import React, { FC, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { RootContextData } from '../../store/ContextApp';
import { getHandle } from '../../utils/fetch';
import { useMainLoadingCb } from '../../utils/hooks';
import { WordStatus } from './constants';
import classes from './index.module.css';
import WordContext, { WordContextData, WordListType } from './word-context';
import WordDialog from './word-dialog';

const { Item: ListItem } = List;
const { Tab } = Tabs;

type WordListParams = {
  skip: number;
  hasMore: boolean;
  list: WordListType[];
  count: number;
};

const WordComponent: FC = () => {
  const {
    navBar,
    isLogin,
    userInfo,
    dispatch: rootDispatch,
  } = useContext(RootContextData);
  const {
    wordList,
    pageOptions,
    wordStatus,
    wordListTabCount,
    getWord,
    restPageOptions,
    dispatch: wordDispatch,
  } = useContext(WordContextData);
  const { _id } = useParams();
  const loadingCb = useMainLoadingCb();

  const unLoginAndUnFirst = !isLogin && wordStatus !== WordStatus.unfamiliar;

  const getWordList = async () => {
    const { data, err } = await getHandle<WordListParams>('word_list', {
      _id,
      wordStatus,
      ...pageOptions,
    });
    if (err) {
      return;
    }
    const { hasMore, skip, count, list = [] } = data;
    if (wordStatus === WordStatus.unfamiliar) {
      wordDispatch({
        type: 'unfamiliarCount',
        payload: count,
      });
    }
    wordDispatch({ type: 'wordList', payload: [...wordList, ...list] });
    wordDispatch({ type: 'pageOptions', payload: { ...pageOptions, hasMore, skip } });
  };

  const tabChange = (active: string) => {
    wordDispatch({ type: 'wordList', payload: [] });
    restPageOptions();
    wordDispatch({ type: 'wordStatus', payload: active as WordStatus });
  };

  useEffect(() => {
    if (isLogin || wordStatus === WordStatus.unfamiliar) {
      getWordList();
    }
  }, [isLogin, wordStatus]);
  useEffect(() => {
    if (userInfo) {
      const { willCount, masteredCount, familiarCount } = userInfo;
      wordDispatch({
        type: 'otherWordListCount',
        payload: {
          [WordStatus.will]: willCount,
          [WordStatus.mastered]: masteredCount,
          [WordStatus.familiar]: familiarCount,
        },
      });
    }
  }, [userInfo]);
  useEffect(() => {
    rootDispatch({
      type: 'navBar',
      payload: { ...navBar, title: '背单词', backArrow: true },
    });
  }, []);

  return (
    <div className={classes.list_main}>
      <Tabs activeKey={wordStatus} onChange={tabChange}>
        <Tab
          title={
            wordListTabCount[WordStatus.unfamiliar] !== null ? (
              <Badge
                content={String(wordListTabCount[WordStatus.unfamiliar])}
                className={classes.word_badge}>
                不认识
              </Badge>
            ) : (
              '不认识'
            )
          }
          key={WordStatus.unfamiliar}
        />
        <Tab
          title={
            wordListTabCount[WordStatus.will] !== null ? (
              <Badge
                content={String(wordListTabCount[WordStatus.will])}
                className={classes.word_badge}>
                不熟悉
              </Badge>
            ) : (
              '不熟悉'
            )
          }
          key={WordStatus.will}
        />
        <Tab
          title={
            wordListTabCount[WordStatus.mastered] !== null ? (
              <Badge
                content={String(wordListTabCount[WordStatus.mastered])}
                className={classes.word_badge}>
                已了解
              </Badge>
            ) : (
              '已了解'
            )
          }
          key={WordStatus.mastered}
        />
        <Tab
          title={
            wordListTabCount[WordStatus.familiar] !== null ? (
              <Badge
                content={String(wordListTabCount[WordStatus.familiar])}
                className={classes.word_badge}>
                早就认识
              </Badge>
            ) : (
              '早就认识'
            )
          }
          key={WordStatus.familiar}
        />
      </Tabs>
      <div className={classes.list}>
        {unLoginAndUnFirst || !wordList.length ? (
          <Empty
            className={classes.empty}
            imageStyle={{ width: 128 }}
            description={unLoginAndUnFirst ? '登录后使用该功能' : '暂无数据'}
          />
        ) : (
          <>
            <List>
              {wordList.map(({ _id, word }, index) => (
                <ListItem key={_id} onClick={() => getWord(index, loadingCb)}>
                  {word}
                </ListItem>
              ))}
            </List>
            <InfiniteScroll
              threshold={120}
              loadMore={getWordList}
              hasMore={pageOptions.hasMore}
            />
          </>
        )}
      </div>
      <WordDialog />
    </div>
  );
};

const Word = () => (
  <WordContext>
    <WordComponent />
  </WordContext>
);

export default Word;
