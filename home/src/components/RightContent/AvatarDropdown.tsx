import { outLogin } from '@/services/ant-design-pro/api';
import { LogoutOutlined, SettingOutlined, UserOutlined, KeyOutlined } from '@ant-design/icons';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { history, useModel, useLocation } from '@umijs/max';
import { Spin } from 'antd';
import { stringify } from 'querystring';
import type { MenuInfo } from 'rc-menu/lib/interface';
import React, { useCallback } from 'react';
import { flushSync } from 'react-dom';
import HeaderDropdown from '../HeaderDropdown';
import { PublicClientApplication, EventType, EventMessage, AuthenticationResult } from "@azure/msal-browser";
import { msalConfig } from "../../authConfig";
import { useAccess, Access } from 'umi';




export type GlobalHeaderRightProps = {
  menu?: boolean;
  children?: React.ReactNode;
};

export const AvatarName = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  return <span className="anticon">{currentUser?.username.split("@")[0] || currentUser?.email.split("@")[0]}</span>;
};

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu, children }) => {

  var redirect = useLocation().pathname
  
  /**
   * 退出登录，并且将当前的 url 保存
   */
  const loginOut = async (a:any) => {
    await outLogin();
    localStorage.setItem('isAdmin', "false");
    localStorage.setItem('token', "");
   
    if (a===true) {
    
      localStorage.setItem('isAdmin', "true");
    }

   
   // const urlParams = new URL(window.location.href).searchParams;
    /** 此方法会跳转到 redirect 参数所在的位置 */
    //const redirect = urlParams.get('redirect');
    // Note: There may be security issues, please note
   // if (window.location.pathname !== url && !redirect) {
    
    window.location.href = "/"
     /* history.replace({
        pathname: url,
        search: 'redirect=/'
       // search: 'redirect=' + redirect,
      });*/
   // }
  };
  const actionClassName = useEmotionCss(({ token }) => {
    return {
      display: 'flex',
      height: '48px',
      marginLeft: 'auto',
      overflow: 'hidden',
      alignItems: 'center',
      padding: '0 8px',
      cursor: 'pointer',
      borderRadius: token.borderRadius,
      '&:hover': {
        backgroundColor: token.colorBgTextHover,
      },
    };
  });
  const { initialState, setInitialState } = useModel('@@initialState');
  const access = useAccess();
 
  const onMenuClick = useCallback(
    (event: MenuInfo) => {
      const { key } = event;
      if (key === 'logout') {
        var canAdmin = access.canAdmin

      
         flushSync(() => {
          
          setInitialState((s) => ({ ...s, currentUser: undefined }));
         


        });

    
       
       
        loginOut(canAdmin);
        return;
      }
      history.push(`/account/${key}`);
    },
    [setInitialState],
  );

  const loading = (
    <span className={actionClassName}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const { currentUser } = initialState;

  if (!currentUser || !currentUser.username) {
    return loading;
  }

  const menuItems = [
    ...(true
      ? [
          /*{
            key: 'center',
            icon: <UserOutlined />,
          label: 'Personal Center',
        },*/
        {
          key: 'baseSettings',
          icon: <SettingOutlined />,
          label: 'My User Profile',
        },
          {
            key: 'modPassword',
            icon: <KeyOutlined />,
            label: 'Change Password',
          },
          {
            type: 'divider' as const,
          },
        ]
      : []),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Log out',
    },
  ];
  
  return (
    <HeaderDropdown
      menu={{
        selectedKeys: [],
        onClick: onMenuClick,
        items: menuItems,
      }}
    >
      {children}
    </HeaderDropdown>
  );
};
