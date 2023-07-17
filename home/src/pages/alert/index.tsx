import RcResizeObserver from 'rc-resize-observer';

import { addAlert, removeAlert, alert as getAlert, updateAlert } from './service';
import { fieldSelectData } from '@/services/ant-design-pro/api';
import { updateTransaction } from '../transaction/service';
import { getInitialState } from '../../app';
import { Empty } from 'antd';
import { PlusOutlined, SearchOutlined, ExclamationCircleOutlined, FormOutlined, DeleteOutlined, SwapOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import { ActionType, ProColumns, ProDescriptionsItemProps, ProCard } from '@ant-design/pro-components';
import { AlertList, AlertListItem } from './data.d';
import { flow } from '../system/flow/service';
import { alertrule } from '../alertrule/service';
import { SvgIcon } from '@/components' 

import { organization } from '../system/company/service';
import { history } from '@umijs/max';
import numeral from 'numeral';
import { jetty } from '../system/jetty/service';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  ProFormTextArea,
  ProFormInstance,
  Search,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, useLocation, formatMessage, useModel } from '@umijs/max';
import { Button, Drawer, Input, message, Modal, ConfigProvider, FloatButton, Popover } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import { tree, isPC } from "@/utils/utils";
import { useAccess, Access } from 'umi';

import MPSort from "@/components/MPSort";

//MP
import { InfiniteScroll, List, NavBar, Space, DotLoading } from 'antd-mobile'
import { before, forEach } from 'lodash';
const { confirm } = Modal;

/**
 *  Delete node
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: AlertListItem[]) => {



  const hide = message.loading(<FormattedMessage
    id="pages.deleting"
    defaultMessage="Deleting"
  />);
  if (!selectedRows) return true;

  confirm({
    title: 'Delete record?',
    icon: <ExclamationCircleOutlined />,
    content: 'The deleted record cannot be restored. Please confirm!',
    onOk() {
      try {
         removeAlert({
          id: selectedRows.map((row) => row.id),
        });
        hide();
        message.success(<FormattedMessage
          id="pages.deletedSuccessfully"
          defaultMessage="Deleted successfully and will refresh soon"
        />);
        return true;
      } catch (error) {
        hide();
        message.error(<FormattedMessage
          id="pages.deleteFailed"
          defaultMessage="Delete failed, please try again"
        />);
        return false;
      }
    },
    onCancel() { },
  });

  
};

/**
 * @en-US Update node
 *
 * @param fields
 */
const handleUpdate = async (fields: Partial<any>) => {
  const hide = message.loading(<FormattedMessage
    id="pages.modifying"
    defaultMessage="Modifying"
  />);
  try {
    
    await updateAlert({ remarks: fields['remarks'], id: fields.id });
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
  const [currentRow, setCurrentRow] = useState<AlertListItem>();
  const [selectedRowsState, setSelectedRows] = useState<AlertListItem[]>([]);
  const [producttypeList, setProducttypeList] = useState<any>({});
  const [organizationList, setOrganizationList] = useState<any>([]);
  const [organizationMap, setOrganizationMap] = useState<any>({});
  const [flowConf, setFlowConf] = useState<any>({});
  const [flowTree, setFlowTree] = useState<any>([]);
  const [processes, setProcesses] = useState<any>([]);
  const [events, setEvents] = useState<any>([]);
  const [jetty_idData, setJetty_idData] = useState<any>({});
  const [isMP, setIsMP] = useState<boolean>(!isPC());
  const [organization_id, setTerminal_id] = useState<any>(useLocation()?.state?.organization_id);
  const [dateArr, setDateArr] = useState<any>(useLocation()?.state?.dateArr);
  const [status, setStatus] = useState<any>(useLocation()?.state?.status);
  const [flow_id, setFlow_id] = useState<any>(useLocation()?.state?.flow_id);
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
 

  const [tab, setTab] = useState(useLocation()?.state?.tab || 'Terminal');
  

  /**
   * @en-US International configuration
   * */
  const intl = useIntl();
  const access = useAccess();


  const formRef = useRef<ProFormInstance>();
  const [resizeObj, setResizeObj] = useState({ searchSpan: 12, tableScrollHeight: 300 });
  //--MP start
  //const MPSearchFormRef = useRef<ProFormInstance>();

  const [showMPSearch, setShowMPSearch] = useState<boolean>(false);
 
  
  var showNoRead= useLocation()?.state?.showNoRead

  const getOrganizationName = () => {
    if (access.canAdmin) {
      return 'Organization'
    }
    if (!(access.alert_list_tab() || access.canAdmin)) {
      return 'Terminal'
    }
    if (access.alert_list_tab()) {
      return 'Customer'
    }
  }
  const right = (
    <div style={{ fontSize: 24 }}>
      <Space style={{ '--gap': '16px' }}>
        <SearchOutlined onClick={e => { setShowMPSearch(!showMPSearch) }} />

      </Space>
    </div>
  )

  const onFormSearchSubmit = (a) => {
   

    setData([]);
   
   
    setShowMPSearch(!showMPSearch)
    setCurrentPage(1)

    getData(1)
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
  const [MPSorter, setMPSorter] = useState<any>({});

  async function getData(page) {
   
    var sorter = {}
    await setMPSorter((sorter_) => {
       sorter= sorter_
      return sorter_
    })


    var tab1 = ''
    await setTab((tab_) => {
      tab1 = tab_
      return tab_
    })

    var f = {}
    for (var k in formRef.current?.getFieldsValue()) {
      if (formRef.current?.getFieldsValue()[k] != undefined) {
        f[k] = formRef.current?.getFieldsValue()[k]
      }

    }
    var d = {
      ...{
        "current": page,
        "pageSize": 10

      }, ...f, sorter
    }
    

    if (showNoRead) {
      d.showNoRead = 1
    }
    d.tab = {
      'field': 'tab',
      'op': 'eq',
      'data': tab1
    }
   
    const append1 = await getAlert(d)
    if (page == 1) {
      setData([]);
    }
    const append = append1

   
    setData(val => [...val, ...append.data])
    setHasMore(10 * (page - 1) + append.data.length < append.total)
   
   
  }
  async function loadMore(isRetry: boolean) {

    await getData(currentPage)
    setCurrentPage(currentPage + 1)
  }

  

  
  useEffect(() => {
  
    
   
    flow({ sorter: { sort: 'ascend' } }).then((res) => {
      var b = { "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa": "Entire Duration" }
      var p = { "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa": "Entire Duration" }
   
     
      res.data.forEach((r) => {
        if (r.type == 0) {

          p[r.id] = r.name
        }
        b[r.id] = r.name
      })
      setFlowConf(b)
      setProcesses(p)


      var treeData = tree(res.data, "                                    ", 'pid')
      setFlowTree(treeData)
     
      alertrule({
        tab: {
          'field': 'tab',
          'op': 'eq',
          'data': tab
        },
        type: {
          'field': 'type',
          'op': 'eq',
          'data': 1
        }
       }).then((res2) => {
        var d = {}



        res2.data.forEach((r) => {

          d[r.flow_id + "_" + r.flow_id_to] = b[r.flow_id] + " -> " + b[r.flow_id_to]
        })

  setEvents(d)

 

  if (status && status.length>0) {
   

    formRef.current?.setFieldValue('t.status', status)
  }

  if (organization_id) {

    formRef.current?.setFieldValue('organization_id', organization_id)
  }
  if (dateArr && dateArr[0] && dateArr[1]) {
    formRef.current?.setFieldValue('t.start_of_transaction', dateArr)
  }

  if (flow_id) {
    if (flow_id != 'b2e') {
      formRef.current?.setFieldValue('flow_id', [flow_id])
    } else {
      var arr = []
      for (var i in d) {
        arr.push(i)
      }
   
      formRef.current?.setFieldValue('flow_id_to', arr)
    }

    
    
     
      formRef.current?.submit();
    
    

  }





      });
    });

    
   

    organization({ sorter: { name: 'ascend' } }).then((res) => {
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







     


    });



  }, [tab]);


  const [imo_numberData, setImo_numberData] = useState<any>({});
  const columns: ProColumns<AlertListItem>[] = [

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
        dropdownMatchSelectWidth: isMP ? true : false,
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
        notFoundContent: <Empty/>,
        dropdownMatchSelectWidth: isMP ? true : false,
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


    },
    {
      title: (
        <FormattedMessage
          id="pages.alert.transactionId"
          defaultMessage="Alert ID"
        />
      ),
     
      dataIndex: 'alert_id',
      hideInSearch: true,
      sorter: true,
      align: "center",
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              history.push(`/transaction/detail`, { transaction_id: entity.transaction_id });
            
              //setShowDetail(true);
            }}
          >
            {"A"+dom}
          </a>
        );
      },
    },
    {
      title: <FormattedMessage id="pages.alertrule.xxx" defaultMessage="Threshold Triggered Time" />,
      dataIndex: 'created_at',
      width: 200,
      hideInSearch: true,
      defaultSortOrder: 'descend',
      sorter: true,
      valueType: 'dateTime',
    },
    {
      title: <FormattedMessage id="pages.alertrule.type" defaultMessage="Threshold Type" />,
      dataIndex: 'alertrule_type',
      sorter: true,
      hideInSearch: true,
      defaultSortOrder: 'ascend',
     
      valueEnum: {
        0: { text: <FormattedMessage id="pages.alertrule.singleProcess" defaultMessage="Single Process" /> },
        1: { text: <FormattedMessage id="pages.alertrule.betweenTwoEvents" defaultMessage="Between Two Events" /> },
        2: { text: <FormattedMessage id="pages.alertrule.entireTransaction" defaultMessage="Entire Transaction" /> },
      }

    },
    {
      title: (
        <FormattedMessage
          id="pages.alertrule.eee"
          defaultMessage="Threshold Process/Events"
        />
      ),
      dataIndex: 'flow_id',
      width:300,
      hideInSearch: true,
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
      title: <FormattedMessage id="pages.alertrule.xxx" defaultMessage="Alert Raised" />,
      dataIndex: 'type',
      hideInSearch: true,
      valueType: 'text',
      render: (dom, entity) => {

        return (<div><div style={{ display: dom == 0 ? "block" : "none" }}> <SvgIcon style={{ color: "#DE7E39" }} type="icon-yuan" /> Amber</div>
          <div style={{ display: dom == 1 ? "block" : "none" }}><SvgIcon style={{ color: "red" }} type="icon-yuan" /> Red</div></div>)
      },
    },
    {
      title: <FormattedMessage id="pages.alertrule.thresholdLimit" defaultMessage="Threshold Limit" />,
      dataIndex: 'ar.amber_hours',
      hideInSearch: true,
      valueType: 'text',
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
      title: <FormattedMessage id="pages.transaction.xxx" defaultMessage="Total/Current Duration" />,
      dataIndex: 'total_duration',
      sorter: true,
      hideInSearch: true,
      render: (dom, entity) => {
      
          return parseInt((dom / 3600) + "") + "h " + parseInt((dom % 3600) / 60) + "m"
        


      },
      valueType: 'text',
    },

    {
      title: <FormattedMessage id="pages.alertrule.vesselSizeLimit" defaultMessage="Vessel Size Limit (DWT)" />,
      dataIndex: 'ar.vessel_size_dwt_from',
      onFilter: true,
     
      hideInSearch: true,
      valueType: 'text',

      render: (dom, entity) => {
        if (entity['ar.vessel_size_dwt_from'] != null && entity['ar.vessel_size_dwt_to']) {

          var valueEnum = {
            "0-25": "GP",
            "25-45": "MR",
            "45-80": "LR1",
            "80-120": "AFRA",
            "120-160": "LR2",
            "160-320": "VLCC",
            "320-1000000": "ULCC",
          }

          return valueEnum[numeral(entity['ar.vessel_size_dwt_from']).format('0,0') + "-" + numeral(entity['ar.vessel_size_dwt_to']).format('0,0')];
        } else {
          return '-'
        }

      },
    },

    {
      title: <FormattedMessage id="pages.alertrule.ee" defaultMessage="Total Nominated Quantity (Bls-60-F)" />,
      dataIndex: 'ar.product_quantity_in_bls_60_f',
      hideInSearch: true,
      width: 200,
      align: "center",
      valueType: 'text',
      render: (dom, entity) => {
        if (dom) {
          return numeral(dom).format('0,0')
        }

      },
    },
   

    
    
    {
      title: <FormattedMessage id="pages.transaction.imoNumber" defaultMessage="IMO Number" />,
      dataIndex: 't.imo_number',
      align: "center",
      valueEnum: imo_numberData,
      search: {
        transform: (value) => {
          if (value && value.length > 0) {
            return {
              't.imo_number': {
                'field': 't.imo_number',
                'op': 'in',
                'data': value
              }
            }
          }

        }
      },
      fieldProps: {
        notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
        showSearch: true,
        multiple: true,
        mode: "multiple",
        allowClear: true,
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
      }
    },

    {
      title: <FormattedMessage id="pages.alert.productType" defaultMessage="Product Type" />,
      dataIndex: 't.product_name',
      align: "center",
      hideInSearch: true,
     
    },
    
  
    {
      title: getOrganizationName(),
      dataIndex: 'organization_id',
      sorter: true,
      valueEnum: organizationMap,
      render: (dom, entity) => {

        if (access.alert_list_tab() && tab =="Terminal") {
          return organizationMap[entity['t.trader_id']]?.name || "-"
        }
      
        return organizationMap[entity.company_id]?.name || "-"
       
      },
      fieldProps: {
        options: organizationList,
        multiple: true,
        mode: "multiple",
        notFoundContent: <Empty />,
      },
      search: {
        transform: (value) => {
          if (value && value.length>0) {
            return {
              'organization_id': {
                'field': 'organization_id',
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
          id="pages.transaction.xxx"
          defaultMessage="Threshold Triggered Time"
        />
      ),

      hideInDescriptions:true,
      hideInTable: true,
      fieldProps: { placeholder: ['From ', 'To '] },
     
      dataIndex: 'created_at',
      valueType: 'dateRange',

      search: {
        transform: (value) => {
          if (value.length > 0) {
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
      title: <FormattedMessage id="pages.transaction.startOfTransaction" defaultMessage="Start Of Transaction" />,
      dataIndex: 't.start_of_transaction',
   
      valueType: 'date',
      hideInTable: true,
      hideInDescriptions: true,
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.transaction.status" defaultMessage="Status" />,
      dataIndex: 't.status',
      hideInTable: true,
      hideInDescriptions: true,
      fieldProps: {
        multiple: true,
        mode: "multiple",
      },
      sorter: true,
      valueEnum: {
        0: {
          text: <FormattedMessage id="pages.transaction.active" defaultMessage="Open" />
        },
        1: { text: <FormattedMessage id="pages.transaction.closed" defaultMessage="Closed" /> },
        2: { text: <FormattedMessage id="pages.transaction.cancelled" defaultMessage="Cancelled" /> }
      },
      search: {
        transform: (value) => {

          if (value && value.length>0) {
            return {

              't.status': {
                'field': 't.status',
                'op': 'in',
                'data': value
              }

            }
          }

        }
      },
    },
    {
      title: <FormattedMessage id="pages.transaction.jettyName" defaultMessage="Jetty Name" />,
      dataIndex: 't.jetty_id',
      sorter: true,
      valueEnum: jetty_idData,
      fieldProps: {
        multiple: true,
        mode: "multiple",
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
      },
      render: (dom, entity) => {
        
          return entity.jetty_name
        

      },
      search: {
        transform: (value) => {
          if (value) {
            return {
              't.jetty_id': {
                'field': 't.jetty_id',
                'op': 'in',
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

        return <div style={{ position: 'relative',width:'100%' }}><p dangerouslySetInnerHTML={{ __html: dom?.replace(/\n/g, '<br />') }} />

         

          {tab == "Terminal" && <div>
            <Access accessible={access.canAlertMod()} fallback={<div></div>}>
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
           
            </Access>
          </div>}
        </div>;
      },
    
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
      return  <Empty />
    }
    

  }
   
      

     
   
  

  return (
    <RcResizeObserver
      key="resize-observer"
      onResize={(offset) => {
        
        const { innerWidth, innerHeight } = window;
        var h = document.getElementsByClassName("ant-table-thead")?.[0]?.offsetHeight + 300 || 0
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
    >
     
      <PageContainer className="myPage" header={{
        title: isMP ? null : < FormattedMessage id="pages.transactions.xxx" defaultMessage="Threshold Triggered Alerts" />,
      breadcrumb: {},
      extra: isMP ? null : []
      }}>

        {access.alert_list_tab() && <ProCard
          className="my-tab"
          headStyle={{ height: 14, lineHeight: '14px', fontSize: 12 }}
          tabs={{
            type: 'card',
           
            activeKey: tab,
            items: [
              {
                label: <div title="Alerts related to my own Terminal Threshold settings">Terminal</div>,
                key: 'Terminal',
                children: null,
              },
              {
                label: <div title="This threshold alert is reflective of my customer’s threshold alerts">Customer</div>,
                key: 'Trader',
                children: null,
              }
            ],
            onChange: (key) => {

              setTab(key);
              if (isMP) {


                getData(1)


              } else {

                actionRef.current?.reload();


              }
            },
          }}
        />}  
      {!isMP && (<ConfigProvider renderEmpty={customizeRenderEmpty}> <ProTable<AlertListItem, API.PageParams>
          scroll={{ x: 2500, y: resizeObj.tableScrollHeight }}
          bordered size="small"
         
        className="mytable"
        editable={{ type: 'single', editableKeys: ['remarks'] }}
        actionRef={actionRef}
        formRef={formRef}
        rowKey="id"
          search={{
            layout: "vertical",
          labelWidth: 210,
          span: resizeObj.searchSpan,
          searchText: < FormattedMessage id="pages.search" defaultMessage="Search" />
        }}
        toolBarRender={() => [
         
        ]}
          request={async (params, sorter) => {
            
            var d = { ...params, sorter }

            if (showNoRead) {
              d.showNoRead = 1
              
            }
            d.tab = {
              'field': 'tab',
              'op': 'eq',
              'data': tab
            }
            var list = await getAlert(d)
            if (showNoRead) {
             
              var a=await getInitialState()
              setInitialState(a)
            }
        
            return list
        }}
        columns={columns}
          pagination={showNoRead ? false : { pageSize: 20, size: "default" }  }
        options={false}
        rowSelection={false}
        /></ConfigProvider >)}

      {isMP && (<>

          <NavBar backArrow={false} left={
            <MPSort columns={columns} onSort={(k) => {
              setMPSorter(k)
              getData(1)
            }} />} right={right} onBack={back}>
          {intl.formatMessage({
            id: 'pages.alert.xx',
            defaultMessage: 'Threshold Triggered Alerts',
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
        <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
          <InfiniteScrollContent hasMore={hasMore} />
          </InfiniteScroll>
          <FloatButton.BackTop  visibilityHeight={0} />
         
      </>)}
      
      
      <CreateForm
        onSubmit={async (value) => {
          value.id = currentRow?.id
          const success = await handleAdd(value as AlertListItem);
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
          <ProDescriptions<AlertListItem>
            column={isMP ? 1 : 2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<AlertListItem>[]}
          />
        )}
        </Drawer>
        
        
      </PageContainer>
    </RcResizeObserver>
  );
};

export default TableList;
