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
import { Modal, Form, TreeSelect, Button } from 'antd';
import React, { useRef, useState, useEffect  } from 'react';
import { flow } from '../../../system/flow/service';
import { tree, isPC } from "@/utils/utils";
import { currentUser, fieldUniquenessCheck } from '@/services/ant-design-pro/api';

export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: Partial<FilterOfTimestampsListItem>) => void;
  onSubmit: (values: Partial<FilterOfTimestampsListItem>) => Promise<void>;
  onApply: (values: Partial<any>) => Promise<void>;
  onDelete: (values: Partial<any>) => Promise<void>;
  createModalOpen: boolean;
  values: Partial<FilterOfTimestampsListItem>;
};
const valueMap = {};
function getPath(value) {
  const path = [];
  let current = valueMap[value];
  while (current) {
    path.unshift(current.value);
    current = current.parent;
  }
  return path;
}
function loops(list, parent) {
  return (list || []).map(({ children, value }) => {
    const node = (valueMap[value] = {
      parent,
      value
    });
    node.children = loops(children, node);
    return node;
  });

  
}
const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const restFormRef = useRef<ProFormInstance>();
  const intl = useIntl();
  const [flowConf, setFlowConf] = useState<any>([]);
  const [isMP, setIsMP] = useState<boolean>(!isPC());
  var {
    onSubmit,
    onCancel,
    onApply,
    onDelete,
    createModalOpen,
    values
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
        loops(flowConf, null);
        console.log("rrrrrrrrrr", valueMap)
      });

    }

  }, [props.createModalOpen]);


  const onlyCheck = (rule: any, value: any, callback: (arg0: string | undefined) => void) => {


    fieldUniquenessCheck({ where: { name: value, type: 0, company_id: currentUser?.company_id }, model: 'Userconfig' }).then((res) => {
      if (values && values.name == value) {
        callback(undefined);
      }
      
      if (res.data) {

        callback(intl.formatMessage({
          id: 'pages.xxx',
          defaultMessage: 'This name is already in use',
        }))
      } else {
        callback(undefined); // 必须返回一个callback
      }
    });

  }


  const onlyCheck2 = (rule: any, value: any, callback: (arg0: string | undefined) => void) => {

   
    fieldUniquenessCheck({ where: { value: value.join(','), type: 0, company_id: currentUser?.company_id }, model: 'Userconfig' }).then((res) => {
     
      if (values && values.value == value) {
        callback(undefined);
      }

      
      if (res.data) {

        callback(intl.formatMessage({
          id: 'pages.xxx',
          defaultMessage:res.data.name +' emplate already uses the same timestamps.',
        }))
      } else {
        callback(undefined); // 必须返回一个callback
      }
    });

  }

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
          submitText:"Save template",
          resetText:
            intl.formatMessage({
              id: 'pages.reset',
              defaultMessage: '重置',
            })
          ,
        },
        resetButtonProps: {
          onClick: () => {
            restFormRef.current?.resetFields();
            //   setModalVisible(false);
          },
        },
        render: (props, defaultDoms) => {
          return [
            ...defaultDoms,
            <Button
              key="apply"
              type="primary"
              onClick={() => {
                onApply(props.form?.getFieldsValue());
              }}
            >
              Apply
            </Button>,
            values.hasOwnProperty("name")? <Button
              key="delete"
              type="primary"
              danger
              onClick={() => {
                onDelete(props.form?.getFieldsValue());
              }}
            >
              Delete
            </Button>:null
          ];
        },
      }}
       
        title={intl.formatMessage({
          id: 'pages.filterOfTimestamps.yy',
          defaultMessage: 'Create New Timestamp Filter',
        })}
      >
        <ProFormText
          name="name"
          label={intl.formatMessage({
            id: 'pages.filterOfTimestamps.xxx',
            defaultMessage: 'Template name (only required if creating a template)',
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
            }, { validator:onlyCheck }
        ]}
      />
      <ProFormTreeSelect
        name="value"
        label={intl.formatMessage({
          id: 'pages.filterOfTimestamps.xx',
          defaultMessage: 'Timestamps to be included in the filter/template',
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
          }, { validator: onlyCheck2 }
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

          onChange: value => {
           // console.log("Change", getPath(value));
            console.log(value)
           // restFormRef.current?.setFieldValue('value', value)
          },

          onSelect: value => {
           // console.log("Select:", getPath(value));
            //restFormRef.current?.setFieldValue('value', getPath(value))
          },
       /* onChange: (checkedKeys, a,e) => {
          console.log(e)
          const checkedKeysResult = [...checkedKeys, ...e.halfCheckedKeys]
          restFormRef.current?.setFieldValue('value', checkedKeysResult)
        },*/
          showArrow: false,
          treeCheckable:true,
          multiple: true,
          maxTagCount:0,
          dropdownMatchSelectWidth: isMP ? true : false,
          //treeCheckStrictly:true,
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
