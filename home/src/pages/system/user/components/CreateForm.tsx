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
import { fieldUniquenessCheck } from '@/services/ant-design-pro/api';
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
    if (!createModalOpen) {


    } else {
      role({ pageSize: 100, current: 1 }).then((res) => {
        var b = {}
        res.data.forEach((r) => {
          if (r.type!="Super") {
            b[r.id] = r.name
          }
        
        })
        setRoleConf(b)

      });

    }

  }, [props.createModalOpen]);

  const onlyCheck = (rule: any, value: any, callback: (arg0: string | undefined) => void) => {


    fieldUniquenessCheck({ where: { username: value }, model: 'User' }).then((res) => {

      if (res.data) {

        callback(intl.formatMessage({
          id: 'pages.xxx',
          defaultMessage: 'This user name is already in use',
        }))
      } else {
        callback(undefined);
      }
    });

  }











  return (

    <ModalForm
      modalProps={{ destroyOnClose: true }}
      initialValues={{ email_notification: "send_email" }}
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
            defaultMessage: '',
          }),
        },
        resetButtonProps: {
          onClick: () => {
            restFormRef.current?.resetFields();

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
          return company({
            'type': {
              'field': 'type',
              'op': 'ne',
              'data': 'Super'
            }
          }).then((res) => {

              res.data = res.data.map((r) => {
                r['value'] = r.id
                r['label'] = r.name
                return r
              })
              return res.data

            });

        }}
      />
      <ProFormText
        name="username"
        label={intl.formatMessage({
          id: 'pages.user.xxx',
          defaultMessage: 'User email address (to be used as User Name for log-in) ',
        })}
        width="md"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="pages.user.rules.username"
                defaultMessage=""
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

      <ProFormSelect
        name="role_id"
        width="md"
        label={intl.formatMessage({
          id: 'pages.user.role',
          defaultMessage: '',
        })}
        valueEnum={roleConf}
      />
      <ProFormCheckbox.Group
        name="email_notification"
        layout="vertical"
        disabled
        label=""
        options={[{
          label: "Send email confirmation", value: "send_email"
        }]}
      />


    </ModalForm>

  );
};

export default UpdateForm;
