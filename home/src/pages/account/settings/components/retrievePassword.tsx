import React, { useRef } from 'react';
import type { ProFormInstance } from '@ant-design/pro-form';

import { UploadOutlined } from '@ant-design/icons';
import { Button, Input, Upload, message, Form } from 'antd';
import { FormattedMessage, useIntl, useLocation, history } from '@umijs/max';
import {
  ProFormDependency,
  ProFormFieldSet,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProCard,
  ProForm
} from '@ant-design/pro-components';

import { queryCurrent } from '../../../system/user/service';


import { modifyPassword } from '../../../system/user/service';



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
 /* const { data: currentUser, loading } = useRequest(() => {
    return queryCurrent();
  });*/
  var loading=false
  const intl = useIntl();

  const formRef = useRef<ProFormInstance>();

  var check = useLocation().search.split("=")[1]

  const handleFinish = async (values: { [key: string]: any; } | undefined) => {
    if (values) {
     // values.id = currentUser?.id

    }
   var d= { ...values }
    d.check = check

    await modifyPassword(d);
    message.success(<FormattedMessage
      id="pages.sss"
      defaultMessage="Password is updated successfully"
    />);

    history.push(`/user/login`);
    // message.success('更新基本信息成功');
  };
  
  return (
    <>
      <ProCard
        title="Please reset your password"

        layout="center"
 
        style={{ maxWidth: '100%', height: '100%' }}
      >
   
            <ProForm
              formRef={formRef}
              validateTrigger={['onBlur']}
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
               

              }}
              hideRequiredMark
            >

             
            

              <ProFormText.Password
                width="md"
                name="newPassword"
                label={<FormattedMessage
                  id="pages.userSet.newPassword"
                  defaultMessage="New password"
                />}
                rules={[
                  {
                    required: true, pattern: new RegExp(/(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[\W])(?=.*[\S])^[0-9A-Za-z\S]{4,100}$/g),
                    message: <>Your password should be at least eight characters and include at least the following:<br />
                      a) At least letters in both upper- and lowercase<br />
                      b) At least one number<br />
                      c) At least one special character</>
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
                     
                      {
                        required: true, pattern: new RegExp(/(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[\W])(?=.*[\S])^[0-9A-Za-z\S]{4,100}$/g),
                        message: <>Your password should be at least eight characters and include at least the following:<br />
                          a) At least letters in both upper- and lowercase<br />
                          b) At least one number<br />
                          c) At least one special character</>
                      },
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
       
        
  
       
      </ProCard>
    </>
  );
};

export default BaseView;
