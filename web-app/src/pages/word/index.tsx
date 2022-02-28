import { Empty, List, Tabs } from 'antd-mobile';
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

  const unLoginOrUnFirst = !isLogin && wordStatus !== WordStatus.unfamiliar;

  const getWordList = async () => {
    const { data, err } = await getHandle<WordList[]>('word_list', { id }, loadingCb);
    if (err) {
      return;
    }
    setList(data);
  };
  const tabChange = (wordStatus: WordStatus) => {
    setWordStatus(wordStatus);
    console.log(1);

    if (!unLoginOrUnFirst) {
      getWordList();
    }
  };

  useEffect(() => {
    dispatch({
      type: 'navBar',
      payload: { ...navBar, title: '背单词', backArrow: true },
    });
    getWordList();
  }, []);
  return (
    <div className={classes.list_main}>
      <Tabs activeKey={wordStatus} onChange={(active) => tabChange(active as WordStatus)}>
        <Tab title="不认识" key={WordStatus.unfamiliar} />
        <Tab title="不熟悉" key={WordStatus.will} />
        <Tab title="已了解" key={WordStatus.mastered} />
        <Tab title="早就认识" key={WordStatus.familiar} />
      </Tabs>
      <div className={classes.list}>
        {unLoginOrUnFirst || !list.length ? (
          <Empty
            className={classes.empty}
            imageStyle={{ width: 128 }}
            description={unLoginOrUnFirst ? '登录后使用该功能' : '暂无数据'}
          />
        ) : (
          <List>
            {list.map(({ id, word }) => (
              <ListItem key={id}>{word}</ListItem>
            ))}
          </List>
        )}
      </div>
    </div>
  );
};

export default Word;
