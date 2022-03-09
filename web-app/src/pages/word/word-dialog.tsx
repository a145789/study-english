import { Button, Dialog, Divider, Space } from 'antd-mobile';
import { Action } from 'antd-mobile/es/components/modal/modal-action-button';
import { SoundOutline } from 'antd-mobile-icons';
import React, { FC, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { postHandle } from '../../utils/fetch';
import { WordStatus } from './constants';
import classes from './index.module.css';
import { WordContextData } from './word-context';

const enum AudioWordType {
  am,
  br,
}

const WordDialog: FC = () => {
  const {
    pageOptions,
    wordIndex,
    word,
    counts,
    wordStatus,
    wordDialogVisible,
    wordList,
    getWord,
    dispatch,
  } = useContext(WordContextData);

  const audioRef = useRef<{
    am: HTMLAudioElement | null;
    br: HTMLAudioElement | null;
  }>({
    am: null,
    br: null,
  });

  const audioWordHandle = (type: AudioWordType) => {
    if (type === AudioWordType.am) {
      audioRef.current.am?.play();
    } else {
      audioRef.current.br?.play();
    }
  };
  const wordHandle = async (type: WordStatus) => {
    const { err } = await postHandle('word_handle', {
      _id: word._id,
      wordStatus,
      moveWordStatus: type,
    });
    if (err) {
      return;
    }

    dispatch({
      type: 'pageOptions',
      payload: {
        ...pageOptions,
        skip: pageOptions.skip === 0 ? 0 : pageOptions.skip - 1,
      },
    });
    dispatch({
      type: 'counts',
      payload: { ...counts, [wordStatus]: counts[wordStatus]! - 1 },
    });
    wordList.splice(wordIndex.currentIndex, 1);
    dispatch({ type: 'wordList', payload: wordList.slice() });

    getWord(wordIndex.currentIndex);
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
        onClick: () => {
          getWord(wordIndex.preIndex!);
        },
      });
    }
    if (wordIndex.nextIndex !== null) {
      actions.push({
        key: 'next',
        text: '下一个',
        onClick: () => {
          getWord(wordIndex.nextIndex!);
        },
      });
    }
    return actions;
  }, [wordIndex, getWord]);

  useEffect(() => {
    if (wordDialogVisible) {
      audioRef.current = {
        am: document.getElementById('audioWordAm') as HTMLAudioElement,
        br: document.getElementById('audioWordBr') as HTMLAudioElement,
      };
      audioRef.current.am?.load();
      audioRef.current.br?.load();
    }
  }, [wordDialogVisible]);
  useEffect(() => {
    () => {
      audioRef.current = {
        am: null,
        br: null,
      };
    };
  }, []);

  return (
    <Dialog
      visible={wordDialogVisible}
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
                  onClick={() => wordHandle(WordStatus.unfamiliar)}>
                  不认识
                </Button>
              )}
              {wordStatus !== WordStatus.will && (
                <Button
                  color="warning"
                  size="small"
                  onClick={() => wordHandle(WordStatus.will)}>
                  不熟悉
                </Button>
              )}
              {wordStatus !== WordStatus.mastered && (
                <Button
                  color="success"
                  size="small"
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
            <source src={`https://dict.youdao.com/dictvoice?audio=${word.word}&type=2`} />
            <source
              src={`https://static2.youzack.com/youzack/wordaudio/us/${word.word}.mp3`}
            />
            <track kind="captions"></track>
          </audio>
          <audio className={classes.audio} id="audioWordBr">
            <source src={`https://dict.youdao.com/dictvoice?audio=${word.word}&type=1`} />
            <source
              src={`https://static2.youzack.com/youzack/wordaudio/br/${word.word}.mp3`}
            />
            <track kind="captions"></track>
          </audio>
        </>
      }
      onClose={() => {
        dispatch({ type: 'wordDialogVisible', payload: false });
      }}
      actions={[diaLogActions]}
    />
  );
};

export default WordDialog;