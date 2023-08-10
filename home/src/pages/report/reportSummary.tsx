
import RcResizeObserver from 'rc-resize-observer';
import { addTransaction, removeTransaction, transaction, updateTransaction } from '../transaction/service';
import { operlog } from '../system/operlog/service';
import { loginlog } from '../system/loginlog/service';
import MPSort from "@/components/MPSort";

import { addReport } from '../report/service';
import { organization } from '../system/company/service';
import { alert as getAlert } from '../alert/service';
import { reportSummary } from './service';
import { SvgIcon, ResizeObserverDo, keyNameMap, getDiff } from '@/components'
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


import { jetty } from '../system/jetty/service';
import { isPC } from "@/utils/utils";
const { confirm } = Modal;


//MP
import { InfiniteScroll, List, NavBar, Space, DotLoading } from 'antd-mobile'






/**
 * @en-US Add node
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
 

  const actionRef = useRef<ActionType>();
 
  const [selectedRowsState, setSelectedRows] = useState<TransactionListItem[]>([]);
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [printModalVisible, handlePrintModalVisible] = useState<boolean>(false);
  const [paramsText, setParamsText] = useState<string>('');
  const [flowConf, setFlowConf] = useState<any>({});
  const [organizationList, setOrganizationList] = useState<any>({});

  const [jettyList, setJettyList] = useState<any>({});

  
  const [processes, setProcesses] = useState<any>([]);
  const [events, setEvents] = useState<any>([]);

  const [resizeObj, setResizeObj] = useState({ searchSpan: 12, tableScrollHeight: 300 });
  //--MP start
  

  const [showMPSearch, setShowMPSearch] = useState<boolean>(false);
  const [isMP, setIsMP] = useState<boolean>(!isPC());

  const [formData, setFormData] = useState<any>({});

  const getTimeStr = (time) => {
    return (time ? parseInt((time / 3600) + "") : 0) + "h " + (time ? parseInt((time % 3600) / 60) : 0) + "m"
  }
  var report_id = useLocation()?.state?.id

  var report_type = useLocation()?.state?.type
  var report_name = useLocation()?.state?.name
  var value = eval('(' + useLocation()?.state?.value + ')');

  var Fields = []
  //var value = useLocation()?.state?.value;
  if (value) {


    var filter = {}
    if (value.total_nominated_quantity && value.total_nominated_quantity.length > 0) {

      var a = {}

      a.field = report_type == 3 ? 't.product_quantity_in_' + value.uom.toLowerCase() : 'product_quantity_in_' + value.uom.toLowerCase()
      a.op = 'between'
      a.data = value.total_nominated_quantity
      filter[a.field] = a
    }



    if (value.imo_number && value.imo_number.length > 0) {
      var a = {}
      a.field = report_type == 3 ? 't.imo_number' : 'imo_number'
      a.op = 'in'
      a.data = value.imo_number
      filter[a.field] = a
    }


    if (value.eos_id && value.eos_id.length > 0) {
      var a = {}
      a.field = report_type == 3 ? "t.eos_id" : 'eos_id'
      a.op = 'in'
      a.data = value.eos_id
      filter[a.field] = a
    }

    if (value.vessel_name && value.vessel_name.length > 0) {
      var a = {}
      a.field = report_type == 3 ? "t.vessel_name" : 'vessel_name'
      a.op = 'in'
      a.data = value.vessel_name
      filter[a.field] = a
    }
    var product_name_str = "All Product"
    if (value.product_name && value.product_name.length > 0) {
      var a = {}
      a.field = report_type == 3 ? "t.product_name" : 'product_name'
      a.op = 'in'
      a.data = value.product_name
      filter[a.field] = a

      product_name_str = value.product_name
    }






    if (value.vessel_size_dwt && value.vessel_size_dwt.length > 0) {
      var a = {}

      if (report_type == 1 || report_type == 2) {
        a.field = 'vessel_size_dwt'
      } else if (report_type == 3) {
        a.field = 't.vessel_size_dwt'
      }


      a.op = 'between'
      a.data = value.vessel_size_dwt.split("-")
      filter[a.field] = a
    }



    if (value.organization_id && value.organization_id.length > 0) {
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


    if (value.jetty_name && value.jetty_name.length > 0) {


      var a = {}
      a.field = report_type == 3 ? "t.jetty_name" : 'jetty_name'
      a.op = 'in'
      a.data = value.jetty_name
      filter[a.field] = a
    }
    if (value.hasOwnProperty('status')) {
      var a = {}
      a.field = report_type == 3 ? "t.status" : 'status'
      a.op = 'in'
      a.data = value.status
      filter[a.field] = a
    }




    if (value.flow_id && value.flow_id.length > 0) {


      filter.flow_id = {
        'field': 'flow_id',
        'op': 'in',
        'data': value.flow_id
      }

    }

    if (value.flow_id_to && value.flow_id_to.length > 0) {


      filter.flow_id = {
        'field': 'flow_id',
        'op': 'in',
        'data': value.flow_id_to.map((a) => {
          return a.split('_')[0]
        })
      }
      filter.flow_id_to = {
        'field': 'flow_id_to',
        'op': 'in',
        'data': value.flow_id_to.map((a) => {
          return a.split('_')[1]
        })
      }
    }


    var dateStr = ""

    if (value.dateArr && value.dateArr.length > 0) {
      var field = "oper_time"
      if (report_type == 1 || report_type == 2) {
        field = "start_of_transaction"
      } else if (report_type == 3) {
        field = "t.start_of_transaction"
      }

      filter[field] = {
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
      filter[field] = {
        'field': field,
        'op': 'between',
        'data': value.dateRange
      }

      dateStr = moment(value.dateRange[0]).format('YYYY/MM/DD') + " To " + moment(value.dateRange[1]).format('YYYY/MM/DD')
    }



    Fields = value.selected_fields


  }



 



  const [start_time, setStart_time] = useState<any>(null);
  const [end_time, setEnd_time] = useState<any>(null);


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
  async function getData(page, _filter, pageSize) {

    var params = {
      "current": page,
      "pageSize": pageSize

    }

    var sorter = null
    var ss = ""
    if (report_type == 1) {

      ss = await transaction({ ...params, sorter, ...filter, is_report: true })

    } else if (report_type == 2) {

      ss = await transaction({ ...params, sorter, ...filter, is_detail_report: true })

    } else if (report_type == 3) {

      ss = await getAlert({ ...params, sorter, ...filter, is_report: true })

    } else if (report_type == 4) {
      ss = await operlog({
        ...params, sorter, is_report: true, type: {
          'field': 'type',
          'op': 'eq',
          'data': 1
        }, report_id: {
          'field': 'report_id',
          'op': 'eq',
          'data': report_id
        }
      })
    } else if (report_type == 5) {
      ss = await loginlog({
        ...params, is_report: true, sorter, report_id: {
          'field': 'report_id',
          'op': 'eq',
          'data': report_id
        }
      })
    } else if (report_type == 6) {

      ss = await operlog({
        ...params, sorter, is_report: true, type: {
          'field': 'type',
          'op': 'eq',
          'data': 2
        }, report_id: {
          'field': 'report_id',
          'op': 'eq',
          'data': report_id
        }
      })
    } else if (report_type == 7) {

      ss = await operlog({
        ...params, sorter, is_report: true, type: {
          'field': 'type',
          'op': 'eq',
          'data': 3
        }, report_id: {
          'field': 'report_id',
          'op': 'eq',
          'data': report_id
        }
      })
    } else {
      ss = await reportSummary({ ...params, sorter, ...filter })
    }

    setStart_time(ss.start_time)
    setEnd_time(ss.end_time)


    setMPPagination({ total: ss.total })
    setData(ss.data)
  }

  //--MP end

  var fd = useLocation()?.state

  useEffect(() => {


    setFormData(fd)



    flow({ sorter: { sort: 'ascend' } }).then((res) => {
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



    organization({ sorter: { name: 'ascend' } }).then((res) => {
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
  /**
   * @en-US International configuration
   * */
  const intl = useIntl();
  const access = useAccess();



  var columns = [
    {
      title: (<FormattedMessage id="pages.transaction.transactionID" defaultMessage="EOS ID" />),
      dataIndex: 'eos_id',
      render: (dom, entity) => {
        return "E" + dom
      },
      sorter: true,
      mustSelect: true
    },
    {
      title: <FormattedMessage id="pages.transaction.xxx" defaultMessage="Transaction Status" />,
      dataIndex: 'status',
      sorter: true,
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
      valueType: "dateTime",
      sorter: true,
      dataIndex: 'start_of_transaction',

    },
    {
      title: <FormattedMessage id="pages.transaction.endOfTransaction" defaultMessage="End Of Transaction" />,
      valueType: "dateTime",
      sorter: true,
      dataIndex: 'end_of_transaction',


    },
    {
      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Number of Amber Alert(s) Triggered " />,
      dataIndex: 'amber_alert_num',


    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Number of Red Alert(s) Triggered" />,
      dataIndex: 'red_alert_num',


    },


    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Number of Amber Alert(s) Triggered (Threshold created by Others)" />,
      dataIndex: 'amber_alert_num_customer',


    },

    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Number of Red Alert(s) Triggered (Threshold created by Others)" />,
      dataIndex: 'red_alert_num_customer',


    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Entire/Current Duration" />,
      dataIndex: 'total_duration',
      sorter: true,
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
      sorter: true,
      render: (dom, entity) => {
        if (entity.status == 0) {
          return flowConf[dom]
        } else {
          return ""
        }
      }

    },
    {
      title: "Trader",
      dataIndex: 'trader_name',

    },
    {
      title: <FormattedMessage id="pages.transaction.jettyName" defaultMessage="Terminal" />,
      dataIndex: 'terminal_name',

    },
    {
      title: <FormattedMessage id="pages.transaction.jettyName" defaultMessage="Jetty Name" />,
      dataIndex: 'jetty_name',

    },
    {
      title: <FormattedMessage id="pages.transaction.arrivalID" defaultMessage="Arrival ID" />,
      dataIndex: 'arrival_id',

    },
    {
      title: <FormattedMessage id="pages.transaction.imoNumber" defaultMessage="IMO Number" />,
      dataIndex: 'imo_number',
      sorter: true,
    },
    {
      title: <FormattedMessage id="pages.transaction.vesselName" defaultMessage="Vessel Name" />,
      dataIndex: 'vessel_name',
      sorter: true,
    },
    {
      title: <FormattedMessage id="pages.transaction.xxx" defaultMessage="Vessel Size" />,
      dataIndex: 'vessel_size_dwt',
      sorter: true,
    },
    {
      title: <FormattedMessage id="pages.transaction.xxx" defaultMessage="Total Nominated Quantity (Bls-60-F)" />,
      dataIndex: 'product_quantity_in_bls_60_f',
      sorter: true,
      render: (dom, entity) => {
        if (dom) {
          return numeral(dom).format('0,0')
        }

      },
    },
    {
      title: <FormattedMessage id="pages.transaction.xxx" defaultMessage="Total nominated Qty (L-obs)" />,
      dataIndex: 'product_quantity_in_l_obs',
      sorter: true,
      render: (dom, entity) => {
        if (dom) {
          return numeral(dom).format('0,0')
        }

      },
    },
    {
      title: <FormattedMessage id="pages.transaction.xxx" defaultMessage="Total nominated Qty (L-15-C)" />,
      dataIndex: 'product_quantity_in_l_15_c',
      sorter: true,
      render: (dom, entity) => {
        if (dom) {
          return numeral(dom).format('0,0')
        }

      },
    },
    {
      title: <FormattedMessage id="pages.transaction.xxx" defaultMessage="Total nominated Qty (Mt)" />,
      dataIndex: 'product_quantity_in_mt',
      sorter: true,
      render: (dom, entity) => {
        if (dom) {
          return numeral(dom).format('0,0')
        }

      },
    },
    {
      title: <FormattedMessage id="pages.transaction.xxx" defaultMessage="Total nominated Qty (MtV)" />,
      dataIndex: 'product_quantity_in_mtv',
      sorter: true,
      render: (dom, entity) => {
        if (dom) {
          return numeral(dom).format('0,0')
        }

      },
    },

    {
      title: "Product Type(S)",
      sorter: true,
      dataIndex: 'product_name',

    }


  ];





  const sharedOnCell = (_: DataType, index: number) => {

    return { colSpan: 0 };



  };

  const columns2 = [

    {
      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="EOS ID" />,
      dataIndex: 'eos_id',
      mustSelect: true,
      render: (dom, entity) => {
        return "E" + dom
      }

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Vessel Name" />,
      dataIndex: 't.vessel_name',

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Arrival ID" />,
      dataIndex: 't.arrival_id',

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Arrival ID Status" />,
      dataIndex: 't.arrival_id_status',

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="IMO Number" />,
      dataIndex: 't.imo_number',

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Process" />,
      dataIndex: 'flow_pid',
      valueEnum: flowConf,
      mustSelect: true
    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Event Name" />,
      dataIndex: 'flow_id',
      valueEnum: flowConf,
      mustSelect: true
    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Event Time" />,
      dataIndex: 'event_time',
      valueType: "dateTime",
      mustSelect: true
    },

    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Agent" />,
      dataIndex: 'agent',

    },

    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Work Order ID" />,
      dataIndex: 'work_order_id',
      mustSelect: true
    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Work order Status" />,
      dataIndex: 'work_order_status',

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Operation Type" />,
      dataIndex: 'work_order_operation_type',

    },

    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Surveyor Name" />,
      dataIndex: 'work_order_surveyor',

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Sequence No." />,
      dataIndex: 'work_order_sequence_number',
      mustSelect: true
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

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Threshold/Alert" />,
      dataIndex: 'threshold_alert',
      mustSelect: true
    },

    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Alert" />,
      dataIndex: 'alertList',
      mustSelect: true,
      children: [
        {

          title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Alert ID" />,
          dataIndex: 'alert_id',
          mustSelect: true,
          width: 120,
          render: (dom, entity) => {


            return entity.alertList.length > 0 ? <ProTable<TransactionListItem, API.PageParams>



              pagination={false}
              showHeader={false}
              size="small"
              dataSource={entity.alertList}
              rowKey="id"
              options={false}
              search={false}
              className="myspantable"
              bordered={false}
              columns={[

                {
                  title: <FormattedMessage id="pages.role.xxx" defaultMessage="Alert ID" />,
                  dataIndex: 'alert_id',
                  width: 120,
                  render: (dom, entity) => {
                    return (

                      "A" + entity.alert_id

                    );

                  }
                },
                {
                  title: "Alert Raised",
                  dataIndex: 'type',
                  width: 120,
                  hideInSearch: true,
                  valueType: 'text',

                  render: (dom, entity) => {

                    return (<div><div style={{ display: dom == 0 ? "block" : "none" }}> <SvgIcon style={{ color: "#DE7E39" }} type="icon-yuan" /> Amber</div>
                      <div style={{ display: dom == 1 ? "block" : "none" }}><SvgIcon style={{ color: "red" }} type="icon-yuan" /> Red</div></div>)
                  },
                },
                {
                  title: <FormattedMessage id="pages.alertrule.xxx" defaultMessage="Threshold Triggered Time" />,
                  dataIndex: 'created_at',
                  width: 200,
                  hideInSearch: true,

                  sorter: true,
                  valueType: 'dateTime',
                },
                {
                  title: "Threshold ID",
                  width: 120,
                  dataIndex: 'ar.alertrule_id',
                  render: (dom, entity) => {
                    return (

                      "T" + entity["ar.alertrule_id"]

                    );

                  }
                },

              ]}
              rowSelection={false}
            /> : "-"

          },
          onCell: (_, index) => ({
            colSpan: 4,
          }),
        },
        {

          title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Alert Type" />,
          width: 120,
          dataIndex: 'alert_type',
          onCell: sharedOnCell,
        },
        {

          title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Alert Triggered Time" />,
          width: 200,
          dataIndex: 'alert_triggered_time',
          onCell: sharedOnCell,
        },
        {

          title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Threshold ID" />,
          width: 120,
          mustSelect: true,
          dataIndex: 'threshold_id',
          onCell: sharedOnCell,
        },
      ]
    },



    {
      title: "Update Log",
      dataIndex: "transactioneventlogList",
      children: [
        {
          title: "Type Of Data",
          width: 200,
          dataIndex: "TypeOfData",
          render: (dom, entity) => {



            var c = entity







            var logObjArr = []
            var newList = [c, ...entity.transactioneventlogList]

           
            newList.forEach((aa, index) => {
              if (index < newList.length && aa && newList[index + 1]) {
                var diff = getDiff(aa, newList[index + 1])

                if (diff) {
                  for (var m in diff) {
                    if (m != 'created_at' && m != 'updated_at' && m != 'id' && m != 'event_duration'
                      && m != 'threshold_alert' && m != "blockchain_hex_key" && m != 'transactioneventlogList' && m != 'alertList' && m != "eos_id" && m.indexOf("t.") == -1) {
                      var obj = {
                        TypeOfData: keyNameMap[m],
                        PreviousValue: newList[index + 1][m],
                        NewValue: aa[m],
                        UpdateTime: aa.created_at
                      }
                      logObjArr.push(obj)
                    }

                  }
                }


              }

            })

            return entity.transactioneventlogList?.length > 0 ? <ProTable<TransactionListItem, API.PageParams>


              bordered={false}
              pagination={false}
              showHeader={false}
              size="small"
              dataSource={logObjArr}
              rowKey="id"
              options={false}
              search={false}
              className="myspantable"

              columns={[{
                title: "Type Of Data",
                dataIndex: "TypeOfData",
                width: 200,
              },
              {
                title: "Previous Value",
                dataIndex: "PreviousValue",
                width: 200,
                render: (dom, entity) => {
                  if (entity.TypeOfData == "Event Time") {
                    return moment(dom).format('YYYY-MM-DD HH:mm:ss')
                  } else {
                    return dom
                  }

                }
              },
              {
                title: "New Value",
                dataIndex: "NewValue",
                width: 200,
                render: (dom, entity) => {
                  if (entity.TypeOfData == "Event Time") {
                    return moment(dom).format('YYYY-MM-DD HH:mm:ss')
                  } else {
                    return dom
                  }

                }
              },
              {
                title: "Update Time",
                dataIndex: "UpdateTime",
                width: 200,
                render: (dom, entity) => {
                  return moment(dom).format('YYYY-MM-DD HH:mm:ss')
                }
              }]}
              rowSelection={false}
            /> : "-"

          },
          onCell: (_, index) => ({
            colSpan: 4,
          }),
        },
        {
          title: "Previous Value",
          dataIndex: "PreviousValue",
          width: 200,
          onCell: sharedOnCell,
          render: (dom, entity) => {
            if (entity.TypeOfData == "Event Time") {
              return moment(dom).format('YYYY-MM-DD HH:mm:ss')
            } else {
              return dom
            }

          }
        },
        {
          title: "New Value",
          dataIndex: "NewValue",
          width: 200,
          onCell: sharedOnCell,
          render: (dom, entity) => {
            if (entity.TypeOfData == "Event Time") {
              return moment(dom).format('YYYY-MM-DD HH:mm:ss')
            } else {
              return dom
            }

          }
        },
        {
          title: "Update Time",
          dataIndex: "UpdateTime",
          width: 200,
          onCell: sharedOnCell,
          render: (dom, entity) => {
            return moment(dom).format('YYYY-MM-DD HH:mm:ss')
          }
        }
      ]
    },


  ]
  const columns3 = [
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Alert ID" />,
      dataIndex: 'alert_id',
      render: (dom, entity) => {
        return "A" + dom
      },
      mustSelect: true

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


    },

    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Alert Triggered Time" />,
      dataIndex: 'created_at',
      valueType: 'dateTime',


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

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Threshold Limit" />,
      dataIndex: 'ar.amber_hours',
      renderPrint: (dom, entity) => {
        entity.amber_hours = entity['ar.amber_hours']
        entity.amber_mins = entity['ar.amber_mins']
        entity.red_hours = entity['ar.red_hours']
        entity.red_mins = entity['ar.red_mins']
        return (entity.amber_hours || entity.amber_mins ? ("Amber: " + (entity.amber_hours ? entity.amber_hours : '0') + "h " + (entity.amber_mins ? entity.amber_mins : '0') + "m") : "") +
          (entity.red_hours || entity.red_mins ? (" Red: " + (entity.red_hours ? entity.red_hours : '0') + "h " + (entity.red_mins ? entity.red_mins : '0') + "m") : "")

      },
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


    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Threshold Process/ Events" />,
      dataIndex: 'flow_id',

      valueEnum: flowConf,
      render: (dom, entity) => {
        if (entity.alertrule_type == 0) {
          return flowConf[entity.flow_id]
        } else if (entity.alertrule_type == 1) {
          return flowConf[entity.flow_id] + " -> " + flowConf[entity.flow_id_to]
        } else {
          return '-'
        }

      }
    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Transaction Total/ Current Duration" />,
      dataIndex: 'total_duration',
      render: (dom, entity) => {

        return parseInt((dom / 3600) + "") + "h " + parseInt((dom % 3600) / 60) + "m"



      },

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Vessel IMO Number" />,
      dataIndex: 't.imo_number',


    },

    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Vessel Name" />,
      dataIndex: 't.vessel_name',

    },

    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Threshold Condition: Vessel Size" />,
      dataIndex: 'ar.vessel_size_dwt_from',
      render: (dom, entity) => {
        if (entity["ar.vessel_size_dwt_from"] != null && entity["ar.vessel_size_dwt_to"]) {

          var valueEnum = {
            "0-25000": "GP",
            "25000-45000": "MR",
            "45000-80000": "LR1",
            "80000-120000": "AFRA",
            "120000-160000": "LR2",
            "160000-320000": "VLCC",
            "320000-1000000000": "ULCC",
          }

          return valueEnum[entity["ar.vessel_size_dwt_from"] + "-" + entity["ar.vessel_size_dwt_to"]];
        } else {
          return '-'
        }

      },
    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Transaction Vessel Size" />,
      dataIndex: 't.vessel_size_dwt',

    },



    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Threshold Condition: Nominated Quantity Range (from - to)" />,
      dataIndex: 'ar.product_quantity_from',
      render: (dom, entity) => {
        if (entity["ar.product_quantity_from"]) {
          return numeral(entity["ar.product_quantity_from"]).format('0,0') + " - " + numeral(entity["ar.product_quantity_from"]).format('0,0')
        } else {
          return '-'
        }

      },

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Transaction Nominated Quantity" />,
      dataIndex: 't.product_quantity',
      render: (dom, entity) => {
        return entity['t.product_quantity_in_' + entity["ar.uom"]]

      },





    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="UOM" />,
      dataIndex: 'ar.uom',
      valueEnum: {
        "l_obs": "L-obs",
        "l_15_c": "L-15-C",
        "mt": "Mt",
        "mtv": "MtV",
        "bls_60_f": "Bls-60-F",

      }

    },
    {
      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Product Type" />,
      dataIndex: 't.product_name',


    },
    {
      title: "Trader",
      dataIndex: 't.trader_name',

    },
    {
      title: <FormattedMessage id="pages.transaction.jettyName" defaultMessage="Terminal" />,
      dataIndex: 't.terminal_name',

    },

    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Threshold Set By" />,
      dataIndex: 'ar.username',
    },

    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage=" Date of Threshold Alert Creation" />,
      valueType: 'dateTime',
      dataIndex: 'ar.created_at',
    }

  ]





  if (report_type == 1) {

    for (var k in processes) {
      if (k != "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa") {
        columns.push({
          title: "Duration of " + processes[k] + " Processes",

          render: (dom, entity) => {
            if (dom > 0 && entity.status == 1) {
              return parseInt((dom / 3600) + "") + "h " + parseInt((dom % 3600) / 60) + "m"
            } else {
              return '-'
            }


          },
          dataIndex: k,

        })
      }


    }

    columns = columns
  } else if (report_type == 2) {

    columns = columns2
  } else if (report_type == 3) {

    columns = columns3
  } else if (report_type == 5) {

    columns = columns5
  } else if (report_type == 4) {

    columns = columns4
  } else if (report_type == 6) {

    columns = columns6
  } else if (report_type == 7) {

    columns = columns7
  }
  if (Fields.length > 0) {
    var arr = []
    Fields.map((a) => {
      return columns.find((b) => {


        if (a == b.dataIndex) {
          if (b.children) {
            b.children.forEach((bb) => {
              arr.push(bb)
            })
          } else {
            arr.push(b)
          }

        }
      })
    })

    columns = arr

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
      title: <>{value?.name} {dateStr && "-"} {dateStr} {!dateStr ? moment(start_time).format('YYYY/MM/DD') + "-" + moment(end_time).format('YYYY/MM/DD') : ""}</>,
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
          onClick={() => exportCSV(selectedRowsState, columns, report_name)}
        ><FileExcelOutlined /> <FormattedMessage id="pages.CSV" defaultMessage="CSV" />
        </Button>

      ]
    }}>

      {!isMP && (<ConfigProvider renderEmpty={customizeRenderEmpty}><RcResizeObserver
        key="resize-observer"
        onResize={(offset) => {
          ResizeObserverDo(offset, setResizeObj, resizeObj)

        }}
      ><ProTable<TransactionListItem, API.PageParams>

          scroll={{ x: columns.length * 140, y: resizeObj.tableScrollHeight }}

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

              ss = await transaction({
                ...params, sorter, ...filter, is_report: true, report_id: {
                  'field': 'report_id',
                  'op': 'eq',
                  'data': report_id
                }
              })

            } else if (report_type == 2) {

              ss = await transaction({
                ...params, sorter, ...filter, is_detail_report: true, report_id: {
                  'field': 'report_id',
                  'op': 'eq',
                  'data': report_id
                }
              })

            } else if (report_type == 3) {

              ss = await getAlert({
                ...params, sorter, ...filter, is_report: true, report_id: {
                  'field': 'report_id',
                  'op': 'eq',
                  'data': report_id
                }
              })

            } else if (report_type == 4) {
              ss = await operlog({
                ...params, sorter, is_report: true, type: {
                  'field': 'type',
                  'op': 'eq',
                  'data': 1
                }, report_id: {
                  'field': 'report_id',
                  'op': 'eq',
                  'data': report_id
                }
              })
            } else if (report_type == 5) {
              ss = await loginlog({
                ...params, sorter, is_report: true, report_id: {
                  'field': 'report_id',
                  'op': 'eq',
                  'data': report_id
                }
              })
            } else if (report_type == 6) {

              ss = await operlog({
                ...params, sorter, is_report: true, type: {
                  'field': 'type',
                  'op': 'eq',
                  'data': 2
                }, report_id: {
                  'field': 'report_id',
                  'op': 'eq',
                  'data': report_id
                }
              })
            } else if (report_type == 7) {

              ss = await operlog({
                ...params, sorter, is_report: true, type: {
                  'field': 'type',
                  'op': 'eq',
                  'data': 3
                }, report_id: {
                  'field': 'report_id',
                  'op': 'eq',
                  'data': report_id
                }
              })
            } else {
              ss = await reportSummary({ ...params, sorter, ...filter })
            }



            setStart_time(ss.start_time)
            setEnd_time(ss.end_time)
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
       
      </div>

      {/* Calling the printing module */}
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
    </PageContainer>
  );
};

export default TableList;
