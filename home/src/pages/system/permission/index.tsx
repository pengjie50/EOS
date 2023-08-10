import RcResizeObserver from 'rc-resize-observer';
import MPSort from "@/components/MPSort";
import { addPermission, removePermission, permission, updatePermission } from './service';
import { PlusOutlined, SearchOutlined, FormOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { PermissionList, PermissionListItem } from './data.d';
import { ResizeObserverDo } from '@/components'
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
import { FormattedMessage, useIntl, formatMessage } from '@umijs/max';
import { Button, Drawer, Input, message, Modal, Pagination, FloatButton, Empty, ConfigProvider } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import { tree } from "@/utils/utils";
import { isPC } from "@/utils/utils";
const { confirm } = Modal;
//MP
import { InfiniteScroll, List, NavBar, Space, DotLoading } from 'antd-mobile'
/**
 * @en-US Add node
 * @param fields
 */
const handleAdd = async (fields: PermissionListItem) => {
  const hide = message.loading(<FormattedMessage
    id="pages.adding"
    defaultMessage="Adding"
  />);
  try {
    await addPermission({ ...fields });
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
 *
 * @param fields
 */
const handleUpdate = async (fields: Partial<PermissionListItem>) => {


  const hide = message.loading(<FormattedMessage
    id="pages.modifying"
    defaultMessage="Modifying"
  />);
  try {
    fields.pid = fields.pid || null
    await updatePermission({ ...fields });
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
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: PermissionListItem[], callBack: any) => {
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
        removePermission({
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
   *  */
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  /**
   * @en-US The pop-up window of the distribution update window
   * */
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<PermissionListItem>();
  const [selectedRowsState, setSelectedRows] = useState<PermissionListItem[]>([]);
  const [resizeObj, setResizeObj] = useState({ searchSpan: 12, tableScrollHeight: 300 });
  /**
   * @en-US International configuration
   * */
  const intl = useIntl();
  //--MP start
  const MPSearchFormRef = useRef<ProFormInstance>();

  const [showMPSearch, setShowMPSearch] = useState<boolean>(false);
  const [isMP, setIsMP] = useState<boolean>(!isPC());
  const [MPSorter, setMPSorter] = useState<any>({});


  useEffect(() => {


    if (isMP) {
      getData(1)
    }
  }, [true])
  const right = (
    <div style={{ fontSize: 24 }}>
      <Space style={{ '--gap': '16px' }}>
        <SearchOutlined onClick={e => { setShowMPSearch(!showMPSearch) }} />
        {/* <PlusOutlined onClick={() => { handleModalOpen(true) }} />*/}
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
  const [MPPagination, setMPPagination] = useState<any>({})
  async function getData(page, filter__) {
    var sorter = {}
    await setMPSorter((sorter_) => {
      sorter = sorter_
      return sorter_
    })
    var filter = {}
    await setMPfilter((filter_) => {
      filter = filter_
      return filter_
    })
    const append = await permission({
      ...{
        "current": page,
        "pageSize": 3

      }, ...filter, sorter: { sort: "ascend" }

    })


    setMPPagination({ total: append.total })
    setData(append.data)
  }

  //--MP end
  const columns: ProColumns<PermissionListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.permission.name"
          defaultMessage="Permission name"
        />
      ),
      sorter: true,


      dataIndex: 'name',

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
    /*{
      title: <FormattedMessage id="pages.permission.xxx" defaultMessage="Permission Key" />,
      dataIndex: 'permission_key',
      valueType: 'textarea',
    },*/
    {
      title: <FormattedMessage id="pages.permission.description" defaultMessage="Description" />,
      dataIndex: 'description',
      valueType: 'textarea',
    },
    /*{
      title: <FormattedMessage id="pages.flow.xxx" defaultMessage="Sort Order" />,
      dataIndex: 'sort',
      
      hideInSearch: true,
      defaultSortOrder: 'ascend',
      sorter: true,
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      width:100,
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

        </a>,
       
      ],
    },*/
  ];
  const formRef = useRef<ProFormInstance>();
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
    <RcResizeObserver
      key="resize-observer"
      onResize={(offset) => {
        ResizeObserverDo(offset, setResizeObj, resizeObj)



      }}
    >
      <PageContainer className="myPage" header={{
        title: isMP ? null : < FormattedMessage id="pages.permission.title" defaultMessage="Permission" />,
        breadcrumb: {},
        /*extra: isMP ? null : [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleModalOpen(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
          </Button>,
        ]*/
      }}>
        {!isMP && (<ConfigProvider renderEmpty={customizeRenderEmpty}><ProTable<PermissionListItem, API.PageParams>
          pagination={{ size: "default", pageSize: 500 }}
          actionRef={actionRef}
          rowKey="id"
          formRef={formRef}
          scroll={{ y: resizeObj.tableScrollHeight }}
          search={{
            labelWidth: 220,
            span: resizeObj.searchSpan,
            searchText: < FormattedMessage id="pages.search" defaultMessage="Search" />
          }}
          className="mytable"
          indentSize={0}
          options={false}
          request={async (params, sorter) => {
            var d = await permission({ ...params, sorter: { sort: "ascend" } })
            d.data = tree(d.data, null, 'pid')
            return d
          }}
          columns={columns}
          bordered
          rowSelection={{
            onChange: (_, selectedRows) => {
              setSelectedRows(selectedRows);
            },
          }}
        /></ConfigProvider>)}

        {isMP && (<>

          <NavBar backArrow={false} left={
            <MPSort columns={columns} onSort={(k) => {
              setMPSorter(k)
              getData(1)
            }} />} right={right} onBack={back}>
            {intl.formatMessage({
              id: 'pages.permission.title',
              defaultMessage: 'Permission',
            })}
          </NavBar>

          <div style={{ padding: '20px', backgroundColor: "#5000B9", display: showMPSearch ? 'block' : 'none' }}>
            <Search columns={columns.filter(a => !(a.hasOwnProperty('hideInSearch') && a['hideInSearch']))} action={actionRef} loading={false}

              onFormSearchSubmit={onFormSearchSubmit}

              dateFormatter={'string'}
              formRef={formRef}
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
                  className="jetty-descriptions"
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
          {MPPagination.total > 0 ? <div style={{ textAlign: 'center', padding: "20px 10px 90px 10px" }}>
            <Pagination

              onChange={(page, pageSize) => {

                getData(page)
              }}
              total={MPPagination.total}
              simple
              showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
              defaultPageSize={3}
              defaultCurrent={1}
            />
          </div> : customizeRenderEmpty()}
          <FloatButton.BackTop visibilityHeight={0} />
        </>)}
        {selectedRowsState?.length > 0 && (
          <FooterToolbar
            extra={
              <div>
                <FormattedMessage id="pages.searchTable.chosen" defaultMessage="Chosen" />{' '}
                <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
                <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
                &nbsp;&nbsp;
                s
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

        <CreateForm
          onSubmit={async (value) => {
            value.id = currentRow?.id
            const success = await handleAdd(value as PermissionListItem);
            if (success) {
              handleModalOpen(false);
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
            handleModalOpen(false);
            if (!showDetail) {
              setCurrentRow(undefined);
            }
          }}
          createModalOpen={createModalOpen}

        />
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
            <ProDescriptions<PermissionListItem>
              column={isMP ? 1 : 2}
              title={currentRow?.name}
              request={async () => ({
                data: currentRow || {},
              })}
              params={{
                id: currentRow?.name,
              }}
              columns={columns as ProDescriptionsItemProps<PermissionListItem>[]}
            />
          )}
        </Drawer>
       
      </PageContainer></RcResizeObserver>
  );
};

export default TableList;
