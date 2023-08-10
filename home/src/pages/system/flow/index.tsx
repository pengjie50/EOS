import RcResizeObserver from 'rc-resize-observer';
import FrPrint from "../../../components/FrPrint";
import { addFlow, removeFlow, flow, updateFlow } from './service';
import { PlusOutlined, SearchOutlined, FormOutlined, DeleteOutlined, ExclamationCircleOutlined, EllipsisOutlined, FileExcelOutlined, PrinterOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FlowList, FlowListItem } from './data.d';
import { exportCSV } from "../../../components/export";
import { ResizeObserverDo } from '@/components'
import { Icon as Iconfy } from '@iconify/react';
import { fieldSelectData } from '@/services/ant-design-pro/api';
import MPSort from "@/components/MPSort";
import {
  FooterToolbar,
  ModalForm,
  DragSortTable,
  PageContainer,
  ProDescriptions,
  ProFormText,
  Search,
  ProFormInstance,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, formatMessage } from '@umijs/max';
import { Button, Drawer, Input, message, Modal, Popover, Pagination, Empty, FloatButton } from 'antd';
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
const handleAdd = async (fields: FlowListItem) => {
  const hide = message.loading(<FormattedMessage
    id="pages.adding"
    defaultMessage="Adding"
  />);
  try {
    await addFlow({ ...fields });
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
const handleUpdate = async (fields: Partial<FlowListItem>) => {
  const hide = message.loading(<FormattedMessage
    id="pages.modifying"
    defaultMessage="Modifying"
  />);
  try {
    await updateFlow({ ...fields });
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
const handleRemove = async (selectedRows: FlowListItem[], callBack: any) => {
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
        removeFlow({
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
  const [printModalVisible, handlePrintModalVisible] = useState<boolean>(false);
  const [paramsText, setParamsText] = useState<string>('');
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<FlowListItem>();
  const [selectedRowsState, setSelectedRows] = useState<FlowListItem[]>([]);
  const [resizeObj, setResizeObj] = useState({ searchSpan: 12, tableScrollHeight: 300 });
  /**
   * @en-US International configuration
   * */
  const intl = useIntl();
  //--MP start
  const MPSearchFormRef = useRef<ProFormInstance>();
  const [isLock, setIsLock] = useState<boolean>(true);
  const [showMPSearch, setShowMPSearch] = useState<boolean>(false);
  const [isMP, setIsMP] = useState<boolean>(!isPC());

  const [sortData, setSortData] = useState<any>({});
  const [codeData, setCodeData] = useState<any>({});

  const [moreOpen, setMoreOpen] = useState<boolean>(false);
  const right = (
    <div style={{ fontSize: 24 }}>
      <Space style={{ '--gap': '16px' }}>
        <SearchOutlined onClick={e => { setShowMPSearch(!showMPSearch) }} />
        <Popover onOpenChange={(v) => { setMoreOpen(v) }} open={moreOpen} placement="bottom" title={""} content={<div>


          <Button type="primary" style={{ width: "100%" }} key="print"
            onClick={() => {
              setMoreOpen(false)
              handlePrintModalVisible(true)
            }}
          ><PrinterOutlined /> <FormattedMessage id="pages.Print" defaultMessage="Print" />
          </Button>, <Button style={{ width: "100%" }} type="primary" key="out"
            onClick={() => exportCSV(data, columns)}
          ><FileExcelOutlined /> <FormattedMessage id="pages.CSV" defaultMessage="CSV" />
          </Button>

        </div>} trigger="click">
          <EllipsisOutlined />


        </Popover>


        {isLock ? <Iconfy onClick={() => {
          setIsLock(!isLock)
        }} className="white-icon" icon="bxs:lock" /> : <Iconfy onClick={() => {
          setIsLock(!isLock)
        }} className="white-icon" icon="bytesize:unlock" />}
        {/*<PlusOutlined onClick={() => { handleModalOpen(true) }} /> */}
      </Space>
    </div>
  )
  useEffect(() => {


    if (isMP) {
      getData(1)
    }

  }, [true]);
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
  const [MPSorter, setMPSorter] = useState<any>({});
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
    const append = await flow({
      ...{
        "current": page,
        "pageSize": 3

      }, ...filter, sorter: { sort: "ascend" }
    })

    tree(append.data, "                                    ", 'pid')

    setMPPagination({ total: append.total })
    setData(append.data)

  }

  //--MP end
  const columns: ProColumns<FlowListItem>[] = [

    {
      title: <FormattedMessage id="pages.flow.xxx" defaultMessage="No." />,
      dataIndex: 'no',
      hideInSearch: true,

      valueType: 'text',
    },
    {
      title: (
        <FormattedMessage
          id="pages.flow.xxx"
          defaultMessage="Transaction Flow"
        />
      ),
      dataIndex: 'name',

      width: 400,

    },
    {
      title: <FormattedMessage id="pages.flow.xxx" defaultMessage="Code" />,
      dataIndex: 'code',


      valueEnum: codeData,
      search: {
        transform: (value) => {

          if (value !== null && value.length > 0) {
            return {

              code: {
                'field': 'code',
                'op': 'in',
                'data': value
              }

            }
          }

        }
      },
      fieldProps: {
        multiple: true,
        mode: 'multiple',
        maxTagCount: 0,
        maxTagPlaceholder: (omittedValues) => {
          return omittedValues.length + " Selected"
        },
        notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
        showSearch: true,
        allowClear: true,
        onFocus: () => {
          fieldSelectData({ model: "Flow", value: '', field: 'code' }).then((res) => {
            setCodeData(res.data)
          })
        },
        onSearch: (newValue: string) => {

          fieldSelectData({ model: "Flow", value: newValue, field: 'code' }).then((res) => {
            setCodeData(res.data)
          })

        }
      },
    },
    {
      title: <FormattedMessage id="pages.flow.type" defaultMessage="Type" />,
      dataIndex: 'type',

      valueEnum: {
        0: { text: <FormattedMessage id="pages.flow.process" defaultMessage="Process" />, status: 'Success' },
        1: { text: <FormattedMessage id="pages.flow.event" defaultMessage="Event" />, status: 'Error' },
      },
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.flow.xxx" defaultMessage="Sort Order" />,
      dataIndex: 'sort',
      valueEnum: sortData,
      search: {
        transform: (value) => {

          if (value !== null && value.length > 0) {
            return {

              sort: {
                'field': 'sort',
                'op': 'in',
                'data': value
              }

            }
          }

        }
      },
      fieldProps: {
        multiple: true,
        mode: 'multiple',
        maxTagCount: 0,
        maxTagPlaceholder: (omittedValues) => {
          return omittedValues.length + " Selected"
        },
        notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
        showSearch: true,
        allowClear: true,
        onFocus: () => {
          fieldSelectData({ model: "Flow", value: '', field: 'sort' }).then((res) => {
            setSortData(res.data)
          })
        },
        onSearch: (newValue: string) => {

          fieldSelectData({ model: "Flow", value: newValue, field: 'sort' }).then((res) => {
            setSortData(res.data)
          })

        }
      }



    },

    {
      title: <FormattedMessage id="pages.flow.xxx" defaultMessage="Description" />,
      dataIndex: 'description',
      valueType: 'textarea'

    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="config"

          onClick={() => {
            if (isLock) {
              return
            }
            handleUpdateModalOpen(true);
            setCurrentRow(record);
          }}
        >
          <FormOutlined style={{ fontSize: '20px', color: isLock ? "#999" : '#5000B9' }} />
        </a>/*,

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

        </a>*/

      ],
    },
  ];

  return (
    <RcResizeObserver
      key="resize-observer"
      onResize={(offset) => {
        ResizeObserverDo(offset, setResizeObj, resizeObj)



      }}
    >
      <PageContainer className="myPage" header={{
        title: isMP ? null : <div>

          <div className="ant-page-header-heading-title">< FormattedMessage id="pages.flow.xxx" defaultMessage="Transaction Flow" /></div>
          <div style={{ color: 'red' }}>Caution: Do not update this page unless necessary as it may impact system logic</div>
        </div>,
        breadcrumb: {},
        extra: isMP ? null : [

          <Button
            type="default"
            key="primary"
            onClick={() => {
              setIsLock(!isLock)
            }}
          >

            {isLock ? <Iconfy onClick={() => {
              setIsLock(!isLock)
            }} className="white-icon" icon="bxs:lock" /> : <Iconfy onClick={() => {
              setIsLock(!isLock)
            }} className="white-icon" icon="bytesize:unlock" />}

          </Button>,
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleModalOpen(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.xxx" defaultMessage="Create New Transaction Flow" />
          </Button>, <Button type="primary" key="print"
            onClick={() => {
              if (selectedRowsState.length == 0) {
                message.error(<FormattedMessage
                  id="pages.selectDataFirst"
                  defaultMessage="Please select data first!"
                />);
                return false;
              }
              handlePrintModalVisible(true)
            }}
          ><PrinterOutlined /> <FormattedMessage id="pages.Print" defaultMessage="Print" />
          </Button>, <Button type="primary" key="out"
            onClick={() => exportCSV(selectedRowsState, columns, "Transaction Flow")}
          ><FileExcelOutlined /> <FormattedMessage id="pages.CSV" defaultMessage="CSV" />
          </Button>

        ]
      }}>
        {!isMP && (<ProTable<FlowListItem, API.PageParams>



          dragSortKey="no"
          onDragSortEnd={(a) => {

          }}
          dragSortHandlerRender={(rowData: any, idx: any) => (
            <div style={{ cursor: 'grab' }} >

              {rowData.no}
            </div>
          )}

          pagination={{ size: "default", pageSize: 500 }}
          actionRef={actionRef}

          rowKey="id"
          scroll={{ x: 1800, y: resizeObj.tableScrollHeight }}
          search={{
            labelWidth: 150,
            searchText: < FormattedMessage id="pages.search" defaultMessage="Search" />
          }}
          options={false}
          className="mytable"
          request={async (params, sorter) => {
            var all = await flow({ sorter: { sort: "ascend" } })
            tree(all.data, "                                    ", 'pid')

            


            var d = await flow({ ...params, sorter: { sort: "ascend" } })
            var old = d.data
            d.data = tree(d.data, "                                    ", 'pid')

            if (d.data.length == 0) {
              d.data = all.data.filter((a) => {
                return old.some((b) => {
                  return b.id == a.id
                })
              })
            }

            return d
          }}
          bordered
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
              id: 'pages.flow.xxx',
              defaultMessage: 'Transaction Flow',
            })}
          </NavBar>

          <div style={{ padding: '20px', backgroundColor: "#5000B9", display: showMPSearch ? 'block' : 'none' }}>
            <Search columns={columns.filter(a => !(a.hasOwnProperty('hideInSearch') && a['hideInSearch']))} action={actionRef} loading={false}

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
            <div style={{ padding: 10, color: 'red' }}>Caution: Do not update this page unless necessary as it may impact system logic</div>
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
          {MPPagination.total && <div style={{ textAlign: 'center', padding: "20px 10px 90px 10px" }}>
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
          </div>}
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
            const success = await handleAdd(value as FlowListItem);
            if (success) {
             
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
          values={currentRow || {}}
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
            <ProDescriptions<FlowListItem>
              column={isMP ? 1 : 2}
              title={currentRow?.name}
              request={async () => ({
                data: currentRow || {},
              })}
              params={{
                id: currentRow?.name,
              }}
              columns={columns as ProDescriptionsItemProps<FlowListItem>[]}
            />
          )}
        </Drawer>
        <FrPrint
          title={""}
          subTitle={paramsText}
          columns={columns}
          dataSource={[...(isMP ? data : selectedRowsState)]}
          onCancel={() => {
            handlePrintModalVisible(false);
          }}
          printModalVisible={printModalVisible}
        />
       
      </PageContainer></RcResizeObserver>
  );
};

export default TableList;
