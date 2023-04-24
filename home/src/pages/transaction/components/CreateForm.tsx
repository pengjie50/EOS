import {
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ModalForm,
  ProFormInstance
  
} from '@ant-design/pro-components';
import { TransactionListItem } from '../data.d';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Modal, Form } from 'antd';
import React, { useRef } from 'react';



export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: Partial<TransactionListItem>) => void;
  onSubmit: (values: Partial<TransactionListItem>) => Promise<void>;
  createModalOpen: boolean;
  values: Partial<TransactionListItem>;
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
          id: 'pages.transaction.add',
          defaultMessage: 'Add Transaction',
        })}
    >

      <ProFormText
        name="start_of_transaction"
        label={intl.formatMessage({
          id: 'pages.transaction.name',
          defaultMessage: 'Start of Transaction',
        })}
        width="md"

      />
        <ProFormText
        name="end_of_transaction"
          label={intl.formatMessage({
            id: 'pages.transaction.name',
            defaultMessage: 'End of Transaction',
          })}
          width="md"
          
      />
      
     
      <ProFormText
        name="arrival_id"
        label={intl.formatMessage({
          id: 'pages.transaction.arrivalID',
          defaultMessage: 'ArrivalID',
        })}
        width="md"

      />
      <ProFormText
        name="product_type"
        label={intl.formatMessage({
          id: 'pages.transaction.name',
          defaultMessage: 'Product Type',
        })}
        width="md"

      />
     
      <ProFormText
        name="jetty_name"
        label={intl.formatMessage({
          id: 'pages.transaction.name',
          defaultMessage: 'jetty name',
        })}
        width="md"

      />
      <ProFormText
        name="vessel_name"
        label={intl.formatMessage({
          id: 'pages.transaction.name',
          defaultMessage: 'Vessel Name',
        })}
        width="md"

      />
      <ProFormText
        name="imo_number"
        label={intl.formatMessage({
          id: 'pages.transaction.name',
          defaultMessage: 'IMO Number',
        })}
        width="md"

      />
      <ProFormText
        name="total_duration"
        label={intl.formatMessage({
          id: 'pages.transaction.name',
          defaultMessage: 'Total Duration (B)',
        })}
        width="md"

      />
      
     
     
    </ModalForm>
     
  );
};

export default UpdateForm;
