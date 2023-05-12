import React, {useEffect, useState} from 'react';
import { Form, Input, Modal, Tree} from 'antd';
import { RoleListItem } from '../data.d';
import { queryMenuByRoleId } from '@/pages/system/role/service';
import { permission } from '@/pages/system/permission/service';
import { tree as toTree } from '@/utils/utils';

export interface MenuFormProps {
  onCancel: () => void;
  onSubmit: (values: { role_id: string; permission_ids: string[] }) => void;
  updateMenuModalVisible: boolean;
  currentData: Partial<RoleListItem>;
}
const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

const UpdateRoleForm: React.FC<MenuFormProps> = (props) => {
  const [form] = Form.useForm();

  const [treeData, setTreeData] = useState([]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [selectedKey, setSelectedKey] = useState<string[]>([]);

  const {
    onSubmit,
    onCancel,
    updateMenuModalVisible,
    currentData,
  } = props;


  const handleSubmit = () => {
    if (!form) return;
    form.submit();
  };

  const handleFinish = (values: { [key: string]: any }) => {
    if (onSubmit) {
      var selectedKey2=selectedKey.filter((a) => {
        return a !="0"
      })
      const data = {
        role_id: currentData.id || "0",
        permission_ids: selectedKey2,
      };
      onSubmit(data);
    }
  };

  useEffect(() => {
    if (updateMenuModalVisible) {
      setSelectedKey([]);
      setCheckedKeys([]);
      permission({ current: 1, pageSize: 2000 }).then((res) => {
       

        res.data = res.data.map((a) => {
          a.title = a.name
          a.key = a.id
          a.parentId="0"
          return a
        })
        res.data.push({ title: "All", key: "0", id: "0", parentId:"" })

        console.log(res.data)
        let tr = toTree(res.data, "", 'parentId');

        console.log(tr)
        // @ts-ignore
        setTreeData(tr);

        if (res.userData) {
          // @ts-ignore
         // let map = res.userData.map(r => r + '');
         // setSelectedKey(map);
         // setCheckedKeys(map);

          console.log(tr);
        }
      });

      queryMenuByRoleId({ role_id: currentData.id }).then((res) => {
        

        if (res.data) {
          console.log(res.data)
          // @ts-ignore
          let map = res.data.map(r => r.permission_id +'');
          setSelectedKey(map);
          setCheckedKeys(map);

          
        }
      });
    }
  }, [props.updateMenuModalVisible]);


  const onCheck = (checkedKeys: React.Key[]) => {
    setCheckedKeys(checkedKeys);

    setSelectedKey(checkedKeys.map((i) => i+""));
  };

  const renderContent = () => {
    return (
      <>
        
        <Tree
          checkable
          defaultExpandAll={true}
          // onExpand={onExpand}
          // expandedKeys={expandedKeys}
          // autoExpandParent={autoExpandParent}
          onCheck={onCheck}
          checkedKeys={checkedKeys}
          // onSelect={onSelect}
          // selectedKeys={selectedKeys}
          treeData={treeData}
        />
      </>
    );
  };


  const modalFooter = { okText: 'Save', onOk: handleSubmit, onCancel };

  return (
    <Modal
      forceRender
      destroyOnClose
      title="Assign role permissions"
      visible={updateMenuModalVisible}
      {...modalFooter}
    >
      <Form
        {...formLayout}
        form={form}
        onFinish={handleFinish}
      >
        {renderContent()}
      </Form>
    </Modal>
  );
};

export default UpdateRoleForm;
