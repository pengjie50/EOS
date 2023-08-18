import {
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormTreeSelect,
  ProFormText,
  ProFormTextArea,
  ModalForm,
  ProFormInstance

} from '@ant-design/pro-components';
import { CompanyListItem } from '../data.d';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Modal, Form } from 'antd';
import React, { useRef, useEffect, useState } from 'react';
import { company } from '../service';

import { fieldUniquenessCheck } from '@/services/ant-design-pro/api';

import { tree } from "@/utils/utils";

export type CreateFormProps = {
  onCancel: (flag?: boolean, formVals?: Partial<CompanyListItem>) => void;
  onSubmit: (values: Partial<CompanyListItem>) => Promise<void>;
  createModalOpen: boolean;

};

const UpdateForm: React.FC<CreateFormProps> = (props) => {
  const restFormRef = useRef<ProFormInstance>();
  const intl = useIntl();
  const [companyList, setCompanyList] = useState<any>({});
  const {
    onSubmit,
    onCancel,
    createModalOpen,

  } = props;
  const onlyCheck = (rule: any, value: any, callback: (arg0: string | undefined) => void) => {

    fieldUniquenessCheck({ where: { name: value }, model: 'Company' }).then((res) => {

      if (res.data) {

        callback(intl.formatMessage({
          id: 'pages.xxx',
          defaultMessage: 'This company name is already in use',
        }))
      } else {
        callback(undefined);
      }
    });

  }
  const onlyCheck2 = (rule: any, value: any, callback: (arg0: string | undefined) => void) => {
    if (!value) {
      callback(undefined);
    }
    fieldUniquenessCheck({ where: { alias: value }, model: 'Company' }).then((res) => {
     
      if (res.data) {

        callback(intl.formatMessage({
          id: 'pages.xxx',
          defaultMessage: 'This company Alias is already in use',
        }))
      } else {
        callback(undefined);
      }
    });

  }
  useEffect(() => {

  }, [true])


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
            
          },
        },
      }}
      title={intl.formatMessage({
        id: 'pages.company.add',
        defaultMessage: 'New Organization',
      })}
    >
      <ProFormText
        name="name"
        label={intl.formatMessage({
          id: 'pages.company.name',
          defaultMessage: 'Organization Name',
        })}
        width="md"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="pages.rules.required"
                defaultMessage="This field cannot be empty"
              />
            ),
          },
          { validator: onlyCheck }
        ]}
      />
     

      <ProFormSelect
        name="type"
        label={intl.formatMessage({
          id: 'pages.xxx',
          defaultMessage: 'Organization Type',
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
        valueEnum={{
          // "Surveyor": "Surveyor",
          "Trader": "Trader",
          // "Agent": "Agent",
          "Terminal": "Oil Terminal",
          // "Pilot": "Pilot",
          //"Super": "Super User",


        }}
      />

      <ProFormTextArea
        name="alias"
        width="md"
        rules={[
          { validator: onlyCheck2 }
        ]}
        label={intl.formatMessage({
          id: 'pages.company.xxx',
          defaultMessage: 'Company Alias',
        })}

      />

      <ProFormTextArea
        name="description"
        width="md"
        label={intl.formatMessage({
          id: 'pages.company.description',
          defaultMessage: 'Description',
        })}

      />
    </ModalForm>

  );
};

export default UpdateForm;
