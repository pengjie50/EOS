import React, { useRef } from 'react';
import type { ProFormInstance } from '@ant-design/pro-form';

import { UploadOutlined } from '@ant-design/icons';
import { Button, Input, Upload, message,Form } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import  {
  ProFormDependency,
  ProFormFieldSet,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProForm
} from '@ant-design/pro-components';
import { useRequest } from 'umi';
import { queryCurrent } from '../service';
import { queryProvince, queryCity } from '../service';

import { updateUser } from '../../../system/user/service';

import styles from './BaseView.less';

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
    <div className={styles.baseView}>
      {loading ? null : (
        <>
          <div className={styles.left}>
            <ProForm
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
                width="md"
                name="oldPassword"
                label={<FormattedMessage
                  id="pages.userSet.oldPassword"
                  defaultMessage="Old password"
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
                width="md"
                name="newPassword"
                label={<FormattedMessage
                  id="pages.userSet.newPassword"
                  defaultMessage="New password"
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
                      defaultMessage="Repeat new password"
                    />}
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
          </div>
         
        </>
      )}
    </div>
  );
};

export default BaseView;
