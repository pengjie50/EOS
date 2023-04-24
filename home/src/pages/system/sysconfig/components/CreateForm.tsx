import {
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ModalForm,
  ProFormInstance
  
} from '@ant-design/pro-components';
import { SysconfigListItem } from '../data.d';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Modal, Form } from 'antd';
import React, { useRef } from 'react';



export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: Partial<SysconfigListItem>) => void;
  onSubmit: (values: Partial<SysconfigListItem>) => Promise<void>;
  createModalOpen: boolean;
  values: Partial<SysconfigListItem>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const restFormRef = useRef<ProFormInstance>();
  const intl = useIntl();
 
  const {
    onSubmit,
    onCancel,
    createModalOpen,
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
      open={props.createModalOpen}
        submitter={{
          searchConfig: {
            resetText: 
              intl.formatMessage({
                id: 'pages.reset',
                defaultMessage: '重置',
              })
            ,
          },
          resetButtonProps: {
            onClick: () => {
              restFormRef.current?.resetFields();
              //   setModalVisible(false);
            },
          },
        }}
        title={intl.formatMessage({
          id: 'pages.sysconfig.add',
          defaultMessage: 'New system config',
        })}
      >
        <ProFormText
          name="name"
          label={intl.formatMessage({
            id: 'pages.sysconfig.name',
            defaultMessage: 'Parameter Name',
          })}
          width="md"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="pages.rules.required"
                defaultMessage=""
              />
            ),
          },
        ]}
      />
      <ProFormText
        name="config_key"
        label={intl.formatMessage({
          id: 'pages.sysconfig.key',
          defaultMessage: 'Parameter Key',
        })}
        width="md"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="pages.rules.required"
                defaultMessage=""
              />
            ),
          },
        ]}
      />
      <ProFormText
        name="value"
        label={intl.formatMessage({
          id: 'pages.sysconfig.value',
          defaultMessage: 'Parameter Value',
        })}
        width="md"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="pages.rules.required"
                defaultMessage=""
              />
            ),
          },
        ]}
      />
        <ProFormTextArea
          name="description"
          width="md"
          label={intl.formatMessage({
            id: 'pages.sysconfig.description',
            defaultMessage: 'Parameter Description',
          })}
          
        />
    </ModalForm>
     
  );
};

export default UpdateForm;
