import RcResizeObserver from 'rc-resize-observer';

import { addTransaction, removeTransaction, transaction, updateTransaction } from './service';
import { PlusOutlined, SearchOutlined, PrinterOutlined, FileExcelOutlined, ExclamationCircleOutlined, FormOutlined, DeleteOutlined, EllipsisOutlined,SwapOutlined,SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { TransactionList, TransactionListItem } from './data.d';
import FrPrint from "../../components/FrPrint";
import { exportCSV } from "../../components/export";
import FileSaver from "file-saver";
import { history } from '@umijs/max';
import { GridContent } from '@ant-design/pro-layout';
import numeral from 'numeral';
import moment from 'moment'
import { useAccess, Access } from 'umi';
import { fieldSelectData } from '@/services/ant-design-pro/api';
const Json2csvParser = require("json2csv").Parser;
import MPSort from "@/components/MPSort";
import {
  FooterToolbar,
  ModalForm,
  ProFormSelect,
  PageContainer,
  ProDescriptions,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormText,
  ProCard,
  ProFormTextArea,
  ProFormInstance,
  Search,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, formatMessage, useLocation, useModel } from '@umijs/max';
import { Button, Drawer, Input, message, Modal, Tooltip, Empty, ConfigProvider, FloatButton, SelectProps, Pagination, Popover } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';

import InterfaceForm from './components/InterfaceForm';


import { flow } from '../system/flow/service';
import { alertrule } from '../alertrule/service';
import { organization } from '../system/company/service';
import { producttype } from '../system/producttype/service';
import { jetty } from '../system/jetty/service';
import { isPC } from "@/utils/utils";
const { confirm } = Modal;


//MP
import { InfiniteScroll, List, NavBar, Space, DotLoading } from 'antd-mobile'
import { parseInt, size } from 'lodash';
/**
 * @en-US Add node
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

  const [interfaceModalOpen, handleInterfaceModalOpen] = useState<boolean>(false);

     

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<TransactionListItem>();
  const [selectedRowsState, setSelectedRows] = useState<TransactionListItem[]>([]);

  const [printModalVisible, handlePrintModalVisible] = useState<boolean>(false);
  const [paramsText, setParamsText] = useState<string>('');
  const [flowConf, setFlowConf] = useState<any>({});
  const [organizationMap, setOrganizationMap] = useState<any>({});
  const [organizationList, setOrganizationList] = useState<any>([]);


  const [sumRow, setSumRow] = useState<TransactionListItem>();
  const [processes, setProcesses] = useState<any>([]);
  const [events, setEvents] = useState<any>([]);


  const [resizeObj, setResizeObj] = useState({ searchSpan: 12, tableScrollHeight: 300 });
  //--MP start
  const MPSearchFormRef = useRef<ProFormInstance>();

  const [showMPSearch, setShowMPSearch] = useState<boolean>(false);
  const [isMP, setIsMP] = useState<boolean>(!isPC());

  const [collapse, setCollapse] = useState<boolean>(isPC()?true:false);

  const [MPSorter, setMPSorter] = useState<any>({});
  
  const [organization_id, setOrganization_id] = useState<any>(useLocation()?.state?.organization_id);
  const [dateArr, setDateArr] = useState<any>(useLocation()?.state?.dateArr);
  const [status, setStatus] = useState<any>(useLocation()?.state?.status);
  const [moreOpen, setMoreOpen] = useState<boolean>(false);
  const right = (
    <div style={{ fontSize: 24 }}>
      <Space style={{ '--gap': '16px' }}>
        <SearchOutlined onClick={e => { setShowMPSearch(!showMPSearch) }} />


        <Popover onOpenChange={(v) => { setMoreOpen(v) }} open={moreOpen}  placement="bottom" title={""} content={<div><Button type="primary" style={{ width: "100%" }} key="print"
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
  const [MPPagination, setMPPagination] = useState<string[]>({})
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [MPfilter, setMPfilter] = useState<any>({})
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
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

  


    const append = await transaction({
      ...{
        "current": page,
        "pageSize": 10,
        "sorter": {
          "start_of_transaction": "descend"
        }
      }, ...filter, sorter
    })

    if (page == 1) {
      
      setData([]);
    }

    setMPPagination({ total:append.total})
   
    setData(val => [...val, ...append.data])
    setHasMore(10 * (page - 1) + append.data.length < append.total)
       

    
  }
  async function loadMore(isRetry: boolean) {

    await getData(currentPage, MPfilter)
    setCurrentPage(currentPage + 1)
  }
  //--MP end

  const getOrganizationName = () => {
    if (access.canAdmin) {
      return 'Organization'
    }
    if (!(access.transactions_list_tab() || access.canAdmin)) {
      return 'Terminal'
    }
    if (access.transactions_list_tab()) {
      return 'Customer'
    }
  }


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

      alertrule({  type: 1,tab:'All' }).then((res2) => {
        var d = {}



        res2.data.forEach((r) => {

         
          d[r.flow_id + "_" + r.flow_id_to] = b[r.flow_id] + " -> " + b[r.flow_id_to]
        })

        setEvents(d)

      });
    });

    
    organization({  sorter: { name: 'ascend' } }).then((res) => {
      var b = []

      var typeMap = {}

      var m = {}

      res.data.forEach((r) => {
        m[r.id] = r
        if (currentUser?.role_type == "Super") {
          if (!typeMap[r.type]) {
            typeMap[r.type] = []
          }
          typeMap[r.type].push({ label: r.name, value: r.id })
        } else {
          b.push({ label: r.name, value: r.id })
        }

      })
      setOrganizationMap(m)
      if (currentUser?.role_type == "Super") {
        var a = []
        for (var k in typeMap) {
          a.push({ label: k, options: typeMap[k] })
        }
        setOrganizationList(a)
      } else {
        setOrganizationList(b)
      }



      if (status  && status.length>0) {
       
        formRef.current?.setFieldValue('status', status)
      }

      if (organization_id) {
       
        formRef.current?.setFieldValue('organization_id', organization_id)
      }
      if (dateArr && dateArr[0] && dateArr[1]) {
      
        formRef.current?.setFieldValue('start_of_transaction', dateArr)
      }
      setTimeout(() => {
        formRef.current?.submit();
      },200)
      
      
     




    });





  }, [true]);
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();
  const access = useAccess();
  const [imo_numberData, setImo_numberData] = useState<any>({});
  const [jetty_idData, setJetty_idData] = useState<any>({});

  const [vessel_nameData, setVessel_nameData] = useState<any>({});
  const [product_nameData, setProduct_nameData] = useState<any>({});
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
      fixed: 'left',
      width:120,
 
      sorter: true,
     
      renderText: (dom, entity) => {
        return entity.eos_id
      },
      render: (dom, entity) => {
        return (
          <a
           
            onClick={() => {
              setCurrentRow(entity);
              history.push(`/transaction/detail`,{ transaction_id: entity.id});
              // setShowDetail(true);
            }}
          >
            {"E"+dom}
          </a>
        );
      },
    },

    {
      title: (
        <FormattedMessage
          id="pages.transaction.xxx"
          defaultMessage="Date Range"
        />
      ),
     
      hideInDescriptions: true,
      hideInTable: true,
      hideInSearch:true,
      fieldProps: { placeholder: ['From ', 'To '] },
      defaultSortOrder: 'descend',
      dataIndex: 'start_of_transaction',
      valueType: 'dateRange',
      
      search: {
        transform: (value) => {
          if (value && value.length > 0) {
            return {
              'start_of_transaction': {
                'field': 'start_of_transaction',
                'op': 'between',
                'data': value
              }
            
            }
          }
          
        }
      }



    },
    {
      title: null,
      dataIndex: "aaa",
      hideInTable: true,
      hideInDescriptions:true,
      renderFormItem: () => (<div style={{ width: '100%' }}>

        {!collapse && <div style={{ width: '100%', textAlign: isMP?"center":"right", color: "#FFF" }}> Description  </div>}
       
        <div style={{ width: '100%', marginBottom: 20 }}> <ProFormDateRangePicker label="Date Range"
          width="lg"
          fieldProps={{ placeholder: ['From ', 'To '] }}
          name="start_of_transaction"
        />  </div>
        <div style={{ height: !collapse ? 'auto' : 0, overflow: 'hidden' }}>
          <div style={{ width: '100%',  marginBottom: 20 }}>

            <ProFormSelect label="Product Type"
              width="lg"
              valueEnum={product_nameData }
              name="product_name"
              fieldProps={{
                notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
                showSearch: true,
                mode: 'multiple',
                allowClear: true,
                onFocus: () => {
                  
                  fieldSelectData({ model: "Transaction", value: '', field: 'product_name' }).then((res) => {
                    setProduct_nameData(res.data)
                  })
                },
                onSearch: (newValue: string) => {
                  
                  fieldSelectData({ model: "Transaction", value: newValue, field: 'product_name' }).then((res) => {
                    setProduct_nameData(res.data)
                  })

                }
              }}
          />

        </div>

          <div style={{ width: '100%', marginBottom: 20 }}>

            <ProFormSelect label="Status"
              width="lg"
              name="status"
              fieldProps={{ mode: "multiple" }}
              valueEnum={{
                '0': {
                  text: <FormattedMessage id="pages.transaction.active" defaultMessage="Open" />
                },
                '1': { text: <FormattedMessage id="pages.transaction.closed" defaultMessage="Closed" /> },
                '2': { text: <FormattedMessage id="pages.transaction.cancelled" defaultMessage="Cancelled" /> }
              }}
           
          />

        </div>

          {  <div style={{ width: '100%', marginBottom: isMP?0:0 }}>

            <ProFormSelect label={getOrganizationName()}
              width="lg"
              fieldProps={{
                options: organizationList,
                showSearch: true,
                allowClear: true,
              }}
             
            name="organization_id"
          />

        </div> }
        </div>
      </div>),
      valueType: 'text'

    },
    {
      title: null,
      dataIndex: "bbb",
      hideInTable: true,
      className:"my-search-divider",
      hideInDescriptions: true,
      renderFormItem: () => (<div style={{ width: '100%' }}>

        {!collapse && !isMP && < div style={{ width: '100%', textAlign: "center", color: "#FFF",height:28 }}>  {" " } </div>}

       
        
        <div style={{ width: '100%', marginBottom: 20 }}>

          <ProFormSelect label="IMO Number"
            width="lg"
            name="imo_number"
            valueEnum={imo_numberData}
            fieldProps={{
              notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
              showSearch: true,
              allowClear: true,
              mode: 'multiple',
            
              onFocus: () => {
                fieldSelectData({ model: "Transaction", value: '', field: 'imo_number' }).then((res) => {
                  setImo_numberData(res.data)
                })
              },
              onSearch: (newValue: string) => {

                fieldSelectData({ model: "Transaction", value: newValue, field: 'imo_number' }).then((res) => {
                  setImo_numberData(res.data)
                })

              }
            }}
            />

          </div>
        <div style={{ height: !collapse ? 'auto' : 0, overflow: 'hidden' }}>
          <div style={{ width: '100%', marginBottom: 20 }}>

            <ProFormSelect label="Jetty"
              width="lg"
              name="jetty_id"
              valueEnum={jetty_idData}
              fieldProps={{
                mode: 'multiple',
                onFocus: () => {
                  fieldSelectData({ model: "Transaction", value: '', field: 'jetty_id' }).then((res) => {
                    setJetty_idData(res.data)
                  })
                },
                onSearch: (newValue: string) => {

                  fieldSelectData({ model: "Transaction", value: newValue, field: 'jetty_id' }).then((res) => {
                    setJetty_idData(res.data)
                  })

                },
              notFoundContent: <Empty />,
            }}
            />

          </div>

          <div style={{ width: '100%', marginBottom: 20 }}>

            <ProFormSelect label="Vessel Name"
              width="lg"
              name="vessel_name"
              valueEnum={vessel_nameData}
              fieldProps={
                {
                  notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
                  showSearch: true,
                  mode: 'multiple',
                  allowClear: true,
                  onFocus: () => {
                    fieldSelectData({ model: "Transaction", value: '', field: 'vessel_name' }).then((res) => {
                      setVessel_nameData(res.data)
                    })
                  },
                  onSearch: (newValue: string) => {

                    fieldSelectData({ model: "Transaction", value: newValue, field: 'vessel_name' }).then((res) => {
                      setVessel_nameData(res.data)
                    })

                  }
                }}
            />

          </div>

        </div>

      </div>),
      valueType: 'text'

    },

    
    {
      title:null,
      dataIndex: "ccc",
      hideInTable: true,
      hideInDescriptions: true,
      renderFormItem: () => (<div style={{ width: '100%' }}>

        {!collapse && <div style={{ width: '100%', textAlign: "center", color: "#FFF" }}> Threshold Breached  </div>}

        <div style={{ width: '100%', display: (access.canAdmin || access.transactions_list_tab()) ?'block':'none', marginBottom: 20 }}> <ProFormSelect label="Organization" 
          width="lg"
          name="threshold_organization_id"
          fieldProps={
            {
              notFoundContent: <Empty />,
              options: access.transactions_list_tab() ? [{ label: currentUser?.company_name, value: currentUser?.company_id }, ...organizationList] : organizationList,
              dropdownMatchSelectWidth: isMP ? true : false,
              mode: 'multiple',
              showSearch: false,
              multiple: true

            }} />  </div>
        <div style={{ height: !collapse ? 'auto' : 0, overflow: 'hidden' }}>
          <div style={{ width: '100%', marginBottom: 20 } }> <ProFormSelect label="Entire Transaction And Processes" valueEnum={processes}
            width="lg"
            name="flow_id"
          fieldProps={
            {
              notFoundContent: <Empty />,
             
              dropdownMatchSelectWidth: isMP ? true : false,
              mode: 'multiple',
              showSearch: false,
              multiple: true

            }} />  </div>
          <div style={{ width: '100%', marginBottom:20 }}> <ProFormSelect label="Between Two Events" valueEnum={events}
          width="lg"
          name="flow_id_to"
          fieldProps={
            {
              notFoundContent: <Empty />,

              dropdownMatchSelectWidth: isMP ? true : false,
              mode: 'multiple',
              showSearch: false,
              multiple: true

            }} />  </div>

        </div>
      </div>),
      valueType: 'text'
    
    },
    {
      title: <FormattedMessage id="pages.transaction.startOfTransaction" defaultMessage="Start Of Transaction" />,
      dataIndex: 'start_of_transaction',
      sorter: true,
      width: 150,
      defaultSortOrder:'descend',
      valueType: 'date',
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.transaction.endOfTransaction" defaultMessage="End Of Transaction" />,
      dataIndex: 'end_of_transaction',
      valueType: 'text',
      width: 150,
      sorter: isMP?false:true,
      hideInSearch: true,
      render: (dom, entity) => {
        if (entity.status == 1) {
          return dom ? moment(new Date(dom)).format('YYYY-MM-DD'):"-"
        } else {
          return "-"
        }
      }


      
    },
    {
      title: <FormattedMessage id="pages.transaction.status" defaultMessage="Status" />,
      dataIndex: 'status',
      sorter: isMP ? false : true,
      hideInSearch: true,
      width: 120,
      defaultSortOrder: 'ascend',
      search: {
        transform: (value) => {

          if (value && value.length>0) {
            return {

              status: {
                'field': 'status',
                'op': 'in',
                'data':value
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
      width: 120,
      sorter: isMP ? false : true,
      hideInSearch: true
    },
    
    {
     
      title: <FormattedMessage id="pages.transaction.currentProcess" defaultMessage="Current Process" />,
      dataIndex: 'flow_id',
      width: 180,
     // valueEnum: flowConf,
      sorter: isMP ? false : true,
      fieldProps: {
        notFoundContent: <Empty />,
      },
      render: (dom, entity) => {
        if (entity.status == 0) {
          return flowConf[dom]
        } else {
          return "-"
        }
      },
      hideInSearch: true,
    },
   
   
    {
      title: <FormattedMessage id="pages.transaction.imoNumber" defaultMessage="IMO Number" />,
      dataIndex: 'imo_number',
      sorter: isMP ? false : true,
      hideInSearch: true,
      width: 120,
      search: {
        transform: (value) => {
          if (value && value.length > 0) {
            return {
              'imo_number': {
                'field': 'imo_number',
                'op': 'in',
                'data': value
              }
            }
          }

        }
      }

    },
    {
      title: <FormattedMessage id="pages.transaction.vesselName" defaultMessage="Vessel Name" />,
      dataIndex: 'vessel_name',
      sorter: isMP ? false : true,
      hideInSearch: true,
      width: 150,
      search: {
        transform: (value) => {
          if (value && value.length > 0) {
            return {
              'vessel_name': {
                'field': 'vessel_name',
                'op': 'in',
                'data': value
              }
            }
          }

        }
      }
    },

    {
      title: getOrganizationName(),
      dataIndex: 'organization_id',
      sorter: isMP ? false : true,
      hideInSearch: true,
      hideInTable: true,
      hideInDescriptions:true,
      valueEnum: organizationList,
      render: (dom, entity) => {
        
          return "-"
        
      },
      fieldProps: {
        notFoundContent: <Empty />,
      },
      search: {
        transform: (value) => {
          if (value && value.length>0) {
            return {
              'organization_id': {
                'field': 'organization_id',
                'op': 'eq',
                'data': value
              }
            }
          }

        }
      }
    },


    {
      title: access.transactions_list_tab() ? "Customer" : "Trader",
      dataIndex: 'organization_id',
      width: 200,
      hideInSearch:true,
     
      align: "center",
      hideInTable: !(access.transactions_list_tab() || access.canAdmin) ? true : false,
      render: (dom, entity) => {

        return entity.trader_name
      }
    },
    {
      title: "Terminal",
      dataIndex: 'organization_id',
      width: 200,
      hideInSearch: true,
      
      hideInTable: access.transactions_list_tab() ? true : false,
      align: "center",
      render: (dom, entity) => {

        return entity.terminal_name 
      },
    },

    {
      title: <FormattedMessage id="pages.transaction.jettyName" defaultMessage="Jetty Name" />,
      dataIndex: 'jetty_name',
      sorter: isMP ? false : true,
      hideInSearch:true,
      width: 150,
      fieldProps: {
        notFoundContent: <Empty />,
      },
      search: {
        transform: (value) => {
          if (value && value.length > 0) {
            return {
              'jetty_id': {
                'field': 'jetty_id',
                'op': 'in',
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
      sorter: isMP ? false : true,
      hideInSearch: true,
      width: 180,
      search: {
        transform: (value) => {
          if (value && value.length > 0) {
            return {
              'product_name': {
                'field': 'product_name',
                'op': 'in',
                'data': value
              }
            }
          }

        }
      }
     
     // valueEnum: producttypeList,
    },
    {
      title: <FormattedMessage id="pages.alertrule.totalNominatedQuantityM" defaultMessage="Total Nominated Quantity (MT)" />,
      dataIndex: 'product_quantity_in_mt',
      sorter: isMP ? false : true,
      width:200,
      hideInSearch: true,
      valueType: "text",
      render: (dom, entity) => {
        if (dom ) {


          return numeral(dom).format('0,0') 
        }

      },
    },
    {
      title: <FormattedMessage id="pages.alertrule.totalNominatedQuantityB" defaultMessage="Total Nominated Quantity (Bls-60-F)" />,
      dataIndex: 'product_quantity_in_bls_60_f',
      hideInSearch: true,
      width: 200,
      sorter: isMP ? false : true,
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
      sorter: isMP ? false : true,
      width: 120,
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
      hideInSearch: true,
      hideInDescriptions: true,
      valueEnum: processes,
      fieldProps: {
        notFoundContent: <Empty />,
        width: '300px',
        dropdownMatchSelectWidth: isMP ? true : false,
        mode: 'multiple',
        showSearch: false,
        multiple: true

      },
      search: {
        transform: (value) => {
          if (value && value.length > 0) {
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
      hideInSearch:true,
      width: 200,
      hideInDescriptions: true,
      valueEnum: events,
      fieldProps: {
       
        notFoundContent: <Empty />,
        dropdownMatchSelectWidth: isMP ? true : false,
        width: '300px',
        mode: 'multiple',
        showSearch: false,
        multiple: true

      },
      search: {
        transform: (value) => {
          if (value && value.length > 0) {
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
      dataIndex: 'average_duration_per_volume_of_same_product_name',
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
            record.status = record.status+""
            setCurrentRow(record);
          }}
        >
            <FormOutlined style={{ fontSize: '20px' }} />
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


    <PageContainer className="myPage transactions-page" header={{
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
      
      {!isMP && (<ConfigProvider renderEmpty={customizeRenderEmpty}> <RcResizeObserver
        key="resize-observer"
        onResize={(offset) => {
          const { innerWidth, innerHeight } = window;
          
          var h = document.getElementsByClassName("ant-table-thead")?.[0]?.offsetHeight +400
          if (offset.width > 1280) {
          
            setResizeObj({ ...resizeObj, searchSpan: 8, tableScrollHeight: innerHeight - h });
          }
          if (offset.width < 1280 && offset.width > 900) {
          
            setResizeObj({ ...resizeObj, searchSpan: 12, tableScrollHeight: innerHeight - h });
          }
          if (offset.width < 900 && offset.width > 700) {
            setResizeObj({ ...resizeObj, searchSpan: 24, tableScrollHeight: innerHeight - h });
            
          }

          

        }}
      ><ProTable<TransactionListItem, API.PageParams>

          scroll={{ x: 2400, y: resizeObj.tableScrollHeight }}
          beforeSearchSubmit={(params) => {

           
            delete params.aaa
            delete params.bbb
            delete params.ccc
            columns.forEach((c) => {
              if (c.search?.transform) {
               
                  var p = c.search?.transform(params[c.dataIndex])
                  params = { ...params, ...p }
                
              
              }
            })
           
            
              
            
            return params
          } }
        formRef={formRef}
        bordered size="small"
          actionRef={actionRef}
          pagination={ {size:"default"}}
        rowKey="id"
        options={false}
          search={{
            layout: "vertical",
            onCollapse: (collapsed) => {
              setCollapse(collapsed)
            },
            labelWidth: 210,
          
          span: 8,
          searchText: < FormattedMessage id="pages.search" defaultMessage="Search" />
        }}
        className="mytable"
          request={(params, sorter) => { return transaction({ ...params, sorter }) }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
        /></RcResizeObserver></ConfigProvider >)}

      {isMP && (<>

        <NavBar backArrow={false} left={
          <MPSort columns={columns} onSort={(k) => {
            setMPSorter(k)
            getData(1)
          }} />} right={right} onBack={back}>
          {intl.formatMessage({
            id: 'pages.transaction.title',
            defaultMessage: 'Summary Of All Transactions',
          })}
        </NavBar>

        <div style={{ padding: '20px', backgroundColor: "#5000B9", display: showMPSearch ? 'block' : 'none' }}>
          <Search columns={columns.filter(a => !(a.hasOwnProperty('hideInSearch') && a['hideInSearch']))} action={actionRef} loading={false}
            beforeSearchSubmit={(params) => {
              columns.forEach((c) => {
                if (c.search?.transform) {
                  var p = c.search?.transform(params[c.dataIndex])
                  params = { ...params, ...p }
                }
              })
              if (params.status == 0 || params.status == 1 || params.status == 2) {

              } else {
                delete params.status
              }
              return params
            }}
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

        {/* <Pagination onChange={() => {


        }} total={50} />*/ }

        <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
          <InfiniteScrollContent hasMore={hasMore} />
        </InfiniteScroll>
        <FloatButton.BackTop visibilityHeight={0} />
      </>)}
      {selectedRowsState?.length > 0 && (
        <Access accessible={access.canAdmin} fallback={<div></div>}>
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
          </Access>
      )}

     

      <InterfaceForm
        onSubmit={async (value) => {
          value.id = currentRow?.id
          const success = await handleAdd(value as TransactionListItem);
          if (success) {
            handleInterfaceModalOpen(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          handleInterfaceModalOpen(false);
          if (!showDetail) {
            setCurrentRow(undefined);
          }
        }}
        createModalOpen={interfaceModalOpen}
       
      />
      
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
        dataSource={[...(isMP?data:selectedRowsState)/*, sumRow*/]}
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
      </PageContainer>
  );
};

export default TableList;
