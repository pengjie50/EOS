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
  updateModalOpen: boolean;
  values: Partial<AlertListItem>;
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
            
          },
        },
      }}
      title={intl.formatMessage({
        id: 'pages.alert.mod',
        defaultMessage: 'Modify Remarks',
      })}
    >

      <ProFormTextArea
        name="remarks"
        width="md"
        label={intl.formatMessage({
          id: 'pages.alert.remark',
          defaultMessage: 'Remarks',
        })}

      />

    </ModalForm>

  );
};

export default UpdateForm;
