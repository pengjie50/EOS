import { PlusOutlined, HomeOutlined, ContactsOutlined, ClusterOutlined } from '@ant-design/icons';
import { Avatar, Card, Col, Divider, Input, Row, Tag } from 'antd';
import React, { useState, useRef } from 'react';
import { GridContent } from '@ant-design/pro-layout';
import { Link, useRequest } from 'umi';
import type { RouteChildrenProps } from 'react-router';

import { queryCurrent } from '../../system/user/service';
import {
  ProFormDependency,
  ProFormFieldSet,
  ProFormSelect,
  ProDescriptions,
  ProCard,
  PageContainer,
  ProFormTextArea,
  ProForm
} from '@ant-design/pro-components';


const Center: React.FC<RouteChildrenProps> = () => {


  //  获取用户信息
  const { data: currentUser, loading } = useRequest(() => {
    return queryCurrent();
  });

  

 

  return (
    <GridContent>
      {!loading && currentUser && (<ProCard layout="center" wrap={true} >
        <ProCard layout="center">
          <img style={{ width:200 }} alt="" src={currentUser.avatar} />
        </ProCard>
        <ProCard layout="center">
          <ProDescriptions style={{ width:200 }} column={1} >
            <ProDescriptions.Item label="Username" valueType="text" >
            {currentUser?.username}
          </ProDescriptions.Item>
            <ProDescriptions.Item label="Nickname"  valueType="text">
            {currentUser?.nickname}
          </ProDescriptions.Item>
            <ProDescriptions.Item label="Role Name"  valueType="text">
            {currentUser?.role_name}
          </ProDescriptions.Item>
        
        </ProDescriptions>

        </ProCard>

      </ProCard>)}
    </GridContent>
  );
};
export default Center;
