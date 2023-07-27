
import RcResizeObserver from 'rc-resize-observer';
import { addTransaction, removeTransaction, transaction, updateTransaction } from '../transaction/service';
import { operlog } from '../system/operlog/service';
import { loginlog } from '../system/loginlog/service';
import MPSort from "@/components/MPSort";

import { addReport } from '../report/service';
import { organization } from '../system/company/service';
import { alert as getAlert } from '../alert/service';
import { reportSummary } from './service';
import { SvgIcon } from '@/components'
import { columnsBase as columns4 } from '../system/operlog/SuperUserActivity';
import { columnsBase as columns5 } from '../system/loginlog/index';
import { columnsBase as columns6 } from '../system/operlog/index';
import { columnsBase as columns7 } from '../system/operlog/APIActivity';
import { exportCSV } from "../../components/export";

import { PlusOutlined, SearchOutlined, PrinterOutlined, FileExcelOutlined, ExclamationCircleOutlined, DeleteOutlined, FormOutlined, EllipsisOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { TransactionList, TransactionListItem } from '../transaction/data.d';
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
import { FormattedMessage, useIntl, formatMessage, useLocation, useModel } from '@umijs/max';
import { Button, Drawer, Input, message, Modal, Tooltip, Empty, ConfigProvider, Popover, Pagination, FloatButton } from 'antd';
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
const handleAdd = async (fields: any) => {
  const hide = message.loading(<FormattedMessage
    id="pages.adding"
    defaultMessage="Adding"
  />);
  try {
    await addReport({ ...fields });
    hide();
    message.success(<FormattedMessage
      id="pages.ddd"
      defaultMessage="Save report successfully"
    />);
    return true;
  } catch (error) {
    hide();
    message.error(<FormattedMessage
      id="pages.xxx"
      defaultMessage="Save report failed, please try again!"
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
const handleUpdate = async (fields: Partial<TransactionListItem>) => {
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
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [printModalVisible, handlePrintModalVisible] = useState<boolean>(false);
  const [paramsText, setParamsText] = useState<string>('');
  const [flowConf, setFlowConf] = useState<any>({});
  const [organizationList, setOrganizationList] = useState<any>({});
  const [terminalList, setTerminalList] = useState<any>({});
  const [jettyList, setJettyList] = useState<any>({});
  const [producttypeList, setProducttypeList] = useState<any>({});
  const [sumRow, setSumRow] = useState<TransactionListItem>();
  const [processes, setProcesses] = useState<any>([]);
  const [events, setEvents] = useState<any>([]);

  const [resizeObj, setResizeObj] = useState({ searchSpan: 12, tableScrollHeight: 300 });
  //--MP start
  const MPSearchFormRef = useRef<ProFormInstance>();

  const [showMPSearch, setShowMPSearch] = useState<boolean>(false);
  const [isMP, setIsMP] = useState<boolean>(!isPC());

  const [formData, setFormData] = useState<any>({});

  const getTimeStr = (time) => {
    return (time ? parseInt((time / 3600) + "") : 0) + "h " + (time ? parseInt((time % 3600) / 60) : 0) + "m"
  }

  var report_type = useLocation()?.state?.type
  var report_name = useLocation()?.state?.name
  var value = eval('(' + useLocation()?.state?.value + ')');

  var Fields=[]
  //var value = useLocation()?.state?.value;
  if(value){



  var filter = {}
  if (value.imo_number) {
    var a = {}
    a.field = report_type == 3 ? 't.imo_number' :'imo_number'
    a.op = 'in'
    a.data = value.imo_number
    filter.imo_number = a
  }


    if (value.eos_id) {
      var a = {}
      a.field = report_type==3?"t.eos_id":'eos_id'
      a.op = 'in'
      a.data = value.eos_id
      filter.eos_id = a
    }

  if (value.vessel_name) {
    var a = {}
    a.field = report_type == 3 ? "t.vessel_name" : 'vessel_name'
    a.op = 'in'
    a.data = value.vessel_name
    filter.vessel_name = a
  }
  var product_name_str ="All Product"
  if (value.product_name) {
    var a = {}
    a.field = report_type == 3 ? "t.product_name" : 'product_name'
    a.op = 'in'
    a.data = value.product_name
    filter.product_name = a

    product_name_str = value.product_name
  }


  



    if (value.vessel_size_dwt) {
      var a = {}

      if (report_type == 1 || report_type == 2) {
        a.field = 'vessel_size_dwt'
      } else if (report_type == 3) {
        a.field = 't.vessel_size_dwt'
      }

     
      a.op = 'between'
      a.data = value.vessel_size_dwt.split("-")
      filter.vessel_size_dwt = a
    }



    if (value.organization_id) {
      var a = {}
      a.field = 'organization_id'
      a.op = 'in'
      a.data = value.organization_id
      filter.organization_id = a
    }
    if (value.threshold_organization_id) {
      var a = {}
      a.field = 'threshold_organization_id'
      a.op = 'in'
      a.data = value.threshold_organization_id
      filter.threshold_organization_id = a
    }


    if (value.jetty_name) {

      
    var a = {}
      a.field = report_type == 3 ? "t.jetty_name" : 'jetty_name' 
    a.op = 'in'
      a.data = value.jetty_name
      filter.jetty_name = a
  }
  if (value.hasOwnProperty('status')) {
    var a = {}
    a.field = report_type == 3 ? "t.status" : 'status' 
    a.op = 'in'
    a.data = value.status
    filter.status = a
  }
 



  if (value.flow_id && value.flow_id.length>0) {

    
    filter.flow_id =  {
        'field': 'flow_id',
          'op': 'in',
          'data': value.flow_id
      }
    
  }
  
  if (value.flow_id_to && value.flow_id_to.length > 0) {

    
    filter.flow_id={
        'field': 'flow_id',
          'op': 'in',
      'data': value.flow_id_to.map((a) => {
              return a.split('_')[0]
            })
      }
    filter.flow_id_to={
        'field': 'flow_id_to',
          'op': 'in',
      'data': value.flow_id_to.map((a) => {
              return a.split('_')[1]
            })
      }
  }


  var dateStr=""

  if (value.dateArr && value.dateArr.length>0) {
    var field = "oper_time"
    if (report_type == 1 || report_type == 2) {
      field = "start_of_transaction"
    } else if (report_type == 3) {
      field = "t.start_of_transaction"
    }
   
    filter.start_of_transaction={
      'field': field,
          'op': 'between',
      'data': value.dateArr
      }
     
    dateStr = moment(value.dateArr[0]).format('YYYY/MM/DD') + " - " + moment(value.dateArr[1]).format('YYYY/MM/DD')
  }

  if (value.dateRange && value.dateRange.length > 0) {
    value.dateRange[0] = moment(new Date(value.dateRange[0])).format('YYYY-MM-DD') + " 00:00:00"
    value.dateRange[1] = moment(new Date(value.dateRange[1])).format('YYYY-MM-DD') + " 23:59:59"
    var field = "oper_time"
    if (report_type == 1 || report_type == 2) {
      field = "start_of_transaction"
    } else if (report_type == 3) {
      field = "t.start_of_transaction"
    }
    filter.start_of_transaction = {
      'field': field,
      'op': 'between',
      'data': value.dateRange
    }
    
    dateStr = moment(value.dateRange[0]).format('YYYY/MM/DD') + " To " + moment(value.dateRange[1]).format('YYYY/MM/DD')
  }



   Fields = value.selected_fields


  }

  

  const [terminal_id, setTerminal_id] = useState<any>(useLocation()?.state?.terminal_id);
  const [dateArr, setDateArr] = useState<any>(useLocation()?.state?.dateArr);
  const [status, setStatus] = useState<any>(useLocation()?.state?.status);




  const [transaction_total_num, setTransaction_total_num] = useState<any>(0);
  const [transaction_filter_num, setTransaction_filter_num] = useState<any>(0);


  const [moreOpen, setMoreOpen] = useState<boolean>(false);



  const right = (
    <div style={{ fontSize: 24 }}>
      <Space style={{ '--gap': '10px' }}>
       <Button type="primary" style={{ width: "100%" }} key="print"
          onClick={() => {
            setMoreOpen(false)
            handlePrintModalVisible(true)
          }}
        ><PrinterOutlined /> <FormattedMessage id="pages.Print" defaultMessage="Print" />
        </Button>, <Button style={{ width: "100%" }} type="primary" key="out"
          onClick={() => exportCSV(data, columns, report_name)}
        ><FileExcelOutlined /> <FormattedMessage id="pages.CSV" defaultMessage="CSV" />
          </Button>

       
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
  async function getData(page, _filter,pageSize) {
   
    var params= {
      "current": page,
      "pageSize": pageSize
         
    }

    var sorter=null
    var ss = ""
    if (report_type == 1) {

      ss = await transaction({ ...params, sorter, ...filter, is_report: true })

    } else if (report_type == 2) {

      ss = await transaction({ ...params, sorter, ...filter, is_detail_report: true })

    } else if (report_type == 3) {

      ss = await getAlert({ ...params, sorter, ...filter, is_report: true })

    } else if (report_type == 4) {
      ss = await operlog({
        ...params, sorter, type: {
          'field': 'type',
          'op': 'eq',
          'data': 1
        }
      })
    } else if (report_type == 5) {
      ss = await loginlog({
        ...params, sorter
      })
    } else if (report_type == 6) {

      ss = await operlog({
        ...params, sorter, type: {
          'field': 'type',
          'op': 'eq',
          'data': 2
        }
      })
    } else if (report_type == 7) {

      ss = await operlog({
        ...params, sorter, type: {
          'field': 'type',
          'op': 'eq',
          'data': 3
        }
      })
    } else {
      ss = await reportSummary({ ...params, sorter, ...filter })
    }


    setTransaction_total_num(ss.top_all_total)
    setTransaction_filter_num(ss.top_total)
   
    setMPPagination({ total: ss.total })
    setData(ss.data)
  }
  
  //--MP end

  var fd=useLocation()?.state

  useEffect(() => {

   
    setFormData(fd)
    


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

          
          d[r.flow_id + "_" + r.flow_id_to] = b[r.flow_id] + " -> " + b[r.flow_id_to]
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

    producttype({ pageSize: 3000, current: 1, sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setProducttypeList(b)

    });

    organization({ sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setOrganizationList(b)







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

    
    if (report_type == 1) {
    
      columns = columns
    } else if (report_type == 2) {
      
        columns = columns2
    } else if (report_type == 3) {

      columns = columns3
    } else if (report_type == 4) {

      columns = columns4
    } else if (report_type == 5) {

      columns = columns5
    } else if (report_type == 6) {

      columns = columns6
    } else if (report_type == 7) {

      columns = columns7
    } 

    if (isMP) {
      getData(1)

    }
  }, [true]);
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();
  const access = useAccess();
  
  var columns = [

    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Total/ Current Duration" />,
      dataIndex: 'total_duration',
      render: (dom, entity) => {
        if (dom > 0 && entity.status == 1) {
          return parseInt((dom / 3600) + "") + "h " + parseInt((dom % 3600) / 60) + "m"
        } else {
          return '-'
        }


      },

    },
    {

      title: <FormattedMessage id="pages.transaction.xxx" defaultMessage="Current Process" />,
      dataIndex: 'flow_id',
      render: (dom, entity) => {
        if (entity.status == 0) {
          return flowConf[dom]
        } else {
          return ""
        }
      }
      
    },
    {
      title: access.transactions_list_tab() ? "Customer" : "Trader",
      dataIndex: 'trader_id',
      render: (dom, entity) => {

        return entity.trader_name

      }

    },
    {
      title: <FormattedMessage id="pages.transaction.jettyName" defaultMessage="Terminal" />,
      dataIndex: 'terminal_id',
      render: (dom, entity) => {

        return entity.terminal_name

      }
    },
    {
      title: <FormattedMessage id="pages.transaction.jettyName" defaultMessage="Jetty Name" />,
      dataIndex: 'jetty_id',
      render: (dom, entity) => {
       
          return entity.jetty_name
        
      }

    },
    {
      title: <FormattedMessage id="pages.transaction.arrivalID" defaultMessage="Arrival ID" />,
      dataIndex: 'arrival_id',

    },
    {
      title: <FormattedMessage id="pages.transaction.imoNumber" defaultMessage="IMO Number" />,
      dataIndex: 'imo_number',

    },
    {
      title: <FormattedMessage id="pages.transaction.vesselName" defaultMessage="Vessel Name" />,
      dataIndex: 'vessel_name',

    },
    {
      title: <FormattedMessage id="pages.transaction.vesselName" defaultMessage="Vessel Size" />,
      dataIndex: 'vessel_size_dwt',

    },
    {
      title: <FormattedMessage id="pages.transaction.productType" defaultMessage="Product Type" />,
      dataIndex: 'product_name',

    },
    {
      title: <FormattedMessage id="pages.transaction.xxx" defaultMessage="Total Nominated Quantity (Bls-60-F)" />,
      dataIndex: 'product_quantity_in_bls_60_f',
      render: (dom, entity) => {
        if (dom) {
          return numeral(dom).format('0,0')
        }

      },

    },
    {
      title: (<FormattedMessage id="pages.transaction.transactionID" defaultMessage="EOS ID" />),
      dataIndex: 'eos_id',
      render: (dom, entity) => {
        return "E" + dom
      },
      mustSelect: true
    },
    {
      title: <FormattedMessage id="pages.transaction.xxx" defaultMessage="Transaction Status" />,
      dataIndex: 'status',
      mustSelect: true,
      valueEnum: {
        0: {
          text: <FormattedMessage id="pages.transaction.active" defaultMessage="Open" />
        },
        1: { text: <FormattedMessage id="pages.transaction.closed" defaultMessage="Closed" /> },
        2: { text: <FormattedMessage id="pages.transaction.cancelled" defaultMessage="Cancelled" /> }
      },
    },
    {
      title: <FormattedMessage id="pages.transaction.startOfTransaction" defaultMessage="Start Of Transaction" />,
      dataIndex: 'start_of_transaction',
      mustSelect: true,
      valueType: 'date',
    },
    {
      title: <FormattedMessage id="pages.transaction.endOfTransaction" defaultMessage="End Of Transaction" />,
      dataIndex: 'end_of_transaction',
      mustSelect: true,
      valueType: 'date',

    },

    {
      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Number of Amber Alert" />,
      dataIndex: 'amber_alert_num',
      mustSelect: true

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Number of Red Alert" />,
      dataIndex: 'red_alert_num',
      mustSelect: true

    },


  ];


  const columns2 = [
    
    {
      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="EOS ID" />,
      dataIndex: 'eos_id',
      mustSelect: true,
      render: (dom, entity) => {
        return "E"+dom
      }

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Process" />,
      dataIndex: 'flow_pid',
      valueEnum:flowConf,
      mustSelect: true
    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Event" />,
      dataIndex: 'flow_id',
      valueEnum: flowConf,
      mustSelect: true
    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Event Time" />,
      dataIndex: 'event_time',
      valueType:"dateTime",
      mustSelect: true
    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Work Order ID" />,
      dataIndex: 'work_order_id',

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Sequence No." />,
      dataIndex: 'work_order_sequence_number',

    },

    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Tank ID" />,
      dataIndex: 'tank_number',

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Product Name" />,
      dataIndex: 'product_name',

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Product Quantity (l-15-c)" />,
      dataIndex: 'product_quantity_in_l_15_c',

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Product Quantity (mt)" />,
      dataIndex: 'product_quantity_in_mt',

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Product Quantity (mtv)" />,
      dataIndex: 'product_quantity_in_mtv',

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Product Quantity (l-obs)" />,
      dataIndex: 'product_quantity_in_l_obs',

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Product Quantity (Bls-60-f)" />,
      dataIndex: 'product_quantity_in_bls_60_f',

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Pilotage ID" />,
      dataIndex: 'order_no',

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Location From" />,
      dataIndex: 'location_from',

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Location To" />,
      dataIndex: 'location_to',

    },

    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Delay Reason" />,
      dataIndex: 'delay_reason',

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Delay Duration" />,
      dataIndex: 'delay_duration',

    }
  ]
  const columns3 = [
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="IMO Number" />,
      dataIndex: 'imo_number',


    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Threshold Vessel Size" />,
      dataIndex: 'ar.vessel_size_dwt_from',

    },
    {
      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Threshold Nominated Quantity Range" />,
      dataIndex: 'ar.product_quantity_in_mt_from',


    },
    {
      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Transaction Vessel Size" />,
      dataIndex: 't.vessel_size_dwt',


    },

    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Transaction Nominated Quantity Range" />,
      dataIndex: 't.product_quantity_in_bls_60_f',


    },

    {
      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Product Type" />,
      dataIndex: 't.product_name',


    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Terminal" />,
      dataIndex: 't.terminal_id',


    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Trader" />,
      dataIndex: 't.trader_id',


    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Alert ID" />,
      dataIndex: 'alert_id',
      mustSelect: true,
      render: (dom, entity) => {
        return "A" + dom
      }

    },
    {
      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Alert Type" />,
      dataIndex: 'type',
      renderPrint: (dom, entity) => {
        if (dom == 0) {
          return "Amber"
        } else if (dom == 1) {
          return "Red"
        }

      },
      render: (dom, entity) => {

        return (<div><div style={{ display: dom == 0 ? "block" : "none" }}> <SvgIcon style={{ color: "#DE7E39" }} type="icon-yuan" /> Amber</div>
          <div style={{ display: dom == 1 ? "block" : "none" }}><SvgIcon style={{ color: "red" }} type="icon-yuan" /> Red</div></div>)
      },
      mustSelect: true

    },

    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Alert Triggered Time" />,
      dataIndex: 'created_at',
      valueType: 'dateTime',
      mustSelect: true

    },

    {
      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Threshold ID" />,
      dataIndex: 'ar.alertrule_id',
      mustSelect: true,
      render: (dom, entity) => {
        return "T" + dom
      }

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Threshold Type" />,
      dataIndex: 'alertrule_type',
      valueEnum: {
        0: { text: <FormattedMessage id="pages.alertrule.singleProcess" defaultMessage="Single Process" /> },
        1: { text: <FormattedMessage id="pages.alertrule.betweenTwoEvents" defaultMessage="Between Two Events" /> },
        2: { text: <FormattedMessage id="pages.alertrule.entireTransaction" defaultMessage="Entire Transaction" /> },
      },
      mustSelect: true

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Threshold Limit" />,
      dataIndex: 'ar.amber_hours',
      mustSelect: true,
      render: (dom, entity) => {
        entity.amber_hours = entity['ar.amber_hours']
        entity.amber_mins = entity['ar.amber_mins']
        entity.red_hours = entity['ar.red_hours']
        entity.red_mins = entity['ar.red_mins']
        return (<div><div style={{ display: entity.amber_hours || entity.amber_mins ? "block" : "none" }}> <SvgIcon style={{ color: "#DE7E39" }} type="icon-yuan" />{" " + (entity.amber_hours ? entity.amber_hours : '0') + "h " + (entity.amber_mins ? entity.amber_mins : '0') + "m"}</div>
          <div style={{ display: entity.red_hours || entity.red_mins ? "block" : "none" }}><SvgIcon style={{ color: "red" }} type="icon-yuan" />{" " + (entity.red_hours ? entity.red_hours : '0') + "h " + (entity.red_mins ? entity.red_mins : '0') + "m"}</div></div>)
      },
    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="EOS ID" />,
      dataIndex: 't.eos_id',
      mustSelect: true

    },

    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Total / Current Duration" />,
      dataIndex: 'total_duration',
      mustSelect: true,
      render: (dom, entity) => {

        return parseInt((dom / 3600) + "") + "h " + parseInt((dom % 3600) / 60) + "m"



      },
    }
  ]



 /* var columns: ProColumns<TransactionListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.transaction.transactionID"
          defaultMessage="EOS ID"
        />
      ),
      dataIndex: 'eos_id',
      hideInSearch: true,
     // fixed: 'left',

      sorter: true,
      //defaultSortOrder: 'descend',
      renderText: (dom, entity) => {
        return entity.eos_id
      },
      render: (dom, entity) => {
        return (
          <a

            onClick={() => {
              setCurrentRow(entity);
              history.push(`/transaction/detail`, { transaction_id: entity.id });
             
              // setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },



    {
      title: <FormattedMessage id="pages.transaction.startOfTransaction" defaultMessage="Start Of Transaction" />,
      dataIndex: 'start_of_transaction',
      sorter: true,
      defaultSortOrder: 'descend',
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
      title: <FormattedMessage id="pages.transaction.arrivalID" defaultMessage="Arrival ID" />,
      dataIndex: 'arrival_id',
      hideInSearch: true
    },

    {

      title: <FormattedMessage id="pages.transaction.currentProcess" defaultMessage="Current Process" />,
      dataIndex: 'flow_pid',
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
      dataIndex: 'product_name',
      // valueEnum: producttypeList,
    },
    

   


    {
      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Activity (From)" />,
      dataIndex: 'flow_id',
      valueEnum: flowConf,
    
    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Activity (To)" />,
      dataIndex: 'flow_id_to',
      valueEnum: flowConf
    
    },

    {
      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Timestamp" />,
      dataIndex: 'event_time',
      valueType: 'dateTime',
    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Total Duration By Process" />,
      dataIndex: 'duration',
      valueType: 'text',
      render: (dom, entity) => {
        
          return getTimeStr(dom)
      


      },
    },

    {
      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Number of Amber Alert Breached" />,
      dataIndex: 'amber_alert_num',
      valueType: 'text',
    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Number of Red Alert Breached" />,
      dataIndex: 'red_alert_num',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.transaction.totalDuration" defaultMessage="Entire Duration (Till Date)" />,
      dataIndex: 'total_duration',
      hideInSearch: true,
      render: (dom, entity) => {
        if (dom > 0 && entity.status == 1) {
          return getTimeStr(dom)
        } else {
          return '-'
        }


      },
      valueType: 'text',
    },
   

    /*{
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
  ];*/


  if (report_type == 1) {
    if (currentUser?.role_type == "Trader") {
      columns.splice(2, 1);
    } else if (currentUser?.role_type == "Terminal"){
      columns.splice(3, 1);
    }
    
    columns = columns
  } else if (report_type == 2) {

    columns = columns2
  } else if (report_type == 3) {

    columns = columns3
  } else if (report_type == 5) {

    columns = columns5
  } else if (report_type == 6) {

    columns = columns6
  } else if (report_type == 7) {

    columns = columns7
  } 
  if (Fields.length > 0) {

    columns = Fields.map((a) => {
      return columns.find((b) => {
        return a == b.dataIndex
      })
    })
   
  }

 

  const customizeRenderEmpty = () => {
    var o = filter
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
      title:<>{value?.name} - {dateStr}<div>{"Total count of transactions filtered: " + transaction_filter_num + " out of " + transaction_total_num}</div></>,
      breadcrumb: {},
      extra: isMP ? null : [
       /* <Access accessible={!formData.id} fallback={<div></div>}>
        <Button

          type="primary"
          key="primary"
          onClick={() => {
            var d = { ...formData }
           d.value= JSON.stringify(d.value)
            handleAdd(d);
          }}
        >
          <PlusOutlined /> <FormattedMessage id="pages.searchTable.xxxx" defaultMessage="Save" />
        </Button>
      </Access>,*/
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
          onClick={() => exportCSV(selectedRowsState, columns, report_name)}
        ><FileExcelOutlined /> <FormattedMessage id="pages.CSV" defaultMessage="CSV" />
        </Button>

      ]
    }}>

      {!isMP && (<ConfigProvider renderEmpty={customizeRenderEmpty}><RcResizeObserver
        key="resize-observer"
        onResize={(offset) => {
          const { innerWidth, innerHeight } = window;
          
          var h=document.getElementsByClassName("ant-table-thead")?.[0]?.offsetHeight+230
          

          if (offset.width > 1280) {
          
            setResizeObj({ ...resizeObj, searchSpan: 8, tableScrollHeight: innerHeight - h });
          }
          if (offset.width < 1280 && offset.width > 900) {
            
            setResizeObj({ ...resizeObj, searchSpan: 12, tableScrollHeight: innerHeight - h });
          }
          if (offset.width < 900 && offset.width > 700) {
            setResizeObj({ ...resizeObj, searchSpan: 24, tableScrollHeight: innerHeight - h });
           
          }

          if (offset.width < 700) {
            
          }

        }}
      ><ProTable<TransactionListItem, API.PageParams>

          scroll={{ x: columns.length*140, y: resizeObj.tableScrollHeight }}
        
          pagination={{ size: "default", showSizeChanger: true, pageSizeOptions: [10, 20, 50, 100, 500] }}
        formRef={formRef}
        bordered size="small"
        actionRef={actionRef}
        rowKey="id"
        options={false}
        search={false}
        className="mytable"
          request={async (params, sorter) => {
            var ss = ""
            if (report_type == 1) {
            
              ss = await transaction({ ...params, sorter, ...filter, is_report:true })
            
          }else if (report_type == 2) {

              ss = await transaction({ ...params, sorter, ...filter, is_detail_report:true })

        } else if (report_type == 3) {

              ss = await getAlert({ ...params, sorter, ...filter })

            } else if (report_type==4) {
              ss = await operlog({
                ...params, sorter, type: {
                  'field': 'type',
                  'op': 'eq',
                  'data': 1
                }
              })
            } else if (report_type == 5) {
              ss = await loginlog({
                ...params, sorter
              })
            } else if (report_type == 6) {
             
              ss = await operlog({
                ...params, sorter, type: {
                  'field': 'type',
                  'op': 'eq',
                  'data': 2
                }
              })
            } else if (report_type == 7) {
             
              ss = await operlog({
                ...params, sorter, type: {
                  'field': 'type',
                  'op': 'eq',
                  'data':3
                }
              })
            } else {
              ss = await reportSummary({ ...params, sorter, ...filter })
            }

           

            setTransaction_total_num(ss.top_all_total)
            setTransaction_filter_num(ss.top_total)
          return ss
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
        /></RcResizeObserver></ConfigProvider >)}

      {isMP && (<>

       
        <NavBar backArrow={false} right={right} onBack={back}>
         
        </NavBar>


       
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
              &nbsp;&nbsp;
             
            </div>
          }
        >
         

        </FooterToolbar>
      )}



      <div style={{ marginTop: 15, paddingLeft: 0 }} className="re-back">
        <Button
          style={isMP ? { width: '100%' } : null}
          type="default"
          onClick={async () => {
            history.push('/report')
          }}
        >Return To Report History</Button>
        {/*  <Button
          style={isMP ? { width: '100%', marginTop: 15 } : { marginLeft: 10 }}
          type="primary"
          onClick={async () => {
            history.push('/Report/add')
          }}
        >Return to create new report</Button>*/ }
      </div>

      {/* 调用打印模块 */}
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
    </PageContainer>
  );
};

export default TableList;
