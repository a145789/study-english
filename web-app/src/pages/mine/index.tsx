import {
  AutoCenter,
  Button,
  Calendar,
  Dialog,
  Form,
  Input,
  List,
  Space,
  Toast,
} from 'antd-mobile';
import React, { FC, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { VERSION } from '../../constants';
import { CertificationProcess } from '../../constants';
import { RootContextData } from '../../store/ContextApp';
import { getHandle, postHandle } from '../../utils/fetch';
import { useLogout, useMainLoadingCb } from '../../utils/hooks';
import { checkUserName } from '../login';
import { WordStatusCountType } from '../word/interface';
import classes from './index.module.css';

const { Item: ListItem } = List;
const { Item: FormItem, useForm } = Form;
const { show: ToastShow } = Toast;
const { alert: DialogAlert, confirm: DialogConfirm } = Dialog;

const Mine: FC = () => {
  const { userInfo, setUserInfo, dispatch } = useContext(RootContextData);
  const navigate = useNavigate();
  const [form] = useForm();
  const loadingCb = useMainLoadingCb();
  const logout = useLogout();

  const [isUpdateUsername, setIsUpdateUsername] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);

  const getMasterCount = async () => {
    const { err, data } = await getHandle<WordStatusCountType>(
      'word_status_count',
      {
        mode: 'deduplication',
      },
      loadingCb,
    );
    if (err) {
      return;
    }
    setMasteredCount(data.masteredCount);
  };

  const updateUserName = async () => {
    try {
      await form.validateFields();
      const username: string = form.getFieldValue('username');
      const { err } = await postHandle('update_username', { username }, loadingCb);
      if (err) {
        return;
      }
      setUserInfo({ ...userInfo!, username });
      setIsUpdateUsername(false);
      ToastShow({
        icon: 'success',
        content: '修改成功',
      });
    } catch (error) {
      return;
    }
  };
  const logoutHandle = () => {
    DialogConfirm({
      content: '确认退出登录',
      onConfirm: async () => {
        await logout();
      },
    });
  };
  const punch = async () => {
    const { err, data } = await postHandle<{ punchTime: string[] }>(
      'punch',
      {},
      loadingCb,
    );
    if (err) {
      return;
    }
    DialogAlert({
      title: '打卡记录',
      content: (
        <Calendar
          renderLabel={(date) => {
            if (
              data.punchTime.some(
                (pDate) =>
                  new Date(date).toDateString() === new Date(pDate).toDateString(),
              )
            ) {
              return '已打卡';
            } else {
              return '';
            }
          }}
        />
      ),
      confirmText: '关闭',
    });
  };

  useEffect(() => {
    getMasterCount();
    dispatch({
      type: 'partialNavBar',
      payload: { title: '我的', backArrow: null },
    });
  }, []);
  return (
    <>
      <List mode="card" header="资料">
        {!isUpdateUsername ? (
          <ListItem
            arrow={
              <Button
                size="small"
                color="primary"
                onClick={() => setIsUpdateUsername(true)}>
                修改
              </Button>
            }>
            账号：{userInfo?.username}
          </ListItem>
        ) : (
          <Form form={form} layout="horizontal" className={classes.custom_form}>
            <FormItem
              name="username"
              label="账号："
              rules={[
                { required: true, message: `账号不能为空` },
                { validator: checkUserName },
              ]}
              extra={
                <Space>
                  <Button
                    size="small"
                    color="danger"
                    onClick={() => setIsUpdateUsername(false)}>
                    取消
                  </Button>
                  <Button size="small" color="success" onClick={() => updateUserName()}>
                    确定
                  </Button>
                </Space>
              }>
              <Input placeholder="请输入账号" clearable />
            </FormItem>
          </Form>
        )}
        <ListItem>邮箱：{userInfo?.email}</ListItem>
        <ListItem>已背单词：{masteredCount}</ListItem>
      </List>
      <List mode="card" header="操作">
        <ListItem onClick={() => punch()}>打卡</ListItem>
        <ListItem
          onClick={() => navigate(`/login/${CertificationProcess.updatePassword}`)}>
          修改密码
        </ListItem>
        <ListItem onClick={() => logoutHandle()}>退出登录</ListItem>
      </List>
      <AutoCenter className={classes.version}>版本号：v{VERSION}</AutoCenter>
    </>
  );
};

export default Mine;
