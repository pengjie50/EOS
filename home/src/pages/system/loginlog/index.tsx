import RcResizeObserver from 'rc-resize-observer';
import { ResizeObserverDo } from '@/components'
import { fieldSelectData } from '@/services/ant-design-pro/api';
import { addLoginlog, removeLoginlog, loginlog, updateLoginlog } from './service';
import FrPrint from "../../../components/FrPrint";
import { exportCSV } from "../../../components/export";
import FileSaver from "file-saver";
import { user } from '../user/service';
import { company } from '../company/service';
import MPSort from "@/components/MPSort";
import { PlusOutlined, SearchOutlined, FormOutlined, DeleteOutlined, ExclamationCircleOutlined, PrinterOutlined, FileExcelOutlined, EllipsisOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { LoginlogList, LoginlogListItem } from './data.d';
import moment from 'moment'
const Json2csvParser = require("json2csv").Parser;
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
import { Button, Drawer, Input, message, Modal, Popover, Empty, Pagination, FloatButton, ConfigProvider } from 'antd';
import React, { useRef, useState, useEffect } from 'react';

const { confirm } = Modal;
//MP
import { InfiniteScroll, List, NavBar, Space, DotLoading } from 'antd-mobile'
import { isPC } from "@/utils/utils";
/**
 *  Delete node
 *
 * @param selectedRows
 */

const getTimeStr = (time) => {
  if (time > 0) {
    return (time ? parseInt((time / 3600) + "") : 0) + "h " + (time ? parseInt((time % 3600) / 60) : 0) + "m"
  } else {
    return "-"
  }

}
const handleRemove = async (selectedRows: LoginlogListItem[], callBack: any) => {
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
        removeLoginlog({
          id: selectedRows.map((row) => row.id),
        });
        hide();
        message.success(<FormattedMessage
          id="pages.deletedSuccessfully"
          defaultMessage="Deleted successfully and will refresh soon"
        />);
        open = false
        callBack(true)

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

export var columnsBase: ProColumns<LoginlogListItem>[] = [
  {
    title: (
      <FormattedMessage
        id="pages.user.xxx"
        defaultMessage="Login Username"
      />
    ),
    dataIndex: 'username',
    sorter: true,
    search: {
      transform: (value) => {

        if (value !== null) {
          return {

            status: {
              'field': 'user_id',
              'op': 'in',
              'data': value
            }

          }
        }

      }
    },
    render: (dom, entity) => {
      return dom
      
    },
  },



  {
    title: <FormattedMessage id="pages.loginlog.xxx" defaultMessage="Organisation" />,
    dataIndex: 'company_name',
    sorter: true,
   
    fieldProps: {
      multiple: true, mode: 'multiple', maxTagCount: 0,
      maxTagPlaceholder: (omittedValues) => {
        return omittedValues.length + " Selected"
      }, showSearch: true
    },

    search: {
      transform: (value) => {

        if (value !== null) {
          return {

            status: {
              'field': 'company_id',
              'op': 'in',
              'data': value
            }

          }
        }

      }
    },
    valueType: 'text',

  },

  {
    title: (
      <FormattedMessage
        id="pages.loginlog.xxx"
        defaultMessage="Login Date and Time"
      />
    ),
    sorter: true,
    defaultSortOrder: 'descend',
    width: 200,
    dataIndex: 'login_time',
    render: (dom, entity) => {

      return moment(new Date(dom)).format('DD MMM YYYY HH:mm:ss')

    },
    hideInSearch: true

  },
  {
    title: <FormattedMessage id="pages.loginlog.xxx" defaultMessage="Active Duration" />,
    dataIndex: 'active_duration',
    hideInSearch: true,
    sorter: true,

    valueType: 'text',
    render: (dom) => {
      return getTimeStr(dom)
    }

  },

  {
    title: "Active Duration (in seconds)",
    dataIndex: 'active_duration',
    hideInDescriptions: true,
    hideInTable: true,
    fieldProps: {
      placeholder: ['From', 'To']
    },
    valueType: "digitRange",
    width: 200,
    sorter: true,
    render: (dom, entity) => {


      return parseInt((entity.active_duration / 3600) + "") + "h " + parseInt((entity.active_duration % 3600) / 60) + "m"





    },
    search: {
      transform: (value) => {
        if (value && value.length > 0) {
          var a = value[0] || 0
          var b = value[1] || 1000000000
          return {
            'active_duration': {
              'field': 'active_duration',
              'op': 'between',
              'data': [a, b]
            }


          }
        }

      }
    }
  },

  {
    title: (
      <FormattedMessage
        id="pages.loginlog.xxx"
        defaultMessage="Logout Date and Time"
      />
    ),
    width: 200,
    sorter: true,
    dataIndex: 'logout_time',
    valueType: 'dateTime',
    hideInSearch: true

  },

  {
    title: <FormattedMessage id="pages.loginlog.xxx" defaultMessage="No Of Invalid Attempts" />,
    dataIndex: 'invalid_attempts',
    sorter: true,
    hideInSearch: true,
    valueType: 'text',
  },
  {
    title: "No Of Invalid Attempts",
    dataIndex: 'invalid_attempts',
    hideInDescriptions: true,
    hideInTable: true,
    fieldProps: {
      placeholder: ['From', 'To']
    },
    valueType: "digitRange",
    width: 200,
    sorter: true,

    search: {
      transform: (value) => {
        if (value && value.length > 0) {
          var a = value[0] || 0
          var b = value[1] || 1000000000
          return {
            'invalid_attempts': {
              'field': 'invalid_attempts',
              'op': 'between',
              'data': [a, b]
            }


          }
        }

      }
    }
  },

  {
    title: <FormattedMessage id="pages.operlog.url" defaultMessage="url" />,
    dataIndex: 'url',
    sorter: true,
    valueType: 'text',
    search: {
      transform: (value) => {
        if (value.length > 0) {

          return {
            'url': {
              'field': 'url',
              'op': 'in',
              'data': value
            }
          }
        }

      }
    },
  },
  {
    title: <FormattedMessage id="pages.operlog.ip" defaultMessage="Ip" />,
    dataIndex: 'ip',
    sorter: true,
    search: {
      transform: (value) => {
        if (value.length > 0) {

          return {
            'ip': {
              'field': 'ip',
              'op': 'in',
              'data': value
            }
          }
        }

      }
    },
    valueType: 'text',
  },

  {
    title: <FormattedMessage id="pages.loginlog.xxx" defaultMessage="Device Type" />,
    dataIndex: 'device_type',
    sorter: true,
    valueType: 'text',
    fieldProps: {
      multiple: true, mode: 'multiple', maxTagCount: 0,
      maxTagPlaceholder: (omittedValues) => {
        return omittedValues.length + " Selected"
      },
    },
    search: {
      transform: (value) => {
        if (value.length > 0) {

          return {
            'device_type': {
              'field': 'device_type',
              'op': 'in',
              'data': value
            }
          }
        }

      }
    },
    valueEnum: {
      "PC": "PC",
      "Laptop": "Laptop",
      "Mobile": "Mobile"

    }
  },
  {
    title: <FormattedMessage id="pages.operlog.xxx" defaultMessage="Parameter" />,
    dataIndex: 'param',
    sorter: true,
    ellipsis: !isPC() ? false : true,
    valueType: 'text',
  },


  {
    title: <FormattedMessage id="pages.loginlog.status" defaultMessage="Status" />,
    dataIndex: 'status',
    sorter: true,
    search: {
      transform: (value) => {

        if (value !== null) {
          return {

            status: {
              'field': 'status',
              'op': 'in',
              'data': value
            }

          }
        }

      }
    },
    fieldProps: {
      multiple: true, mode: 'multiple', maxTagCount: 0,
      maxTagPlaceholder: (omittedValues) => {
        return omittedValues.length + " Selected"
      },
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
        id="pages.loginlog.xxx"
        defaultMessage="Logout Date and Time"
      />
    ),

    hideInTable: true,
    fieldProps: { style: { width: '100%' } },

    dataIndex: 'logout_time',
    valueType: 'dateRange',
    search: {
      transform: (value) => {
        if (value && value.length > 0) {
          value[0] = moment(new Date(value[0])).format('YYYY-MM-DD') + " 00:00:00"
          value[1] = moment(new Date(value[1])).format('YYYY-MM-DD') + " 23:59:59"
          return {
            'logout_time': {
              'field': 'logout_time',
              'op': 'between',
              'data': value
            }
          }
        }

      }
    }



  },
  {
    title: (
      <FormattedMessage
        id="pages.loginlog.xxx"
        defaultMessage="Login Date and Time"
      />
    ),

    hideInTable: true,
    fieldProps: { style: { width: '100%' } },

    dataIndex: 'login_time',
    valueType: 'dateRange',
    search: {
      transform: (value) => {
        if (value && value.length > 0) {
          value[0] = moment(new Date(value[0])).format('YYYY-MM-DD') + " 00:00:00"
          value[1] = moment(new Date(value[1])).format('YYYY-MM-DD') + " 23:59:59"
          return {
            'login_time': {
              'field': 'login_time',
              'op': 'between',
              'data': value
            }
          }
        }

      }
    }



  },

];


const TableList: React.FC = () => {
  /**
   * @en-US Pop-up window of new window
   *  */
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  /**
   * @en-US The pop-up window of the distribution update window
   * */
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);
  const [printModalVisible, handlePrintModalVisible] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [organizationList, setOrganizationList] = useState<any>({});

  const [moreOpen, setMoreOpen] = useState<boolean>(false);
  const [paramsText, setParamsText] = useState<string>('');
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<LoginlogListItem>();
  const [selectedRowsState, setSelectedRows] = useState<LoginlogListItem[]>([]);
  const [resizeObj, setResizeObj] = useState({ searchSpan: 12, tableScrollHeight: 300 });


  const [urlData, setUrlData] = useState<any>({});
  const [ipData, setIpData] = useState<any>({});
  const [userList, setUserList] = useState<any>({});

  const [MPSorter, setMPSorter] = useState<any>({});


  var columns: ProColumns<LoginlogListItem>[] = columnsBase.map((a) => {


    var b = { ...a }


    if (b.dataIndex == "company_name") {

      b.valueEnum = organizationList
    }

    if (b.dataIndex == "url") {
      b.valueEnum = urlData
      b.fieldProps = {
        notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
        showSearch: true,
        allowClear: true,
        multiple: true,
        mode: 'multiple',
        maxTagCount: 0,
        maxTagPlaceholder: (omittedValues) => {
          return omittedValues.length + " Selected"
        },
        onFocus: () => {
          fieldSelectData({ model: "Loginlog", value: '', field: 'url' }).then((res) => {

            setUrlData(res.data)
          })
        },
        onSearch: (newValue: string) => {

          fieldSelectData({ model: "Loginlog", value: newValue, field: 'url' }).then((res) => {

            setUrlData(res.data)
          })

        }
      }
    }

    if (b.dataIndex == "ip") {
      b.valueEnum = ipData
      b.fieldProps = {
        notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
        showSearch: true,
        allowClear: true,
        multiple: true,
        mode: 'multiple',
        maxTagCount: 0,
        maxTagPlaceholder: (omittedValues) => {
          return omittedValues.length + " Selected"
        },
        onFocus: () => {
          fieldSelectData({ model: "Loginlog", value: '', field: 'ip' }).then((res) => {

            setIpData(res.data)
          })
        },
        onSearch: (newValue: string) => {

          fieldSelectData({ model: "Loginlog", value: newValue, field: 'ip' }).then((res) => {

            setIpData(res.data)
          })

        }
      }
    }

    if (b.dataIndex == "username") {
      b.valueEnum = userList
      b.fieldProps = {
        dropdownMatchSelectWidth: isMP ? true : false,
        notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
        showSearch: true,
        allowClear: true,
        multiple: true,
        mode: 'multiple',
        maxTagCount: 0,
        maxTagPlaceholder: (omittedValues) => {
          return omittedValues.length + " Selected"
        },


      }
    }
    return b






  })

  /**
   * @en-US International configuration
   * */
  const intl = useIntl();


  //--MP start
  const MPSearchFormRef = useRef<ProFormInstance>();

  const [showMPSearch, setShowMPSearch] = useState<boolean>(false);
  const [isMP, setIsMP] = useState<boolean>(!isPC());


  useEffect(() => {

    user({ sorter: { username: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.username
      })
      setUserList(b)

    });


    company({ sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setOrganizationList(b)

    });
    if (isMP) {
      getData(1)
    }


  }, [true]);








  const right = (
    <div style={{ fontSize: 24 }}>
      <Space style={{ '--gap': '16px' }}>
        <SearchOutlined onClick={e => { setShowMPSearch(!showMPSearch) }} />
        <Popover onOpenChange={(v) => { setMoreOpen(v) }} open={moreOpen} placement="bottom" title={""} content={<div><Button type="primary" style={{ width: "100%" }} key="print"
          onClick={() => {
            setMoreOpen(false)
            handlePrintModalVisible(true)
          }}
        ><PrinterOutlined /> <FormattedMessage id="pages.Print" defaultMessage="Print" />
        </Button> <Button style={{ width: "100%", marginTop: 20 }} type="primary" key="out"
          onClick={() => exportCSV(data, columns, "Login log")}
        ><FileExcelOutlined /> <FormattedMessage id="pages.CSV" defaultMessage="CSV" />
          </Button>

        </div>} trigger="click">
          <EllipsisOutlined />


        </Popover>
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
  async function getData(page, filter__, pageSize) {
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
    const append = await loginlog({
      ...{
        "current": page,
        "pageSize": pageSize || 3

      }, ...filter
    })

    setMPPagination({ total: append.total })
    setData(append.data)
  }

  //--MP end

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
        title: isMP ? null : < FormattedMessage id="pages.loginlog.title" defaultMessage="Login log" />,
        breadcrumb: {},
        extra: isMP ? null : [
          <Button type="primary" key="print"
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
            onClick={() => exportCSV(selectedRowsState, columns, "Login log")}
          ><FileExcelOutlined /> <FormattedMessage id="pages.CSV" defaultMessage="CSV" />
          </Button>

        ]
      }} >
        {!isMP && (<ConfigProvider renderEmpty={customizeRenderEmpty}><ProTable<LoginlogListItem, API.PageParams>
          pagination={{ size: "default", showSizeChanger: true, pageSizeOptions: [10, 20, 50, 100, 500] }}
          formRef={formRef}
          actionRef={actionRef}
          rowKey="id"
          scroll={{ x: 1800, y: resizeObj.tableScrollHeight }}
          search={{
            labelWidth: 170,
            span: resizeObj.searchSpan,
            searchText: < FormattedMessage id="pages.search" defaultMessage="Search" />
          }}
          toolBarRender={() => [

          ]}
          options={false}
          className="mytable"
          request={(params, sorter) => loginlog({ ...params, sorter })}
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
              id: 'pages.loginlog.title',
              defaultMessage: 'Login log',
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

                getData(page, MPfilter, pageSize)
              }}
              total={MPPagination.total}
              showSizeChanger={true}
              pageSizeOptions={[3, 20, 50, 100, 500]}
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

              </div>
            }
          >


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
          {currentRow?.username && (
            <ProDescriptions<LoginlogListItem>
              column={isMP ? 1 : 2}
              title={currentRow?.username}
              request={async () => ({
                data: currentRow || {},
              })}
              params={{
                id: currentRow?.username,
              }}
              columns={columns as ProDescriptionsItemProps<LoginlogListItem>[]}
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
