import {
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ModalForm,
  ProFormInstance,
  ProFormTreeSelect
  
} from '@ant-design/pro-components';
import { FlowListItem } from '../data.d';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Modal, Form } from 'antd';

import React, { useRef, useState, useEffect } from 'react';

import { flow } from '../service';
import { tree, isPC } from "@/utils/utils";


export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: Partial<FlowListItem>) => void;
  onSubmit: (values: Partial<FlowListItem>) => Promise<void>;
  updateModalOpen: boolean;
  values: Partial<FlowListItem>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const restFormRef = useRef<ProFormInstance>();
  const intl = useIntl();
  const [flowConf, setFlowConf] = useState<any>([]);
  const [isMP, setIsMP] = useState<boolean>(!isPC());
  const {
    onSubmit,
    onCancel,
    updateModalOpen,
    values,
  } = props;

  useEffect(() => {
    if (!updateModalOpen) {


    } else {
      flow({ pageSize: 1000, current: 1, sorter: { sort: 'ascend' } }).then((res) => {

        res.data = res.data.map((r) => {
          r['value'] = r.id
          r['title'] = r.name
          return r
        })

        setFlowConf(tree(res.data, "                                    ", 'pid'))

      });

    }

  }, [props.updateModalOpen]);
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
              defaultMessage: '',
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
          id: 'pages.xxx',
          defaultMessage: 'Edit Transaction flow',
        })}
      >
      <ProFormText
        name="name"
        label={intl.formatMessage({
          id: 'pages.flow.xx',
          defaultMessage: 'Transaction Flow name',
        })}
        width="md"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="pages.flow.rules.name"
                defaultMessage="Please enter a transaction flow name!"
              />
            ),
          },
        ]}
      />

     

      <ProFormTreeSelect
        name="pid"
        label={intl.formatMessage({
          id: 'pages.flow.xxx',
          defaultMessage: 'Transaction Father Flow',
        })}
        placeholder="Please select"
        allowClear
        width="md"
        valueEnum={flowConf}
        request={async () => {
          return flow({ pageSize: 1000, current: 1, sorter: { sort: 'ascend' } }).then((res) => {

            res.data = res.data.map((r) => {
              r['value'] = r.id
              r['title'] = r.name
              return r
            })

            setFlowConf(tree(res.data, "                                    ", 'pid'))
            return tree(res.data, "                                    ", 'pid')
          });

        }}

        // tree-select args
        fieldProps={{
          showArrow: false,


          dropdownMatchSelectWidth: isMP ? true : false,


          treeNodeFilterProp: 'name',
          fieldNames: {
            label: 'name',
          },
        }}
      />
      <ProFormRadio.Group
        name="type"
        label={intl.formatMessage({
          id: 'pages.flow.type',
          defaultMessage: 'Type',
        })}
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="pages.flow.rules.type"
                defaultMessage="Please select type!"
              />
            ),
          },
        ]}
        options={[
          {
            value: 0,
            label:
              intl.formatMessage({
                id: 'pages.flow.process',
                defaultMessage: 'Process',
              })

          },
          {
            value: 1,
            label:
              intl.formatMessage({
                id: 'pages.flow.event',
                defaultMessage: 'Event',
              })

          },

        ]}
      />
      <ProFormText
        name="sort"
        label={intl.formatMessage({
          id: 'pages.flow.sort',
          defaultMessage: 'Sort',
        })}
        width="md"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="pages.flow.rules.sort"
                defaultMessage="Please enter sort!"
              />
            ),
          },
        ]}
      />
      {/*
      <ProFormText
        name="icon"
        label={intl.formatMessage({
          id: 'pages.flow.icon',
          defaultMessage: 'Icon',
        })}
        width="md"
      />

*/ } 

      <ProFormText
        name="code"
        label={intl.formatMessage({
          id: 'pages.flow.xxx',
          defaultMessage: 'Code',
        })}
        width="md"
      />
      <ProFormTextArea
        name="description"
        width="md"
        label={intl.formatMessage({
          id: 'pages.flow.xxx',
          defaultMessage: 'Transaction Flow Description',
        })}

      />
    </ModalForm>
     
  );
};

export default UpdateForm;
