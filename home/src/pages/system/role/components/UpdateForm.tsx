import {
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormTreeSelect,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormCheckbox,
  ModalForm,
  ProCard,
  ProFormInstance
  
} from '@ant-design/pro-components';
import { RoleListItem } from '../data.d';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Modal, Form, TreeSelect, Tree } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import { flow } from '../../../system/flow/service';
import { tree, getparentlist, getChildNode, isPC } from "@/utils/utils";
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
  const [permissionConf, setPermissionConf] = useState<any>([]);
  const [companyConf, setCompanyConf] = useState<any>([]);
  const [isMP, setIsMP] = useState<boolean>(!isPC());


  const [accessiblePermissionsCheckedKeys, setAccessiblePermissionsCheckedKeys] = useState<any>(values?.accessible_permissions ||[]); 
  const {
    onSubmit,
    onCancel,
    updateModalOpen,
    values,
  } = props;

  useEffect(() => {

    flow({ sorter: { sort: 'ascend' } }).then((res) => {

      res.data = res.data.map((r) => {
        r['key'] = r.id
        r['title'] = r.name
        return r
      })
      res.data.unshift({ value: 'all', title: 'All', name: 'All', id: "                                    ", pid: "all" })
      setFlowConf(tree(res.data, "all", 'pid'))
      return tree(res.data, "all", 'pid')
    });
    company().then((res) => {

      res.data = res.data.map((r) => {
        r['key'] = r.id
        r['title'] = r.name
        return r
      })
      var d = tree(res.data, "                                    ", 'pid')

      d[0].title = "All"
      setCompanyConf(d)
      return d
    });


    permission({ sorter: { sort: 'ascend' } }).then((res) => {

      res.data = res.data.map((r) => {
        r['key'] = r.id
        r['title'] = r.name
        if (r.pid == null) {
          r.pid = 'all'
        }

        return r
      })
      res.data.unshift({ value: 'all', key: 'all', title: 'All', name: 'All', id: 'all', pid: "pall" })
      setPermissionConf(tree(res.data, "pall", 'pid'))
      return tree(res.data, "pall", 'pid')
    });
    if (values && values.accessible_permissions) {
      setAccessiblePermissionsCheckedKeys(['all', ...values?.accessible_permissions] || [])
    }
    
    
  }, [true, values]);


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
      <ProCard title="Basic Information" colSpan={24} headerBordered collapsible={true} headStyle={{ backgroundColor: "#d4d4d4" }}>
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
        {/*<ProFormSelect
          name="type"
          label={intl.formatMessage({
            id: 'pages.xxx',
            defaultMessage: 'Role Type',
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
            "Super": "Super",


          }}
        />*/ }

        <ProFormTextArea
          name="description"
          width="md"
          label={intl.formatMessage({
            id: 'pages.role.description',
            defaultMessage: 'Role Description',
          })}

        />
      </ProCard>

      <ProCard title="Accessible feature" colSpan={24} headerBordered collapsible={true} headStyle={{ backgroundColor: "#d4d4d4" }}>

        <ProFormCheckbox name="accessible_permissions" hidden={true} />
        <Tree
          checkable
          multiple={true}
          checkedKeys={accessiblePermissionsCheckedKeys}
         // defaultCheckedKeys={values.accessible_permissions}
          defaultExpandAll={true}
          checkStrictly={true}
          onSelect={(e) => {

           
          }}
          onCheck={(e, a) => {
            var ishas = accessiblePermissionsCheckedKeys.some((b) => {
              return b == a.node.id
            })
            var checks=[]
            if (!ishas) {
              var parent = getparentlist(a.node.id, permissionConf)



              var child = getChildNode(permissionConf, a.node.id, [])

              checks = Array.from(new Set([a.node.id, ...parent, ...child, ...accessiblePermissionsCheckedKeys]))
              setAccessiblePermissionsCheckedKeys(checks);
            } else {
              var child = getChildNode(permissionConf, a.node.id, [])


              var checks = accessiblePermissionsCheckedKeys.filter((c) => {

                return ![a.node.id, ...child].some((a) => {
                  return a == c
                })
              })
              setAccessiblePermissionsCheckedKeys(checks)
            }


            checks=checks?.filter((a) => {
              return a != "all"
            })
          


            restFormRef.current?.setFieldValue("accessible_permissions", checks )
          }}

          treeData={permissionConf}
        />






      </ProCard>


      <ProCard title="Data Available" colSpan={24} headerBordered collapsible={true} headStyle={{ backgroundColor: "#d4d4d4" }}>
        <ProFormCheckbox name="accessible_organization" hidden={true} />
        <Tree
          checkable
          defaultCheckedKeys={values.accessible_organization}
          defaultExpandAll={true}
          onSelect={() => { }}
          onCheck={(e) => { restFormRef.current?.setFieldValue("accessible_organization", e) }}
          treeData={companyConf}
        />


      </ProCard>

      <ProCard title="Accessible Timestamp" colSpan={24} headerBordered collapsible={true} headStyle={{ backgroundColor: "#d4d4d4" }}>
        <ProFormCheckbox name="accessible_timestamp" hidden={true} />
        {/*accessible_timestamp*/}

        <Tree
          checkable
          defaultCheckedKeys={values.accessible_timestamp}
          defaultExpandAll={true}
          onSelect={() => { }}
          onCheck={(e) => { restFormRef.current?.setFieldValue("accessible_timestamp", e) }}
          treeData={flowConf}
        />






      </ProCard>
    </ModalForm>
     
  );
};

export default UpdateForm;
