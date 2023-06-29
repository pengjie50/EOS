import RcResizeObserver from 'rc-resize-observer';

import { addLoginlog, removeLoginlog, loginlog, updateLoginlog } from './service';
import FrPrint from "../../../components/FrPrint";
import { exportCSV } from "../../../components/export";
import FileSaver from "file-saver";
import { user } from '../user/service';
import { company } from '../company/service';
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
import { Button, Drawer, Input, message, Modal, Popover } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
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

export var  columns: ProColumns<LoginlogListItem>[] = [
  {
    title: (
      <FormattedMessage
        id="pages.user.usename"
        defaultMessage="Login Usename"
      />
    ),
    dataIndex: 'username',
   // valueEnum: userList,
    fieldProps: {
      showSearch: true,
    },
    search: {
      transform: (value) => {

        if (value !== null) {
          return {

            status: {
              'field': 'user_id',
              'op': 'eq',
              'data': value
            }

          }
        }

      }
    },
    render: (dom, entity) => {
      return dom
      /* return (
         <a
           onClick={() => {
             setCurrentRow(entity);
             setShowDetail(true);
           }}
         >
           {dom}
         </a>
       );*/
    },
  },


 
  {
    title: <FormattedMessage id="pages.loginlog.xxx" defaultMessage="Organisation" />,
    dataIndex: 'company_name',
   // valueEnum: organizationList,
    fieldProps: {
      showSearch: true,
    },
    search: {
      transform: (value) => {

        if (value !== null) {
          return {

            status: {
              'field': 'company_id',
              'op': 'eq',
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
        id="pages.loginlog.loginTime"
        defaultMessage="Login Time"
      />
    ),
    sorter: true,
    width: 200,
    dataIndex: 'login_time',
    valueType: 'dateTime',
    hideInSearch: true

  },
  {
    title: <FormattedMessage id="pages.loginlog.xxx" defaultMessage="Active duration" />,
    dataIndex: 'active_duration',
    valueType: 'text',
  },
  {
    title: (
      <FormattedMessage
        id="pages.loginlog.xxx"
        defaultMessage="Logout Time"
      />
    ),
    width: 200,
    sorter: true,
    dataIndex: 'logout_time',
    valueType: 'dateTime',
    hideInSearch: true

  },

  {
    title: <FormattedMessage id="pages.loginlog.xxx" defaultMessage="No of Invalid attempts" />,
    dataIndex: 'invalid_attempts',
    valueType: 'text',
  },

  {
    title: <FormattedMessage id="pages.loginlog.xxx" defaultMessage="URL" />,
    dataIndex: 'url',
    valueType: 'text',
  },

  {
    title: <FormattedMessage id="pages.loginlog.xxx" defaultMessage="IP" />,
    dataIndex: 'ip',
    valueType: 'text',
  },
  {
    title: <FormattedMessage id="pages.loginlog.xxx" defaultMessage="Device Type" />,
    dataIndex: 'device_type',
    valueType: 'text',
    valueEnum: {
      "PC": "PC",
      "Laptop": "Laptop",
      "Mobile": "Mobile"

    }
  },



  {
    title: <FormattedMessage id="pages.loginlog.status" defaultMessage="Status" />,
    dataIndex: 'status',
    search: {
      transform: (value) => {

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
  /* {
     title: (
       <FormattedMessage
         id="pages.loginlog.information"
         defaultMessage="Information"
       />
     ),
     dataIndex: 'err_code',
     sorter: true,
     renderText: (val: Number) => {
       if (val == 0) {
         return ''
       }
       return `${intl.formatMessage({
         id: 'pages.error.' + val,
         defaultMessage: '',
       })}`
     }
      
   },*/

  {
    title: (
      <FormattedMessage
        id="pages.loginlog.loginTime"
        defaultMessage="Login time"
      />
    ),
    sorter: true,
    hideInTable: true,
    defaultSortOrder: 'descend',
    dataIndex: 'login_time',
    valueType: 'dateRange',
    search: {
      transform: (value) => {
        if (value.length > 0) {
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
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);
  const [printModalVisible, handlePrintModalVisible] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [organizationList, setOrganizationList] = useState<any>({});
  const [userList, setUserList] = useState<any>({});
  const [moreOpen, setMoreOpen] = useState<boolean>(false);
  const [paramsText, setParamsText] = useState<string>('');
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<LoginlogListItem>();
  const [selectedRowsState, setSelectedRows] = useState<LoginlogListItem[]>([]);
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
  columns[0].valueEnum = userList
  columns[1].valueEnum = organizationList

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
        </Button>, <Button style={{ width: "100%" }} type="primary" key="out"
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

  async function getData(page, filter) {
    const append = await loginlog({
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

 

  return (
    <RcResizeObserver
      key="resize-observer"
      onResize={(offset) => {
        const { innerWidth, innerHeight } = window;

        if (offset.width > 1280) {
          
          setResizeObj({ ...resizeObj, searchSpan: 8, tableScrollHeight: innerHeight - 420 });
        }
        if (offset.width < 1280 && offset.width > 900) {
         
          setResizeObj({ ...resizeObj, searchSpan: 12, tableScrollHeight: innerHeight - 420 });
        }
        if (offset.width < 900 && offset.width > 700) {
          setResizeObj({ ...resizeObj, searchSpan: 24, tableScrollHeight: innerHeight - 420 });
          
        }

        

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
            onClick={() => exportCSV(selectedRowsState, columns,"Login log")}
          ><FileExcelOutlined /> <FormattedMessage id="pages.CSV" defaultMessage="CSV" />
          </Button>

        ]
    }} >
      {!isMP && (<ProTable<LoginlogListItem, API.PageParams>
       
       
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
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />)}

      {isMP && (<>

        <NavBar backArrow={false} right={right} onBack={back}>
          {intl.formatMessage({
            id: 'pages.loginlog.title',
            defaultMessage: 'Login log',
          })}
        </NavBar>

        <div style={{ padding: '20px', backgroundColor: "#5187c4", display: showMPSearch ? 'block' : 'none' }}>
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
          dataSource={[...(isMP ? data : selectedRowsState)/*, sumRow*/]}
          onCancel={() => {
            handlePrintModalVisible(false);
          }}
          printModalVisible={printModalVisible}
        />
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
