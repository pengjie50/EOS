import RcResizeObserver from 'rc-resize-observer';

import { addOperlog, removeOperlog, operlog, updateOperlog } from './service';
import { PlusOutlined, SearchOutlined, FormOutlined, DeleteOutlined, ExclamationCircleOutlined, PrinterOutlined, SortAscendingOutlined, SortDescendingOutlined, SwapOutlined, FileExcelOutlined, EllipsisOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { OperlogList, OperlogListItem } from './data.d';
import FrPrint from "../../../components/FrPrint";
import FileSaver from "file-saver";
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
/**
 * @en-US Update node
 * @zh-CN 更新节点
 *
 * @param fields
 */
const handleUpdate = async (fields: Partial<any>) => {
  const hide = message.loading(<FormattedMessage
    id="pages.modifying"
    defaultMessage="Modifying"
  />);
  try {

    await updateOperlog({ remarks: fields['remarks'], id: fields.id });
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


const exportCSV = (data, columns, filename = `${"Summary of all transactions" + moment(Date.now()).format(' YYYY-MM-DD HH:mm:ss')}.csv`) => {

  if (data.length == 0) {
    message.error(<FormattedMessage
      id="pages.selectDataFirst"
      defaultMessage="Please select data first!"
    />);
    return false;
  }
  var newData = []
  var map = {}
  columns.forEach((a) => {

    map[a.dataIndex] = a
  })
  data = data.forEach((s) => {
    var n = {}

    for (var k in s) {

      var c = map[k]
      if (c && !c.hideInTable) {
        if (c.valueType == 'date') {
          n[c.title.props.defaultMessage] = s[k] ? moment(s[k]).format('YYYY/MM/DD') : ""
        } else if (c.renderText) {
          n[c.title.props.defaultMessage] = "" + c.renderText(s[k], s)
        }
        else if (c.render && k != 'id') {
          n[c.title.props.defaultMessage] = c.render(s[k], s)
        } else {
          if (c.valueEnum) {
            if (c.valueEnum[s[k]]) {
              if (typeof c.valueEnum[s[k]] == 'string') {
                n[c.title.props.defaultMessage] = c.valueEnum[s[k]]
              } else {
                n[c.title.props.defaultMessage] = c.valueEnum[s[k]].text.props.defaultMessage
              }

            } else {
              n[c.title.props.defaultMessage] = s[k]
            }

          } else {
            n[c.title.props.defaultMessage] = s[k]
          }
          // n[c.title.props.defaultMessage] = c.valueEnum ? (typeof c.valueEnum[s[k]] == 'string' ? c.valueEnum[s[k]] : c.valueEnum[s[k]].text.props.defaultMessage) : s[k]
        }


      }

    }
    newData.push(n)

  })

  const parser = new Json2csvParser();
  const csvData = parser.parse(newData);

  const blob = new Blob(["\uFEFF" + csvData], {
    type: "text/plain;charset=utf-8;",
  });
  FileSaver.saveAs(blob, filename);
}
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
  const [paramsText, setParamsText] = useState<string>('');
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [printModalVisible, handlePrintModalVisible] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<OperlogListItem>();
  const [selectedRowsState, setSelectedRows] = useState<OperlogListItem[]>([]);
  const [resizeObj, setResizeObj] = useState({ searchSpan: 12, tableScrollHeight: 300 });
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();
  const [MPSorter, setMPSorter] = useState<any>({});
  //--MP start
  const MPSearchFormRef = useRef<ProFormInstance>();
  const [moreOpen, setMoreOpen] = useState<boolean>(false);
  const [showMPSearch, setShowMPSearch] = useState<boolean>(false);
  const [isMP, setIsMP] = useState<boolean>(!isPC());

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
          onClick={() => exportCSV(data, columns)}
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
      title: <FormattedMessage id="pages.operlog.module" defaultMessage="module" />,
      dataIndex: 'module',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.operlog.action" defaultMessage="Action Type" />,
      dataIndex: 'action',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.operlog.xxx" defaultMessage="Action Description" />,
      dataIndex: 'param',
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
   /* {
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
    },*/
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
    }/*,
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
    }*/,
    {
      title: (
        <FormattedMessage
          id="pages.operlog.operTime"
          defaultMessage="Oper time"
        />
      ),
     
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
      title: <FormattedMessage id="pages.alert.specificProcess" defaultMessage="Remarks" />,
      dataIndex: 'remarks',
      hideInSearch: true,

      valueType: 'textarea',
      render: (dom, record) => {

        return <div style={{ position: 'relative', width: '100%' }}><p dangerouslySetInnerHTML={{ __html: dom?.replace(/\n/g, '<br />') }} />



         <div>
          
              <a
                title={formatMessage({ id: "pages.update", defaultMessage: "Modify" })}
                key="config"
                onClick={() => {
                  setCurrentRow(record);
                  handleUpdateModalOpen(true);




                }}
              >
                <FormOutlined style={{ fontSize: '20px' }} />

              </a>

            
          </div>
        </div>;
      },

    },
    /*{
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
       
       
      ],
    },*/
  ];

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
        title: isMP ? null : < FormattedMessage id="pages.operlog.xxx" defaultMessage="Super User Activity Log" />,
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
            onClick={() => exportCSV(selectedRowsState, columns)}
          ><FileExcelOutlined /> <FormattedMessage id="pages.CSV" defaultMessage="CSV" />
          </Button>

        ]
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

          <NavBar backArrow={false} left={<div>  <Popover placement="bottom" title={""} content={<div>{columns.filter(a => (a.hasOwnProperty('sorter') && a['sorter'])).map((a) => {

            return (<div><Button onClick={() => {
              setMPSorter({ [a.dataIndex]: 'ascend' })


              getData(1)
             

            }} icon={<SortAscendingOutlined />} />
              <Button style={{ margin: 5 }} onClick={() => {
                setMPSorter({ [a.dataIndex]: 'descend' })

                getData(1)

              }} icon={<SortDescendingOutlined />} />
              <span>{a.title}</span>
            </div>)

          })}</div>} trigger="click">
            <SwapOutlined rotate={90} />


          </Popover> </div>} right={right} onBack={back}>
          {intl.formatMessage({
            id: 'pages.operlog.xxx',
            defaultMessage: 'Super User Activity Log',
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
             
            </div>
          }
        >
         
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
                getData(1)
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
