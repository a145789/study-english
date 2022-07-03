import { Button, Form, Input, Toast } from 'antd-mobile';
import { Md5 } from 'md5-typescript';
import { ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { CertificationProcess } from '../../constants';
import { UserInfo } from '../../interface';
import { RootContextData } from '../../store/ContextApp';
import { postHandle } from '../../utils/fetch';
import { useLogout, useMainLoadingCb } from '../../utils/hooks';
import classes from './index.module.css';

const { Item: FormItem } = Form;
const { show: ToastShow } = Toast;

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

export const checkUserName = (_: any, value: string) => {
  if (!value || value.length < 1) {
    return Promise.resolve();
  }
  if (value.length > 9) {
    return Promise.reject('账号长度不能超过9位');
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
  const { navBar, userInfo, setUserInfo, dispatch } = useContext(RootContextData);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const logout = useLogout();

  const { process } = useParams<{ process: CertificationProcess }>();

  const [certificationProcess, setCertificationProcess] = useState<CertificationProcess>(
    process || CertificationProcess.login,
  );
  const [isUseCodeLogin, setIsUseCodeLogin] = useState(false);
  const [codeStatus, setCodeStatus] = useState(CodeStatus.send);
  const [codePendingNum, setPendingCode] = useState(INIT_PENDING_TIME);
  const loadingCb = useMainLoadingCb();

  const codeTimerRef = useRef<number>(0);
  const navBarRef = useRef<ReactNode>(navBar.right);

  const submit = async (values: any) => {
    switch (certificationProcess) {
      case CertificationProcess.login: {
        const params = { ...values, isUseCodeLogin };
        !isUseCodeLogin && (params.password = Md5.init(values.password));
        const { err, data } = await postHandle<UserInfo>('login', params, loadingCb);
        if (err) {
          return;
        }

        ToastShow({
          icon: 'success',
          content: '登录成功',
        });
        setUserInfo(data);
        dispatch({ type: 'isLogin', payload: true });
        navBarRef.current = null;
        navigate('/', { replace: true });
        break;
      }
      case CertificationProcess.register: {
        const { err } = await postHandle('register', {
          ...values,
          password: Md5.init(values.password),
          loadingCb,
        });
        if (err) {
          return;
        }

        ToastShow({
          icon: 'success',
          content: '注册成功',
        });
        setCertificationProcess(CertificationProcess.login);

        break;
      }
      case CertificationProcess.updatePassword:
        {
          const { err } = await postHandle('update_password', {
            ...values,
            password: Md5.init(values.password),
            loadingCb,
          });
          if (err) {
            return;
          }

          ToastShow({
            icon: 'success',
            content: '修改成功',
          });

          logout({ notToReplaceHome: true });
          setCertificationProcess(CertificationProcess.login);
        }
        break;

      default:
        break;
    }
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

    const { err } = await postHandle(
      'getEmailCode',
      {
        email,
        isUseCodeLogin,
        isUpdatePassword: certificationProcess === CertificationProcess.updatePassword,
      },
      loadingCb,
    );
    if (err) {
      return;
    }

    setCodeStatus(CodeStatus.pending);
  };

  useEffect(() => {
    form.resetFields();
  }, [certificationProcess, isUseCodeLogin]);
  useEffect(() => {
    let title = '';
    switch (certificationProcess) {
      case CertificationProcess.login:
        setCodeStatus(CodeStatus.send);
        setPendingCode(INIT_PENDING_TIME);
        clearTimeout(codeTimerRef.current);
        title = '登录';

        break;
      case CertificationProcess.register:
        title = '注册';

        break;
      case CertificationProcess.updatePassword:
        title = '修改密码';

        form.setFieldsValue({ email: userInfo?.email });
        break;

      default:
        break;
    }
    dispatch({
      type: 'partialNavBar',
      payload: {
        ...navBar,
        title,
        backArrow: true,
        right: null,
      },
    });
  }, [certificationProcess]);

  useEffect(() => {
    if (codeStatus !== CodeStatus.pending) {
      return;
    }
    codeTimerRef.current = setTimeout(() => {
      const nextPendingNum = codePendingNum - 1;
      if (nextPendingNum < 0) {
        setCodeStatus(CodeStatus.resend);
        return;
      }
      setPendingCode(nextPendingNum);
    }, 1000);
    return () => {
      clearTimeout(codeTimerRef.current);
    };
  }, [codeStatus, codePendingNum]);
  useEffect(() => {
    dispatch({ type: 'isShowTabBar', payload: false });
    return () => {
      dispatch({ type: 'isShowTabBar', payload: true });
      dispatch({
        type: 'partialNavBar',
        payload: { right: navBarRef.current },
      });
      navBarRef.current = null;
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
        <Input
          disabled={certificationProcess === CertificationProcess.updatePassword}
          placeholder="请输入邮箱"
          clearable
        />
      </FormItem>
    ),
    [certificationProcess],
  );

  const emailCodeEle = useMemo(
    () => (
      <FormItem
        name="emailCode"
        label="邮箱验证码"
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
        <Input placeholder="请输入" type="tel" />
      </FormItem>
    ),
    [isUseCodeLogin, codeStatus, codePendingNum],
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
            {emailEle}
            {emailCodeEle}
            {passwordEle}
          </>
        );

      default:
        break;
    }
  }, [
    certificationProcess,
    isUseCodeLogin,
    usernameEle,
    passwordEle,
    emailEle,
    emailCodeEle,
  ]);

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
