import { Button, Form, Input } from 'antd-mobile';
import React, { useContext, useEffect } from 'react';

const { Item: FormItem } = Form;

import { ContextData } from '../../store/ContextApp';
import classes from './index.module.css';

const checkUserName = (_: any, value: string) => {
  if (!value || value.length < 1) {
    return Promise.resolve();
  }
  if (!/[a-zA-Z]/.test(value[0])) {
    return Promise.reject(new Error('用户名必须以大小写字母开头'));
  } else {
    return Promise.resolve();
  }
};

const checkPassWord = (_: any, value: string) => {
  if (value && value.length < 6) {
    return Promise.reject(new Error('密码长度不能小于6位'));
  } else {
    return Promise.resolve();
  }
};

const Login = () => {
  const { dispatch } = useContext(ContextData);

  const submit = (values: any) => {
    dispatch({ type: 'isLoading', payload: true });
    console.log(values);
  };

  useEffect(() => {
    dispatch({ type: 'title', payload: '登录' });
    dispatch({ type: 'isShowTabBar', payload: false });
    return () => {
      dispatch({ type: 'isShowTabBar', payload: true });
    };
  }, []);

  return (
    <div className={classes.login}>
      <Form
        className={classes.login_form}
        onFinish={submit}
        footer={
          <Button
            block
            type="submit"
            color="primary"
            size="large"
            className={classes.login_button}>
            提交
          </Button>
        }>
        <FormItem
          name="username"
          label="账号"
          rules={[
            { required: true, message: '账号不能为空' },
            { validator: checkUserName },
          ]}>
          <Input placeholder="请输入账号" clearable />
        </FormItem>
        <FormItem
          name="password"
          label="密码"
          rules={[
            { required: true, message: '密码不能为空' },
            { validator: checkPassWord },
          ]}>
          <Input placeholder="请输入密码" clearable type="password" />
        </FormItem>
      </Form>
    </div>
  );
};

export default Login;
