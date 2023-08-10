import {
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ModalForm,
  ProFormInstance

} from '@ant-design/pro-components';
import { AlertListItem } from '../data.d';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Modal, Form } from 'antd';
import React, { useRef } from 'react';



export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: Partial<AlertListItem>) => void;
  onSubmit: (values: Partial<AlertListItem>) => Promise<void>;
  createModalOpen: boolean;
  values: Partial<AlertListItem>;
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
        id: 'pages.alert.add',
        defaultMessage: '',
      })}
    >
      <ProFormSelect
        name="company_id"
        width="md"
        label={intl.formatMessage({
          id: 'pages.user.company',
          defaultMessage: 'Select Process ActivityProcess in-scope for alerts(“From”)',
        })}
     
      />
      <ProFormSelect
        name="company_id"
        width="md"
        label={intl.formatMessage({
          id: 'pages.user.company',
          defaultMessage: 'Process in-scope for alerts(“To”)',
        })}
      
      />
      <ProFormText
        width="md"
        name="email"
        label={<FormattedMessage
          id="pages.user.email"
          defaultMessage="Hours"
        />}

      />
      <ProFormText
        width="md"
        name="phone"
        label={<FormattedMessage
          id="pages.user.phone"
          defaultMessage="Mins"
        />}

      />
    </ModalForm>

  );
};

export default UpdateForm;
