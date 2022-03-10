import { Badge, Empty, InfiniteScroll, List, Tabs } from 'antd-mobile';
import React, { FC, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { RootContextData } from '../../store/ContextApp';
import { getHandle } from '../../utils/fetch';
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
  const { navBar, isLogin, dispatch: rootDispatch } = useContext(RootContextData);
  const {
    wordList,
    pageOptions,
    wordStatus,
    counts,
    getWord,
    restPageOptions,
    dispatch: wordDispatch,
  } = useContext(WordContextData);
  const { _id } = useParams();

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
    wordDispatch({ type: 'counts', payload: { ...counts, [wordStatus]: count } });
    wordDispatch({ type: 'wordList', payload: [...wordList, ...list] });
    wordDispatch({ type: 'pageOptions', payload: { ...pageOptions, hasMore, skip } });
  };

  const tabChange = (active: string) => {
    wordDispatch({ type: 'wordList', payload: [] });
    restPageOptions();
    wordDispatch({ type: 'wordStatus', payload: active as WordStatus });
  };

  useEffect(() => {
    if (isLogin) {
      getWordList();
    } else if (wordStatus === WordStatus.unfamiliar) {
      getWordList();
    }
  }, [wordStatus]);
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
            counts[WordStatus.unfamiliar] !== null ? (
              <Badge
                content={String(counts[WordStatus.unfamiliar])}
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
            counts[WordStatus.will] !== null ? (
              <Badge
                content={String(counts[WordStatus.will])}
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
            counts[WordStatus.mastered] !== null ? (
              <Badge
                content={String(counts[WordStatus.mastered])}
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
            counts[WordStatus.familiar] !== null ? (
              <Badge
                content={String(counts[WordStatus.familiar])}
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
                <ListItem key={_id} onClick={() => getWord(index)}>
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
