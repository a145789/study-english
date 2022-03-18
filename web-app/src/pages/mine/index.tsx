import { AutoCenter, Button, Form, Input, List, Space, Toast } from 'antd-mobile';
import React, { FC, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { VERSION } from '../../constants';
import { CertificationProcess } from '../../constants';
import { RootContextData } from '../../store/ContextApp';
import { postHandle } from '../../utils/fetch';
import { useMainLoadingCb } from '../../utils/hooks';
import { checkUserName } from '../login';
import classes from './index.module.css';

const { Item: ListItem } = List;
const { Item: FormItem } = Form;
const { show: ToastShow } = Toast;

const Mine: FC = () => {
  const { navBar, userInfo, setUserInfo, dispatch } = useContext(RootContextData);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const loadingCb = useMainLoadingCb();

  const [isUpdateUsername, setIsUpdateUsername] = useState(false);

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

  useEffect(() => {
    dispatch({
      type: 'navBar',
      payload: { ...navBar, title: '我的', backArrow: null },
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
      </List>
      <List mode="card" header="操作">
        <ListItem
          onClick={() => navigate(`/login/${CertificationProcess.updatePassword}`)}>
          修改密码
        </ListItem>
      </List>
      <AutoCenter className={classes.version}>版本号：v{VERSION}</AutoCenter>
    </>
  );
};

export default Mine;
