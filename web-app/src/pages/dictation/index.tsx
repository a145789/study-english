import { Button, Form, NoticeBar, Selector, Skeleton, Slider, Toast } from 'antd-mobile';
import React, { FC, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { RootContextData } from '../../store/ContextApp';
import { getHandle } from '../../utils/fetch';
import { useMainLoadingCb } from '../../utils/hooks';
import { WordStatus } from '../word/constants';

const { Item: FormItem, useForm } = Form;
const { Title: SkeletonTitle, Paragraph: SkeletonParagraph } = Skeleton;
const required = [{ required: true }];

const Dictation: FC = () => {
  const { dictationSetting, dispatch } = useContext(RootContextData);
  const navigate = useNavigate();
  const loadingCb = useMainLoadingCb();

  const [words, setWords] = useState<any[]>([]);

  const getDictation = async () => {
    const { count, wordBank, wordStatus } = dictationSetting!;

    const { data, err } = await getHandle<any[]>(
      'word_dictation',
      { count, wordBank, wordStatus },
      loadingCb,
    );
    if (err) {
      return;
    }
    if (!data.length) {
      Toast.show('该选择项下没有可以听写的单词');
      navigate('/dictation-setting');
      return;
    }
    setWords(data);
  };

  useEffect(() => {
    if (!dictationSetting) {
      navigate('/dictation-setting');
      return;
    }
    dispatch({
      type: 'partialNavBar',
      payload: { title: '听写设置', backArrow: true },
    });
    getDictation();
  }, []);
  return (
    <>
      {words.length ? (
        <div>待上线。。。</div>
      ) : (
        <>
          {' '}
          <SkeletonTitle animated />
          <SkeletonParagraph lineCount={5} animated />
        </>
      )}
    </>
  );
};

export default Dictation;
