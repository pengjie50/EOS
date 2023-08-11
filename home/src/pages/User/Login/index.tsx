import { Footer, getSearchObj } from '@/components';
import { login, retrievePassword } from '@/services/ant-design-pro/api';
import { getFakeCaptcha } from '@/services/ant-design-pro/login';
import { fieldUniquenessCheck } from '@/services/ant-design-pro/api';
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
  ProFormDependency,
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
import { modifyPassword } from '../../system/user/service';
import { KeepAliveContext } from '@umijs/max';
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

  var searchObj = getSearchObj(useLocation()?.search)



  if (searchObj.redirect == "/transactions?eos_id") {
    searchObj.redirect = "/transactions"
    var a = useLocation().search.split("=")
    searchObj.eos_id = [a[a.length - 1]]

  }

  if (searchObj.redirect == "/threshold/alert?alert_id") {
    searchObj.redirect = "/threshold/alert"
    var a = useLocation().search.split("=")
    searchObj.alert_id = [a[a.length - 1]]

  }



  const [redirect, setRedirect] = useState<string>(searchObj?.redirect || '/');


  const [check, setCheck] = useState<string>(searchObj?.check?.replace("@", "&") || false);

  const [resetcheck, setResetcheck] = useState<string>(searchObj?.resetcheck?.replace("@", "&") || false);


  const { updateTab, dropByCacheKey, dropOtherTabs, refreshTab } = React.useContext(KeepAliveContext);
  const [modalVisit, setModalVisit] = useState<boolean>(check || resetcheck);
  const onlyCheck = (rule: any, value: any, callback: (arg0: string | undefined) => void) => {
    if (!(/^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/.test(value))) {
      callback(undefined);
    }

    fieldUniquenessCheck({ where: { username: value }, model: 'User' }).then((res) => {

      if (!res.data) {

        callback(intl.formatMessage({
          id: 'pages.xxx',
          defaultMessage: 'No account found with that email.',
        }))
      } else {
        callback(undefined);
      }
    });

  }
  const handleFinish = async (values: { [key: string]: any; } | undefined) => {
    if (values) {

      values.check = check
      if (resetcheck) {
        values.check = resetcheck
      }
    }

    await modifyPassword({ ...values });
    message.success(resetcheck ? "Your password has been reset successfully.Please log in using the new password" : "Your password has been set successfully. Please log in using the set password");
    setModalVisit(false)
   
  };

  const containerClassName = useEmotionCss(({ token }) => {

    return {
      [`@media screen and (max-width: ${token.screenMD}px)`]: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        backgroundSize: '100% 100%',
      },
      [`@media screen and (min-width: ${token.screenMD}px)`]: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        backgroundSize: '100% 100%',
      }
    };

  });

  const titleClassName = useEmotionCss(({ token }) => {

    return {
      [`@media screen and (max-width: ${token.screenMD}px)`]: {
        height: 42,
        fontSize: '14px',
        fontWeight: 'bold',
        lineHeight: '42px',
        fontFamily: "Alaska !important",
        color: '#fff',
        paddingLeft: `${token.paddingXS}px`,
        backgroundColor: 'rgba(0,0, 0, 0.6)',
        top: 0,
        left: 0,
        right: 0,
        position: 'fixed'
      },
      [`@media screen and (min-width: ${token.screenMD}px)`]: {
        height: 42,
        fontSize: '24px !important',
        fontFamily: "Alaska !important",
        fontWeight: 'bold',
        lineHeight: '42px',
        color: '#FFF',
        paddingLeft: '20px',

        backgroundColor: 'rgba(0,0, 0, 0.6)',
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


      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
    return userInfo
  };



  const handleSubmit = async (values: API.LoginParams) => {
    try {

      const msg = await login({ ...values, type });
      if (msg.status === 'ok') {
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '',
        });
        message.success(defaultLoginSuccessMessage);
        setInitialState((s) => ({
          ...s,
          token: msg.token,
        }));
        localStorage.setItem('token', msg?.token || '');

        var user = await fetchUserInfo();
        if (user.role_type === 'Super') {
          localStorage.setItem('isAdmin', "true");
        } else {
          localStorage.setItem('isAdmin', "false");
        }

        var goto = "/"
        user.permissions.forEach((a) => {

          if (goto == "/") {
            if (a.indexOf("_") > -1) {

            } else {
              if (a == "jetty") {
                a = 'InformationPage'
              }
              if (a == "alertrule") {
                a = 'threshold/alertRule'
              }
              if (a == "alert") {
                a = 'threshold/alert'
              }

              goto = "/" + a

            }
          }


        })
        dropByCacheKey("/dashboard")
        refreshTab("/dashboard")
        var gotourl = goto || redirect
        if (gotourl == "/") {
          gotourl = "/dashboard"
        }

        if (redirect && redirect != "/") {


          history.push(redirect, searchObj);
        } else {
          history.push(gotourl);
        }





        return;
      }

      setUserLoginState(msg);
    } catch (error) {

    }
  };






  if (isAdmin) {

    useEffect(() => {
      msalInstance.addEventCallback((event: EventMessage) => {

        if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
          const payload = event.payload as AuthenticationResult;
          const account = payload.account;

          handleSubmit({ "superData": account, username: account?.username, password: "aaa" })
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

      } else {

        msalInstance.loginPopup(loginRequest);
      }
    }, [true])
  }



  const { status, type: loginType } = userLoginState;

  return (
    <div className={containerClassName}>

      <div style={{ position: 'fixed', top: 0, width: '100%', height: '100%', zIndex: -1 }}>
        <img style={{ width: '100%', height: '100%' }} src="https://eosuat.southeastasia.cloudapp.azure.com/upload/login_bg.png" />

      </div>
      <div className={titleClassName}>
        EOS - Efficiency Optimization System
      </div>

      <div style={{ position: 'absolute', top: isMP ? 'none' : 70, bottom: !isMP ? 'none' : 20, left: 20, right: isMP ? 20 : 'none', padding: 20, backgroundColor: 'rgba(0,0, 0, 0.6)', fontWeight: "bold", borderRadius: 10, }}>
        <div className="my-font-size" style={{ fontSize: "50px", color: "#fff" }}>
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
            defaultMessage: '',
          })}
          - {Settings.title}
        </title>
      </Helmet>
      {/*
	<Lang /> */}
      {!isAdmin && (<div style={{
        position: 'absolute', right: isMP ? 20 : 70, left: isMP ? 20 : 'none', top: 70,
      }}>
        <div style={{
          border: '1px solid #F5F7F9',
          padding: '0px',
          backgroundColor: '#d2faf5'
        }}>
          <LoginForm style={{ padding: isMP ? 10 : 0 }} initialValues={{
            autoLogin: true,
          }} onFinish={async (values) => {


            await handleSubmit(values as API.LoginParams);
          }}
          >


            {status === 'error' && loginType === 'account' && (
              <LoginMessage content={intl.formatMessage({ id: 'pages.login.accountLogin.errorMessage', defaultMessage: '', })} />
            )}
            {type === 'account' && (
              <>
                <ProFormText name="username" fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }} placeholder={intl.formatMessage({ id: 'pages.login.username.placeholder', defaultMessage: '', })} rules={[{
                  required: true, message: (<FormattedMessage id="pages.login.username.required" defaultMessage="" />
                  ),
                },
                ]}
                />
                <ProFormText.Password name="password" fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }} placeholder={intl.formatMessage({ id: 'pages.login.password.placeholder', defaultMessage: '', })} rules={[{
                  required: true, message: (<FormattedMessage id="pages.login.password.required" defaultMessage="" />
                  ),
                },
                ]}
                />
              </>
            )}

            <div style={{
              height: '10px',
              marginBottom: 24,
            }}>
              <ModalForm< { name: string; company: string; }>
                title="Forgot your password?"
                trigger={
                  <a style={{
                    color: "#fff",
                    float: 'right',
                  }}>
                    <FormattedMessage id="pages.login.forgotPasswordxx" defaultMessage="Forgot your password?" />
                  </a>
                }

                autoFocusFirstInput
                modalProps={{
                  destroyOnClose: true,

                }}
                submitTimeout={2000}
                onFinish={async (values) => {
                  retrievePassword(values)
                  message.success("Thanks! If your email address exists, you'll get an email with a link to reset your password shortly.");
                  return true;
                }}
              >
                <ProFormText width="md" name="email" label="Please enter your email address and we will send you a link to reset it" placeholder="Please enter" rules={[{ required: true, message: " Please enter an email address", }, {
                  pattern: /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/, message: (<FormattedMessage id="pages.user.rules.incorrectEmailFormat" defaultMessage="Incorrect email format" />
                  )
                },
                { validator: onlyCheck }
                ]}
                />
              </ModalForm>





              <ModalForm< { name: string; company: string; }>
                title="Create your password"
                open={modalVisit}
                onOpenChange={setModalVisit}
                autoFocusFirstInput
                modalProps={{
                  destroyOnClose: true,

                }}

                submitTimeout={2000}
                onFinish={
                  handleFinish

                }
              >
                <div>{resetcheck ? "Please reset your password." : "For your account security, please take a moment to set your password."}
                </div>




                <div>
                  Your password should be at least eight characters long and include the following:<br />
                  <br />
                  a) At least one letter in both uppercase and lowercase.<br />
                  b) At least one number.<br />
                  c) At least one special character.
                </div>

                <ProFormText.Password
                  width="lg"
                  name="newPassword"
                  label={<FormattedMessage
                    id="pages.userSet.newPassword"
                    defaultMessage="New Password"
                  />}
                  rules={[
                    {
                      required: true, pattern: new RegExp(/(?=.*[A-Z])(?=.*[a-z])/g),
                      message: "At least one letter in both uppercase and lowercase."

                    },
                    {
                      required: true, pattern: new RegExp(/(?=.*[0-9])/g),
                      message: "At least one number."
                    },
                    {
                      required: true, pattern: new RegExp(/(?=.*[\W])(?=.*[\S])/g),
                      message: "At least one special character"

                    },
                    {
                      required: true, pattern: new RegExp(/^.{8,100}$/g),
                      message: "Your password should be at least eight characters long"

                    }

                  ]}
                />
                <ProFormDependency name={['newPassword']}>
                  {({ newPassword }) => (
                    <ProFormText.Password
                      label={<FormattedMessage
                        id="pages.userSet.repeatNewPassword"
                        defaultMessage="Re-enter New Password"
                      />}
                      width="lg"
                      name="repeatNewPassword"
                      rules={[
                        {
                          required: true, pattern: new RegExp(/(?=.*[A-Z])(?=.*[a-z])/g),
                          message: "At least one letter in both uppercase and lowercase."

                        },
                        {
                          required: true, pattern: new RegExp(/(?=.*[0-9])/g),
                          message: "At least one number."
                        },
                        {
                          required: true, pattern: new RegExp(/(?=.*[\W])(?=.*[\S])/g),
                          message: "At least one special character"

                        },
                        {
                          required: true, pattern: new RegExp(/^.{8,100}$/g),
                          message: "Your password should be at least eight characters long"

                        },
                        {   
                          validator: (rule, value) =>
                            new Promise<void>((resolve, reject) => {
                              if (newPassword === value) {
                                resolve();
                              } else {
                                reject(new Error(`${intl.formatMessage({
                                  id: 'pages.userSet.rules.twoPasswordsNotMatch',
                                  defaultMessage: 'The two passwords do not match',
                                })}`));
                              }
                            }),
                        },
                      ]}
                    />
                  )}
                </ProFormDependency>
              </ModalForm>

            </div>

          </LoginForm>

        </div>
        <div style={{

          border: '1px solid #F5F7F9',
          padding: '15px',
          backgroundColor: 'rgba(0,0, 0, 0.6)',
          marginBottom: 24,
          borderTop: 0,
          maxWidth: 400,
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
