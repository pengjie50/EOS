import {
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ModalForm,
  ProFormTreeSelect,
  ProFormInstance
  
} from '@ant-design/pro-components';
import { UserListItem } from '../data.d';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Modal, Form } from 'antd';
import React, { useRef } from 'react';
import { checkEmail } from '../service';
import { tree } from "@/utils/utils";
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

  const emailCheck =  (rule: any, value: any, callback: (arg0: string | undefined) => void) => {
   
    if (values.email==value) {
      callback(undefined);
    }
    checkEmail({ email: value }).then((res) => {
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
              //   setModalVisible(false);
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
      <ProFormText
        name="email"
        label={intl.formatMessage({
          id: 'pages.user.email',
          defaultMessage: 'Email',
        })}
        width="md"
       
        rules={[
          /*{
            required: true, message: (
              <FormattedMessage
                id="pages.rules.required"
                defaultMessage=""
              />
            ) },*/
          {
            pattern: /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/, message: (
              <FormattedMessage
                id="pages.user.rules.incorrectEmailFormat"
                defaultMessage="Incorrect email format"
              />
            )  },
         { validator: emailCheck }
        ]}
      />
      <ProFormText
        name="nickname"
        label={intl.formatMessage({
          id: 'pages.user.nickname',
          defaultMessage: 'Nick Name',
        })}
        width="md"
        rules={[
          
        ]}
      />
      <ProFormRadio.Group
        name="status"
        label={intl.formatMessage({
          id: 'pages.user.status',
          defaultMessage: 'Status',
        })}
        options={[
          {
            value: 0,
            label: 
              intl.formatMessage({
                id: 'pages.user.normal',
                defaultMessage: 'Normal',
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
        
    </ModalForm>
     
  );
};

export default UpdateForm;
