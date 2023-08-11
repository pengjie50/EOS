import RcResizeObserver from 'rc-resize-observer';
import { addReport, removeReport, report, updateReport, updateReportMenu } from './service';
import { PlusOutlined, SearchOutlined, FormOutlined, DeleteOutlined, ExclamationCircleOutlined, SwapOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { ReportList, ReportListItem } from './data.d';
import MPSort from "@/components/MPSort";
import { fieldSelectData } from '@/services/ant-design-pro/api';
import { useAccess, Access } from 'umi';
import moment from 'moment'
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
import { FormattedMessage, useIntl, formatMessage, history, useModel } from '@umijs/max';
import { Button, Drawer, Input, message, Modal, ConfigProvider, Empty, Popover, FloatButton, Pagination } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import { isPC } from "@/utils/utils";
import { ResizeObserverDo } from '@/components'
const { confirm } = Modal;
//MP
import { InfiniteScroll, List, NavBar, Space, DotLoading } from 'antd-mobile'
/**
 * @en-US Add node
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
 *
 * @param fields
 */
const handleUpdate = async (fields: Partial<ReportListItem>) => {
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
   *  */
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  /**
   * @en-US The pop-up window of the distribution update window
   * */
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [MPSorter, setMPSorter] = useState<any>({});

  const [updateMenuModalVisible, handleUpdateMenuModalVisible] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<ReportListItem>();
  const [selectedRowsState, setSelectedRows] = useState<ReportListItem[]>([]);
  const formRef = useRef<ProFormInstance>();
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [nameData, setNameData] = useState<any>({})
  const [template_nameData, setTemplate_nameData] = useState<any>({})


  /**
   * @en-US International configuration
   * */
  const intl = useIntl();
  const access = useAccess();
  const [resizeObj, setResizeObj] = useState({ searchSpan: 12, tableScrollHeight: 300 });
  //--MP start
  const MPSearchFormRef = useRef<ProFormInstance>();
  const [MPPagination, setMPPagination] = useState<any>({})
  const [showMPSearch, setShowMPSearch] = useState<boolean>(false);
  const [isMP, setIsMP] = useState<boolean>(!isPC());
  useEffect(() => {



    if (isMP) {

      getData(1)
    }
  }, [true]);
  const right = (
    <div style={{ fontSize: 24 }}>
      <Space style={{ '--gap': '16px' }}>
        <SearchOutlined onClick={e => { setShowMPSearch(!showMPSearch) }} />
        <PlusOutlined onClick={() => { handleModalOpen(true); }} />
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

  const [user_idData, setUser_idData] = useState<any>({})

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
    const append = await report({
      ...{
        "current": page,
        "pageSize": 3

      }, ...filter, sorter
    })



    setMPPagination({ total: append.total })
    setData(append.data)
  }

  //--MP end
  const columns: ProColumns<ReportListItem>[] = [




    {
      title: (
        <FormattedMessage
          id="pages.report.name"
          defaultMessage="Report Name"
        />
      ),
      sorter: true,
      dataIndex: 'name',
      valueEnum: nameData,
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
          fieldSelectData({ model: "Report", value: '', field: 'name' }).then((res) => {
            setNameData(res.data)
          })
        },
        onSearch: (newValue: string) => {

          fieldSelectData({ model: 'Report', value: newValue, field: 'name' }).then((res) => {
            setNameData(res.data)
          })

        }
      },
      search: {
        transform: (value) => {
          if (value && value.length > 0) {
            return {
              'name': {
                'field': 'name',
                'op': 'in',
                'data': value
              }
            }
          }

        }
      },
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
      defaultSortOrder: 'descend',
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

      fieldProps: { style: { width: '100%' }, placeholder: ['From', 'To'] },

      hideInTable: true,
      hideInDescriptions: true,
      dataIndex: 'created_at',
      valueType: 'dateRange',
      search: {
        transform: (value) => {
          if (value && value.length > 0) {
            value[0] = moment(new Date(value[0])).format('YYYY-MM-DD') + " 00:00:00"
            value[1] = moment(new Date(value[1])).format('YYYY-MM-DD') + " 23:59:59"

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
      title: 'Report Type',
      dataIndex: 'type',
      sorter: true,
      fieldProps: {
        multiple: true, mode: 'multiple', maxTagCount: 0,
        maxTagPlaceholder: (omittedValues) => {
          return omittedValues.length + " Selected"
        },
      },
      search: {
        transform: (value) => {

          if (value && value.length > 0) {
            return {

              status: {
                'field': 'type',
                'op': 'in',
                'data': value
              }

            }
          }

        }
      },
      valueEnum: currentUser?.role_type == "Super" ? {
        1: "Transaction Summary",
        2: "Transaction Details",
        3: "Alert Reports",
        4: "Super User Activity Log",
        5: "Login Log",
        6: "User Activity Log",
        7: "API Activity",
      
      } : {
        1: "Transaction Summary",
        2: "Transaction Details",
        3: "Alert Reports"

      },
    },
    {
      title: <FormattedMessage id="pages.report.xxx" defaultMessage="Template Used" />,
      dataIndex: 'template_name',
      sorter: true,
      valueEnum: template_nameData,
      fieldProps:
      {
        notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
        showSearch: true,
        mode: 'multiple',
        maxTagCount: 0,
        maxTagPlaceholder: (omittedValues) => {
          return omittedValues.length + " Selected"
        },
        allowClear: true,
        onFocus: () => {
          fieldSelectData({ model: "Report", value: '', field: 'template_name' }).then((res) => {
            setTemplate_nameData(res.data)
          })
        },
        onSearch: (newValue: string) => {

          fieldSelectData({ model: "Report", value: newValue, field: 'template_name' }).then((res) => {
            setTemplate_nameData(res.data)
          })

        }
      },
      search: {
        transform: (value) => {
          if (value && value.length > 0) {
            return {
              'template_name': {
                'field': 'template_name',
                'op': 'in',
                'data': value
              }
            }
          }

        }
      },

      valueType: 'text',
      render: (dom, entity) => {
        return (


          dom ? <a
            onClick={
              () => {

                var v = {}
                var report_type = entity.type
                var report_name = entity.name
                v = eval('(' + entity.value + ')');
                if (v) {
                  v.report_type = report_type + ""
                  v.useExisting = 'existing'

                  v.report_name = report_name


                }

                setCurrentRow(v);

                handleUpdateModalOpen(true);

              }}
          >{dom} </a > : 'N.A.'

        );
      },

    },
    {
      title: 'Generated By',
      dataIndex: 'username',
      valueEnum: user_idData,
      fieldProps:
      {
        notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
        showSearch: true,
        mode: 'multiple',
        maxTagCount: 0,
        maxTagPlaceholder: (omittedValues) => {
          return omittedValues.length + " Selected"
        },
        allowClear: true,
        onFocus: () => {
          fieldSelectData({ model: "Report", value: '', field: 'user_id' }).then((res) => {
            setUser_idData(res.data)
          })
        },
        onSearch: (newValue: string) => {

          fieldSelectData({ model: "Report", value: newValue, field: 'user_id' }).then((res) => {
            setUser_idData(res.data)
          })

        }
      },
      search: {
        transform: (value) => {
          if (value && value.length > 0) {
            return {
              'user_id': {
                'field': 'user_id',
                'op': 'in',
                'data': value
              }
            }
          }

        }
      },

      hideInTable: true,
      hideInDescriptions: true,
      render: (dom, entity) => {

        return dom?.split('@')[0] || '-'


      },
      valueType: 'text',
    },

    {
      title: 'Generated By',
      dataIndex: 'username',
      sorter: true,
      hideInSearch: true,
      render: (dom, entity) => {

        return dom?.split('@')[0] || '-'


      },
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      width: 80,
      valueType: 'option',
      render: (_, record) => [
      
        <Access accessible={access.canReportDel()} fallback={<div></div>}>
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

          </a></Access>


      ],
    }
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


    <PageContainer className="myPage" header={{
      title: isMP ? null : < FormattedMessage id="pages.report.xxx" defaultMessage="Report History" />,
      breadcrumb: {},
      extra: isMP ? null : [
        <Access accessible={access.canReportAdd() || access.canReportAddWithTemplate()} fallback={<div></div>}> <Button
          type="primary"
          key="primary"
          onClick={() => {

           
            handleModalOpen(true);
          }}
        >
          <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
        </Button></Access>,
      ]
    }}>
      {!isMP && (<ConfigProvider renderEmpty={customizeRenderEmpty}><RcResizeObserver
        key="resize-observer"
        onResize={(offset) => {
          ResizeObserverDo(offset, setResizeObj, resizeObj)



        }}
      ><ProTable<ReportListItem, API.PageParams>
          formRef={formRef}
          bordered
          actionRef={actionRef}
          scroll={{ x: columns.length * 150, y: resizeObj.tableScrollHeight }}
          pagination={{ size: "default" }}
          rowKey="id"
          search={{
            labelWidth: 18 * 12,
            layout: "vertical",
            span: resizeObj.searchSpan,
            searchText: < FormattedMessage id="pages.search" defaultMessage="Search" />
          }}
          options={false}
          className="mytable"
          request={(params, sorter) => report({ ...params, sorter })}
          columns={columns}

        /></RcResizeObserver></ConfigProvider >)}

      {isMP && (<>

        <NavBar backArrow={false} left={
          <MPSort columns={columns} onSort={(k) => {
            setMPSorter(k)
            getData(1)
          }} />} right={right} onBack={back}>
          {intl.formatMessage({
            id: 'pages.report.xxx',
            defaultMessage: 'Report History',
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
      <CreateForm
        onSubmit={async (value) => {
          
          if (true) {
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
     
        
    </PageContainer>
  );
};

export default TableList;
