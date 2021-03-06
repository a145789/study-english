import { Button, Dialog, Divider, Space } from 'antd-mobile';
import { Action } from 'antd-mobile/es/components/dialog/dialog-action-button';
import { SoundOutline } from 'antd-mobile-icons';
import { FC, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { postHandle } from '../../utils/fetch';
import { WordStatus } from './constants';
import classes from './index.module.css';
import { WordStatusCountType } from './interface';
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
    wordListTabCount,
    wordStatus,
    wordDialogVisible,
    wordList,
    getWord,
    dispatch: wordDispatch,
  } = useContext(WordContextData);
  const { wordTypeId } = useParams();

  const [isLoading, setIsLoading] = useState(false);

  const loadingCb = {
    beforeCb: () => {
      setIsLoading(true);
    },
    resolveCb: () => {
      setIsLoading(false);
    },
    rejectCb: () => {
      setIsLoading(false);
    },
  };

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
    const { err, data } = await postHandle<WordStatusCountType>('word_handle', {
      wordId: word._id,
      wordTypeId,
      wordStatus,
      moveWordStatus: type,
    });
    if (err) {
      return;
    }

    wordDispatch({
      type: 'pageOptions',
      payload: {
        ...pageOptions,
        skip: pageOptions.skip === 0 ? 0 : pageOptions.skip - 1,
      },
    });
    if (wordStatus === WordStatus.unfamiliar) {
      wordDispatch({
        type: 'unfamiliarCount',
        payload: wordListTabCount[WordStatus.unfamiliar]! - 1,
      });
    }
    if (type === WordStatus.unfamiliar) {
      wordDispatch({
        type: 'unfamiliarCount',
        payload: wordListTabCount[WordStatus.unfamiliar]! + 1,
      });
    }

    wordDispatch({
      type: 'otherWordListCount',
      payload: {
        [WordStatus.will]: data.willCount,
        [WordStatus.mastered]: data.masteredCount,
        [WordStatus.familiar]: data.familiarCount,
      },
    });
    wordList.splice(wordIndex.currentIndex, 1);
    wordDispatch({ type: 'wordList', payload: wordList.slice() });

    getWord(wordIndex.currentIndex, loadingCb);
  };

  const diaLogActions = useMemo(() => {
    const actions: Action[] = [
      {
        key: 'confirm',
        text: '??????',
        disabled: isLoading,
        onClick: () => {
          wordDispatch({ type: 'wordDialogVisible', payload: false });
        },
      },
    ];
    if (wordIndex.preIndex !== null) {
      actions.unshift({
        key: 'pre',
        text: '?????????',
        disabled: isLoading,
        onClick: () => {
          getWord(wordIndex.preIndex!, loadingCb);
        },
      });
    }
    if (wordIndex.nextIndex !== null) {
      actions.push({
        key: 'next',
        text: '?????????',
        disabled: isLoading,
        onClick: () => {
          getWord(wordIndex.nextIndex!, loadingCb);
        },
      });
    }
    return [actions];
  }, [wordIndex, isLoading, getWord]);

  useEffect(() => {
    if (wordDialogVisible) {
      audioRef.current = {
        am: document.getElementById('audioWordAm') as HTMLAudioElement,
        br: document.getElementById('audioWordBr') as HTMLAudioElement,
      };
      audioRef.current.am?.load();
      audioRef.current.br?.load();
    }
  }, [wordDialogVisible, word.word]);
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
      content={
        <>
          <div>?????????{word.word}</div>
          <div>??????1???{word.translation_1}</div>
          <div>??????2???{word.translation_2}</div>
          <Divider />
          <div className={classes.audio_active}>
            ?????????{word.americanPhonetic}
            <SoundOutline
              color="var(--adm-color-primary)"
              onClick={() => audioWordHandle(AudioWordType.am)}
            />
          </div>
          <div className={classes.audio_active}>
            ?????????{word.britishPhonetic}
            <SoundOutline
              color="var(--adm-color-primary)"
              onClick={() => audioWordHandle(AudioWordType.br)}
            />
          </div>
          {Boolean(word.association?.length) && (
            <>
              <Divider />
              <div>????????????</div>
              {word.association.map(({ word, translation, _id }) => (
                <div key={_id}>
                  {word}???{translation}
                </div>
              ))}
            </>
          )}
          {Boolean(word.sampleSentences?.length) && (
            <>
              <Divider />
              <div>?????????</div>
              {word.sampleSentences.map(({ en, cn, _id }, index) => (
                <div key={_id}>
                  {index + 1}.{en} {cn}
                </div>
              ))}
            </>
          )}

          <Divider>??????</Divider>
          <div className={classes.word_handle_space}>
            <Space wrap>
              {wordStatus !== WordStatus.unfamiliar && (
                <Button
                  color="danger"
                  size="small"
                  loading={isLoading}
                  onClick={() => wordHandle(WordStatus.unfamiliar)}>
                  ?????????
                </Button>
              )}
              {wordStatus !== WordStatus.will && (
                <Button
                  color="warning"
                  size="small"
                  loading={isLoading}
                  onClick={() => wordHandle(WordStatus.will)}>
                  ?????????
                </Button>
              )}
              {wordStatus !== WordStatus.mastered && (
                <Button
                  color="success"
                  size="small"
                  loading={isLoading}
                  onClick={() => wordHandle(WordStatus.mastered)}>
                  ?????????
                </Button>
              )}
              {wordStatus !== WordStatus.familiar && (
                <Button
                  color="primary"
                  size="small"
                  loading={isLoading}
                  onClick={() => wordHandle(WordStatus.familiar)}>
                  ????????????
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
        wordDispatch({ type: 'wordDialogVisible', payload: false });
      }}
      actions={diaLogActions}
    />
  );
};

export default WordDialog;
