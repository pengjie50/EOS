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
import { InterfacedataListItem } from '../data.d';
import { FormattedMessage, useIntl, useModel } from '@umijs/max';
import { Modal, Form } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import { organization } from '../../../system/company/service';
import { company } from '../../../system/company/service';
import { tree } from "@/utils/utils";
import { currentUser } from '../../../../services/ant-design-pro/api';
export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: Partial<InterfacedataListItem>) => void;
  onSubmit: (values: Partial<InterfacedataListItem>) => Promise<void>;
  updateModalOpen: boolean;
  values: Partial<InterfacedataListItem>;
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
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  useEffect(() => {







  }, [true]);
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
        id: 'pages.interfacedata.mod',
        defaultMessage: 'Modify Interfacedata',
      })}
    >

      <ProFormSelect
        name="type"
        label="DE Name"
        width="md"

        valueEnum={{
          '1': "DE 1",
          '2': "DE 2",
          '3': "DE 3",
          '4': "DE 4",
          '5': "DE 5",
        }}
      />
      <ProFormTextArea
        name="json_string"
        label="Json String"
        width="lg"

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
      <ProFormRadio.Group
        name="already_used"
        label={intl.formatMessage({
          id: 'pages.user.xxx',
          defaultMessage: 'Already Used',
        })}
        options={[
          {
            value: 0,
            label:
              intl.formatMessage({
                id: 'pages.user.xx',
                defaultMessage: 'No',
              })

          },
          {
            value: 1,
            label:
              intl.formatMessage({
                id: 'pages.user.xx',
                defaultMessage: 'Yes',
              })

          },
        ]}
      />


    </ModalForm>

  );
};

export default UpdateForm;
