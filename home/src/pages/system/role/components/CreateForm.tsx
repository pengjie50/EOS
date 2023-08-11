import {
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormTreeSelect,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormCheckbox,
  ProFormDependency,
  ModalForm,
  ProCard,
  ProFormInstance

} from '@ant-design/pro-components';
import { RoleListItem } from '../data.d';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Modal, Form, TreeSelect, Tree } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import { flow } from '../../../system/flow/service';
import { company } from '../../../system/company/service';
import { tree, getparentlist, getChildNode, isPC } from "@/utils/utils";
import { permission } from '@/pages/system/permission/service';
import { fieldUniquenessCheck } from '@/services/ant-design-pro/api';
import { Checkbox } from 'antd-mobile';
export type CreateFormProps = {
  onCancel: (flag?: boolean, formVals?: Partial<RoleListItem>) => void;
  onSubmit: (values: Partial<RoleListItem>) => Promise<void>;
  createModalOpen: boolean;

};

const UpdateForm: React.FC<CreateFormProps> = (props) => {
  const restFormRef = useRef<ProFormInstance>();
  const intl = useIntl();
  const [flowConf, setFlowConf] = useState<any>([]);
  const [permissionConf, setPermissionConf] = useState<any>([]);
  const [accessiblePermissionsCheckedKeys, setAccessiblePermissionsCheckedKeys] = useState<any>([]);
  const [companyConf1, setCompanyConf1] = useState<any>([]);
  const [companyConf2, setCompanyConf2] = useState<any>([]);
  const [dataTerminal, setDataTerminal] = useState<any>([]);
  const [dataTrader, setDataTrader] = useState<any>([]);
  const [isMP, setIsMP] = useState<boolean>(!isPC());
  const {
    onSubmit,
    onCancel,
    createModalOpen,

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
        r.pid = null
        return r
      })

      var dataTerminal = res.data.filter((a) => {
        return a.type == "Terminal"
      })
      setDataTerminal(dataTerminal)
      var dataTrader = res.data.filter((a) => {
        return a.type != "Terminal" && a.type != "Super"
      })
      setDataTrader(dataTrader)
      var d1 = tree(dataTerminal, null, 'pid')


      setCompanyConf1(d1)


      var d2 = tree(dataTrader, null, 'pid')


      setCompanyConf2(d2)


      return d1
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

      return d
    });

  }, [true]);

  const onlyCheck = (rule: any, value: any, callback: (arg0: string | undefined) => void) => {


    fieldUniquenessCheck({ where: { name: value }, model: 'Role' }).then((res) => {

      if (res.data) {

        callback(intl.formatMessage({
          id: 'pages.xxx',
          defaultMessage: 'This role name is already in use',
        }))
      } else {
        callback(undefined); 
      }
    });

  }



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
        id: 'pages.role.add',
        defaultMessage: 'New Role',
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
                  defaultMessage="Please enter a role name !"
                />
              ),
            },
            { validator: onlyCheck }
          ]}
        />
        {/* <ProFormSelect
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
          defaultExpandAll={true}
          checkStrictly={true}
          onSelect={(e) => {


          }}
          onCheck={(e, a) => {
            
            var select = []
            var ishas = accessiblePermissionsCheckedKeys.some((b) => {
              return b == a.node.id
            })
            if (!ishas) {
              var parent = getparentlist(a.node.id, permissionConf)



              var child = getChildNode(permissionConf, a.node.id, [])

              select = Array.from(new Set([a.node.id, ...parent, ...child, ...accessiblePermissionsCheckedKeys]))
              setAccessiblePermissionsCheckedKeys(select);
            } else {
              var child = getChildNode(permissionConf, a.node.id, [])


              select = accessiblePermissionsCheckedKeys.filter((c) => {

                return ![a.node.id, ...child].some((a) => {
                  return a == c
                })
              })


              setAccessiblePermissionsCheckedKeys(select)
            }






            restFormRef.current?.setFieldValue("accessible_permissions", select?.filter((a) => {
              return a != "all"
            }))
          }}
          treeData={permissionConf}
        />






      </ProCard>



      <ProCard title="Accessible data for this role" colSpan={24} wrap={true} headerBordered collapsible={true} headStyle={{ backgroundColor: "#d4d4d4" }}>
        <ProFormCheckbox name="accessible_organization1" hidden={true} />
        <ProFormCheckbox name="accessible_organization2" hidden={true} />

        <ProFormCheckbox name="accessible_organization" hidden={true} />

        <ProCard colSpan={24} >
          <div style={{ marginBottom: 10 }}>Note: In order for a transaction to be visible for this role, please select the relevant trader and the terminal.</div>
          <ProFormDependency name={['accessible_organization']}>
            {({ accessible_organization }) => {



              if (accessible_organization?.length > 0) {

                var isa = dataTerminal.some((a) => {
                  return accessible_organization.some((b) => {
                    return b == a.id
                  })
                })

                var isb = dataTrader.some((a) => {
                  return accessible_organization.some((b) => {
                    return b == a.id
                  })
                })
                if (isa && isb) {

                  return ""
                } else {

                  return <div style={{ color: 'red' }}>Both Terminal and Trader must be selected</div>
                }

              }

            }}
          </ProFormDependency>
        </ProCard>
        <ProCard
          wrap={isMP}
          bordered
          headerBordered
        >
          <ProCard title="Terminal" colSpan="50%">
            <Tree
              checkable
              defaultExpandAll={true}
              onSelect={() => { }}
              onCheck={(e) => {
                restFormRef.current?.setFieldValue("accessible_organization1", e)
                restFormRef.current?.setFieldValue("accessible_organization", e.concat(restFormRef.current?.getFieldValue("accessible_organization2")))
              }}
              treeData={companyConf1}
            />
          </ProCard>
          <ProCard title="Trader / Others">
            <Tree
              checkable
              defaultExpandAll={true}
              onSelect={() => { }}
              onCheck={(e) => {
                restFormRef.current?.setFieldValue("accessible_organization2", e)
                restFormRef.current?.setFieldValue("accessible_organization", e.concat(restFormRef.current?.getFieldValue("accessible_organization1")))
              }}
              treeData={companyConf2}
            />
          </ProCard>
        </ProCard>





      </ProCard>

      <ProCard title="Accessible Timestamp" colSpan={24} headerBordered collapsible={true} headStyle={{ backgroundColor: "#d4d4d4" }}>
        <ProFormCheckbox name="accessible_timestamp" hidden={true} />
       

        <Tree
          checkable
          defaultExpandAll={true}
          onSelect={() => { }}
          onCheck={(e, h) => { restFormRef.current?.setFieldValue("accessible_timestamp", e.concat(h)) }}
          treeData={flowConf}
        />






      </ProCard>







    </ModalForm>

  );
};

export default UpdateForm;
