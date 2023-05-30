import React, { useRef, useState } from 'react';
import type { ProFormInstance } from '@ant-design/pro-form';

import { UploadOutlined } from '@ant-design/icons';
import { Button, Input, Upload, message,Form } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { isPC } from "@/utils/utils";
import  {
  ProFormDependency,
  ProFormFieldSet,
  ProFormSelect,
  ProFormText,
  PageContainer,
  ProFormTextArea,
  ProCard,
  ProForm
} from '@ant-design/pro-components';
import { useRequest } from 'umi';
import { queryCurrent } from '../../../system/user/service';


import { updateUser } from '../../../system/user/service';

const validatorPhone = (rule: any, value: string[], callback: (message?: string) => void) => {
  if (!value[0]) {
    callback('Please input your area code!');
  }
  if (!value[1]) {
    callback('Please input your phone number!');
  }
  callback();
};


const BaseView: React.FC = () => {
  const { data: currentUser, loading } = useRequest(() => {
    return queryCurrent();
  });
  const intl = useIntl();
 
  const formRef = useRef<ProFormInstance>();
  
  const [isMP, setIsMP] = useState<boolean>(!isPC());
  
  const handleFinish = async (values: { [key: string]: any; } | undefined) => {
    if (values) {
      values.id = currentUser?.id
      
    }


    
    await updateUser({ ...values });
    message.success(<FormattedMessage
      id="pages.modifySuccessful"
      defaultMessage="Modify is successful"
    />);
   // message.success('更新基本信息成功');
  };
  return (
    <PageContainer header={{

      breadcrumb: {},
    }}>
      <ProCard style={{ marginBlockStart: 8 }} gutter={8} wrap={isMP ? true : false}>
      {loading ? null : (
       
            <ProForm
              autoFocusFirstInput={false }
              formRef={formRef}
              layout="vertical"
              onFinish={handleFinish}
              submitter={{
                searchConfig: {
                  submitText: <FormattedMessage
                    id="pages.update"
                    defaultMessage="Modify"
                  />,
                },
                render: (_, dom) => dom[1],
              }}
              initialValues={{
                ...currentUser
               
              }}
              hideRequiredMark
            >
             
              <ProFormText.Password
                width="lg"
                name="oldPassword"
                label={<FormattedMessage
                  id="pages.userSet.oldPassword"
                  defaultMessage="Enter Current Password"
                />}
                rules={[
                  {
                    required: true, pattern: new RegExp(/((?=.*\d)(?=.*\D)|(?=.*[a-zA-Z])(?=.*[^a-zA-Z]))(?!^.*[\u4E00-\u9FA5].*$)^\S{8,22}$/),
                    message: <FormattedMessage
                      id="pages.userSet.rules.generatePassword"
                      defaultMessage="Two or more types of letters, numbers, and special characters with 8-22 digits"
                    />
                  }
                ]}
              />

              <ProFormText.Password
                  width="lg"
                name="newPassword"
                label={<FormattedMessage
                  id="pages.userSet.newPassword"
                  defaultMessage="New Password"
                />}
                rules={[
                   {
                    required: true, pattern: new RegExp(/((?=.*\d)(?=.*\D)|(?=.*[a-zA-Z])(?=.*[^a-zA-Z]))(?!^.*[\u4E00-\u9FA5].*$)^\S{8,22}$/),
                    message: <FormattedMessage
                      id="pages.userSet.rules.generatePassword"
                      defaultMessage="Two or more types of letters, numbers, and special characters with 8-22 digits"
                    />
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
                      { required: true },
                      {
                        pattern: new RegExp(/((?=.*\d)(?=.*\D)|(?=.*[a-zA-Z])(?=.*[^a-zA-Z]))(?!^.*[\u4E00-\u9FA5].*$)^\S{8,22}$/),
                        message: <FormattedMessage
                          id="pages.userSet.rules.generatePassword"
                          defaultMessage="Two or more types of letters, numbers, and special characters with 8-22 digits"
                        /> },
                      {   //在这里使用antd 的validator通过promise去校验重复输入的密码和新密码是否一致
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
           
             
             
              
            </ProForm>
          
      )}
        </ProCard>
    </PageContainer>
  );
};

export default BaseView;
