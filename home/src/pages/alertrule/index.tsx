
import RcResizeObserver from 'rc-resize-observer';
import { addAlertrule, removeAlertrule, alertrule, updateAlertrule } from './service';
import { PlusOutlined, SearchOutlined, MoreOutlined, FormOutlined, DeleteOutlined, InfoCircleOutlined, ExclamationCircleOutlined, PrinterOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps, ProTableProps } from '@ant-design/pro-components';
import { AlertruleList, AlertruleListItem } from './data.d';
import { GridContent } from '@ant-design/pro-layout';
import { flow } from '../system/flow/service';
import FrPrint from "../../components/FrPrint";
//MP
import { InfiniteScroll, List, NavBar, Space, DotLoading } from 'antd-mobile'

import { SvgIcon } from '@/components' // 自定义组件
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  ProFormDigitRange,
  ProFormTextArea,
  ProFormGroup,
  ProFormTreeSelect,
  ProTable,
 
  ProFormInstance,
  Search
} from '@ant-design/pro-components';

import { FormattedMessage, useIntl, useLocation, formatMessage } from '@umijs/max';
import { Button, Drawer, Input, message, TreeSelect, Modal, Space as SpaceA, Empty, ConfigProvider, FloatButton } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import { useAccess, Access } from 'umi';
import { tree,isPC } from "@/utils/utils";
import numeral from 'numeral';
import { event } from '../../.umi/plugin-locale/localeExports';
const { confirm } = Modal;
/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: any) => {
 
  var d = { ...fields }
  console.log(d)
  if ((d.hasOwnProperty('typeArr') && d.typeArr.length > 0) ) {
    
   

  } else {
    message.error(<FormattedMessage
      id="pages.aaa"
      defaultMessage="Please define threshold duration!"
    />);
    return
  }
  
  

  const hide = message.loading(<FormattedMessage
    id="pages.adding"
    defaultMessage="Adding"
  />);
  if (d.total_nominated_quantity_unit=='b') {
    d.total_nominated_quantity_from_b = d.total_nominated_quantity_from_m
    d.total_nominated_quantity_to_b = d.total_nominated_quantity_to_m

    delete d.total_nominated_quantity_from_m
    delete d.total_nominated_quantity_to_m
  }

  if (d.from_to) {
    d.size_of_vessel_from = Number(d.from_to.split("-")[0])
    d.size_of_vessel_to = Number(d.from_to.split("-")[1])
  }
 
  
 
  delete d.total_nominated_quantity_unit
  delete d.from_to
  try {

    
    await addAlertrule(d);
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
const handleUpdate = async (fields: Partial<AlertruleListItem>) => {
  var d = { ...fields }
  if (d.from_to) {

    d.size_of_vessel_from = Number(d.from_to.split("-")[0])
    d.size_of_vessel_to = Number(d.from_to.split("-")[1])
  } else {
    d.size_of_vessel_from =null
    d.size_of_vessel_to = null
  }
  if (d.total_nominated_quantity_from_m ) {

    d['total_nominated_quantity_from_' + d.total_nominated_quantity_unit] = d.total_nominated_quantity_from_m
    d['total_nominated_quantity_to_' + d.total_nominated_quantity_unit] = d.total_nominated_quantity_to_m

    
  }
  if (d.total_nominated_quantity_from_b) {
    d['total_nominated_quantity_from_' + d.total_nominated_quantity_unit] = d.total_nominated_quantity_from_b
    d['total_nominated_quantity_to_' + d.total_nominated_quantity_unit] = d.total_nominated_quantity_to_b
    
  }

  if (d.total_nominated_quantity_unit=='m') {
    d.total_nominated_quantity_from_b = null
    d.total_nominated_quantity_to_b = null
  }
  
  if (d.total_nominated_quantity_unit == 'b') {
    d.total_nominated_quantity_from_m = null
    d.total_nominated_quantity_to_m = null
  }
    var is = false
    
     



     
      
          if (d.hasOwnProperty( "amber_hours") || d.hasOwnProperty( "amber_mins") || d.hasOwnProperty("red_hours") || d.hasOwnProperty("red_mins")) {

            is = true
          }

        

      


    
    if (!is) {
      message.error(<FormattedMessage
        id="pages.aaa"
        defaultMessage="Please enter compulsory threshold alert field for either Amber or Red!"
      />);
      return
    }


  
  const hide = message.loading(<FormattedMessage
    id="pages.modifying"
    defaultMessage="Modifying"
  />);
  try {
    await updateAlertrule(d);
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

const handleRemove = async (selectedRows: AlertruleListItem[],callBack:any) => {
  if (!selectedRows) return true;
  var open=true
  confirm({
    title: 'Delete threshold? ',
    open: open,
    icon: <ExclamationCircleOutlined />,
    content: 'Please note that the deleted threshold cannot be restored!',
    onOk() {


      const hide = message.loading(<FormattedMessage
        id="pages.deleting"
        defaultMessage="Deleting"
      />);
      try {
        removeAlertrule({
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
  const [currentRow, setCurrentRow] = useState<AlertruleListItem>();
  const [selectedRowsState, setSelectedRows] = useState<AlertruleListItem[]>([]);
  const [flowConf, setFlowConf] = useState<any>({});
  const [flowTree, setFlowTree] = useState<any>([]);
  const [processes, setProcesses] = useState<any>([]);
  const restFormRef = useRef<ProFormInstance>();
  const [resizeObj, setResizeObj] = useState({ searchSpan: 12, tableScrollHeight: 300, width:0 });
  //--MP start
  const MPSearchFormRef = useRef<ProFormInstance>();
  const [printModalVisible, handlePrintModalVisible] = useState<boolean>(false);
  const [showMPSearch, setShowMPSearch] = useState<boolean>(false);
  const [isMP, setIsMP] = useState<boolean>(!isPC());
  const [paramsText, setParamsText] = useState<string>('');
  const right = (
    <div style={{ fontSize: 24 }}>
      <Space style={{ '--gap': '16px' }}>
        <SearchOutlined onClick={e => { setShowMPSearch(!showMPSearch) }} />
        <PlusOutlined onClick={() => { handleModalOpen(true) }} />

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
    const append = await alertrule({
      ...{
        "current": page,
        "pageSize": 10,
        "sorter": {
          "type": "ascend"
        }
      }, ...filter
    })
    
    console.log(append)
    setData(val => [...val, ...append.data])
    setHasMore(10 * (page - 1) + append.data.length < append.total)
  }
  async function loadMore(isRetry: boolean) {
    

    await getData(currentPage , MPfilter)
    setCurrentPage(currentPage + 1)
  }


  

  var  pathname=useLocation().pathname
  //--MP end
  const [events, setEvents] = useState<any>([]);
  useEffect(() => {
    if (pathname == '/threshold/createAlertRule') {
      if (!createModalOpen) {
        handleModalOpen(true)
      }
    }
   

    flow({ sorter: { sort: 'ascend' } }).then((res) => {
      var b = { "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa": intl.formatMessage({
            id: 'pages.alertrule.entireTransaction',
            defaultMessage: 'Entire Transaction',
          }) }
      var p = {
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa": intl.formatMessage({
          id: 'pages.alertrule.entireTransaction',
          defaultMessage: 'Entire Transaction',
        }) }


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
        type: {
          'field': 'type',
          'op': 'eq',
          'data': 1
        } }).then((res2) => {
        var d = {  }



        res2.data.forEach((r) => {

          d[r.flow_id + "_" + r.flow_id_to] = b[r.flow_id] + " -> " + b[r.flow_id_to]
        })

        setEvents(d)

      });
    });
  },[true]);
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();
  const access = useAccess();
  const formRef = useRef<ProFormInstance>();
  const columns: ProColumns<AlertruleListItem>[] = [

    {
      title: <FormattedMessage id="pages.alertrule.type" defaultMessage="Threshold Type" />,
      dataIndex: 'type',
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
          id="pages.alertrule.entireTransactionAndProcesses"
          defaultMessage="Entire Transaction And Processes"
        />
      ),
      dataIndex: 'flow_id',
      hideInTable: true,
      hideInDescriptions:true,
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
          id="pages.alertrule.betweenTwoEvents"
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
       
        dropdownMatchSelectWidth:isMP?true:false,
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
      title: <FormattedMessage id="pages.alertrule.vesselSizeLimit" defaultMessage="Vessel Size Limit (DWT)" />,
      dataIndex: 'from_to',
      hideInTable: true,
      hideInDescriptions: true,
      fieldProps: {

        dropdownMatchSelectWidth: isMP ? true : false,
        width: '300px',
        
       // showSearch: true,


      },
      valueEnum: {
        "0-25": "1. GP (General Purpose): Less than 24.99 DWT",
        "25-45": "2. MR (Medium Range): 25 to 44.99 DWT",
        "45-80": "3. LR1 (Long Range 1): 45 to 79.99 DWT",
        "80-120": "4. AFRA (AFRAMAX): 80 to 119.99 DWT",
        "120-160": "5. LR2 (Long Range 2): 120 to 159.99 DWT",
        "160-320": "6. VLCC (Very Large Crude Carrier): 160 to 319.99 DWT",
        "320-1000000": "7. ULCC (Ultra-Large Crude Carrier): More than 320 DWT",
      },
      search: {
        transform: (value) => {
          if (value) {
            return {
              'size_of_vessel_from': {
                'field': 'size_of_vessel_from',
                'op': 'eq',
                'data': value.split('-')[0]
              },
              'size_of_vessel_to': {
                'field': 'size_of_vessel_to',
                'op': 'eq',
                'data': value.split('-')[1]
              }
            }
          }

        }
      }

    },
    /*{
      title: (
        <FormattedMessage
          id="pages.alertrule.eee"
          defaultMessage="Between two events"
        />
      ),
      dataIndex: 'flow_id_to',
      hideInDescriptions: true,
      hideInTable: true,
      renderFormItem: (_, fieldConfig, form) => {
        if (fieldConfig.type === 'form') {
          return null;
        }
        const status = form.getFieldValue('state');
        if (status !== 'open') {
          return (

            <TreeSelect
              allowClear
              fieldNames={{ label: 'name', value: 'id' }}
              treeData = { flowTree}
            />)
            
        }
        return fieldConfig.defaultRender(_);
      },
    },*/
    {
      title: (
        <FormattedMessage
          id="pages.alertrule.eee"
          defaultMessage="Threshold Process/Events"
        />
      ),
      dataIndex: 'flow_id',
      hideInSearch: true,
      valueEnum: flowConf ,
      render: (dom, entity) => {
        if (entity.type == 0) {
          return flowConf[entity.flow_id]
        } else if (entity.type == 1) {
          return flowConf[entity.flow_id] + " -> "+ flowConf[entity.flow_id_to]
        }else{
          return '-'
        }
       
      }
      
    },

   
    




    {
      title: <FormattedMessage id="pages.alertrule.vesselSizeLimit" defaultMessage="Vessel Size Limit (DWT)" />,
      dataIndex: 'size_of_vessel_from',
      onFilter: true,
      sorter: true,
      hideInSearch: true,
      valueType: 'text',
      
      render: (dom, entity) => {
        if (entity.size_of_vessel_from != null && entity.size_of_vessel_to) {

          var valueEnum = {
            "0-25": "GP",
            "25-45": "MR",
            "45-80": "LR1",
            "80-120": "AFRA",
            "120-160": "LR2",
            "160-320": "VLCC",
            "320-1000000": "ULCC",
          }

          return valueEnum[numeral(entity.size_of_vessel_from).format('0,0') + "-" + numeral(entity.size_of_vessel_to).format('0,0')];
        } else {
          return '-'
        }
        
      },
    },
    {
      title: <FormattedMessage id="pages.alertrule.throughputVolume1" defaultMessage="Total Nominated Quantity (MT)" />,
      dataIndex: 'total_nominated_quantity_from_m',
      fieldProps: { placeholder: ['From', 'To'] },
      valueType: "digitRange",
      width: 200,
      sorter: true,
      render: (dom, entity) => {
        if (entity.total_nominated_quantity_from_m  && entity.total_nominated_quantity_to_m) {

       
          return numeral(entity.total_nominated_quantity_from_m).format('0,0') + " - " + numeral(entity.total_nominated_quantity_to_m).format('0,0')
        } else {
          return '-'
        }
       
      },
      search: {
        transform: (value) => {
          if (value.length > 0) {

            var a = value[0] || 0
            var b = value[1] || 1000000000
           
            return {
              'total_nominated_quantity_from_m': {
                'field': 'total_nominated_quantity_from_m',
                'op': 'between',
                'data': [a,b]
              }
            }
          }

        }
      }
    },
   
    {
      title:"Total Nominated Quantity (Bal-60-F)",
      dataIndex: 'total_nominated_quantity_from_b',
      fieldProps: { placeholder:['From','To']},
      valueType: "digitRange",
      width:200,
      sorter: true,
      render: (dom, entity) => {
        if (entity.total_nominated_quantity_from_b && entity.total_nominated_quantity_to_b ) {
          return numeral(entity.total_nominated_quantity_from_b).format('0,0') + " - " + numeral(entity.total_nominated_quantity_to_b).format('0,0')
        } else {
          return '-'
        }
       
      },
      search: {
        transform: (value) => {
          if (value.length > 0) {
            var a = value[0] || 0
            var b = value[1] || 1000000000
            return {
              'total_nominated_quantity_from_b': {
                'field': 'total_nominated_quantity_from_b',
                'op': 'between',
                'data': [a,b]
              }
             
            }
          }

        }
      }
    },
    
    {
      title: <FormattedMessage id="pages.alertrule.thresholdLimit" defaultMessage="Threshold Limit" />,
      dataIndex: 'amber_hours',
      hideInSearch: true,
      valueType: 'text',
      render: (dom, entity) => {
        return (<div><div style={{ display: entity.amber_hours || entity.amber_mins ?"block":"none" }}> <SvgIcon style={{ color: "#DE8205" }} type="icon-yuan" />{" " + (entity.amber_hours ? entity.amber_hours : '0') + "h " + (entity.amber_mins ? entity.amber_mins : '0') + "m"}</div>
          <div style={{ display: entity.red_hours || entity.red_mins ? "block" : "none" }}><SvgIcon style={{ color: "red" }} type="icon-yuan" />{" " + (entity.red_hours ? entity.red_hours : '0') + "h " + (entity.red_mins ? entity.red_mins :'0') + "m"}</div></div>)
      },
    },
    {
      title: <FormattedMessage id="pages.alertrule.email" defaultMessage="" />,
      dataIndex: 'email',
      hideInSearch: true,
      hideInTable: true,
      hideInDescriptions:true,
      valueType: 'text',
    },
   /* {
      title: <FormattedMessage id="pages.alertrule.sendEmailSelect" defaultMessage="Send Email Select" />,
      dataIndex: 'send_email_select',
      hideInSearch: true,
      hideInTable: true,
      render: (dom, entity) => {

        return dom;
      },
    },*/


    {
      title: <FormattedMessage id="pages.alertrule.userName" defaultMessage="User Name" />,
      dataIndex: 'username',
      hideInSearch: true,
      
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.alertrule.userName" defaultMessage="Date of Threshold Alert Creation" />,
      dataIndex: 'created_at',
      width: 200,
      hideInSearch: true,
      sorter: true,
      valueType: 'dateTime',
    },
    
    
   
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [

        <Access accessible={access.canAlertruleMod()} fallback={<div></div>}>
          <a
            title={formatMessage({ id: "pages.update", defaultMessage: "Modify" })}
            key="config"
            onClick={() => {
              handleUpdateModalOpen(true);

              try {
                if (record.size_of_vessel_from == null && record.size_of_vessel_to == null) {
                  record.from_to = null
                } else {
                  record.from_to = record.size_of_vessel_from + "-" + record.size_of_vessel_to
                }
                record.emailArr = []
                record.typeArr = [1]
                record.email = record.email.split(";")
                record.email.forEach((v, i) => {
                  var a = '' + (new Date()).getTime() + i
                  v = v.split(',')
                  record[a + '_email'] = v[0]
                  v.splice(0, 1)
                  record[a + '_send_type_select'] = v

                  record.emailArr.push(a)

                })

                // record.send_email_select = record.send_email_select.split(",")



              } catch (e) {

              }

              setCurrentRow(record);
            }}
          >
            <FormOutlined style={{ fontSize: '20px' }} />

          </a>
        </Access>
        ,
        <Access accessible={access.canAlertruleDel()} fallback={<div></div>}>
          <a
            title={formatMessage({ id: "pages.delete", defaultMessage: "Delete" })}
            key="config"
            onClick={() => {

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

          </a>
        </Access>
        /*,
          <Access accessible={access.canAlertruleMod()} fallback={<div></div>}>
            <a
              title={formatMessage({ id: "pages.details", defaultMessage: "Details" })  }
            key="config"
            onClick={() => {
              setCurrentRow(record);
              setShowDetail(true);
            
            }}
          >
              <InfoCircleOutlined style={{ fontSize:'20px'} } /> 
           
          </a>
        </Access>*/



        

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
    <RcResizeObserver
      key="resize-observer"
      onResize={(offset) => {
        const { innerWidth, innerHeight } = window;
       
        var h = document.getElementsByClassName("ant-table-thead")?.[0]?.offsetHeight + 300
        if (offset.width > 1280) {
          setIsMP(false)
          setResizeObj({ ...resizeObj, searchSpan: 8, tableScrollHeight: innerHeight - h });
        }
        if (offset.width < 1280 && offset.width > 900) {
          setIsMP(false)
          setResizeObj({ ...resizeObj, searchSpan: 12, tableScrollHeight: innerHeight - h });
        }
        if (offset.width < 900 && offset.width > 700) {
          setResizeObj({ ...resizeObj, searchSpan: 24, tableScrollHeight: innerHeight - h });
          setIsMP(false)
        }
       
        if (offset.width <700) {
          setIsMP(true)
        }

        
      }}
    >
      <PageContainer header={{
        title: isMP ? null : < FormattedMessage id="pages.alertrule.title" defaultMessage="Threshold Limit List" /> ,
      breadcrumb: {},
      extra: isMP?null:[<Access accessible={access.canAlertruleAdd()} fallback={<div></div>}>
        <Button

          type="primary"
          key="primary"
          onClick={() => {
            handleModalOpen(true);
          }}
        >
          <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="Create New" />
        </Button>
      </Access>, <Button type="primary" key="print"
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
        </Button>]
    }}>
      {!isMP && (<ConfigProvider renderEmpty={customizeRenderEmpty}><ProTable<AlertruleListItem, API.PageParams>
       
        formRef={formRef}
        className="mytable"
        actionRef={actionRef}
        rowKey="id"
         scroll={{ x: 1800, y: resizeObj.tableScrollHeight }}
        bordered size="small"
        search={{
          labelWidth: 210,
          span: resizeObj.searchSpan,
          searchText: < FormattedMessage id="pages.search" defaultMessage="Search" />
        }}
        options={false }
        toolBarRender={() => []

        }
        request={(params, sorter) => alertrule({ ...params, sorter })}
        columns={columns}
        rowSelection={access.canAlertruleDel()?{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }:false}
      /></ConfigProvider >)}

      {isMP && (<>
       
        <NavBar backArrow={false} right={right} onBack={back}>
          {intl.formatMessage({
            id: 'pages.alertrule.title',
            defaultMessage: 'Threshold Limit List',
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

            search={{}}
            manualRequest={true}
          />
        </div>
        <List>
          {data.map((item, index) => (
            <List.Item key={index}>

              <ProDescriptions<AlertruleListItem>
                bordered={true}
                size="small"
                layout="horizontal"
                column={1}
                title={item?.process_name}
                request={async () => ({
                  data: item || {},
                })}
                params={{
                  id: item?.id,
                }}
                columns={columns as ProDescriptionsItemProps<AlertruleListItem>[]}
              />

            </List.Item>
          ))}
        </List>
        <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
          <InfiniteScrollContent hasMore={hasMore} />
          </InfiniteScroll>

          <FloatButton.BackTop visibilityHeight={0} />
      </>)}
     
      
      <CreateForm
        onSubmit={async (value) => {
         
          const success = await handleAdd(value as AlertruleListItem);
          if (success) {
            handleModalOpen(false);
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
        //values={currentRow || {}}
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
        width={isMP ? '100%':600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={isMP?true:false}
      >
        {currentRow?.id && (
          <ProDescriptions<AlertruleListItem>
            column={isMP ? 1 : 1}
            title={currentRow?.process_name}
            request={async () => {
              var d = { ...currentRow }
              d.email = d.email.split(";").map((a) => {
                a = a.replace(',a', ',Amber')
                a = a.replace(',r', ',Red')
                return a
              })
               d.email=d.email.join(";")
              return { data: d || {} }


            }}
            params={{
              id: currentRow?.id,
            }}
            columns={columns as ProDescriptionsItemProps<AlertruleListItem>[]}
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
      </RcResizeObserver>
  )
};

export default TableList;
