import {
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ModalForm,
  ProFormSwitch,
  ProFormCheckbox,
  ProFormTreeSelect,
  ProFormInstance

} from '@ant-design/pro-components';
import { UserListItem } from '../data.d';
import { FormattedMessage, useIntl } from '@umijs/max';
import { fieldUniquenessCheck } from '@/services/ant-design-pro/api';
import { Modal, Form } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import { checkEmail } from '../service';
import { tree } from "@/utils/utils";
import { role } from '../../role/service';
import { company } from '../../company/service';
export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: Partial<UserListItem>) => void;
  onSubmit: (values: Partial<UserListItem>) => Promise<void>;
  updateModalOpen: boolean;
  values: Partial<UserListItem>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const restFormRef = useRef<ProFormInstance>();
  const intl = useIntl();

  const {
    onSubmit,
    onCancel,
    updateModalOpen,
    values,
  } = props;
  useEffect(() => {

    role({ pageSize: 100, current: 1 }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setRoleConf(b)

    });



  }, [true]);
  const onlyCheck = (rule: any, value: any, callback: (arg0: string | undefined) => void) => {


    fieldUniquenessCheck({ where: { username: value }, model: 'User' }).then((res) => {

      if (values.username == value) {
        callback(undefined);
        return
      }

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
  const emailCheck = (rule: any, value: any, callback: (arg0: string | undefined) => void) => {

    if (values.email == value) {
      callback(undefined);
    }
    checkEmail({ email: value }).then((res) => {
      if (res.data == true) {

        callback(intl.formatMessage({
          id: 'pages.user.emailIsUse',
          defaultMessage: 'This email is already in use',
        }))
      } else {
        callback(undefined); 
      }
    });




  }
  const [roleConf, setRoleConf] = useState<any>({});
  return (

    <ModalForm
      validateTrigger={['onBlur']}
      modalProps={{ destroyOnClose: true }}
      initialValues={values}
      onOpenChange={(vi) => {
        if (!vi) {
          props.onCancel();
        }

      }}
      formRef={restFormRef}
      onFinish={props.onSubmit}
      open={props.updateModalOpen}
      submitter={{
        searchConfig: {
          resetText: intl.formatMessage({
            id: 'pages.reset',
            defaultMessage: 'Reset',
          }),
        },
        resetButtonProps: {
          onClick: () => {
            restFormRef.current?.resetFields();
           
          },
        },
      }}
      title={intl.formatMessage({
        id: 'pages.user.mod',
        defaultMessage: 'Modify user information',
      })}
    >

      <ProFormTreeSelect
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
              r['title'] = r.name
              return r
            })

          
            return tree(res.data, "                                    ", 'pid')
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
      <ProFormRadio.Group
        name="status"
        label={intl.formatMessage({
          id: 'pages.user.xxx',
          defaultMessage: 'Account Status',
        })}
        options={[
          {
            value: 0,
            label:
              intl.formatMessage({
                id: 'pages.user.normal',
                defaultMessage: 'Active',
              })

          },
          {
            value: 1,
            label:
              intl.formatMessage({
                id: 'pages.user.disable',
                defaultMessage: 'Disable',
              })

          },
        ]}
      />
      <ProFormCheckbox.Group
        name="email_notification"
        layout="vertical"
        label=""
        options={[{ label: "Send email notification for Password Reset", value: "send_email" }]}
      />
    </ModalForm>

  );
};

export default UpdateForm;
