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
  updateModalOpen: boolean;
  values: Partial<TransactionListItem>;
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
          id: 'pages.transaction.mod',
          defaultMessage: '修改权限',
        })}
      >
      <ProFormText
        name="name"
        label={intl.formatMessage({
          id: 'pages.transaction.name',
          defaultMessage: '权限名称',
        })}
        width="md"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="pages.transaction.rules.name"
                defaultMessage="请输入权限名称！"
              />
            ),
          },
        ]}
      />
      <ProFormTextArea
        name="description"
        width="md"
        label={intl.formatMessage({
          id: 'pages.transaction.description',
          defaultMessage: '规则描述',
        })}

      />
        
    </ModalForm>
     
  );
};

export default UpdateForm;
