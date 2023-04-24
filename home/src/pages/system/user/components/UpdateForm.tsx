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
import { FormattedMessage, useIntl } from '@umijs/max';
import { Modal, Form } from 'antd';
import React, { useRef } from 'react';



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
        open={props.updateModalOpen}
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
          id: 'pages.user.mod',
          defaultMessage: '修改用户信息',
        })}
      >
        
      
      <ProFormText
        name="email"
        label={intl.formatMessage({
          id: 'pages.user.email',
          defaultMessage: '邮箱',
        })}
        width="md"
      />
      <ProFormText
        name="phone"
        label={intl.formatMessage({
          id: 'pages.user.phone',
          defaultMessage: '手机号',
        })}
        width="md"
      />
      <ProFormRadio.Group
        name="status"
        label={intl.formatMessage({
          id: 'pages.user.status',
          defaultMessage: '状态',
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
