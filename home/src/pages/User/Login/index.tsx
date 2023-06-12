import { Footer } from '@/components';
import { login, retrievePassword } from '@/services/ant-design-pro/api';
import { getFakeCaptcha } from '@/services/ant-design-pro/login';

import {
  AlipayCircleOutlined,
  LockOutlined,
  MobileOutlined,
  TaobaoCircleOutlined,
  UserOutlined,
  WeiboCircleOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ModalForm,
  ProFormText,
} from '@ant-design/pro-components';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { FormattedMessage, history, SelectLang, useIntl, useModel, useLocation, Helmet } from '@umijs/max';
import { Alert, message, Tabs, Button } from 'antd';
import Settings from '../../../../config/defaultSettings';
import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { isPC } from "@/utils/utils";


import { PublicClientApplication, EventType, EventMessage, AuthenticationResult } from "@azure/msal-browser";
import { msalConfig, loginRequest } from "../../../authConfig";

export const msalInstance = new PublicClientApplication(msalConfig);

const ActionIcons = () => {
  const langClassName = useEmotionCss(({ token }) => {
    return {
      marginLeft: '8px',
      color: 'rgba(0, 0, 0, 0.2)',
      fontSize: '24px',
      verticalAlign: 'middle',
      cursor: 'pointer',
      transition: 'color 0.3s',
      '&:hover': {
        color: token.colorPrimaryActive,
      },
    };
  });

  return (
    <>
      <AlipayCircleOutlined key="AlipayCircleOutlined" className={langClassName} />
      <TaobaoCircleOutlined key="TaobaoCircleOutlined" className={langClassName} />
      <WeiboCircleOutlined key="WeiboCircleOutlined" className={langClassName} />
    </>
  );
};

const Lang = () => {
  const langClassName = useEmotionCss(({ token }) => {
    return {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    };
  });

  return (
    <div className={langClassName} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
  };





const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const [type, setType] = useState<string>('account');
  const [isAdmin, setIsAdmin] = useState<boolean>(useLocation().pathname == "/user/adminlogin" ? true : false);
  const { initialState, setInitialState } = useModel('@@initialState');
  const [isMP, setIsMP] = useState<boolean>(!isPC());
  const containerClassName = useEmotionCss(({ token }) => {

    return {
      [`@media screen and (max-width: ${token.screenMD}px)`]: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        backgroundImage:
          "url('/loginbg_xs.jpg')",
        backgroundSize: '100% 100%',
      },
      [`@media screen and (min-width: ${token.screenMD}px)`]: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        backgroundImage:
          "url('/loginbg.jpg')",
        backgroundSize: '100% 100%',
      }
    };
   
  });

  const titleClassName = useEmotionCss(({ token }) => {
    console.log(token)
    return {
      [`@media screen and (max-width: ${token.screenMD}px)`]: {
        height: 42,
        fontSize: '14px',
        fontWeight: 'bold',
        lineHeight: '42px',
        color: '#000',
        paddingLeft: `${token.paddingXS}px`,
        backgroundColor: '#F2F2F2',
        top: 0,
        left: 0,
        right: 0,
        position: 'fixed'
      },
      [`@media screen and (min-width: ${token.screenMD}px)`]: {
        height: 42,
        fontSize: '24px !important',
        fontWeight: 'bold',
        lineHeight: '42px',
        color: '#000',
        paddingLeft: '20px',
      
        backgroundColor: '#F2F2F2',
        top: 0,
        left: 0,
        right: 0,
        position: 'fixed'
      },
    };
   
  });

  const intl = useIntl();

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
   
    if (userInfo) {
      console.log(userInfo)
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };
  

  
  const handleSubmit = async (values: API.LoginParams) => {
    try {
      // 登录
      const msg = await login({ ...values, type });
      if (msg.status === 'ok') {
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
        message.success(defaultLoginSuccessMessage);
        setInitialState((s) => ({
          ...s,
          token: msg.token,
        }));
        localStorage.setItem('token', msg?.token || '');
       
        await fetchUserInfo();
        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/');
        return;
      }
      console.log(msg);
      // 如果失败去设置用户错误信息
      setUserLoginState(msg);
    } catch (error) {
      /*const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: '登录失败，请重试！',
      });
      console.log(error);
      message.error(defaultLoginFailureMessage);*/
    }
  };

 
   

  

  if (isAdmin) {
  
    useEffect(() => {
      msalInstance.addEventCallback((event: EventMessage) => {

        if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
          const payload = event.payload as AuthenticationResult;
          const account = payload.account;

          handleSubmit({ "superData": account })
          msalInstance.setActiveAccount(account);


        } else if (event.eventType === EventType.LOGOUT_END) {

          window.location.reload();
        }
      });
      const accounts = msalInstance.getAllAccounts();

      if (accounts.length > 0) {
        msalInstance.logoutPopup({
          mainWindowRedirectUri: '/#/user/adminlogin'
        });

        //console.log(accounts[0])
        //handleSubmit({ "username": "admin", password: "abc123456" })

      } else {

        msalInstance.loginPopup(loginRequest);
      }
    })
  }

 

  const { status, type: loginType } = userLoginState;

  return (
    <div className={containerClassName}>
      <div

        className={titleClassName}
      
      >
        EOS - Efficiency Optimization System
      </div>




      <div style={{ position: 'absolute', bottom: 20, left: 20, right:isMP?20:'none', padding: 20, backgroundColor:'rgba(0,0, 0, 0.6)', fontWeight: "bold", borderRadius: 10, }}>
        <div className="my-font-size" style={{ fontSize: "50px", color:"#fff" }}>
          EOS
        </div>
        <div style={{ fontSize: "18px", color: "#fff" }}>
          Blockchain empowered voyage timestamp management solution
        </div>

      </div>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: '登录页',
          })}
          - {Settings.title}
        </title>
      </Helmet>
      {/*<Lang /> */}
      {!isAdmin && (<div style={{
        position: 'absolute', right: isMP ? 20 : 70, left: isMP ? 20 : 'none', top: 70, 
      }}><div
        style={{
          border: '1px solid #F5F7F9',
          padding: '0px',
          backgroundColor: '#7BA8D9' }}
      >
          <LoginForm
            style={{ padding: isMP ? 10 : 0 }}
         
         // logo={<img alt="logo" src="/logo.png" />}
          //title="Demurrage Management System (DMS)"
         // subTitle={intl.formatMessage({ id: 'pages.layouts.userLayout.title' })}
          initialValues={{
            autoLogin: true,
          }}
          
          onFinish={async (values) => {

            
            await handleSubmit(values as API.LoginParams);
          }}
        >
         

          {status === 'error' && loginType === 'account' && (
            <LoginMessage
              content={intl.formatMessage({
                id: 'pages.login.accountLogin.errorMessage',
                defaultMessage: '账户或密码错误',
              })}
            />
          )}
          {type === 'account' && (
            <>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.username.placeholder',
                  defaultMessage: '用户名',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.username.required"
                        defaultMessage="请输入用户名!"
                      />
                    ),
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.password.placeholder',
                  defaultMessage: '密码',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.password.required"
                        defaultMessage="请输入密码！"
                      />
                    ),
                  },
                ]}
              />
            </>
          )}

          <div
            style={{
              height:'10px',
              marginBottom: 24,
            }}
          >
            <ModalForm<{
              name: string;
              company: string;
            }>
              title="Forgot your password?"
              trigger={
                <a
                  style={{
                    color: "#fff",
                    float: 'right',
                  }}
                >
                  <FormattedMessage id="pages.login.forgotPasswordxx" defaultMessage="Forgot your password?" />
                </a>
              }
             // form={form}
              autoFocusFirstInput
              modalProps={{
                destroyOnClose: true,
                onCancel: () => console.log('run'),
              }}
              submitTimeout={2000}
              onFinish={async (values) => {
                retrievePassword(values)
                message.success("Thanks! If your email address exists, you'll get an email with a link to reset your password shortly.");
                return true;
              }}
            >
              <ProFormText
                width="md"
                name="email"
                  label="Please enter your email address and we will send you a link to reset it"
                  placeholder="Please enter"
              />
            </ModalForm>
           
          </div>
         
        </LoginForm>
        
      </div>
        <div style={{
       
          border: '1px solid #F5F7F9',
        padding: '15px',
          backgroundColor: '#7BA8D9',
          marginBottom: 24,
         borderTop:0,
          maxWidth:400,
          color: '#fff'
        }}>
          By continuing, you agree to Efficiency Optimization System’s Terms of Service, Privacy Policy and Cookie Use.
        </div>
        </div>
      )}

      
      
    </div>
  );
};

export default Login;
