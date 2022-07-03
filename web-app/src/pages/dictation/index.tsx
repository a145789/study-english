import {
  Button,
  Card,
  Dialog,
  Divider,
  Empty,
  Input,
  List,
  Picker,
  ProgressCircle,
  Skeleton,
  Space,
  Steps,
  Tag,
  Toast,
} from 'antd-mobile';
import {
  CheckCircleOutline,
  CloseCircleOutline,
  LeftOutline,
  RightOutline,
} from 'antd-mobile-icons';
import { FC, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { RootContextData } from '../../store/ContextApp';
import { getHandle } from '../../utils/fetch';
import { useMainLoadingCb } from '../../utils/hooks';
import { DictationMode } from '../dictation-setting/constants';
import classes from './index.module.css';

const { Step } = Steps;
const { Item: ListItem } = List;
const { Paragraph: SkeletonParagraph } = Skeleton;
const { show: DialogShow, clear: DialogClear } = Dialog;

const Dictation: FC = () => {
  const { dictationSetting, dispatch } = useContext(RootContextData);
  const navigate = useNavigate();
  const loadingCb = useMainLoadingCb();

  const [words, setWords] = useState<
    {
      word: string;
      translation_1: string;
      translation_2: string;
      mode: DictationMode;
      dictationWord: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentDictation, setCurrentDictation] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [step, setStep] = useState(0);

  const word = useMemo(() => words[currentIndex], [currentIndex, words]);
  const percent = useMemo(
    () => (words.length ? Math.round(((currentIndex + 1) / words.length) * 100) : 0),
    [currentIndex, words],
  );
  const cardExtra = useMemo(
    () =>
      Number(dictationSetting?.count) > words.length ? (
        <Tag color="warning">{`此选项单词不足${dictationSetting!.count}个`}</Tag>
      ) : null,
    [dictationSetting, words],
  );
  const pickerColumns = useMemo(
    () => [words.map((_, index) => ({ value: index, label: index + 1 }))],
    [words],
  );
  const contentCenter = useMemo(() => {
    if (!word) {
      return null;
    }
    switch (word.mode) {
      case DictationMode.CnToEn:
        return (
          <>
            <div className={classes.translation}>中译1：{word.translation_1}</div>
            <div className={classes.translation}>中译2：{word.translation_2}</div>
            <Divider />
          </>
        );
      case DictationMode.EnToCn:
        return (
          <>
            <div className={classes.translation}>英语单词：{word.word}</div>
            <Divider />
          </>
        );

      default:
        return null;
    }
  }, [word]);

  const getDictation = async () => {
    setLoading(true);
    const { count, wordBank, wordStatus } = dictationSetting!;

    const { data, err } = await getHandle<
      { word: string; translation_1: string; translation_2: string }[]
    >('word_dictation', { count, wordBank, wordStatus }, loadingCb);
    if (err) {
      return;
    }
    if (!data.length) {
      Toast.show('该选择项下没有可以听写的单词，请返回重新选择');
      return;
    }

    let tempWords: typeof words = [];
    switch (dictationSetting!.mode) {
      case DictationMode.CnToEn:
        tempWords = data.map(({ word, translation_1, translation_2 }) => ({
          word,
          translation_1,
          translation_2,
          mode: dictationSetting!.mode,
          dictationWord: '',
        }));
        break;
      case DictationMode.EnToCn:
        tempWords = data.map(({ word, translation_1, translation_2 }) => ({
          word,
          translation_1,
          translation_2,
          mode: dictationSetting!.mode,
          dictationWord: '',
        }));
        break;
      case DictationMode.mix:
        tempWords = data.map(({ word, translation_1, translation_2 }) => {
          if (Math.random() > 0.5) {
            return {
              word,
              translation_1,
              translation_2,
              mode: DictationMode.CnToEn,
              dictationWord: '',
            };
          } else {
            return {
              word,
              translation_1,
              translation_2,
              mode: DictationMode.EnToCn,
              dictationWord: '',
            };
          }
        });
        break;

      default:
        break;
    }
    setWords(tempWords);
    setLoading(false);
  };

  const handle = (type: 'add' | 'del' | number) => {
    switch (type) {
      case 'add':
        setCurrentIndex(currentIndex + 1);
        break;
      case 'del':
        setCurrentIndex(currentIndex - 1);
        break;
      default:
        if (type === currentIndex) {
          return;
        }
        setCurrentIndex(type);
        break;
    }
    if (currentDictation) {
      word.dictationWord = currentDictation;
      words.splice(currentIndex, 1, word);
      setWords(words.slice());
      setCurrentDictation('');
    }
  };

  const submit = () => {
    if (currentDictation) {
      word.dictationWord = currentDictation;
      words.splice(currentIndex, 1, word);
      setWords(words.slice());
    }
    if (words.some(({ dictationWord }) => !dictationWord)) {
      DialogShow({
        title: '提示',
        content: '检测到您有未填写的单词，是否继续提交？',
        closeOnAction: true,
        actions: [
          [
            {
              key: 'cancel',
              text: '返回',
            },
            {
              key: 'submit',
              text: '确定',
              bold: true,
              danger: true,
              onClick() {
                toCheck();
              },
            },
          ],
        ],
      });
      return;
    }
    toCheck();
  };

  const toCheck = () => {
    setStep(1);
  };

  useEffect(() => {
    if (!dictationSetting) {
      navigate('/dictation-setting', { replace: true });
      return;
    }
    dispatch({
      type: 'partialNavBar',
      payload: { title: '听写设置', backArrow: true },
    });
    getDictation();
    return () => {
      DialogClear();
    };
  }, []);
  return (
    <div className={classes.box}>
      {words.length ? (
        <>
          <Steps current={step}>
            <Step title="听写" />
            <Step title="检查" />
          </Steps>
          {step === 0 ? (
            <>
              <Card
                title={`${currentIndex + 1}.${
                  word.mode === DictationMode.CnToEn ? '汉译英' : '英译汉'
                }`}
                extra={cardExtra}>
                <div className={classes.progress}>
                  <ProgressCircle percent={percent}>
                    <span className={classes.middle}>
                      {currentIndex + 1}/{words.length}
                    </span>
                  </ProgressCircle>
                </div>
                <div className={classes.card_content}>
                  {contentCenter}
                  <Input
                    placeholder="请输入翻译"
                    value={currentDictation}
                    onChange={setCurrentDictation}
                  />

                  <div className={classes.page}>
                    <Space>
                      <Button disabled={currentIndex === 0} onClick={() => handle('del')}>
                        <LeftOutline />
                      </Button>
                      <Button onClick={() => setPickerVisible(true)}>跳转</Button>
                      <Button
                        disabled={currentIndex === words.length - 1}
                        onClick={() => handle('add')}>
                        <RightOutline />
                      </Button>
                    </Space>
                  </div>
                </div>
              </Card>
              {currentIndex === words.length - 1 && (
                <Button
                  block
                  color="primary"
                  size="large"
                  className={classes.submit}
                  onClick={() => submit()}>
                  提交
                </Button>
              )}
              <Picker
                columns={pickerColumns as any}
                visible={pickerVisible}
                onClose={() => {
                  setPickerVisible(false);
                }}
                onConfirm={(v: any[]) => {
                  handle(v[0]);
                }}
              />
            </>
          ) : (
            <>
              <div className={classes.result}>
                <List>
                  {words.map(
                    (
                      { word, translation_1, translation_2, dictationWord, mode },
                      index,
                    ) => (
                      <ListItem
                        key={word}
                        description={
                          <>
                            <div>你的答案：{dictationWord}</div>
                            <div>
                              真实答案：
                              {mode === DictationMode.CnToEn
                                ? word
                                : `${translation_1} | ${translation_2}`}
                            </div>
                          </>
                        }
                        arrow={
                          mode === DictationMode.CnToEn ? (
                            dictationWord === word ? (
                              <CheckCircleOutline color="var(--adm-color-success)" />
                            ) : (
                              <CloseCircleOutline color="var(--adm-color-danger)" />
                            )
                          ) : (
                            '自检'
                          )
                        }>
                        <div>
                          问题：
                          {mode === DictationMode.CnToEn
                            ? `${translation_1} | ${translation_2}`
                            : word}
                        </div>
                      </ListItem>
                    ),
                  )}
                </List>
              </div>
              <Button
                block
                color="primary"
                size="large"
                className={classes.submit}
                onClick={() => navigate(-1)}>
                返回
              </Button>
            </>
          )}
        </>
      ) : loading ? (
        <SkeletonParagraph lineCount={12} animated />
      ) : (
        <Empty
          description="该选择项下没有可以听写的单词，请返回重新选择"
          imageStyle={{ width: 128 }}
        />
      )}
    </div>
  );
};

export default Dictation;
