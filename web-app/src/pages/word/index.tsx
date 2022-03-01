import { Empty, FloatingBubble, List, Tabs } from 'antd-mobile';
import { MessageFill } from 'antd-mobile-icons';
import React, { FC, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { ContextData } from '../../store/ContextApp';
import { getHandle } from '../../utils/fetch';
import { useLoadingCb } from '../../utils/hooks';
import classes from './index.module.css';

const { Item: ListItem } = List;
const { Tab } = Tabs;

type WordList = {
  id: string;
  word: string;
};

const enum WordStatus {
  unfamiliar = 'unfamiliar',
  will = 'will',
  mastered = 'mastered',
  familiar = 'familiar',
}

const Word: FC = () => {
  const { navBar, isLogin, dispatch } = useContext(ContextData);
  const loadingCb = useLoadingCb();
  const { id, type } = useParams();

  const [list, setList] = useState<WordList[]>([]);
  const [wordStatus, setWordStatus] = useState<WordStatus>(WordStatus.unfamiliar);

  const unLoginAndUnFirst = !isLogin && wordStatus !== WordStatus.unfamiliar;

  const getWordList = async () => {
    const { data, err } = await getHandle<WordList[]>(
      'word_list',
      { id, wordStatus },
      loadingCb,
    );
    if (err) {
      return;
    }
    setList(data);
  };

  useEffect(() => {
    if (!unLoginAndUnFirst) {
      getWordList();
    }
  }, [wordStatus]);
  useEffect(() => {
    dispatch({
      type: 'navBar',
      payload: { ...navBar, title: '背单词', backArrow: true },
    });
    if (!isLogin) {
      getWordList();
    }
  }, []);
  return (
    <div className={classes.list_main}>
      <Tabs
        activeKey={wordStatus}
        onChange={(active) => setWordStatus(active as WordStatus)}>
        <Tab title="不认识" key={WordStatus.unfamiliar} />
        <Tab title="不熟悉" key={WordStatus.will} />
        <Tab title="已了解" key={WordStatus.mastered} />
        <Tab title="早就认识" key={WordStatus.familiar} />
      </Tabs>
      <div className={classes.list}>
        {unLoginAndUnFirst || !list.length ? (
          <Empty
            className={classes.empty}
            imageStyle={{ width: 128 }}
            description={unLoginAndUnFirst ? '登录后使用该功能' : '暂无数据'}
          />
        ) : (
          <List>
            {list.map(({ id, word }) => (
              <ListItem key={id}>{word}</ListItem>
            ))}
          </List>
        )}
      </div>
      <FloatingBubble
        style={{
          '--initial-position-bottom': '24px',
          '--initial-position-right': '24px',
          // '--edge-distance': '24px',
        }}>
        <MessageFill fontSize={32} />
      </FloatingBubble>
    </div>
  );
};

export default Word;
