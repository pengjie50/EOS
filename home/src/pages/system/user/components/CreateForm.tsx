import {
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTreeSelect,
  ProFormTextArea,
  ModalForm,
  ProFormInstance
  
} from '@ant-design/pro-components';
import { UserListItem } from '../data.d';

import { role } from '../../role/service';
import { company } from '../../company/service';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Modal, Form } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import { checkEmail, checkUsername } from '../service';
import { tree } from "@/utils/utils";

export type CreateFormProps = {
  onCancel: (flag?: boolean, formVals?: Partial<UserListItem>) => void;
  onSubmit: (values: Partial<UserListItem>) => Promise<void>;
  createModalOpen: boolean;
  
};

const UpdateForm: React.FC<CreateFormProps> = (props) => {
  const restFormRef = useRef<ProFormInstance>();
  const intl = useIntl();
  const [roleConf, setRoleConf] = useState<any>({});
  

  const {
    onSubmit,
    onCancel,
    createModalOpen
   
  } = props;

  useEffect(() => {
    if ( !createModalOpen) {
   

    } else {
      role({ pageSize: 100, current: 1 }).then((res) => {
        var b = {}
        res.data.forEach((r) => {
          b[r.id]=r.name
        })
        setRoleConf(b)
       
      });
     
    }

  }, [props.createModalOpen]);

  const usernameCheck = (rule: any, value: any, callback: (arg0: string | undefined) => void) => {


    checkUsername({ username: value }).then((res) => {
      if (res.data == true) {

        callback(intl.formatMessage({
          id: 'pages.user.emailIsUse',
          defaultMessage: 'This email is already in use',
        }))
      } else {
        callback(undefined); // 必须返回一个callback
      }
    });




  }









 
  return (
   
    <ModalForm
      modalProps={{ destroyOnClose: true }}
     
      onOpenChange={(vi) => {
        if (!vi) {
          props.onCancel();
        }
          
      }}
      formRef={restFormRef}
        onFinish={props.onSubmit}
      open={props.createModalOpen}
        submitter={{
          searchConfig: {
            resetText: intl.formatMessage({
              id: 'pages.reset',
              defaultMessage: '重置',
            }),
          },
          resetButtonProps: {
            onClick: () => {
              restFormRef.current?.resetFields();
              //   setModalVisible(false);
            },
          },
        }}
        title={intl.formatMessage({
          id: 'pages.user.add',
          defaultMessage: '新增用户',
        })}
      >
      <ProFormText
        name="username"
        label={intl.formatMessage({
          id: 'pages.user.username',
          defaultMessage: '用户名',
        })}
        width="md"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="pages.user.rules.username"
                defaultMessage="请输入用户名！"
              />
            ),
          },
          { validator: usernameCheck }
        ]}
      />
      <ProFormText.Password
        name="password"
        label={intl.formatMessage({
          id: 'pages.user.password',
          defaultMessage: '密码',
        })}
        width="md"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="pages.user.rules.password"
                defaultMessage="请输入密码！"
              />
            ),
          },
        ]}
      />
      <ProFormTreeSelect
        name="company_id"
        width="md"
        label={intl.formatMessage({
          id: 'pages.user.company',
          defaultMessage: 'Company',
        })}
        request={async () => {
          return company({}).then((res) => {

            res.data = res.data.map((r) => {
              r['value'] = r.id
              r['title'] = r.name
              return r
            })

            // setFlowList(tree(res.data, "                                    ", 'pid'))
            return tree(res.data, "                                    ", 'pid')
          });

        }}
      />
      <ProFormSelect
        name="role_id"
        width="md"
        label={intl.formatMessage({
          id: 'pages.user.role',
          defaultMessage: '角色',
        })}
        valueEnum={roleConf }
      />
        
    </ModalForm>
     
  );
};

export default UpdateForm;
