import {
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormTreeSelect,
  ProFormSelect,
  ProFormText,
  ProFormSwitch,
  ProFormTextArea,
  ModalForm,
  ProFormInstance
  
} from '@ant-design/pro-components';
import { RoleListItem } from '../data.d';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Modal, Form, TreeSelect } from 'antd';
import React, { useRef, useState } from 'react';
import { flow } from '../../../system/flow/service';
import { tree, isPC } from "@/utils/utils";
import { company } from '../../../system/company/service';
import { queryMenuByRoleId } from '@/pages/system/role/service';
import { permission } from '@/pages/system/permission/service';
export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: Partial<RoleListItem>) => void;
  onSubmit: (values: Partial<RoleListItem>) => Promise<void>;
  updateModalOpen: boolean;
  values: Partial<RoleListItem>;
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
              //   setModalVisible(false);
            },
          },
        }}
        title={intl.formatMessage({
          id: 'pages.role.mod',
          defaultMessage: 'Modify Role',
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
      <ProFormSelect
        name="type"
        label={intl.formatMessage({
          id: 'pages.xxx',
          defaultMessage: 'Role Type',
        })}
        width="md"
        valueEnum={{
          "Surveyor": "Surveyor",
          "Trader": "Trader",
          "Agent": "Agent",
          "Terminal": "Oil Terminal",
          "Pilot": "Pilot",
          "Super": "Super",


        }}
      />

        <ProFormTextArea
          name="description"
          width="md"
          label={intl.formatMessage({
            id: 'pages.role.description',
            defaultMessage: 'Role Description',
          })}
         
      />
      <ProFormTreeSelect
        name="accessible_feature"
        label={intl.formatMessage({
          id: 'pages.xxx',
          defaultMessage: "Accessible Feature",
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

          var data = [
            {
              name: 'All', id: "all", pid: "                                    "
            },
            {
              name: 'Dashboard', id: "dashboard"
            },
            {
              name: 'Threshold–Triggered Alert', id: "alert"

            },
            {
              name: 'Threshold–Summary', id: "alertrule"

            },
            {
              name: 'Information Page–Jetty', id: "jetty"

            },
            {
              name: 'Transaction', id: "transaction"

            },
            {
              name: 'Report–Report  History', id: "report"

            }


          ]

          data = data.map((r) => {
            r['value'] = r.id
            r['title'] = r.name
            r.pid="all"
            return r
          })
          data[0].pid = "                                    "
          var d = tree(data, "                                    ", 'pid')
         
          return d


        }}
        // tree-select args
        fieldProps={{
          showArrow: false,
          treeCheckable: true,
          multiple: true,
          maxTagCount: 0,
          dropdownMatchSelectWidth: isMP ? true : false,
          // treeCheckStrictly:true,
          // showCheckedStrategy: TreeSelect.SHOW_ALL,
          treeNodeFilterProp: 'name',
          fieldNames: {
            label: 'name',
          },
        }}
      />
      <ProFormTreeSelect
        name="accessible_organization"
        label={intl.formatMessage({
          id: 'pages.xxx',
          defaultMessage: "Accessible Organization's  Data",
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
          return company().then((res) => {

            res.data = res.data.map((r) => {
              r['value'] = r.id
              r['title'] = r.name
              return r
            })
            var d = tree(res.data, "                                    ", 'pid')
            d[0].name = "All"
            return d
          });

        }}

        // tree-select args
        fieldProps={{
          showArrow: false,
          treeCheckable: true,
          multiple: true,
          maxTagCount: 0,
          dropdownMatchSelectWidth: isMP ? true : false,
          // treeCheckStrictly:true,
          //showCheckedStrategy: TreeSelect.SHOW_ALL,
          treeNodeFilterProp: 'name',
          fieldNames: {
            label: 'name',
          },
        }}
      />
      <ProFormTreeSelect
        name="accessible_permissions"
        label={intl.formatMessage({
          id: 'pages.xxx',
          defaultMessage: "Accessible Permissions",
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
          
          return permission().then((res) => {

            queryMenuByRoleId({ role_id: values.id }).then((res2) => {
              var dd = res2.data.map((rr) => {
              
                return rr.permission_id+""
              })
             
              restFormRef.current?.setFieldValue('accessible_permissions',dd)
            })

            res.data = res.data.map((r) => {
              r['value'] = r.id
              r['title'] = r.d
              r['pid'] = "all"
              return r
            })
            res.data.unshift({ value: 'all', title: 'All', name: 'All', pid: "                                    ", id: "all" })
            var d = tree(res.data, "                                    ", 'pid')

            return d
          });

        }}

        // tree-select args
        fieldProps={{
          showArrow: false,
          treeCheckable: true,
          multiple: true,
          maxTagCount: 0,
          dropdownMatchSelectWidth: isMP ? true : false,
          // treeCheckStrictly:true,
          // showCheckedStrategy: TreeSelect.SHOW_ALL,
          treeNodeFilterProp: 'name',
          fieldNames: {
            label: 'name',
          },
        }}
      />
      <ProFormTreeSelect
        name="accessible_timestamp"
        label={intl.formatMessage({
          id: 'pages.xxx',
          defaultMessage: 'Accessible Timestamp',
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
          treeCheckable: true,
          multiple: true,
          maxTagCount: 0,
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
