import {
  Button,
  Dialog,
  Divider,
  Dropdown,
  Empty,
  FloatingBubble,
  InfiniteScroll,
  List,
  Radio,
  Space,
  Tabs,
} from 'antd-mobile';
import { Action } from 'antd-mobile/es/components/modal/modal-action-button';
import { SoundOutline } from 'antd-mobile-icons';
import React, { FC, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { ContextData } from '../../store/ContextApp';
import { getHandle, postHandle } from '../../utils/fetch';
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
  sampleSentences: { en: string; cn: string; _id: string }[];
  /** 翻译1 */
  translation_1: string;
  /** 翻译2 */
  translation_2: string;
  /** 关联词 */
  association: { word: string; translation: string; _id: string }[];
};

type WordListType = {
  _id: string;
  word: string;
};

type WordListParams = {
  skip: number;
  hasMore: boolean;
  list: WordListType[];
};

const enum WordStatus {
  unfamiliar = 'unfamiliar',
  will = 'will',
  mastered = 'mastered',
  familiar = 'familiar',
}

const enum AudioWordType {
  am,
  br,
}

const initWordStatus = () => ({
  skip: 0,
  limit: 18,
  hasMore: false,
});

const Word: FC = () => {
  const { navBar, isLogin, dispatch } = useContext(ContextData);
  const loadingCb = useLoadingCb();
  const { _id } = useParams();

  const [wordList, setWordList] = useState<WordListType[]>([]);
  const [wordStatus, setWordStatus] = useState<WordStatus>(WordStatus.unfamiliar);
  const [word, setWord] = useState({} as WordType);
  const [wordIndex, setWordIndex] = useState(
    {} as {
      preIndex: number | null;
      currentIndex: number;
      nextIndex: number | null;
    },
  );
  const [wordVisible, setWordVisible] = useState(false);
  const [pageOptions, setPageOptions] = useState(initWordStatus());
  const [diaButtonDisable, setDiaButtonDisable] = useState(false);

  const audioRef = useRef<{
    am: HTMLAudioElement | null;
    br: HTMLAudioElement | null;
  }>({
    am: null,
    br: null,
  });

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
    const { hasMore, skip, list = [] } = data;
    setWordList([...wordList, ...list]);
    setPageOptions({ ...pageOptions, hasMore, skip });
  };
  const showWordDia = () => {
    setWordVisible(true);
  };
  const getWord = async (index: number) => {
    setWordIndex({
      preIndex: index === 0 ? null : index - 1,
      currentIndex: index,
      nextIndex: index + 1 === wordList.length ? null : index + 1,
    });
    const _id = wordList[index]._id;
    const { err, data } = await getHandle<WordType>('word', { _id }, loadingCb);
    if (err) {
      return;
    }
    setWord(data);
    setDiaButtonDisable(false);
    if (!wordVisible) {
      showWordDia();
    }
  };

  const audioWordHandle = (type: AudioWordType) => {
    if (type === AudioWordType.am) {
      audioRef.current.am?.play();
    } else {
      audioRef.current.br?.play();
    }
  };
  const wordHandle = async (type: WordStatus) => {
    const { err } = await postHandle(
      'word_handle',
      {
        _id: word._id,
        wordStatus,
        moveWordStatus: type,
      },
      {
        beforeCb() {
          setDiaButtonDisable(true);
        },
        resolveCb() {
          setDiaButtonDisable(false);
        },
        rejectCb() {
          setDiaButtonDisable(false);
        },
      },
    );
    if (err) {
      return;
    }

    setPageOptions({
      ...pageOptions,
      skip: pageOptions.skip === 0 ? 0 : pageOptions.skip - 1,
    });
    wordList.splice(wordIndex.currentIndex, 1);
    setWordList(wordList.slice());
    getWord(wordIndex.currentIndex);
  };
  const tabChange = (active: string) => {
    setWordList([]);
    setPageOptions(initWordStatus());
    setWordStatus(active as WordStatus);
  };

  const diaLogActions = useMemo(() => {
    const actions: Action[] = [
      {
        key: 'confirm',
        text: '关闭',
      },
    ];
    if (wordIndex.preIndex !== null) {
      actions.unshift({
        key: 'pre',
        text: '上一个',
        disabled: diaButtonDisable,
        onClick: () => {
          setDiaButtonDisable(true);
          getWord(wordIndex.preIndex!);
        },
      });
    }
    if (wordIndex.nextIndex !== null) {
      actions.push({
        key: 'next',
        text: '下一个',
        disabled: diaButtonDisable,
        onClick: () => {
          setDiaButtonDisable(true);
          getWord(wordIndex.nextIndex!);
        },
      });
    }
    return actions;
  }, [wordIndex, diaButtonDisable]);

  useEffect(() => {
    if (isLogin) {
      getWordList();
    }
  }, [wordStatus]);
  useEffect(() => {
    if (wordVisible) {
      audioRef.current = {
        am: document.getElementById('audioWordAm') as HTMLAudioElement,
        br: document.getElementById('audioWordBr') as HTMLAudioElement,
      };
      audioRef.current.am?.load();
      audioRef.current.br?.load();
    }
  }, [wordVisible]);
  useEffect(() => {
    dispatch({
      type: 'navBar',
      payload: { ...navBar, title: '背单词', backArrow: true },
    });
    if (!isLogin) {
      getWordList();
    }
    () => {
      audioRef.current = {
        am: null,
        br: null,
      };
    };
  }, []);

  return (
    <div className={classes.list_main}>
      <Tabs activeKey={wordStatus} onChange={tabChange}>
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
      <Dialog
        visible={wordVisible}
        closeOnAction
        content={
          <>
            <div>单词：{word.word}</div>
            <div>翻译1：{word.translation_1}</div>
            <div>翻译2：{word.translation_2}</div>
            <Divider />
            <div className={classes.audio_active}>
              美音：{word.americanPhonetic}
              <SoundOutline
                color="var(--adm-color-primary)"
                onClick={() => audioWordHandle(AudioWordType.am)}
              />
            </div>
            <div className={classes.audio_active}>
              英音：{word.britishPhonetic}
              <SoundOutline
                color="var(--adm-color-primary)"
                onClick={() => audioWordHandle(AudioWordType.br)}
              />
            </div>
            {Boolean(word.association?.length) && (
              <>
                <Divider />
                <div>相关词：</div>
                {word.association.map(({ word, translation, _id }) => (
                  <div key={_id}>
                    {word}：{translation}
                  </div>
                ))}
              </>
            )}
            {Boolean(word.sampleSentences?.length) && (
              <>
                <Divider />
                <div>例句：</div>
                {word.sampleSentences.map(({ en, cn, _id }, index) => (
                  <div key={_id}>
                    {index + 1}.{en} {cn}
                  </div>
                ))}
              </>
            )}

            <Divider>操作</Divider>
            <div className={classes.word_handle_space}>
              <Space wrap>
                {wordStatus !== WordStatus.unfamiliar && (
                  <Button
                    color="danger"
                    size="small"
                    loading={diaButtonDisable}
                    onClick={() => wordHandle(WordStatus.unfamiliar)}>
                    不认识
                  </Button>
                )}
                {wordStatus !== WordStatus.will && (
                  <Button
                    color="warning"
                    size="small"
                    loading={diaButtonDisable}
                    onClick={() => wordHandle(WordStatus.will)}>
                    不熟悉
                  </Button>
                )}
                {wordStatus !== WordStatus.mastered && (
                  <Button
                    color="success"
                    size="small"
                    loading={diaButtonDisable}
                    onClick={() => wordHandle(WordStatus.mastered)}>
                    已了解
                  </Button>
                )}
                {wordStatus !== WordStatus.familiar && (
                  <Button
                    color="primary"
                    size="small"
                    onClick={() => wordHandle(WordStatus.familiar)}>
                    早就认识
                  </Button>
                )}
              </Space>
            </div>

            <audio className={classes.audio} id="audioWordAm">
              <source
                src={`https://dict.youdao.com/dictvoice?audio=${word.word}&type=2`}
              />
              <source
                src={`https://static2.youzack.com/youzack/wordaudio/us/${word.word}.mp3`}
              />
              <track kind="captions"></track>
            </audio>
            <audio className={classes.audio} id="audioWordBr">
              <source
                src={`https://dict.youdao.com/dictvoice?audio=${word.word}&type=1`}
              />
              <source
                src={`https://static2.youzack.com/youzack/wordaudio/br/${word.word}.mp3`}
              />
              <track kind="captions"></track>
            </audio>
          </>
        }
        onClose={() => {
          setWordVisible(false);
        }}
        actions={[diaLogActions]}
      />
    </div>
  );
};

export default Word;
