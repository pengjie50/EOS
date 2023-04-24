import {
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ModalForm,
  ProFormInstance
  
} from '@ant-design/pro-components';
import { ProducttypeListItem } from '../data.d';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Modal, Form } from 'antd';
import React, { useRef } from 'react';



export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: Partial<ProducttypeListItem>) => void;
  onSubmit: (values: Partial<ProducttypeListItem>) => Promise<void>;
  updateModalOpen: boolean;
  values: Partial<ProducttypeListItem>;
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
          id: 'pages.producttype.mod',
          defaultMessage: 'Modify producttype',
        })}
      >
      <ProFormText
        name="name"
        label={intl.formatMessage({
          id: 'pages.producttype.name',
          defaultMessage: 'Producttype Name',
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
          id: 'pages.producttype.description',
          defaultMessage: 'Producttype Description',
        })}

      />
        
    </ModalForm>
     
  );
};

export default UpdateForm;
