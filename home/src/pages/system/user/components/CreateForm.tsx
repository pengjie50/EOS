import {
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
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



export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: Partial<UserListItem>) => void;
  onSubmit: (values: Partial<UserListItem>) => Promise<void>;
  createModalOpen: boolean;
  values: Partial<UserListItem>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const restFormRef = useRef<ProFormInstance>();
  const intl = useIntl();
  const [roleConf, setRoleConf] = useState<any>({});
  const [companyConf, setCompanyConf] = useState<any>({});

  const {
    onSubmit,
    onCancel,
    createModalOpen,
    values,
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
      company({ pageSize: 100, current: 1 }).then((res) => {
        var b = {}
        res.data.forEach((r) => {
          b[r.id] = r.name
        })
        setCompanyConf(b)

      });
    }

  }, [props.createModalOpen]);
  return (
   
    <ModalForm
      modalProps={{ destroyOnClose: true }}
      initialValues={values}
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
      <ProFormSelect
        name="company_id"
        width="md"
        label={intl.formatMessage({
          id: 'pages.user.company',
          defaultMessage: '公司',
        })}
        valueEnum={companyConf}
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
