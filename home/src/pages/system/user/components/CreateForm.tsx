import {
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTreeSelect,
  ProFormSwitch,
  ModalForm,
 
  ProFormCheckbox,
  ProFormInstance
  
} from '@ant-design/pro-components';
import { UserListItem } from '../data.d';
import {  fieldUniquenessCheck } from '@/services/ant-design-pro/api';
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

  const onlyCheck = (rule: any, value: any, callback: (arg0: string | undefined) => void) => {


    fieldUniquenessCheck({ where: { username: value}, model: 'User' }).then((res) => {
     
      if (res.data) {

        callback(intl.formatMessage({
          id: 'pages.xxx',
          defaultMessage: 'This user name is already in use',
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
          id: 'pages.user.xxx',
          defaultMessage: 'Add New User',
        })}
    >
      <ProFormSelect
        name="company_id"
        width="md"
        label={intl.formatMessage({
          id: 'pages.user.xxx',
          defaultMessage: 'Organization Name',
        })}
        request={async () => {
          return company({}).then((res) => {

            res.data = res.data.map((r) => {
              r['value'] = r.id
              r['label'] = r.name
              return r
            })
            return res.data
            // setFlowList(tree(res.data, "                                    ", 'pid'))
           // return tree(res.data, "                                    ", 'pid')
          });

        }}
      />
      <ProFormText
        name="username"
        label={intl.formatMessage({
          id: 'pages.user.xxx',
          defaultMessage: 'User Name',
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
          {
            pattern: /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/, message: (
              <FormattedMessage
                id="pages.user.rules.incorrectEmailFormat"
                defaultMessage="Incorrect email format"
              />
            )
          },
          { validator: onlyCheck }
        ]}
      />
      {/*<ProFormText.Password
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
      />*/ }
      
      <ProFormSelect
        name="role_id"
        width="md"
        label={intl.formatMessage({
          id: 'pages.user.role',
          defaultMessage: '角色',
        })}
        valueEnum={roleConf }
      />
      <ProFormCheckbox.Group
        name="email_notification"
        layout="vertical"
        label=""
        options={[{
          label: "Send email confirmation", value:"send_email"}]}
      />
     
     
    </ModalForm>
     
  );
};

export default UpdateForm;
