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
              //   setModalVisible(false);
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
          ]}
      />
      {/*<ProFormTreeSelect
        name="pid"
        width="md"
        label={intl.formatMessage({
          id: 'pages.user.parentCompany',
          defaultMessage: 'Parent Company',
        })}
        request={async () => {
          return company({}).then((res) => {

            res.data = res.data.map((r) => {
              r['value'] = r.id
              r['title'] = r.name
              return r
            })

            // setFlowList(tree(res.data, "                                    ", 'pid'))
            return tree(res.data, "                                    ", 'pid')
          });

        }}
      />*/ }

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
          "Surveyor": "Surveyor",
          "Trader": "Trader",
          "Agent": "Agent",
          "Terminal": "Oil Terminal",
          "Pilot": "Pilot",
          "Super": "Super User",


        }}
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
