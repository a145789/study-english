import { Button, Form, Input, Toast } from 'antd-mobile';
import { Md5 } from 'md5-typescript';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

const { Item: FormItem } = Form;
const { show: ToastShow } = Toast;
import { useNavigate } from 'react-router-dom';

import { CertificationProcess } from '../../constants';
import { ContextData } from '../../store/ContextApp';
import { getHandle, postHandle } from '../../utils/fetch';
import classes from './index.module.css';

const enum CodeStatus {
  send,
  pending,
  resend,
}

const emailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;

const INIT_PENDING_TIME = 60;

const checkUserEmail = (_: any, value: string) => {
  if (value && !emailReg.test(value)) {
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
  }
  if (emailReg.test(value)) {
    return Promise.reject('账号请勿使用邮箱格式');
  }
  return Promise.resolve();
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
  const [form] = Form.useForm();

  const { process } = useParams();

  const [certificationProcess, setCertificationProcess] = useState(
    process || CertificationProcess.login,
  );
  const [isUseCodeLogin, setIsUseCodeLogin] = useState(false);
  const [codeStatus, setCodeStatus] = useState(CodeStatus.send);
  const [codePendingNum, setPendingCode] = useState(INIT_PENDING_TIME);

  const codeTimer = useRef<number>(0);

  const cancelLoading = () => dispatch({ type: 'isLoading', payload: false });

  const submit = async (values: any) => {
    dispatch({ type: 'isLoading', payload: true });
    switch (certificationProcess) {
      case CertificationProcess.login: {
        const params = { ...values, isUseCodeLogin };
        !isUseCodeLogin && (params.password = Md5.init(values.password));
        const { err, data } = await postHandle<{
          userId: string;
          username: string;
          email: string;
        }>('login', params, cancelLoading);
        if (err) {
          return;
        }

        ToastShow({
          icon: 'success',
          content: '登录成功',
        });
        dispatch({ type: 'userInfo', payload: data });
        dispatch({ type: 'isLogin', payload: true });
        navigate('/');
        break;
      }
      case CertificationProcess.register: {
        const { err } = await postHandle('register', {
          ...values,
          password: Md5.init(values.password),
          cancelLoading,
        });
        if (err) {
          return;
        }

        ToastShow({
          icon: 'success',
          content: '注册成功',
        });

        break;
      }
      case CertificationProcess.updatePassword:
        console.log('updatePassword');
        break;

      default:
        break;
    }
    dispatch({ type: 'isLoading', payload: false });
  };

  const sendCode = async () => {
    const email = form.getFieldValue('email');
    const emailErr = form.getFieldError('email');
    if (!email) {
      ToastShow({
        icon: 'fail',
        content: '请先填写邮箱',
      });
      return;
    }
    if (emailErr?.length) {
      ToastShow({
        icon: 'fail',
        content: emailErr[0],
      });
      return;
    }

    dispatch({ type: 'isLoading', payload: true });
    const { err } = await postHandle(
      'getEmailCode',
      { email, isUseCodeLogin },
      cancelLoading,
    );
    if (err) {
      return;
    }

    dispatch({ type: 'isLoading', payload: false });
    setCodeStatus(CodeStatus.pending);
  };

  useEffect(() => {
    switch (certificationProcess) {
      case CertificationProcess.login:
        setCodeStatus(CodeStatus.send);
        setPendingCode(INIT_PENDING_TIME);
        clearTimeout(codeTimer.current);
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
    setIsUseCodeLogin(false);
    form.resetFields();
  }, [certificationProcess]);

  useEffect(() => {
    if (codeStatus !== CodeStatus.pending) {
      return;
    }
    codeTimer.current = setTimeout(() => {
      const nextPendingNum = codePendingNum - 1;
      if (nextPendingNum < 0) {
        setCodeStatus(CodeStatus.resend);
        return;
      }
      setPendingCode(nextPendingNum);
    }, 1000);
    return () => {
      clearTimeout(codeTimer.current);
    };
  }, [codeStatus, codePendingNum]);

  useEffect(() => {
    dispatch({ type: 'isShowTabBar', payload: false });
    return () => {
      dispatch({ type: 'isShowTabBar', payload: true });
    };
  }, []);

  const usernameEle = useMemo(() => {
    const isLoginStatus = certificationProcess === CertificationProcess.login;
    const rules: any[] = [
      { required: true, message: `账号${isLoginStatus ? '/邮箱' : ''}不能为空` },
    ];
    !isLoginStatus && rules.push({ validator: checkUserName });
    return (
      <FormItem
        name="username"
        label={`账号${isLoginStatus ? '/邮箱' : ''}`}
        rules={rules}>
        <Input placeholder={`请输入账号${isLoginStatus ? '/邮箱' : ''}`} clearable />
      </FormItem>
    );
  }, [certificationProcess]);

  const passwordEle = useMemo(
    () => (
      <FormItem
        name="password"
        label="密码"
        rules={[
          { required: true, message: '密码不能为空' },
          { validator: checkPassWord },
        ]}>
        <Input placeholder="请输入密码" clearable type="password" />
      </FormItem>
    ),
    [],
  );

  const emailEle = useMemo(
    () => (
      <FormItem
        name="email"
        label="邮箱"
        rules={[
          { required: true, message: '邮箱不能为空' },
          { validator: checkUserEmail },
        ]}>
        <Input placeholder="请输入邮箱" clearable />
      </FormItem>
    ),
    [],
  );

  const emailCodeEle = useMemo(
    () => (
      <FormItem
        name="emailCode"
        label="短信验证码"
        rules={[{ required: true, message: '请输入四位验证码', len: 4 }]}
        extra={
          <Button
            color="primary"
            fill="none"
            size="small"
            disabled={codeStatus === CodeStatus.pending}
            onClick={() => sendCode()}>
            {codeStatus === CodeStatus.send
              ? '发送验证码'
              : codeStatus === CodeStatus.pending
              ? codePendingNum
              : '重新发送'}
          </Button>
        }>
        <Input placeholder="请输入" type="number" />
      </FormItem>
    ),
    [codeStatus, codePendingNum],
  );

  const formEle = useMemo(() => {
    switch (certificationProcess) {
      case CertificationProcess.login:
        return !isUseCodeLogin ? (
          <>
            {usernameEle}
            {passwordEle}
          </>
        ) : (
          <>
            {emailEle}
            {emailCodeEle}
          </>
        );
      case CertificationProcess.register:
        return (
          <>
            {usernameEle}
            {passwordEle}
            {emailEle}
            {emailCodeEle}
          </>
        );
      case CertificationProcess.updatePassword:
        return (
          <>
            {usernameEle}
            {passwordEle}
          </>
        );

      default:
        break;
    }
  }, [isUseCodeLogin, usernameEle, passwordEle, emailEle, emailCodeEle]);

  return (
    <div className={classes.login}>
      <Form
        form={form}
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
        {formEle}
      </Form>

      {certificationProcess === CertificationProcess.login && (
        <Button
          className={classes.login_switch}
          color="primary"
          fill="none"
          onClick={() => setIsUseCodeLogin(!isUseCodeLogin)}>
          {isUseCodeLogin ? '使用账号密码登录' : '使用邮箱验证码登录'}
        </Button>
      )}
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
