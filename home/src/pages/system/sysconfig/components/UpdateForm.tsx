import {
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ModalForm,
  ProFormDependency,
  ProFormInstance

} from '@ant-design/pro-components';
import { SysconfigListItem } from '../data.d';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Modal, Form } from 'antd';
import React, { useRef } from 'react';



export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: Partial<SysconfigListItem>) => void;
  onSubmit: (values: Partial<SysconfigListItem>) => Promise<void>;
  updateModalOpen: boolean;
  values: Partial<SysconfigListItem>;
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
            defaultMessage: 'xx',
          }),
        },
        resetButtonProps: {
          onClick: () => {
            restFormRef.current?.resetFields();
           
          },
        },
      }}
      title={intl.formatMessage({
        id: 'pages.sysconfig.xxx',
        defaultMessage: 'Modify System Configuration',
      })}
    >
      <ProFormText
        name="name"
        label={intl.formatMessage({
          id: 'pages.sysconfig.name',
          defaultMessage: 'Parameter Name',
        })}
        width="md"
        disabled
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
        disabled
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


      <ProFormDependency name={['config_key']}>
        {({ config_key }) => {


          if (config_key == 'token_timeout') {
            return <ProFormText
              name="value"
              label={"Login timeout duration (in seconds)"}
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
              ]} />
          } else {
            return [<ProFormText
              name="value1"
              label={"Number of incorrect passwords in a row before locking user"}
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
              ]} />,
            <ProFormText
              name="value2"
              label={"Period (in seconds) in which incorrect passwords are entered in a row before locking user"}
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
              ]} />

            ]
          }



        }}
      </ProFormDependency>

      <ProFormTextArea
        name="description"
        disabled
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
