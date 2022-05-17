import { Badge, Empty, InfiniteScroll, List, Tabs } from 'antd-mobile';
import React, { FC, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { RootContextData } from '../../store/ContextApp';
import { getHandle } from '../../utils/fetch';
import { useMainLoadingCb } from '../../utils/hooks';
import { WordStatus } from './constants';
import classes from './index.module.css';
import { WordStatusCountType } from './interface';
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
  const { isLogin, dispatch: rootDispatch } = useContext(RootContextData);
  const {
    wordList,
    pageOptions,
    wordStatus,
    wordListTabCount,
    getWord,
    restPageOptions,
    dispatch: wordDispatch,
  } = useContext(WordContextData);
  const { wordTypeId } = useParams();
  const loadingCb = useMainLoadingCb();

  const unLoginAndUnFirst = !isLogin && wordStatus !== WordStatus.unfamiliar;

  const getWordList = async () => {
    const { data, err } = await getHandle<WordListParams>('word_list', {
      wordTypeId,
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

  const getWordStatusCount = async () => {
    const { data, err } = await getHandle<WordStatusCountType>('word_status_count', {
      wordTypeId,
    });
    if (err) {
      return;
    }
    wordDispatch({
      type: 'otherWordListCount',
      payload: {
        [WordStatus.will]: data.willCount,
        [WordStatus.mastered]: data.masteredCount,
        [WordStatus.familiar]: data.familiarCount,
      },
    });
  };

  const tabChange = (active: string) => {
    if (active === wordStatus) {
      return;
    }
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
    if (isLogin) {
      getWordStatusCount();
    }
  }, [isLogin]);
  useEffect(() => {
    rootDispatch({
      type: 'partialNavBar',
      payload: { title: '背单词', backArrow: true },
    });
  }, []);

  return (
    <div className={classes.list_main}>
      <Tabs activeKey={wordStatus} onChange={tabChange}>
        <Tab
          title={
            wordListTabCount[WordStatus.unfamiliar] !== null ? (
              <Badge
                content={wordListTabCount[WordStatus.unfamiliar]}
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
                content={wordListTabCount[WordStatus.will]}
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
                content={wordListTabCount[WordStatus.mastered]}
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
                content={wordListTabCount[WordStatus.familiar]}
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
