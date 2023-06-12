import RcResizeObserver from 'rc-resize-observer';

import { addOperlog, removeOperlog, operlog, updateOperlog } from './service';
import { PlusOutlined, SearchOutlined, FormOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
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
  Search,
  ProFormInstance
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, formatMessage } from '@umijs/max';
import { Button, Drawer, Input, message, Modal } from 'antd';
import React, { useRef, useState } from 'react';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';

const { confirm } = Modal;
//MP
import { InfiniteScroll, List, NavBar, Space, DotLoading } from 'antd-mobile'
import { isPC } from "@/utils/utils";

/**
 *  Delete node
 * @zh-CN 删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: OperlogListItem[], callBack: any) => {
  if (!selectedRows) return true;
  var open = true
  confirm({
    title: 'Delete record?',
    open: open,
    icon: <ExclamationCircleOutlined />,
    content: 'The deleted record cannot be restored. Please confirm!',
    onOk() {


      const hide = message.loading(<FormattedMessage
        id="pages.deleting"
        defaultMessage="Deleting"
      />);
      try {
        removeOperlog({
          id: selectedRows.map((row) => row.id),
        }).then(() => {
          hide();
          message.success(<FormattedMessage
            id="pages.deletedSuccessfully"
            defaultMessage="Deleted successfully and will refresh soon"
          />);
          open = false
          callBack(true)
        });

      } catch (error) {
        hide();
        message.error(<FormattedMessage
          id="pages.deleteFailed"
          defaultMessage="Delete failed, please try again"
        />);
        callBack(false)
      }

    },
    onCancel() { },
  });





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
  const [resizeObj, setResizeObj] = useState({ searchSpan: 12, tableScrollHeight: 300 });
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  //--MP start
  const MPSearchFormRef = useRef<ProFormInstance>();

  const [showMPSearch, setShowMPSearch] = useState<boolean>(false);
  const [isMP, setIsMP] = useState<boolean>(!isPC());

  const right = (
    <div style={{ fontSize: 24 }}>
      <Space style={{ '--gap': '16px' }}>
        <SearchOutlined onClick={e => { setShowMPSearch(!showMPSearch) }} />

      </Space>
    </div>
  )

  const onFormSearchSubmit = (a) => {


    setData([]);
    delete a._timestamp;
    setMPfilter(a)
    setShowMPSearch(!showMPSearch)
    setCurrentPage(1)

    getData(1, a)
  }
  const InfiniteScrollContent = ({ hasMore }: { hasMore?: boolean }) => {
    return (
      <>
        {hasMore ? (
          <>
            <span>Loading</span>
            <DotLoading />
          </>
        ) : (
          <span>{data.length} items in total</span>
        )}
      </>
    )
  }
  const back = () => { }
  const [data, setData] = useState<string[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [MPfilter, setMPfilter] = useState<any>({})

  async function getData(page, filter) {
    const append = await operlog({
      ...{
        "current": page,
        "pageSize": 10

      }, ...filter
    })


    console.log(append)
    setData(val => [...val, ...append.data])
    setHasMore(10 * (page - 1) + append.data.length < append.total)
  }
  async function loadMore(isRetry: boolean) {

    await getData(currentPage, MPfilter)
    setCurrentPage(currentPage + 1)
  }
  //--MP end
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
      ellipsis:true,
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.operlog.result" defaultMessage="result" />,
      dataIndex: 'result',
      ellipsis: true,
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.loginlog.status" defaultMessage="Status" />,
      dataIndex: 'status',
      hideInForm: true,
      search: {
        transform: (value) => {
          alert(value)
          if (value !== null) {
            return {

              status: {
                'field': 'status',
                'op': 'eq',
                'data': Number(value)
              }

            }
          }

        }
      },
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
      hideInSearch:true,
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
          if (value.length > 0) {
            return {
              'oper_time': {
                'field': 'oper_time',
                'op': 'between',
                'data': value
              }
            }
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
    <RcResizeObserver
      key="resize-observer"
      onResize={(offset) => {
        const { innerWidth, innerHeight } = window;

        if (offset.width > 1280) {
          setIsMP(false)
          setResizeObj({ ...resizeObj, searchSpan: 8, tableScrollHeight: innerHeight - 420 });
        }
        if (offset.width < 1280 && offset.width > 900) {
          setIsMP(false)
          setResizeObj({ ...resizeObj, searchSpan: 12, tableScrollHeight: innerHeight - 420 });
        }
        if (offset.width < 900 && offset.width > 700) {
          setResizeObj({ ...resizeObj, searchSpan: 24, tableScrollHeight: innerHeight - 420 });
          setIsMP(false)
        }

        if (offset.width < 700) {
          setIsMP(true)
        }

      }}
    >
    <PageContainer header={{
      title: isMP ? null : < FormattedMessage id="pages.operlog.title" defaultMessage="Operation log" />,
      breadcrumb: {},
    }} >
      {!isMP && (<ProTable<OperlogListItem, API.PageParams>
        //scroll={{ x: 2500, y: 300 }}
       
        actionRef={actionRef}
          rowKey="id"
          scroll={{ x: 1800, y: resizeObj.tableScrollHeight }}
        search={{
          labelWidth: 120,
          span: resizeObj.searchSpan,
          searchText: < FormattedMessage id="pages.search" defaultMessage="Search" />
        }}
        toolBarRender={() => [
         
        ]}
        options={false}
        className="mytable"
        request={(params, sorter) => operlog({ ...params, sorter })}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />)}

      {isMP && (<>

        <NavBar backArrow={false} right={right} onBack={back}>
          {intl.formatMessage({
            id: 'pages.operlog.title',
            defaultMessage: 'Operation log',
          })}
        </NavBar>

        <div style={{ padding: '20px', backgroundColor: "#5187c4", display: showMPSearch ? 'block' : 'none' }}>
          <Search columns={columns.filter(a => !a.hasOwnProperty('hideInSearch'))} action={actionRef} loading={false}

            onFormSearchSubmit={onFormSearchSubmit}

            dateFormatter={'string'}
            formRef={MPSearchFormRef}
            type={'form'}
            cardBordered={true}
            form={{
              submitter: {
                searchConfig: {

                  submitText: < FormattedMessage id="pages.search" defaultMessage="Search" />,
                }

              }
            }}

            search={{}}
            manualRequest={true}
          />
        </div>
        <List>
          {data.map((item, index) => (
            <List.Item key={index}>

              <ProDescriptions<any>
                bordered={true}
                size="small"
                layout="horizontal"
                column={1}
                title={""}
                request={async () => ({
                  data: item || {},
                })}
                params={{
                  id: item?.id,
                }}
                columns={columns as ProDescriptionsItemProps<any>[]}
              />

            </List.Item>
          ))}
        </List>
        <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
          <InfiniteScrollContent hasMore={hasMore} />
        </InfiniteScroll>
      </>)}
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="Chosen" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
              &nbsp;&nbsp;
             
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
        width={isMP ? '100%' : 600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={isMP ? true : false}
      >
        {currentRow?.name && (
          <ProDescriptions<OperlogListItem>
            column={isMP ? 1 : 2}
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
        {/*
         <div style={{ marginTop: -45, paddingLeft: 10 }}>
          <Button

            type="primary"
            onClick={async () => {
              history.back()
            }}
          >Return to previous page</Button>
        </div>

        */ }
      </PageContainer></RcResizeObserver>
  );
};

export default TableList;
