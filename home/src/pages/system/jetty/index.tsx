import { addJetty, removeJetty, jetty, updateJetty } from './service';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { JettyList, JettyListItem } from './data.d';
import * as XLSX from 'xlsx';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  ProFormInstance,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Drawer, Input, message, Upload, Tooltip } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import { terminal } from '../../system/terminal/service';
/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: JettyListItem) => {
  const hide = message.loading(<FormattedMessage
    id="pages.adding"
    defaultMessage="Adding"
  />);
  try {
    await addJetty({ ...fields });
    hide();
    message.success(<FormattedMessage
      id="pages.addedSuccessfully"
      defaultMessage="Added successfully"
    />);
    return true;
  } catch (error) {
    hide();
    message.error(<FormattedMessage
      id="pages.addingFailed"
      defaultMessage="Adding failed, please try again!"
    />);
    return false;
  }
};

/**
 * @en-US Update node
 * @zh-CN 更新节点
 *
 * @param fields
 */
const handleUpdate = async (fields: Partial<JettyListItem> ) => {
  const hide = message.loading(<FormattedMessage
    id="pages.modifying"
    defaultMessage="Modifying"
  />);
  try {
    await updateJetty({ ...fields });
    hide();

    message.success(<FormattedMessage
      id="pages.modifySuccessful"
      defaultMessage="Modify is successful"
    />);
    return true;
  } catch (error) {
    hide();
    message.error(<FormattedMessage
      id="pages.modifyFailed"
      defaultMessage="Modify failed, please try again!"
    />);
    return false;
  }
};

/**
 *  Delete node
 * @zh-CN 删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: JettyListItem[]) => {
  const hide = message.loading(<FormattedMessage
    id="pages.deleting"
    defaultMessage="Deleting"
  />);
  if (!selectedRows) return true;
  try {
    await removeJetty({
      id: selectedRows.map((row) => row.id),
    });
    hide();
    message.success(<FormattedMessage
      id="pages.deletedSuccessfully"
      defaultMessage="Deleted successfully and will refresh soon"
    />);
    return true;
  } catch (error) {
    hide();
    message.error(<FormattedMessage
      id="pages.deleteFailed"
      defaultMessage="Delete failed, please try again"
    />);
    return false;
  }
};

const TableList: React.FC = () => {
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<JettyListItem>();
  const [selectedRowsState, setSelectedRows] = useState<JettyListItem[]>([]);
  const [terminalList, setTerminalList] = useState<any>({});
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();
  const formRef = useRef<ProFormInstance>();
  useEffect(() => {

   
    terminal({ pageSize: 3000, current: 1, sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setTerminalList(b)

    });





  }, [true]);
  const uploadprops = {
    // 这里我们只接受excel2007以后版本的文件，accept就是指定文件选择框的文件类型
    accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    name: 'file',
    headers: {
      authorization: 'authorization-text',
    },
    showUploadList: false,
    // 把excel的处理放在beforeUpload事件，否则要把文件上传到通过action指定的地址去后台处理
    // 这里我们没有指定action地址，因为没有传到后台
    beforeUpload:  (file, fileList) => {
      let terminal_id = formRef.current?.getFieldValue('terminal_id')
      if (!terminal_id) {
        message.error(<FormattedMessage
          id="pages.jetty.p"
          defaultMessage="Please select terminal first!"
        />);
        return
      }

      const rABS = true;
      const f = fileList[0];
      const reader = new FileReader();
      reader.onload = async (e )=> {
        let dataResult = e.target.result;
        if (!rABS) dataResult = new Uint8Array(dataResult);
        const workbook = XLSX.read(dataResult, {
          type: rABS ? 'binary' : 'array',
        });
        // 假设我们的数据在第一个标签
        const firstWorksheet = workbook.Sheets[workbook.SheetNames[0]];
        // XLSX自带了一个工具把导入的数据转成json
        let jsonArr = XLSX.utils.sheet_to_json(firstWorksheet, { header: 1 });
        // 通过自定义的方法处理Json,得到Excel原始数据传给后端，后端统一处理
        jsonArr.shift()
        jsonArr=jsonArr.map(a => {
          let b = {}
          b.name = a[0]
          b.depth_alongside = a[1]+""
          b.depth_approaches = a[2] + ""
          b.max_loa = a[3] + ""
          b.min_loa = a[4] + ""
          b.max_displacement = a[5] + ""
          b.mla_envelop_at_mhws_3m = a[6] + ""
          b.terminal_id = formRef.current?.getFieldValue('terminal_id')
          return b
        })
        var s = await handleAdd({ batch_data: jsonArr })
        if (s) {
          if (actionRef.current) {
            actionRef.current.reload();

          }
        }
        
       
      };
      if (rABS) reader.readAsBinaryString(f);
      else reader.readAsArrayBuffer(f);
      return false;
    },
  };
  const columns: ProColumns<JettyListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.jetty.berthNo"
          defaultMessage="Berth No."
        />
      ),
      sorter: true,
      hideInSearch: true,
      defaultSortOrder: 'ascend',
      dataIndex: 'name',
      tip: 'The jetty name is the unique key',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: <FormattedMessage id="pages.jetty.terminals" defaultMessage="Terminal" />,
      dataIndex: 'terminal_id',
      valueEnum: terminalList
    },
    {
      title: <FormattedMessage id="pages.jetty.depthAlongside" defaultMessage="Depth Alongside (M)" />,
      dataIndex: 'depth_alongside',
      valueType: 'text',
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.jetty.depthApproaches" defaultMessage="Depth Approaches (M)" />,
      dataIndex: 'depth_approaches',
      valueType: 'text',
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.jetty.maxLOA" defaultMessage="Max. LOA (M)" />,
      dataIndex: 'max_loa',
      valueType: 'text',
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.jetty.minLOA" defaultMessage="Min. LOA (M)" />,
      dataIndex: 'min_loa',
      valueType: 'text',
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.jetty.maxDisplacement" defaultMessage="Max. Displacement (MT)D
" />,
      dataIndex: 'max_displacement',
      valueType: 'text',
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.jetty.mlaEnvelopAtMHWS3m" defaultMessage="MLA Envelop at MHWS 3.0m (unless otherwise specified) (M)
" />,
      dataIndex: 'mla_envelop_at_mhws_3m',
      valueType: 'text',
      hideInSearch: true,
    },
    
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="config"
          onClick={() => {
            handleUpdateModalOpen(true);
            setCurrentRow(record);
          }}
        >
          <FormattedMessage id="pages.update" defaultMessage="Modify" />
        </a>,
       
      ],
    },
  ];

  return (
    <PageContainer header={{
      title: '',
      breadcrumb: {},
    }}>
      <ProTable<JettyListItem, API.PageParams>
        formRef={formRef }
        headerTitle={intl.formatMessage({
          id: 'pages.jetty.title',
          defaultMessage: 'Jetty Criteria – Advario',
        })}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 150,
          searchText: < FormattedMessage id="pages.search" defaultMessage="Search" />
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleModalOpen(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
          </Button>, <Upload {...uploadprops}>
            <Tooltip title="">
              <Button type="primary">
                Batch Add
              </Button>
            </Tooltip>
          </Upload>
        ]}
        request={(params, sorter) => jetty({ ...params, sorter })}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="Chosen" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
              &nbsp;&nbsp;
              <span>
                <FormattedMessage
                  id="pages.searchTable.totalServiceCalls"
                  defaultMessage="Total number of service calls"
                />{' '}
                {selectedRowsState.reduce((pre, item) => pre , 0)}{' '}
                <FormattedMessage id="pages.searchTable.tenThousand" defaultMessage="万" />
              </span>
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            <FormattedMessage
              id="pages.searchTable.batchDeletion"
              defaultMessage="Batch deletion"
            />
          </Button>
          
        </FooterToolbar>
      )}
      
      <CreateForm
        onSubmit={async (value) => {
          value.id = currentRow?.id
          const success = await handleAdd(value as JettyListItem);
          if (success) {
            handleModalOpen(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          handleModalOpen(false);
          if (!showDetail) {
            setCurrentRow(undefined);
          }
        }}
        createModalOpen={createModalOpen}
        values={currentRow || {}}
      />
      <UpdateForm
        onSubmit={async (value) => {
          value.id = currentRow?.id
          const success = await handleUpdate(value);
          if (success) {
            handleUpdateModalOpen(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          handleUpdateModalOpen(false);
          if (!showDetail) {
            setCurrentRow(undefined);
          }
        }}
        updateModalOpen={updateModalOpen}
        values={currentRow || {}}
      />

      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <ProDescriptions<JettyListItem>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<JettyListItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
