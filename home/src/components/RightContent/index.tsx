import { QuestionCircleOutlined, BellOutlined } from '@ant-design/icons';
import { SelectLang as UmiSelectLang } from '@umijs/max';
import React from 'react';
import { history, useModel } from '@umijs/max';
export type SiderTheme = 'light' | 'dark';
import { Badge } from 'antd';

import { setUserReadAlert } from "../../pages/alert/service"

export const SelectLang = () => {
  return (
    <UmiSelectLang
      style={{
        padding: 4,
      }}
    />
  );
};

export const Question = () => {
  return (
    <div
      style={{
        display: 'flex',
        height: 26,
      }}
      onClick={() => {
       
        //window.open('https://pro.ant.design/docs/getting-started');
      }}
    >
      <QuestionCircleOutlined />
    </div>
  );
};

export const Alert = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  

  
 
  return (
    <div
      style={{
        display: 'flex',
        height: 30,
      }}
      onClick={() => {
        if (currentUser.userUnreadAlertCount > 0) {
         
          setUserReadAlert({}).then((res) => {
            currentUser.userUnreadAlertCount=0
            history.push(`/threshold/alert`, { showNoRead: true });
          })

         // history.push(`/threshold/alert`,);
        } else {
          history.push(`/threshold/alert`);
        }
       
      //  currentUser.userUnreadAlertCount = 0
        //window.open('https://pro.ant.design/docs/getting-started');
      }}
    >
      <Badge  count={currentUser?.userUnreadAlertCount} style={{ boxShadow: 'none' }}>
        <BellOutlined  />
      </Badge>
    </div>
  );
};

