import {
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormTreeSelect,
  ModalForm,
  ProFormInstance
  
} from '@ant-design/pro-components';
import { PermissionListItem } from '../data.d';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Modal, Form } from 'antd';
import React, { useRef, useState } from 'react';

import { permission } from '../service';
import { tree, isPC } from "@/utils/utils";

export type CreateFormProps = {
  onCancel: (flag?: boolean, formVals?: Partial<PermissionListItem>) => void;
  onSubmit: (values: Partial<PermissionListItem>) => Promise<void>;
  createModalOpen: boolean;
  
};

const UpdateForm: React.FC<CreateFormProps> = (props) => {
  const restFormRef = useRef<ProFormInstance>();
  const intl = useIntl();
  const [permissionConf, setPermissionConf] = useState<any>([]);
  const [isMP, setIsMP] = useState<boolean>(!isPC());
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
          id: 'pages.permission.add',
          defaultMessage: 'Add a permission',
        })}
      >
        <ProFormText
          name="name"
          label={intl.formatMessage({
            id: 'pages.permission.name',
            defaultMessage: 'Permission Name',
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
      <ProFormText
        name="permission_key"
        label={intl.formatMessage({
          id: 'pages.permission.xxx',
          defaultMessage: 'Permission Key',
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
        name="pid"
        label={intl.formatMessage({
          id: 'pages.flow.fatherFlow',
          defaultMessage: 'Father Permission',
        })}
        placeholder="Please select"
        allowClear
        width="md"

        request={async () => {
          return permission({ sorter: { sort: 'ascend' } }).then((res) => {

            res.data = res.data.map((r) => {
              r['value'] = r.id
              r['title'] = r.name
              return r
            })

            setPermissionConf(tree(res.data, null, 'pid'))
            return tree(res.data, null, 'pid')
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
        <ProFormTextArea
          name="description"
          width="md"
          label={intl.formatMessage({
            id: 'pages.permission.description',
            defaultMessage: 'Permission Description',
          })}
         
        />
    </ModalForm>
     
  );
};

export default UpdateForm;
