import {
  Dialog,
  Dropdown,
  Empty,
  FloatingBubble,
  InfiniteScroll,
  List,
  Radio,
  Space,
  Tabs,
} from 'antd-mobile';
import React, { FC, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { ContextData } from '../../store/ContextApp';
import { getHandle } from '../../utils/fetch';
import { useLoadingCb } from '../../utils/hooks';
import classes from './index.module.css';

const { Item: ListItem } = List;
const { Item: DropdownItem } = Dropdown;
const { Group: RadioGroup } = Radio;
const { Tab } = Tabs;

type WordType = {
  _id: string;
  word: string;
  /** 美式发音 */
  americanPhonetic: string;
  /** 英式发音 */
  britishPhonetic: string;
  /** 例句 */
  sampleSentences: { en: string; cn: string }[];
  /** 翻译1 */
  translation_1: string;
  /** 翻译2 */
  translation_2: string;
  /** 关联词 */
  association: { word: String; translation: String }[];
};

type WordList = {
  _id: string;
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
  const { _id, type } = useParams();

  const [list, setList] = useState<WordList[]>([]);
  const [wordStatus, setWordStatus] = useState<WordStatus>(WordStatus.unfamiliar);
  const [word, setWord] = useState({} as WordType);
  const [wordVisible, setWordVisible] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const unLoginAndUnFirst = !isLogin && wordStatus !== WordStatus.unfamiliar;

  const getWordList = async () => {
    const { data, err } = await getHandle<WordList[]>(
      'word_list',
      { _id, wordStatus },
      loadingCb,
    );
    if (err) {
      return;
    }
    setList(data);
    // setHasMore(!data?.length);
  };
  const showWordDia = () => {
    setWordVisible(true);
  };
  const getWord = async (_id: string) => {
    const { err, data } = await getHandle<WordType>('word', { _id }, loadingCb);
    if (err) {
      return;
    }
    console.log(data);
    setWord(data);
    showWordDia();
  };

  useEffect(() => {
    if (isLogin) {
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
      {/* <Dropdown>
        <DropdownItem key="sorter" title="排序">
          <div style={{ padding: 12 }}>
            <RadioGroup defaultValue="default">
              <Space direction="vertical" block>
                <Radio block value="default">
                  列表模式
                </Radio>
                <Radio block value="nearest">
                  卡片模式
                </Radio>
              </Space>
            </RadioGroup>
          </div>
        </DropdownItem>
      </Dropdown> */}
      <div className={classes.list}>
        {unLoginAndUnFirst || !list.length ? (
          <Empty
            className={classes.empty}
            imageStyle={{ width: 128 }}
            description={unLoginAndUnFirst ? '登录后使用该功能' : '暂无数据'}
          />
        ) : (
          <>
            <List>
              {list.map(({ _id, word }) => (
                <ListItem key={_id} onClick={() => getWord(_id)}>
                  {word}
                </ListItem>
              ))}
            </List>
            <InfiniteScroll loadMore={getWordList} hasMore={hasMore} />
          </>
        )}
      </div>
      <Dialog
        visible={wordVisible}
        closeOnAction
        content={
          <>
            <div>单词：{word.word}</div>
            <div>翻译：{word.translation_1}</div>
          </>
        }
        onClose={() => {
          setWordVisible(false);
        }}
        actions={[
          {
            key: 'confirm',
            text: '关闭',
          },
        ]}
      />
    </div>
  );
};

export default Word;
