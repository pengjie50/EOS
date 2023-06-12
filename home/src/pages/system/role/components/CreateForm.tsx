import {
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ModalForm,
  ProFormInstance
  
} from '@ant-design/pro-components';
import { RoleListItem } from '../data.d';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Modal, Form } from 'antd';
import React, { useRef } from 'react';



export type CreateFormProps = {
  onCancel: (flag?: boolean, formVals?: Partial<RoleListItem>) => void;
  onSubmit: (values: Partial<RoleListItem>) => Promise<void>;
  createModalOpen: boolean;
 
};

const UpdateForm: React.FC<CreateFormProps> = (props) => {
  const restFormRef = useRef<ProFormInstance>();
  const intl = useIntl();
 
  const {
    onSubmit,
    onCancel,
    createModalOpen,
  
  } = props;

  
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
          id: 'pages.role.add',
          defaultMessage: 'New Role',
        })}
      >
      <ProFormText
        name="name"
        label={intl.formatMessage({
          id: 'pages.role.name',
          defaultMessage: 'Role Name',
        })}
        width="md"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="pages.role.rules.name"
                defaultMessage="Please enter a role mame !"
              />
            ),
          },
        ]}
      />
      <ProFormTextArea
        name="description"
        width="md"
        label={intl.formatMessage({
          id: 'pages.role.description',
          defaultMessage: 'Role Description',
        })}

      />
    </ModalForm>
     
  );
};

export default UpdateForm;
