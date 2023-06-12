import RcResizeObserver from 'rc-resize-observer';
import { addReport, removeReport, report, updateReport, updateReportMenu } from './service';
import { PlusOutlined, SearchOutlined, FormOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { ReportList, ReportListItem } from './data.d';

import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  Search,
  ProFormInstance,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, formatMessage, history } from '@umijs/max';
import { Button, Drawer, Input, message, Modal, ConfigProvider, Empty } from 'antd';
import React, { useRef, useState } from 'react';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import { isPC } from "@/utils/utils";
const { confirm } = Modal;
//MP
import { InfiniteScroll, List, NavBar, Space, DotLoading } from 'antd-mobile'
/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */


const handleAdd = async (fields: ReportListItem) => {
  const hide = message.loading(<FormattedMessage
    id="pages.adding"
    defaultMessage="Adding"
  />);
  try {
    await addReport({ ...fields });
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
const handleUpdate = async (fields: Partial<ReportListItem> ) => {
  const hide = message.loading(<FormattedMessage
    id="pages.modifying"
    defaultMessage="Modifying"
  />);
 
  try {
    await updateReport({
      ...fields
    }
    );
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
const handleRemove = async (selectedRows: ReportListItem[], callBack: any) => {
  if (!selectedRows) return true;
  var open = true
  confirm({
    title: 'Delete Report?',
    open: open,
    icon: <ExclamationCircleOutlined />,
    content: 'Please note that the deleted Report cannot be restored!',
    onOk() {


      const hide = message.loading(<FormattedMessage
        id="pages.deleting"
        defaultMessage="Deleting"
      />);
      try {
        removeReport({
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


  const [updateMenuModalVisible, handleUpdateMenuModalVisible] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<ReportListItem>();
  const [selectedRowsState, setSelectedRows] = useState<ReportListItem[]>([]);
  const formRef = useRef<ProFormInstance>();
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const [resizeObj, setResizeObj] = useState({ searchSpan: 12, tableScrollHeight: 300 });
  //--MP start
  const MPSearchFormRef = useRef<ProFormInstance>();

  const [showMPSearch, setShowMPSearch] = useState<boolean>(false);
  const [isMP, setIsMP] = useState<boolean>(!isPC());

  const right = (
    <div style={{ fontSize: 24 }}>
      <Space style={{ '--gap': '16px' }}>
        <SearchOutlined onClick={e => { setShowMPSearch(!showMPSearch) }} />
        <PlusOutlined onClick={() => { history.push(`/Report/add`); }} />
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
    const append = await report({
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
  const columns: ProColumns<ReportListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.report.name"
          defaultMessage="Report name"
        />
      ),
      sorter: true,
      dataIndex: 'name',
     
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);

              history.push(`/Report/ReportSummary`, entity);
             
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: (
        <FormattedMessage
          id="pages.report.addTime"
          defaultMessage="Report Generated Date"
        />
      ),
      sorter: true,
      hideInSearch: true,
      dataIndex: 'created_at',
      valueType: 'dateTime'

    },
    {
      title: (
        <FormattedMessage
          id="pages.report.addTime"
          defaultMessage="Report Generated Date"
        />
      ),
      sorter: true,
      fieldProps: {placeholder: ['From', 'To'] },
      hideInForm: true,
      hideInTable: true,
      defaultSortOrder: 'descend',
      dataIndex: 'created_at',
      valueType: 'dateRange',
      search: {
        transform: (value) => {
          if (value.length > 0) {
            return {
              'created_at': {
                'field': 'created_at',
                'op': 'between',
                'data': value
              }
            }
          }

        }
      }



    },
    {
      title: <FormattedMessage id="pages.report.xxx" defaultMessage="Template  Name" />,
      dataIndex: 'template_name',
      valueType: 'text',
      render: (dom, entity) => {
        return (
          
          
            dom?<a
            onClick = {
              () => {
                setCurrentRow(entity);

                history.push(`/Report/Detail`, entity);

          }}
          >{dom} </a > : 'N.A.'
         
        );
      },
   
    },
    /*{
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
          <FormOutlined style={{ fontSize: '20px' }} />
        </a>,
        
          <a
            title={formatMessage({ id: "pages.delete", defaultMessage: "Delete" })}
            key="config"
            onClick={() => {
              setCurrentRow(record);
              handleRemove([record], (success) => {
                if (success) {
                  if (isMP) {
                    setData([]);
                    getData(1, MPfilter)
                  }
                  actionRef.current?.reloadAndRest?.();
                }
              });


            }}
          >
            <DeleteOutlined style={{ fontSize: '20px', color: 'red' }} />

          </a>
       
       
      ],
    },*/
  ];
  const customizeRenderEmpty = () => {
    var o = formRef.current?.getFieldsValue()
    var isSearch = false
    for (var a in o) {
      if (o[a]) {
        isSearch = true
      }

    }
    if (isSearch) {
      return <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />
    } else {
      return <Empty />
    }


  }
  return (

  
    <PageContainer header={{
      title: isMP ? null : < FormattedMessage id="pages.report.title" defaultMessage="Report" />,
      breadcrumb: {},
      extra: isMP ? null : [
        <Button
          type="primary"
          key="primary"
          onClick={() => {

            history.push(`/Report/add`);
           // handleModalOpen(true);
          }}
        >
          <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
        </Button>,
      ]
    }}>
      {!isMP && (<ConfigProvider renderEmpty={customizeRenderEmpty}><RcResizeObserver
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
      ><ProTable<ReportListItem, API.PageParams>
          formRef={formRef}
          bordered
          actionRef={actionRef}
          scroll={{ x: columns.length*150, y: resizeObj.tableScrollHeight }}
        
        rowKey="id"
        search={{
          labelWidth: 18 * 12,
          span: resizeObj.searchSpan,
          searchText: < FormattedMessage id="pages.search" defaultMessage="Search" />
        }}
        options={false}
        className="mytable"
        request={(params, sorter) => report({ ...params, sorter })}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
        /></RcResizeObserver></ConfigProvider >)}

      {isMP && (<>

        <NavBar backArrow={false} right={right} onBack={back}>
          {intl.formatMessage({
            id: 'pages.report.title',
            defaultMessage: 'Report',
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
              await handleRemove(selectedRowsState, (success) => {
                if (success) {
                  setSelectedRows([]);
                  if (isMP) {
                    setData([]);
                    getData(1, MPfilter)
                  }
                  actionRef.current?.reloadAndRest?.();
                }

              });
            }}
          >
            <FormattedMessage
              id="pages.searchTable.batchDeletion"
              defaultMessage="Batch deletion"
            />
          </Button>
          
        </FooterToolbar>
      )}
     
      <UpdateForm
        onSubmit={async (value) => {
          value.id = currentRow?.id
          const success = await handleUpdate(value);
          if (success) {
            handleUpdateModalOpen(false);
            setCurrentRow(undefined);
            if (isMP) {
              setData([]);
              getData(1, MPfilter)
            }
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
        width={isMP ? '100%' : 600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={isMP ? true : false}
      >
        {currentRow?.name && (
          <ProDescriptions<ReportListItem>
            column={isMP ? 1 : 2}
           
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<ReportListItem>[]}
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
      </PageContainer> 
  );
};

export default TableList;
