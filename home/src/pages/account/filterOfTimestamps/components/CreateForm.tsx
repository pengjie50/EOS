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
import { FilterOfTimestampsListItem } from '../data.d';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Modal, Form, TreeSelect } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import { flow } from '../../../system/flow/service';
import { tree,isPC } from "@/utils/utils";


export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: Partial<FilterOfTimestampsListItem>) => void;
  onSubmit: (values: Partial<FilterOfTimestampsListItem>) => Promise<void>;
  createModalOpen: boolean;
  
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const restFormRef = useRef<ProFormInstance>();
  const intl = useIntl();
  const [flowConf, setFlowConf] = useState<any>([]);
  const [isMP, setIsMP] = useState<boolean>(!isPC());
  const {
    onSubmit,
    onCancel,
    createModalOpen,
   
  } = props;

  useEffect(() => {

  alert(1)
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
            resetText: 
              intl.formatMessage({
                id: 'pages.reset',
                defaultMessage: '',
              })
            ,
          },
          resetButtonProps: {
            onClick: () => {
              restFormRef.current?.resetFields();
              //   setModalVisible(false);
            },
          },
        }}
        title={intl.formatMessage({
          id: 'pages.filterOfTimestamps.add',
          defaultMessage: 'New filter Of Timestamps',
        })}
      >
        <ProFormText
          name="name"
          label={intl.formatMessage({
            id: 'pages.filterOfTimestamps.name',
            defaultMessage: 'Template Name',
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
      <ProFormTreeSelect
        name="value"
        label={intl.formatMessage({
          id: 'pages.filterOfTimestamps.value',
          defaultMessage: 'Template Content',
        })}

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
          treeCheckable:true,
          multiple: true,
          maxTagCount: 0,
         
          maxTagPlaceholder: (omittedValues) => {
            return omittedValues.length + " Selected"
          },
          dropdownMatchSelectWidth: isMP ? true : false,
         // treeCheckStrictly:true,
          showCheckedStrategy: TreeSelect.SHOW_ALL,
          treeNodeFilterProp: 'name',
          fieldNames: {
            label: 'name',
          },
        }}
      />

     
       
    </ModalForm>
     
  );
};

export default UpdateForm;
