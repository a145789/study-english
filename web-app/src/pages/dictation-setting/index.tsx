import { Button, Form, NoticeBar, Selector, Slider } from 'antd-mobile';
import React, { FC, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { RootContextData } from '../../store/ContextApp';
import { getHandle } from '../../utils/fetch';
import { useMainLoadingCb } from '../../utils/hooks';
import { WordStatus } from '../word/constants';
import { DictationMode } from './constants';

const { Item: FormItem } = Form;
const required = [{ required: true }];

const DictationSetting: FC = () => {
  const { dispatch } = useContext(RootContextData);
  const navigate = useNavigate();
  const loadingCb = useMainLoadingCb();

  const [wordBank, setWordBank] = useState<{ label: string; value: string }[]>([]);
  const [count, setCount] = useState(1);

  const getWordBank = async () => {
    const { data, err } = await getHandle<
      {
        _id: string;
        name: string;
        type: string;
      }[]
    >('word_type_list', {}, loadingCb);
    if (err) {
      return;
    }
    setWordBank(data.map(({ _id: value, name: label }) => ({ label, value })));
  };

  const onFinish = ({
    count,
    mode,
    wordBank,
    wordStatus,
  }: {
    count: number;
    mode: [number];
    wordBank: string[];
    wordStatus: string[];
  }) => {
    dispatch({
      type: 'dictationSetting',
      payload: { count, mode: mode[0], wordBank, wordStatus },
    });

    navigate('/dictation');
  };

  useEffect(() => {
    dispatch({
      type: 'partialNavBar',
      payload: { title: '听写设置', backArrow: true },
    });
    getWordBank();
  }, []);
  return (
    <>
      <NoticeBar
        content="词库、背诵状态可多选，模式为单选。将会从中随机抽选听写数量的单词。最多只能选择30个。"
        color="alert"
        closeable
      />
      <Form
        layout="horizontal"
        mode="card"
        onFinish={onFinish}
        footer={
          <Button block type="submit" color="primary" size="large">
            开始
          </Button>
        }>
        <FormItem name="wordBank" label="词库" rules={required}>
          <Selector multiple options={wordBank} />
        </FormItem>
        <FormItem name="wordStatus" label="背诵状态" rules={required}>
          <Selector
            multiple
            options={[
              { label: '不熟悉', value: WordStatus.will },
              { label: '已了解', value: WordStatus.mastered },
              { label: '早就认识', value: WordStatus.familiar },
            ]}
          />
        </FormItem>
        <FormItem name="mode" label="模式" rules={required}>
          <Selector
            options={[
              { label: '汉译英', value: DictationMode.CnToEn },
              { label: '英译汉', value: DictationMode.EnToCn },
              { label: '混合', value: DictationMode.mix },
            ]}
          />
        </FormItem>
        <FormItem
          name="count"
          label="听写数量"
          rules={required}
          initialValue={1}
          extra={count}>
          <Slider
            onChange={(value) => setCount(value as number)}
            step={1}
            max={30}
            min={1}
          />
        </FormItem>
      </Form>
    </>
  );
};

export default DictationSetting;
