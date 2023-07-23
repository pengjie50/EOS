//import { Footer } from '@/components';
import { Question, SelectLang,Alert} from '@/components';
import { LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from '../tests/requestErrorConfig';
import { currentUser as queryCurrentUser } from '@/services/ant-design-pro/api';
import React from 'react';
import logo from '../public/logo.svg';
import { AvatarDropdown, AvatarName } from '@/components';
import NoticeIconView from '@/components/NoticeIcon';
import { Result } from 'antd';
import UnAccessPage from './pages/403';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';
const loginAdminPath = '/user/adminlogin';

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  token?: string;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {

 
  function getInitials(fullName, includeLastName) {
 
    fullName = fullName.replace(/[^A-Z]/g, '');
   
    if (fullName.length >= 2) {
      return fullName.toUpperCase().slice(0, 2);
    } else {
      return ""
    }
   
   
  }
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser({
        skipErrorHandler: true,
      });
     

      msg.data.avatarText = getInitials(msg.data.username, true) || msg.data.username.slice(0, 2).toUpperCase()
      return msg.data;
    } catch (error) {
     
      if (localStorage.getItem('isAdmin')==="true") {
       
        history.push(loginAdminPath);
      } else {
        history.push(loginPath);
      }
     
    }
    return undefined;
  };
  
  // 如果不是登录页面，执行
  const { location } = history;


 
  if (location.pathname !== loginPath && location.pathname !== "/user/retrievePassword" && location.pathname !== "/user/adminlogin" ) {
   

    var currentUser = await fetchUserInfo();
   
   
    
    
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }


  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}






// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  try {
    document.onclick = (e) => {

      if (e.target.innerHTML == 'Information Page') {
        history.push('/InformationPage/jetty')
      }
    }
  } catch (e) {

  }

  
  return {
    
    actionsRender: () => [<Alert key="Alert" />,<Question key="doc" />/*, <SelectLang key="SelectLang" />*/],
    avatarProps: {
      src:false,
      // src:initialState?.currentUser?.avatar,
      title: <div><div className="my-font-size" style={{ fontSize: 14, display: 'inline-block', backgroundColor: "#FF4D00", borderRadius: "50%", color: "#fff", height: "28px", textAlign: 'center', lineHeight: '28px', width: 28, fontWeight: "bolder" }}>{initialState?.currentUser?.avatarText}</div>{/* <AvatarName />*/ }</div>,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    footerRender: null,
    logo: logo ,
    onPageChange: () => {
      document.getElementsByClassName('ant-pro-sider-collapsed-button-is-mobile')?.[0]?.click();
    
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {

        
          history.push(loginPath);
        
       
      }
    },
    layoutBgImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    links: isDev
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    unAccessible: <div><UnAccessPage /></div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      class BasicLayout extends React.Component {
        constructor(props) {
          super(props);
          // 默认没有错误
          this.state = {
            hasError: false

          };
        }
        // 增加错误边界代码，当发生错误时，state中的hasError会变成true
        static getDerivedStateFromError() {
          return { hasError: true };
        }

        render() {
          const { hasError } = this.state;
          return (

            < >

              {hasError ? <Result status="error" title="Something went wrong. Please refresh the page and try again" />  : children}

            </>
          )
        }
      }
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children }
          
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  ...errorConfig,
};
