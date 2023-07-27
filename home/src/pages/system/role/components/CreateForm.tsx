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
import { company } from '../../../system/company/service';
import { tree, getparentlist, getChildNode, isPC } from "@/utils/utils";
import { permission } from '@/pages/system/permission/service';
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
  const [companyConf, setCompanyConf] = useState<any>([]);
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
        if (r.pid==null) {
          r.pid = 'all'
        }
        
        return r
      })
      res.data.unshift({ value: 'all',key:'all' ,title: 'All', name: 'All', id: 'all', pid: "pall" })
      setPermissionConf(tree(res.data, "pall", 'pid'))
      return tree(res.data, "pall", 'pid')

      return d
    });

  }, [true]);

  

  
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
                  defaultMessage="Please enter a role mame !"
                />
              ),
            },
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

        <ProFormCheckbox name="accessible_permissions"  hidden={true } />
        <Tree
          checkable
          multiple={true}
          checkedKeys={accessiblePermissionsCheckedKeys}
          defaultExpandAll={true}
          checkStrictly={true }
          onSelect={(e) => {
            

          }}
          onCheck={(e, a) => {
            var ishas=accessiblePermissionsCheckedKeys.some((b) => {
              return b == a.node.id
            })
            if (!ishas) {
              var parent = getparentlist(a.node.id, permissionConf)
             

              
              var child= getChildNode(permissionConf, a.node.id, [])
              
              
              setAccessiblePermissionsCheckedKeys(Array.from(new Set([a.node.id, ...parent, ...child, ...accessiblePermissionsCheckedKeys])));
            } else {
              var child = getChildNode(permissionConf, a.node.id, [])


             var checks= accessiblePermissionsCheckedKeys.filter((c) => {

                return ![a.node.id, ...child].some((a) => {
                  return a == c
                })
              })
              setAccessiblePermissionsCheckedKeys(checks)
            }


            

            
            
            restFormRef.current?.setFieldValue("accessible_permissions", checks?.filter((a) => {
              return a != "all"
            }))
          }}
          treeData={permissionConf}
        />

        


       

      </ProCard>


      <ProCard title="Data Available" colSpan={24} headerBordered collapsible={true} headStyle={{ backgroundColor: "#d4d4d4" }}>
        <ProFormCheckbox name="accessible_organization" hidden={true} />
        <Tree
          checkable
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
          defaultExpandAll={true }
          onSelect={() => { } }
          onCheck={(e, h) => { restFormRef.current?.setFieldValue("accessible_timestamp", e.concat(h)) }}
          treeData={flowConf}
        />




       

      </ProCard>

      
      
     
     

     
    </ModalForm>
     
  );
};

export default UpdateForm;
