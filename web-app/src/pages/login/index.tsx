import { Button, Form, Input } from 'antd-mobile';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const { Item: FormItem } = Form;
import { useNavigate } from 'react-router-dom';

import { CertificationProcess } from '../../constants';
import { ContextData } from '../../store/ContextApp';
import classes from './index.module.css';

const checkUserEmail = (_: any, value: string) => {
  if (value && !/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/.test(value)) {
    return Promise.reject('邮箱格式不正确');
  }
  return Promise.resolve();
};

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
  const { navBar, dispatch } = useContext(ContextData);
  const navigate = useNavigate();

  const { process } = useParams();

  console.log(process);

  const [certificationProcess, setCertificationProcess] = useState(
    process || CertificationProcess.login,
  );

  const submit = (values: any) => {
    dispatch({ type: 'isLoading', payload: true });
    console.log(values);
  };

  // 去注册
  const toRegister = () => {
    navigate('/register');
  };

  useEffect(() => {
    switch (certificationProcess) {
      case CertificationProcess.login:
        dispatch({
          type: 'navBar',
          payload: {
            ...navBar,
            title: '登录',
            backArrow: true,
            right: null,
          },
        });
        break;
      case CertificationProcess.register:
        dispatch({
          type: 'navBar',
          payload: {
            ...navBar,
            title: '注册',
            backArrow: true,
            right: null,
          },
        });
        break;
      case CertificationProcess.updatePassword:
        dispatch({
          type: 'navBar',
          payload: {
            ...navBar,
            title: '修改密码',
            backArrow: true,
            right: null,
          },
        });
        break;

      default:
        break;
    }
  }, [certificationProcess]);

  useEffect(() => {
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
        {certificationProcess === CertificationProcess.register && (
          <>
            <FormItem
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '邮箱不能为空' },
                { validator: checkUserEmail },
              ]}>
              <Input placeholder="请输入邮箱" clearable />
            </FormItem>
            <FormItem
              name="code"
              label="短信验证码"
              rules={[{ required: true, message: '短信验证码不能为空' }]}
              extra={
                <Button color="primary" fill="none" size="mini">
                  发送验证码
                </Button>
              }>
              <Input placeholder="请输入" type="number" />
            </FormItem>
          </>
        )}
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

      {certificationProcess !== CertificationProcess.updatePassword && (
        <Button
          className={classes.login_switch}
          color="primary"
          fill="none"
          onClick={() =>
            setCertificationProcess(
              certificationProcess === CertificationProcess.login
                ? CertificationProcess.register
                : CertificationProcess.login,
            )
          }>
          {certificationProcess === CertificationProcess.login ? '去注册' : '去登录'}
        </Button>
      )}
    </div>
  );
};

export default Login;
