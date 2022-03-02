import {
  Dialog,
  Dropdown,
  Empty,
  FloatingBubble,
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
  const [word, setWord] = useState<string>('');
  const [wordVisible, setWordVisible] = useState(false);

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
  };
  const showWordDia = () => {
    setWordVisible(true);
  };
  const getWord = async () => {};

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
          <List>
            {list.map(({ _id, word }) => (
              <ListItem key={_id} onClick={() => showWordDia()}>
                {word}
              </ListItem>
            ))}
          </List>
        )}
      </div>
      <Dialog
        visible={wordVisible}
        closeOnAction
        content={
          <>
            <div>请用手机拍摄手持工牌照，注意保持照片清晰</div>
            <div>
              详情说明请查阅<a>操作指引</a>
            </div>
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
