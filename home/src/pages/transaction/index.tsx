import { addTransaction, removeTransaction, transaction, updateTransaction } from './service';
import { PlusOutlined, SearchOutlined, PrinterOutlined, FileExcelOutlined, ExclamationCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { TransactionList, TransactionListItem } from './data.d';
import FrPrint from "../../components/FrPrint";
import FileSaver from "file-saver";
import { history } from '@umijs/max';
import { GridContent } from '@ant-design/pro-layout';
import numeral from 'numeral';
import moment from 'moment'
import { useAccess, Access } from 'umi';
const Json2csvParser = require("json2csv").Parser;
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormDatePicker,
  ProFormText,
  ProCard,
  ProFormTextArea,
  ProFormInstance,
  Search,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, formatMessage, useLocation } from '@umijs/max';
import { Button, Drawer, Input, message, Modal, Tooltip, Empty, ConfigProvider } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import { flow } from '../system/flow/service';
import { alertrule } from '../alertrule/service';
import { terminal } from '../system/terminal/service';
import { producttype } from '../system/producttype/service';
import { jetty } from '../system/jetty/service';
import { isPC } from "@/utils/utils";
const { confirm } = Modal;


//MP
import { InfiniteScroll, List, NavBar, Space, DotLoading } from 'antd-mobile'
/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: TransactionListItem) => {
  const hide = message.loading(<FormattedMessage
    id="pages.adding"
    defaultMessage="Adding"
  />);
  try {
    await addTransaction({ ...fields });
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
const handleUpdate = async (fields: Partial<TransactionListItem> ) => {
  const hide = message.loading(<FormattedMessage
    id="pages.modifying"
    defaultMessage="Modifying"
  />);
  try {
    await updateTransaction({ ...fields });
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

const handleRemove = async (selectedRows: TransactionListItem[], callBack: any) => {
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
        removeTransaction({
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




/*var keysArr = new Array("key0", "key1", "key2");

function TableToJson(tableid){//tableid是你要转化的表的表名，是一个字符串，如"example"

  var rows = document.getElementById(tableid).rows.length;//获得行数(包括thead)

  var colums = document.getElementById(tableid).rows[0].cells.length;//获得列数

  var json = "[";

  var tdValue;

  for (var i = 1; i < rows; i++) {//每行

    json += "{";

    for (var j = 0; j < colums; j++) {

      tdName = keysArr[j];//Json数据的键

      json += "\"";//加上一个双引号

      json += tdName;

      json += "\"";

      json += ":";

      tdValue = document.getElementById(tableid).rows[i].cells[j].innerHTML;//Json数据的值

      if (j === 1) {//第1列是日期格式，需要按照json要求做如下添加

        tdValue = "\/Date(" + tdValue + ")\/";

      }

      json += "\"";

      json += tdValue;

      json += "\"";

      json += ",";

    }

    json = json.substring(0, json.length - 1);

    json += "}";

    json += ",";

  }

  json = json.substring(0, json.length - 1);

  json += "]";

  return json;

}*/

const exportCSV = (data, columns, filename = `${"Summary of all transactions"+moment(Date.now()).format(' YYYY-MM-DD HH:mm:ss') }.csv`) => {

  if (data.length==0) {
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
          n[c.title.props.defaultMessage] = "" +c.renderText(s[k], s)
        }
        else if (c.render && k != 'id') {
          n[c.title.props.defaultMessage] = c.render(s[k],s)
        } else {
          n[c.title.props.defaultMessage] = c.valueEnum ? (typeof c.valueEnum[s[k]] == 'string' ? c.valueEnum[s[k]] : c.valueEnum[s[k]].text.props.defaultMessage) : s[k]
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

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<TransactionListItem>();
  const [selectedRowsState, setSelectedRows] = useState<TransactionListItem[]>([]);

  const [printModalVisible, handlePrintModalVisible] = useState<boolean>(false);
  const [paramsText, setParamsText] = useState<string>('');
  const [flowConf, setFlowConf] = useState<any>({});

  const [terminalList, setTerminalList] = useState<any>({});
  const [jettyList, setJettyList] = useState<any>({});
  const [producttypeList, setProducttypeList] = useState<any>({});
  const [sumRow, setSumRow] = useState<TransactionListItem>();
  const [processes, setProcesses] = useState<any>([]);
  const [events, setEvents] = useState<any>([]);
  //--MP start
  const MPSearchFormRef = useRef<ProFormInstance>();

  const [showMPSearch, setShowMPSearch] = useState<boolean>(false);
  const [isMP, setIsMP] = useState<boolean>(!isPC());



  
  

  const [terminal_id, setTerminal_id] = useState<any>(useLocation()?.state?.terminal_id);
  const [dateArr, setDateArr] = useState<any>(useLocation()?.state?.dateArr);
  const [status, setStatus] = useState<any>(useLocation()?.state?.status);

  const right = (
    <div style={{ fontSize: 24 }}>
      <Space style={{ '--gap': '16px' }}>
        <SearchOutlined onClick={e => { setShowMPSearch(!showMPSearch) }} />

      </Space>
    </div>
  )


  const formRef = useRef<ProFormInstance>();



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
          <span>--- There's no more ---</span>
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
    const append = await transaction({
      ...{
        "current": page,
        "pageSize": 10,
        "sorter": {
          "start_of_transaction": "descend"
        }
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



  useEffect(() => {
   
    
   
   
  

    flow({ pageSize: 300, current: 1, sorter: { sort: 'ascend' } }).then((res) => {
      var b = {}
      var p = { "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa": "Entire Duration" }
      res.data.forEach((r) => {
        if (r.type == 0) {

          p[r.id] = r.name
        }
        b[r.id] = r.name
      })
      setFlowConf(b)
      setProcesses(p)

      alertrule({ pageSize: 300, current: 1, type: 1 }).then((res2) => {
        var d = {}



        res2.data.forEach((r) => {
         
          console.log(b)
          d[r.flow_id + "_" + r.flow_id_to] = b[r.flow_id] + " - " + b[r.flow_id_to]
        })

        setEvents(d)

      });
    });

    jetty({ pageSize: 3000, current: 1, sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setJettyList(b)

    });

    producttype({ pageSize: 3000, current: 1,  sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setProducttypeList(b)

    });
    terminal({ pageSize: 3000, current: 1, sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setTerminalList(b)

     

      if (status !== "" && status !== undefined) {
        
          formRef.current?.setFieldValue('status', status + "")
        }

        if (terminal_id) {
        
          formRef.current?.setFieldValue('terminal_id', terminal_id)
        }
        if (dateArr && dateArr[0] && dateArr[1]) {
          formRef.current?.setFieldValue('start_of_transaction', dateArr)
        }
        formRef.current?.submit();

      


    });





  }, [true]);
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();
  const access = useAccess();
  const columns: ProColumns<TransactionListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.transaction.transactionID"
          defaultMessage="EOS ID"
        />
      ),
      dataIndex: 'eos_id',
      hideInSearch: true,
      sorter: true,
      defaultSortOrder: 'descend',
      renderText: (dom, entity) => {
        return entity.eos_id
      },
      render: (dom, entity) => {
        return (
          <a
           
            onClick={() => {
              setCurrentRow(entity);
              history.push(`/transaction/detail?transaction_id=` + entity.id);
              // setShowDetail(true);
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
          id="pages.transaction.timeFrame"
          defaultMessage="Timeframe"
        />
      ),
      sorter: true,
     
      hideInTable: true,
      fieldProps: { placeholder: ['Date (From) ', 'Date (To) '] },
      defaultSortOrder: 'descend',
      dataIndex: 'start_of_transaction',
      valueType: 'dateRange',
     
      search: {
        transform: (value) => {
          if (value.length > 0) {
            return {
              'start_of_transaction': {
                'field': 'start_of_transaction',
                'op': 'gt',
                'data': value[0]
              },
              'end_of_transaction': {
                'field': 'end_of_transaction',
                'op': 'lt',
                'data': value[1]
              },
            }
          }
          
        }
      }



    },


    {
      title: <FormattedMessage id="pages.transaction.startOfTransaction" defaultMessage="Start Of Transaction" />,
      dataIndex: 'start_of_transaction',
      sorter: true,
      defaultSortOrder:'descend',
      valueType: 'date',
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.transaction.endOfTransaction" defaultMessage="End Of Transaction" />,
      dataIndex: 'end_of_transaction',
      valueType: 'date',
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.transaction.status" defaultMessage="Status" />,
      dataIndex: 'status',
      search: {
        transform: (value) => {
         
          if (value!==null) {
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
          text: <FormattedMessage id="pages.transaction.active" defaultMessage="Open" /> },
        1: { text: <FormattedMessage id="pages.transaction.closed" defaultMessage="Closed" /> },
        2: { text: <FormattedMessage id="pages.transaction.cancelled" defaultMessage="Cancelled" /> }
      },
    },
    {
      title: <FormattedMessage id="pages.transaction.arrivalID" defaultMessage="Arrival ID" />,
      dataIndex: 'arrival_id',
      hideInSearch: true
    },
    
    {
     
      title: <FormattedMessage id="pages.transaction.currentProcess" defaultMessage="Current Process" />,
      dataIndex: 'flow_id',
      valueEnum: flowConf,
      fieldProps: {
        notFoundContent: <Empty />,
      },
      hideInSearch: true,
    },
   
   
    {
      title: <FormattedMessage id="pages.transaction.imoNumber" defaultMessage="IMO Number" />,
      dataIndex: 'imo_number',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.transaction.vesselName" defaultMessage="Vessel Name" />,
      dataIndex: 'vessel_name',
      valueType: 'text',
    },

    {
      title: <FormattedMessage id="pages.transaction.terminalName" defaultMessage="Terminal Name" />,
      dataIndex: 'terminal_id',
      valueEnum: terminalList,
      fieldProps: {
        notFoundContent: <Empty />,
      },
      search: {
        transform: (value) => {
          if (value) {
            return {
              'terminal_id': {
                'field': 'terminal_id',
                'op': 'eq',
                'data': value
              }
            }
          }

        }
      }
    },
    {
      title: <FormattedMessage id="pages.transaction.jettyName" defaultMessage="Jetty Name" />,
      dataIndex: 'jetty_id',
      valueEnum: jettyList,
      fieldProps: {
        notFoundContent: <Empty />,
      },
      search: {
        transform: (value) => {
          if (value) {
            return {
              'jetty_id': {
                'field': 'jetty_id',
                'op': 'eq',
                'data': value
              }
            }
          }

        }
      }
    },
    
   
    {
      title: <FormattedMessage id="pages.transaction.productType" defaultMessage="Product Type" />,
      dataIndex: 'product_type',
     // valueEnum: producttypeList,
    },
    {
      title: <FormattedMessage id="pages.alertrule.totalNominatedQuantityM" defaultMessage="Total Nominated Quantity (MT)" />,
      dataIndex: 'total_nominated_quantity_m',
      
      hideInSearch: true,
      valueType: "text",
      render: (dom, entity) => {
        if (dom ) {


          return numeral(dom).format('0,0') 
        }

      },
    },
    {
      title: <FormattedMessage id="pages.alertrule.totalNominatedQuantityB" defaultMessage="Total Nominated Quantity (Bal-60-F)" />,
      dataIndex: 'total_nominated_quantity_b',
      hideInSearch: true,
     
      valueType: 'text',

      render: (dom, entity) => {
        if (dom) {
          return numeral(dom).format('0,0') 
        }

      },
    },

    {
      title: <FormattedMessage id="pages.transaction.totalDuration" defaultMessage="Entire Duration (Till Date)" />,
      dataIndex: 'total_duration',
      hideInSearch: true,
      render: (dom, entity) => {
        if (dom > 0 && entity.status == 1) {
          return parseInt((dom / 3600) + "") + "h " + parseInt((dom % 3600) / 60) + "m"
        } else {
          return '-'
        }
        

      },
      valueType: 'text',
    },
    {
      title: (
        <FormattedMessage
          id="pages.alertrule.eee"
          defaultMessage="Entire Transaction And Processes"
        />
      ),
      dataIndex: 'flow_id',
      hideInTable: true,
      hideInDescriptions: true,
      valueEnum: processes,
      fieldProps: {
        notFoundContent: <Empty />,
        width: '300px',
        mode: 'multiple',
        showSearch: false,
        multiple: true

      },
      search: {
        transform: (value) => {
          if (value.length > 0) {
            return {
              'flow_id': {
                'field': 'flow_id',
                'op': 'in',
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
          id="pages.alertrule.eee"
          defaultMessage="Between Two Events"
        />
      ),
      dataIndex: 'flow_id_to',
      hideInTable: true,
      width: 200,
      hideInDescriptions: true,
      valueEnum: events,
      fieldProps: {
        notFoundContent: <Empty />,
        dropdownMatchSelectWidth: false,
        width: '300px',
        mode: 'multiple',
        showSearch: false,
        multiple: true

      },
      search: {
        transform: (value) => {
          if (value.length > 0) {
            return {
              'flow_id': {
                'field': 'flow_id',
                'op': 'in',
                'data': value.map((a) => {
                  return a.split('_')[0]
                })
              },
              'flow_id_to': {
                'field': 'flow_id_to',
                'op': 'in',
                'data': value.map((a) => {
                  return a.split('_')[1]
                })
              },
            }
          }
        }
      }


    },/*,
    {
      title: <FormattedMessage id="pages.transaction.durationPerVolume" defaultMessage="Duration per Volume (B) / (A)" />,
      dataIndex: 'duration_per_volume',
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <span>
            {dom} mins/m{< sup > 3</sup>}
          </span>
        );
      },
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.transaction.averageDurationPerVolumeOfSameProductType" defaultMessage="Average Duration per Volume of same Product Type" />,
      dataIndex: 'average_duration_per_volume_of_same_product_type',
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <span>
            {dom} mins/m{< sup > 3</sup>}
          </span>
        );
      },
      valueType: 'text',
    }*/
    ,
   
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      hideInTable: !access.canAdmin,
      render: (_, record) => [
        <Access accessible={access.canAdmin} fallback={<div></div>}>
        <a
          key="config"
          onClick={() => {
            handleUpdateModalOpen(true);
            setCurrentRow(record);
          }}
        >
          <FormattedMessage id="pages.update" defaultMessage="Modify" />
          </a></Access>,
        <Access accessible={access.canAdmin} fallback={<div></div>}>
          <a
            title={formatMessage({ id: "pages.delete", defaultMessage: "Delete" })}
            key="config"
            onClick={() => {

              handleRemove([record], (success) => {
                if (success) {

                  actionRef.current?.reloadAndRest?.();
                }
              });


            }}
          >
            <DeleteOutlined style={{ fontSize: '20px', color: 'red' }} />

          </a>
        </Access>
       
      ],
    },
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
      title: isMP ? null : < FormattedMessage id="pages.transactions.title" defaultMessage="Summary Of All Transactions" />,
      breadcrumb: {},
      extra: isMP ? null : [
        <Access accessible={access.canAdmin} fallback={<div></div>}><Button
          type="primary"
          key="primary"
          onClick={() => {
            handleModalOpen(true);
          }}
        >

          <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
        </Button> </Access>, <Button type="primary" key="print"
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
    }}>
      
      {!isMP && (<ConfigProvider renderEmpty={customizeRenderEmpty}><ProTable<TransactionListItem, API.PageParams>

       
      
        formRef={formRef}
        bordered size="small"
        actionRef={actionRef}
        rowKey="id"
        options={false}
        search={{
          labelWidth: 210,
          span:8,
          searchText: < FormattedMessage id="pages.search" defaultMessage="Search" />
        }}
        className="mytable"
        request={(params, sorter) => transaction({ ...params, sorter })}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      /></ConfigProvider >)}

      {isMP && (<>

        <NavBar backArrow={false} right={right} onBack={back}>
          {intl.formatMessage({
            id: 'pages.transaction.title',
            defaultMessage: 'Summary Of All Transactions',
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
            search={{

            }}
            
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
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState, (success) => {
                if (success) {
                  setSelectedRows([]);
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
          const success = await handleAdd(value as TransactionListItem);
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
        width={isMP ? '100%' : 600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={isMP ? true : false}
      >
        {currentRow?.name && (
          <ProDescriptions<TransactionListItem>
            column={isMP ? 1 : 2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<TransactionListItem>[]}
          />
        )}
      </Drawer>
      {/* 调用打印模块 */}
      <FrPrint
        title={""}
        subTitle={paramsText}
        columns={columns}
        dataSource={[...selectedRowsState/*, sumRow*/]}
        onCancel={() => {
          handlePrintModalVisible(false);
        }}
        printModalVisible={printModalVisible}
      />
    </PageContainer>
  );
};

export default TableList;
