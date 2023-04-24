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
import { tree } from "@/utils/utils";

export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: Partial<FlowListItem>) => void;
  onSubmit: (values: Partial<FlowListItem>) => Promise<void>;
  createModalOpen: boolean;
  values: Partial<FlowListItem>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const restFormRef = useRef<ProFormInstance>();
  const intl = useIntl();
  const [flowConf, setFlowConf] = useState<any>([]);
  const {
    onSubmit,
    onCancel,
    createModalOpen,
    values,
  } = props;

  useEffect(() => {
    if (!createModalOpen) {


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

  }, [props.createModalOpen]);
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
          id: 'pages.flow.add',
          defaultMessage: '',
        })}
      >
        <ProFormText
          name="name"
          label={intl.formatMessage({
            id: 'pages.flow.name',
            defaultMessage: 'Flow name',
          })}
          width="md"
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.flow.rules.name"
                  defaultMessage="Please enter a flow name!"
                />
              ),
            },
          ]}
      />


      <ProFormTreeSelect
        name="pid"
        label={intl.formatMessage({
          id: 'pages.flow.fatherFlow',
          defaultMessage: 'Father Flow',
        })}
        placeholder="Please select"
        allowClear
        width="md"
        
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
        
      
          dropdownMatchSelectWidth: false,
       
     
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
      <ProFormText
        name="icon"
        label={intl.formatMessage({
          id: 'pages.flow.icon',
          defaultMessage: 'Icon',
        })}
        width="md"
      />
        <ProFormTextArea
          name="description"
          width="md"
          label={intl.formatMessage({
            id: 'pages.flow.description',
            defaultMessage: 'Flow.description',
          })}
          
        />
    </ModalForm>
     
  );
};

export default UpdateForm;
