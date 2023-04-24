import { addOperlog, removeOperlog, operlog, updateOperlog } from './service';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { OperlogList, OperlogListItem } from './data.d';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Drawer, Input, message } from 'antd';
import React, { useRef, useState } from 'react';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';



/**
 *  Delete node
 * @zh-CN 删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: OperlogListItem[]) => {
  const hide = message.loading('Deleting');
  if (!selectedRows) return true;
  try {
    await removeOperlog({
      id: selectedRows.map((row) => row.id),
    });
    hide();
    message.success('Deleted successfully and will refresh soon');
    return true;
  } catch (error) {
    hide();
    message.error('Delete failed, please try again');
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
  const [currentRow, setCurrentRow] = useState<OperlogListItem>();
  const [selectedRowsState, setSelectedRows] = useState<OperlogListItem[]>([]);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const columns: ProColumns<OperlogListItem>[] = [
    
    {
      title: <FormattedMessage id="pages.user.username" defaultMessage="username" />,
      dataIndex: 'username',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.operlog.url" defaultMessage="url" />,
      dataIndex: 'url',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.operlog.ip" defaultMessage="Ip" />,
      dataIndex: 'ip',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.operlog.module" defaultMessage="module" />,
      dataIndex: 'module',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.operlog.action" defaultMessage="action" />,
      dataIndex: 'action',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.operlog.param" defaultMessage="param" />,
      dataIndex: 'param',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.operlog.result" defaultMessage="result" />,
      dataIndex: 'result',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.loginlog.status" defaultMessage="Status" />,
      dataIndex: 'status',
      hideInForm: true,
      valueEnum: {
        0: {
          text: (
            <FormattedMessage
              id="pages.loginlog.Success"
              defaultMessage="Success"
            />
          ),
          status: 'Success',
        },
        1: {
          text: (
            <FormattedMessage id="pages.loginlog.error" defaultMessage="Error" />
          ),
          status: 'Error',
        }

      },
    },
    {
      title: (
        <FormattedMessage
          id="pages.loginlog.information"
          defaultMessage="Information"
        />
      ),
      dataIndex: 'err_code',
      sorter: true,
      hideInForm: true,
      renderText: (val: Number) => {
        if (val == 0) {
          return ''
        }
        return `${intl.formatMessage({
          id: 'pages.error.' + val,
          defaultMessage: '',
        })}`
      }
      ,
    },
    {
      title: (
        <FormattedMessage
          id="pages.operlog.operTime"
          defaultMessage="Oper time"
        />
      ),
      sorter: true,
      dataIndex: 'oper_time',
      valueType: 'dateTime'

    },
    {
      title: (
        <FormattedMessage
          id="pages.operlog.operTime"
          defaultMessage="Oper time"
        />
      ),
      sorter: true,
      hideInForm: true,
      hideInTable: true,
      defaultSortOrder: 'descend',
      dataIndex: 'oper_time',
      valueType: 'dateRange',
      search: {
        transform: (value) => {
          return {
            'oper_time__gt': value[0],
            'oper_time__lt': value[1],
          }
        }
      }



    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
       
       
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<OperlogListItem, API.PageParams>
        scroll={{ x: 2500, y: 300 }}
        headerTitle={intl.formatMessage({
          id: 'pages.searchTable.title',
          defaultMessage: 'Enquiry form',
        })}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
          searchText: < FormattedMessage id="pages.search" defaultMessage="Search" />
        }}
        toolBarRender={() => [
         
        ]}
        request={(params, sorter) => operlog({ ...params, sorter })}
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
          <ProDescriptions<OperlogListItem>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<OperlogListItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
