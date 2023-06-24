import React, { useRef, useState, useEffect,useCallback } from 'react';
import { PageContainer, ProCard, ProColumns, ProDescriptions, ProFormGroup, ProFormSelect, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { AlertOutlined, SafetyCertificateOutlined, FormOutlined, CheckOutlined, ReloadOutlined, FieldTimeOutlined, CalendarOutlined,DownCircleOutlined,EyeOutlined, ExclamationCircleOutlined, AimOutlined } from '@ant-design/icons'; 
import ProTable from '@ant-design/pro-table';
import { FormattedMessage, useIntl, useLocation, useModel, history } from '@umijs/max';
import { TransactionList, TransactionListItem } from '../data.d';
import { transaction, validateBC, transactionevent, addTransactionevent, updateTransactionevent } from '../service';
import { Button, Space, Steps, Icon, Select, message, Spin, Empty, Modal } from 'antd';
import { flow } from '../../system/flow/service';
import { filterOfTimestamps, addFilterOfTimestamps, updateFilterOfTimestamps, removeFilterOfTimestamps } from '../../account/filterOfTimestamps/service';
import { getAlertBytransactionId } from '../../alert/service';
import { SvgIcon } from '@/components' // 自定义组件
import { tree,isPC } from "@/utils/utils";
import FilterForm from '../../account/filterOfTimestamps/components/FilterForm';
import { rearg } from 'lodash';
import { useAccess, Access } from 'umi';
import { terminal } from '../../system/terminal/service';
import { producttype } from '../../system/producttype/service';
import { jetty } from '../../system/jetty/service';
import { alertrule } from '../../alertrule/service';
import { organization } from '../../system/company/service';
import numeral from 'numeral';
var moment = require('moment');

const { Step } = Steps;
const { confirm } = Modal;


var handleget: () => void
var handlegetFlow: (f: any) => void

var handlegetFlowFilter: (f: any) => void


const handleAdd = async (fields: any) => {
  const hide = message.loading(<FormattedMessage
    id="pages.adding"
    defaultMessage="Adding"
  />);
  try {
    await addFilterOfTimestamps({ ...fields });
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


const handleRemove = async (selectedRows: any[], callBack: any) => {
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
        removeFilterOfTimestamps({
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

}

const handleUpdate = async (fields: any) => {
  const hide = message.loading(<FormattedMessage
    id="pages.modifying"
    defaultMessage="Modifying"

  />);
  try {
    await updateFilterOfTimestamps({ ...fields });
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

const Threshold: React.FC<any> = (props) => {
  const {
    hours,
    mins,
    type,
    size,
    opacity,
    ...restProps
  } = props;


  return (hours || mins) ? <span style={{ fontSize: size, opacity: opacity } }><SvgIcon style={{ color: type == "amber" ? "#DE8205" : "red" }} type="icon-yuan" /> {(hours ? hours : 0) + "h " + (mins ? mins : 0) + "m"}</span> : null
}





const Detail: React.FC<any> = (props) => {

  const [currentFilter, setCurrentFilter] = useState<any>();
  const [currentRow, setCurrentRow] = useState<TransactionListItem>();
  const [flowTreeFilter, setFlowTreeFilter] = useState<any>([]);
  const [flowTreeAll, setFlowTreeAll] = useState<any>([]);
  const [flowList, setFlowList] = useState<any>([]);
  const [summaryList, setSummaryList] = useState<any>([]);
  const [transactionAlert, setTransactionAlert] = useState<any>([]);
 
  const [transactioneventMap, setTransactioneventMap] = useState<any>(new Map());
  const [processMap, setProcessMap] = useState<any>({});
 // const [transaction_id, setTransaction_id] = useState<any>("");
  const [filterOfTimestampsList, setFilterOfTimestampsList] = useState<any>([{ value: 'add', label: 'Select/create new timestamp filter' }]);
  const [filterOfTimestampsMap, setFilterOfTimestampsMap] = useState<any>(new Map());
  const [terminalList, setTerminalList] = useState<any>({});
  const [jettyList, setJettyList] = useState<any>({});
  const [producttypeList, setProducttypeList] = useState<any>({});

  const [alertruleProcessMap, setAlertruleProcessMap] = useState<any>({});

  const [alertruleEventList, setAlertruleEventList] = useState<any>([]);
  const [collapsed, setCollapsed] = useState(true);
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [show, setShow] = useState<any>({});
  const [organizationList, setOrganizationList] = useState<any>({});
  const [organization_id, setOrganization_id] = useState<any>("");
  var transaction_id = useLocation()?.state?.transaction_id

  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [isAdd, setIsAdd] = useState<boolean>(false);

  const [totalDuration, setTotalDuration] = useState<any>(0);

  const [flowConf, setFlowConf] = useState<any>({});
  const [isMP, setIsMP] = useState<boolean>(!isPC());

  const [validateStatus, setValidateStatus] = useState<any>(0);
  const [validateData, setValidateData] = useState<any>([]);
  const [selectValue, setSelectValue] = useState<any>(null);
  const [tab, setTab] = useState(useLocation()?.state?.tab || 'Terminal');

  const [thresholdExpand, setThresholdExpand] = useState<boolean>(false);
  
  const getTimeStr=(time)=>{
    return (time ? parseInt((time / 3600) + "") : 0 )+ "h " +( time? parseInt((time % 3600) / 60):0) + "m"
  }

  const access = useAccess();


  const columns1: ProColumns<TransactionListItem>[] = [
    {
      title: <FormattedMessage id="pages.transaction.status" defaultMessage="Status" />,
      dataIndex: 'status',
      valueEnum: {
        0: { text: <FormattedMessage id="pages.transaction.active" defaultMessage="Open" /> },
        1: { text: <FormattedMessage id="pages.transaction.closed" defaultMessage="Closed" /> },
        2: { text: <FormattedMessage id="pages.transaction.cancelled" defaultMessage="Cancelled" /> }
      },
    },
    {
      title: <FormattedMessage id="pages.transaction.startOfTransaction" defaultMessage="Start of transaction" />,
      dataIndex: 'start_of_transaction',
      valueType: 'date',

      align: "center",
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.transaction.endOfTransaction" defaultMessage="End of transaction" />,
      dataIndex: 'end_of_transaction',
      valueType: 'date',
      align: "center",
      hideInSearch: true,
    }
   

    ]

  const columns2: ProColumns<TransactionListItem>[] = [
    {
      title: <FormattedMessage id="pages.transaction.vesselName" defaultMessage="Vessel Name" />,
      dataIndex: 'vessel_name',
      align: "center",
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.transaction.imoNumber" defaultMessage="IMO Number" />,
      dataIndex: 'imo_number',
      hideInSearch: true,
      align: "center",
      valueType: 'text',
    }
   


  ]
  const columns3: ProColumns<TransactionListItem>[] = [
    {
      title: <FormattedMessage id="pages.transaction.terminalName" defaultMessage="Terminal Name" />,
      dataIndex: 'terminal_id',
      valueEnum: terminalList
    },
    {
      title: <FormattedMessage id="pages.transaction.jettyName" defaultMessage="Jetty Name" />,
      dataIndex: 'jetty_id',
      valueEnum: jettyList
    }


  ]


  const columns4: ProColumns<TransactionListItem>[] = [
    {
      title: <FormattedMessage id="pages.alertrule.throughputVolume1" defaultMessage="Total Nominated Quantity (MT)" />,
      dataIndex: 'total_nominated_quantity_m',
      hideInSearch: true,
      valueType: "text",
      render: (dom, entity) => {
        if (dom != null) {
          return numeral(dom).format('0,0')
        } else {
          return '-'
        }

      },
    },
    {
      title: <FormattedMessage id="pages.alertrule.throughputVolume1" defaultMessage="Total Nominated Quantity (Bal-60-F)" />,
      dataIndex: 'total_nominated_quantity_b',
      hideInSearch: true,
      valueType: 'text',
      render: (dom, entity) => {
        if (dom != null) {
          return numeral(dom).format('0,0')
        } else {
          return '-'
        }

      },
    },


  ]

  const columns5: ProColumns<TransactionListItem>[] = [
    {
      title: <FormattedMessage id="pages.transaction.productType" defaultMessage="Product Type" />,
      dataIndex: 'product_type',
      //valueEnum: producttypeList,
    },

  ]


  const columns: ProColumns<TransactionListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.transaction.transactionID"
          defaultMessage="EOS ID"
        />
      ),
      dataIndex: 'eos_id',
      ellipsis: {
        showTitle: true,
      }
     
    },

    {
      title: (
        <FormattedMessage
          id="pages.transaction.timeFrame"
          defaultMessage="Timeframe"
        />
      ),
      sorter: true,
      hideInForm: true,
      hideInTable: true,
      defaultSortOrder: 'descend',
      dataIndex: 'start_of_transaction',
      valueType: 'dateRange',
      search: {
        transform: (value) => {
          return {
            'start_of_transaction__gt': value[0],
            'start_of_transaction__lt': value[1],
          }
        }
      }



    },
    
    {
      title: <FormattedMessage id="pages.transaction.arrivalID" defaultMessage="Arrival ID" />,
      dataIndex: 'arrival_id',
      hideInSearch: true
    },

    {
      title: <FormattedMessage id="pages.transaction.currentProcess" defaultMessage="Current Process" />,
      dataIndex: 'flow_id',
      valueEnum: flowConf

    },
    /*
    {
      title: <FormattedMessage id="pages.transaction.workOrderId" defaultMessage="Work Order ID" />,
      dataIndex: 'work_order_id',
      valueType: 'text',
    },
    
    {
      title: <FormattedMessage id="pages.transaction.productOfVolume" defaultMessage="Volume of Product (A)" />,
      dataIndex: 'product_of_volume',
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <span>
            {dom} m{< sup > 3</sup>}
          </span>
        );
      },
     
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.transaction.traderName" defaultMessage="Trader Name" />,
      dataIndex: 'trader_name',
      valueType: 'text',
    },*/

    
   

   
   

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
    }/*,
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
    }*//*,
    
   
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="config"
          onClick={() => {
            handleUpdateModalOpen(true);
            setCurrentRow(record);
          }}
        >
          <FormattedMessage id="pages.update" defaultMessage="Modify" />
        </a>,
       
      ],
    },*/
  ];

  const getTimeByTwoEvent = (flow_id, flow_id_to) => {
    try {
      return getTimeStr((new Date(transactioneventMap.get(flow_id_to).event_time).getTime() - new Date(transactioneventMap.get(flow_id).event_time).getTime()) / 1000)
    } catch (e) {
      return "-"
    }

    
  }
  useEffect(() => {
    jetty({ sorter: { name: 'ascend' } }).then((res) => {
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

    })

    alertrule({
      organization_id,tab,transaction_id: {
      'field': 'transaction_id',
        'op': 'eq',
      'data': transaction_id
      } }).then((res) => {
      var b = {}
      var c = []
      res.data.forEach((r) => {
        if (r.type != 1) {
          if (!b[r.flow_id]) {
            b[r.flow_id]=[]
          }
         
          b[r.flow_id].push(r)
        } else {
          setCollapsed(false)
          c.push(r)
        }
        
      })
        for (var i in b) {
          b[i]=b[i].sort((a, b) => {
            var sa = (a.amber_hours || 0) * 60 + (a.amber_mins || 0) + (a.red_hours || 0) * 60 + (a.red_mins || 0)
            var sb = (b.amber_hours || 0) * 60 + (b.amber_mins || 0) + (b.red_hours || 0) * 60 + (b.red_mins || 0)
            
            return sa - sb
          })

        }

      setAlertruleProcessMap(b)
      setAlertruleEventList(c)


    });


    getAlertBytransactionId({
      tab,
      organization_id,
      transaction_id: {
       
          'field': 'transaction_id',
          'op': 'eq',
          'data': transaction_id
        } }).then((res) => {
      var map = {}


      res.data.forEach((a) => {

        if (a.alertrule_type != 1) {
          if (!map[a.flow_id]) {
            map[a.flow_id] = { amber: 0, red: 0 }
          }
          if (a.type == 0) {
            map[a.flow_id].amber++
          } else {
            map[a.flow_id].red++
          }

        } else {
          if (!map['b2e']) {
           
            map['b2e'] = {}
          }

          map['b2e'][a.flow_id + "_" + a.flow_id_to]=a
        }


      })
      setTransactionAlert(map)


      /*setSummaryList(flowTree.map((a, index) => {
        return {
          no: index + 1,
          process: a.name,
          noOfActivities: 1,
          totalDuration: 1,
          thresholdBreach: transactionAlert.get(a.id),
          blockchainVerified: 0

        }
      }))*/

    });

    producttype({  sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setProducttypeList(b)

    });
    terminal({ sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setTerminalList(b)

    });
    //setTransaction_id(transaction_id)
     handlegetFlowFilter = (f: any) => {
     


   
       setFlowList((flowList) => {
         
        
        
      var fidMap = {}
       var arr = flowList.map((a) => {
         return a
       });

      var ss = arr.map((bb) => { return { ...bb } })
        var all = tree(ss, "                                    ", 'pid')
        setFlowTreeAll(all)

         if (f && f.length > 0) {

           var s = { ...show }

          arr.forEach((a) => {
            if (a.pid && f.some((c) => {
              return c == a.id
            })) {

              s[a.pid]=true
              fidMap[a.pid] = true
            }



          })

           setShow(s)
          for (var k in fidMap) {

            f.push(k)
          }

          arr = arr.filter((a) => {
            return f.some((b) => {

              return a.id == b
            })
          })

          arr.push({
            name: currentRow?.status == 1 ? 'Entire Duration' : 'Current Duration', icon: 'icon-daojishi', pid: '                                    ', id: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
          })
        }
       


       
      arr = tree(arr, "                                    ", 'pid')
      setFlowTreeFilter(arr)


         return flowList
       })

      

    }


    handlegetFlow = (f: any) => {

     // f.push("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
    
      setCurrentRow((currentRow) => {
     
       
     
      flow({ sorter: { sort: 'ascend' } }).then((res) => {
       
        res.data.push({
          name: currentRow?.status == 1 ? 'Entire Duration' : 'Current Duration', icon: currentRow?.status == 1 ? 'icon-daojishi' :'icon-shalou', pid: '                                    ', id: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' })
        var b = {}


        

        var s = {}
        res.data.forEach((r) => {
          b[r.id] = r.name
          s[r.id] = false
        })
        setShow(s)
        setFlowConf(b)

        var ss = res.data.map((bb) => { return {...bb} })
        var all = tree(ss, "                                    ", 'pid')
          setFlowTreeAll(all)

        
        console.log("dddddddddd",res.data)

      
        setFlowList(res.data)

        var cc = res.data.map((cc) => { return { ...cc } })
        var f = tree(cc, "                                    ", 'pid')
        setFlowTreeFilter(f)


       

      });

        return currentRow
      })
     }
    

    
    
    
    transactionevent({
      transaction_id: {
       
          'field': 'transaction_id',
          'op': 'eq',
          'data': transaction_id
        },sorter: { event_time: 'ascend' }
    }).then((res) => {
      var processMap = {}
      var td=0
      try {
       
       var e=new Date(res.data[res.data.length - 1].event_time).getTime()
        var s = new Date(res.data[0].event_time).getTime()

        td = (e - s) / 1000
        setTotalDuration(td)
       
      } catch (e) {

      }
      res.data.forEach((a,index) => {

        var obj = processMap[a.flow_pid]
        if (!obj) {
          obj = { duration: 0, process_duration: 0, status: 0, event_count: 0,eventArr:[] ,start_date:null}
        }
        obj.eventArr.push(a)

       
        var ne = res.data[index + 1]
        if (ne && a.flow_pid == ne.flow_pid) {
         
          a.event_duration = getTimeStr((new Date(ne.event_time).getTime() - new Date(a.event_time).getTime()) / 1000)

        }


        transactioneventMap.set(a.flow_id, a);

       

        var next = res.data[index + 1]
        if (next) {

          if (next.flow_pid != a.flow_pid) {
           
            obj.process_duration = parseInt(((new Date(res.data[index + 1].event_time)).getTime() - (new Date(a.event_time)).getTime()) / 1000 + "")
          } 
        }

        processMap[a.flow_pid] = obj

      })

      for (var k in processMap) {
        var ps = processMap[k].eventArr[0]
        var es = processMap[k].eventArr[processMap[k].eventArr.length - 1]
        processMap[k].duration = ((new Date(es.event_time)).getTime() - (new Date(ps.event_time)).getTime()) / 1000


        processMap[k].end_date = moment(new Date(es.event_time)).format('DD/MM/YYYY HH:mm')

        processMap[k].start_date = moment(new Date(ps.event_time)).format('DD/MM/YYYY HH:mm')

        processMap[k].event_count = processMap[k].eventArr.length
      }


      processMap["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"] = { duration: td }
      setProcessMap(processMap)
    

      console.log("qqqqqqqqqqqqqqqq", processMap)


});
    const getFilterOfTimestamps = async () => {
    
      filterOfTimestamps({
        user_id: {
            'field': 'user_id',
            'op': 'eq',
            'data': currentUser?.id
          }, type: {
            'field': 'type',
            'op': 'eq',
            'data':0
          } }).then((res) => {

        var m = new Map()
        res.data = res.data.map((b) => {

          m.set(b.id, b)
          var a = {}
          a.value = b.id
          a.label = <span><FormOutlined onClick={() => {
            handleModalOpen(true);

          }} /> {b.name} </span>
          return a
        })
            res.data.push({ value: 'add', label: 'Select/create new timestamp filter' })
        setFilterOfTimestampsList(res.data)
        setFilterOfTimestampsMap(m)

      });
    }
    handleget=getFilterOfTimestamps
    getFilterOfTimestamps()

    transaction({
      id: {
      'field': 'id',
      'op': 'eq',
      'data': transaction_id
    } }).then((res) => {


      setCurrentRow(res.data[0])
      handlegetFlow([])
      if (res.data[0].status == 1) {
        res.data[0].bliockchain_hex_key="sssss"
        setValidateStatus(1)
        validateBC({ id: res.data[0].id }).then((res) => {
          if (res.data && res.data.length == 0) {
           
            setValidateStatus(0)
            setValidateData([])
          } else {
           
            setValidateStatus(2)
            setValidateData(res.data)
          }
         
         // console.log(res.data)
        })
      }


      });
      return () => {
       
      };
    },
    [tab, organization_id]
  );

  var color = {
    'icon-daojishimeidian': '#70AD47',
    'icon-matou': '#70AD47',
    'icon-habor': '#70AD47',
    'icon-zhuanyunche': '#70AD47',
    'icon-matou1': '#70AD47',
    'icon-daojishi': '#70AD47'
  }
 
  return (<div
    style={{
      background: '#F5F7FA',
    }}
  >
    
    {currentUser?.role_type == "Terminal" && <ProCard
      className="my-tab"
      title={<div className="my-font-size" style={{ height: 14, lineHeight: '14px', fontSize: 12 }}>{tab == 'Terminal' ? 'This transaction is reflective of my own Terminal threshold alerts.' : 'This transaction is reflective of my customer threshold alerts'}</div>}
      headStyle={{ height: 14, lineHeight: '14px', fontSize: 12 }}
     
      tabs={{
        type: 'card',
        //tabPosition,
        activeKey: tab,
        items: [
          {
            label: `Terminal`,
            key: 'Terminal',
            children: null,
          },
          {
            label: `Customer`,
            key: 'Trader',
            children:null,
          }
        ],
        onChange: (key) => {
          setTab(key);
          //actionRef.current.reload();
        },
      }}
    />}  
    <PageContainer

      header={{
        title: "Transaction - " + currentRow?.eos_id

      }}

      extra={

        tab == 'Trader' &&
        <ProFormSelect

          style={{ width: 200 }}
          allowClear={true}
          valueEnum={organizationList}


          fieldProps={{
            dropdownMatchSelectWidth: isMP ? true : false,
            onSelect: (a) => {

              setOrganization_id(a)

            }
          }}

          placeholder={'Filter By: Customer'}


        />
      }

    >


     

      <FilterForm
        onSubmit={async (value) => {
          value.id = currentFilter?.id
          var success
          if (isAdd) {
             success = await handleAdd(value);
          } else {
            success = await handleUpdate(value);
          }
          
          if (success) {
            handleModalOpen(false);
           
            handleget()
          
            setCurrentFilter(undefined);
           
          }
        }}
      
        onApply={async (value) => {
          value.id = currentRow?.id
          handlegetFlowFilter(value.value)
            handleModalOpen(false);
            setCurrentFilter(value);

          
        }}
        onDelete={async (value) => {
          handleRemove([currentFilter], (success) => {
            if (success) {
              handleModalOpen(false);
              setSelectValue(null)
              handleget()
              handlegetFlowFilter([])
            }
            
          })

        }}
        onCancel={() => {
          handleModalOpen(false);
         
        }}
        createModalOpen={createModalOpen}
        values={currentFilter || {}}
      />
      

      <ProCard ghost={true} className="my-ant-descriptions-row" style={{ marginBlockStart: 8 }} wrap={isMP ? true : false} gutter={8}>
          <ProCard
          colSpan={isMP ? 24 : 12}
          style={{  backgroundColor: "#e5e5e5" }}
            layout="center"
            title={"General Information"}
            wrap={true }
            bordered
          >

          <ProCard ghost={true} className="my-font-size">
            <ProDescriptions colon={false} contentStyle={{ fontSize: 16 }} columns={columns1 as ProDescriptionsItemProps<any>[]} dataSource={currentRow} labelStyle={{ fontSize: '18px', color: "#333", fontWeight: 500, lineHeight: "18px", padding:0 }} layout="vertical" className="my-descriptions-item"
                column={isMP ? 2 : 3} >

              </ProDescriptions>
            </ProCard>
           
            <ProCard ghost={true}>


              <ProCard ghost={true} colSpan={8} >
              <SvgIcon className="my-font-size" style={{ fontSize: 40 }} type="icon-lunchuan" />
              </ProCard>

            <ProCard ghost={true} colSpan={16} >
              <ProDescriptions colon={false} style={{ display: "inline-block" }} contentStyle={{ fontSize: 16, textAlign: 'center' }} columns={columns2 as ProDescriptionsItemProps<any>[]} dataSource={currentRow} labelStyle={{ fontSize: '18px', lineHeight: "18px", color: "#333", fontWeight: 500 }} layout="vertical" className="my-descriptions-item"
                  column={isMP ? 2 : 2} >

                </ProDescriptions>
              </ProCard>

              
            </ProCard>

          <ProCard ghost={true} className="my-font-size">
              <ProCard ghost={true} colSpan={8} >
              <SvgIcon className="my-font-size" style={{ fontSize:40 }} type="icon-terminal" />
              </ProCard>

            <ProCard ghost={true} colSpan={16} >
              <ProDescriptions colon={false} style={{ display: "inline-block" }} contentStyle={{ fontSize: 16 }} columns={columns3 as ProDescriptionsItemProps<any>[]} dataSource={currentRow} labelStyle={{ fontSize: '18px', color: "#333", lineHeight: "18px", fontWeight:500 }} layout="vertical" className="my-descriptions-item"
                  column={isMP ? 2 : 2} >

                </ProDescriptions>
              </ProCard>
              

            </ProCard>
           
           
          </ProCard>
          <ProCard
          colSpan={isMP ? 24 : 12}
          style={{ height: '100%',backgroundColor:"#e5e5e5",marginTop:isMP?10:0 }}
            layout="center"
            title={"Products"}
            wrap={true}
            bordered
          >

          <ProCard ghost={true}>
            <ProDescriptions colon={false} contentStyle={{ marginTop: 0 }} columns={columns4 as ProDescriptionsItemProps<any>[]} dataSource={currentRow} labelStyle={{ fontSize: '12px', color: "#333", fontWeight:500, lineHeight: "18px" }} layout="vertical" className="my-descriptions-item"
                column={isMP ? 1 : 2} >

              </ProDescriptions>
            </ProCard>


          <ProCard ghost={true}  >
              <ProCard ghost={true} colSpan={6} >
              <SvgIcon className="my-font-size" style={{ fontSize: 40 }} type="icon-huowu1" />
              </ProCard>

              <ProCard ghost={true} colSpan={18} >
              <ProDescriptions colon={false} style={{ display: "inline-block" }} contentStyle={{ marginTop: 0 }} columns={columns5 as ProDescriptionsItemProps<any>[]} dataSource={currentRow} labelStyle={{ fontSize: '12px', color: "#333", fontWeight: 500, lineHeight: "18px" }} layout="vertical" className="my-descriptions-item"
                  column={isMP ? 1 : 1} >

                </ProDescriptions>
              </ProCard>


            </ProCard>
          </ProCard>


           

           


           
        

      </ProCard>




     


      {!isMP && (<ProCard ghost={true} style={{ marginBlockStart: 16 }} ><div style={{ paddingRight: 20,width: '100%', height: 'auto', overflow: 'auto', padding: "10px", backgroundColor: "#FFF" }}>

        <div style={{ width:2000 }}>


        <div style={{ position: 'relative', float: 'left', zIndex: 1, textAlign: 'left', marginRight: 10 }}>

          <div style={{ position: 'relative', zIndex: 1, fontSize: '14px', lineHeight:'14px', color: "#808080", height: 28, }}>Processes</div>
          <div style={{ position: 'relative', zIndex: 1, height: '40px', }}>

          </div>
          <div style={{ fontSize: '14px', height: 35, lineHeight: '35px', color: "#808080" }}>
            Duration
          </div>
          <div style={{ fontSize: '14px', height: 35, lineHeight: '35px', color: "#808080" }}>
            Start Time
           </div>
           <div style={{ fontSize: '14px', height: 35, lineHeight: '35px', color: "#808080" }}>
              End Time
            </div>
            <div style={{ fontSize: '14px', height: 35, lineHeight: '35px', color: "#808080" }} onClick={() => {
              setThresholdExpand(!thresholdExpand)
            } }>
              Threshold <DownCircleOutlined rotate={thresholdExpand?180:0} />
          </div>

        
        </div>
        {flowTreeAll.map((e, i) => {

          var p = processMap[e.id]
          var arArr = alertruleProcessMap[e.id]
         
          return [
            <div style={{ position: 'relative', float: 'left', zIndex: 1, textAlign: 'center', cursor: 'pointer', width: '10%' }} onClick={() => {
             var a = {...show}
              a[e.id] = true
              setShow(a)
             
              window.scrollTo(0, document.getElementById(e.id + "_")?.getBoundingClientRect().top || 0)

            } }>


              <div style={{ position: 'absolute', zIndex: 0, top: 47, left: i == 0 ? '50%' : 0, width: (i == 0 || i == 4) ? '50%' : (i == 5 ? 0 : '100%'), height: 2, backgroundColor: '#d2d2d2', overflow: 'hidden', }}></div>
              <div style={{ position: 'relative', zIndex: 1, fontSize: '14px', height:28,lineHeight:'14px', color: "#333", fontWeight: "bold" }}>{e.name}</div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                {e.id != "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" && (<span className="my-font-size" style={{
                  display: "inline-block",
                  color: "#fff",
                  width: '40px',
                  height: '40px',
                  fontSize: "30px",
                  backgroundColor: p ? (p.event_count > 0 ? transactionAlert[e.id] ? (transactionAlert[e.id].red > 0 ? "red" : "#DE8205") : color[e.icon] : "#595959") : "#595959",
                  borderRadius: '50%',
                  textAlign: 'center',
                  lineHeight: '40px'
                }}>

                  <SvgIcon type={e.icon} />
                </span>)
                }


                {e.id == "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" && (
                  <div style={{ height:40 }}>
                    <span className="my-font-size" style={{
                   
                    display: "inline-block",
                    color: "#fff",
                    width: '40px',
                    height: '40px',
                    fontSize: "28px",
                    backgroundColor: transactionAlert[e.id] ? (transactionAlert[e.id].red > 0 ? "red" : "#DE8205") :( currentRow?.status == 1 ?color[e.icon]:"#595959"),      
                    borderRadius: '50%',
                    textAlign: 'center',
                    lineHeight: '40px'
                  }}>
                      <SvgIcon type={e.icon} />
                    
                  </span>
                    </div>

                  )} 

              </div>
              <div style={{ fontSize: '14px', fontWeight:500, color: "#333",  height: 35, lineHeight: "35px" }}>
                {p ? getTimeStr(p.duration) : ""}
              </div>


              <div className="my-font-size" style={{ fontSize: '18px',  color: "#333", height: 35, lineHeight: "35px" }}>
                {p ? p.start_date  : ""}
              </div>
              <div className="my-font-size" style={{ fontSize: '18px',color: "#333", height: 35, lineHeight: "35px" }}>
                {p ? p.end_date : ""}
              </div>

              <div style={{ fontSize: '12px', lineHeight: "35px", height: thresholdExpand ? 'auto' : 30, overflow: 'hidden' }}>

                {arArr && arArr.map((ar) => {

                  return (<div> <Threshold hours={ar.amber_hours} opacity={ ar.amber?1:0.3}  mins={ar.amber_mins} type="amber" size={10} /> &nbsp;

                    <Threshold hours={ar.red_hours} mins={ar.red_mins} opacity={ar.red ? 1 : 0.3}  type="red" size={10} /></div>)
                })
                }

              </div>

             

            </div>,

            
              e.id != "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"?
                (<div style={{ width: '4.5%', position: 'relative', float: 'left', textAlign: 'center', display: i >= flowTreeAll.length-2 ? "none" : "block" }}>
              <div style={{ position: 'absolute', zIndex: 0, top: 47, width: '100%', height: 2, backgroundColor: '#d2d2d2', overflow: 'hidden', }}></div>
              <div style={{ position: 'relative', marginTop: '41px', fontSize: "16px", zIndex: 1 }}>

                    {p && p.process_duration > 0 && (<SvgIcon style={{ color: "#d2d2d2" }} type={'icon-map-link-full'} />)}

              </div>
              <div style={{ fontSize: '12px' }}>
                {p && p.process_duration > 0 ? getTimeStr(p.process_duration):"" }
              </div>
            </div>):null


          ]


        })
        }




        <div style={{ position: 'relative', cursor: "pointer", float: 'left', zIndex: 1, width: '250px', textAlign: 'center' }} onClick={() => {

          history.push(`/transaction/blockchainIntegration?transaction_id=` + currentRow?.id, { validateData: validateData } );
        
        } }>

          <div style={{ position: 'relative', zIndex: 1, fontSize: '14px', height: 25, color: "#333" }}></div>
          <div style={{ position: 'relative', zIndex: 1, height: '30px', }}>

            {validateStatus == 1 ? (<Spin />) :

              <span style={{
                display: "inline-block",
                  color:  "#fff" ,
                width: '30px',
                height: '30px',
                fontSize: "20px",
                  backgroundColor: currentRow?.bliockchain_hex_key ?( validateStatus == 2 ? "rgb(130, 71, 229)" : "red") :"#666" ,
                borderRadius: '50%',
                textAlign: 'center',
                lineHeight: '30px'
              }}>

                <SvgIcon type={"icon-a-outline-polygon-matic"} />

              </span>

              }
            
          </div>
          <div style={{ fontSize: '10px', width: "100%" }}>
              {currentRow?.bliockchain_hex_key ? (validateStatus == 2 ? "Timestamps uploaded and validated on Polygon blockchain" : "Timestamps not validated on blockchain") : "Timestamps to be uploaded to Polygon blockchain"}
          </div>

        </div>

      </div></div></ProCard>)}






      {isMP && (<ProCard ghost={true} style={{ marginBlockStart: 16 }}><div style={{ width: '100%', height: 'auto', overflow: 'auto', padding: "10px", backgroundColor: "#FFF" }}>
        <div style={{ position: 'relative', float: 'left', zIndex: 1, textAlign: 'left', marginRight: 10, width: '100%' }}>
          <div style={{ float: 'left', width: 1, height: 40 }}>
            
          </div>
          <div style={{ position: 'relative', zIndex: 1, marginLeft: 0, fontSize: '14px', color: "#808080", width: '250px', float: 'left' }}>
            Processes
          </div>
         
          <div style={{ fontSize: '14px', color: "#808080", float: 'left' }}>
            Duration
          </div>
          
        </div>
        {flowTreeAll.map((e, i) => {

          var p = processMap[e.id]
          var arArr = alertruleProcessMap[e.id]
          return <div style={{ position: 'relative' }} >
            {i < 5 && <div style={{ position: 'absolute', zIndex: 0, left: 20, height: (i == 0 || i == 4) ? '50%' : '100%', top: (i == 0)?'50%':0 ,width: 1, backgroundColor: '#d2d2d2', overflow: 'hidden', }}></div>}
           
            <div style={{ position: 'relative', float: 'left', zIndex: 1, textAlign: 'left', width: '100%' }}>


              <div style={{ position: 'relative', zIndex: 1, float: 'left' }}>

                {e.id != "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" && (
                  <span className="my-font-size" style={{
                    display: "inline-block",
                    color: "#fff",
                    width: '40px',
                    height: '40px',
                    fontSize: "30px",
                    backgroundColor: p ? (p.event_count > 0 ? transactionAlert[e.id] ? (transactionAlert[e.id].red > 0 ? "red" : "#DE8205") : color[e.icon] : "#595959") : "#595959",
                    borderRadius: '50%',
                    textAlign: 'center',
                    lineHeight: '40px'
                  }}>

                    <SvgIcon type={e.icon} />
                  </span>)}


                {e.id == "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" && (
                  <span className="my-font-size" style={{
                    
                    display: "inline-block",
                    color: "#fff",
                    width: '40px',
                    height: '40px',
                    fontSize: "28px",
                    backgroundColor: currentRow?.status == 1 ? (transactionAlert[e.id] ? (transactionAlert[e.id].red > 0 ? "red" : "#DE8205") : color[e.icon]) : "#595959",
                    borderRadius: '50%',
                    textAlign: 'center',
                    lineHeight: '40px'
                  }}>
                    <SvgIcon type={e.icon} />
                   
                  </span>

                  )}
              </div>
              <div style={{ position: 'relative', marginLeft: 5, height: '40px', lineHeight: '40px', width: '200px', zIndex: 1, float: 'left', fontSize: '12px', color: "#333", fontWeight: "bold" }}>{e.name}</div>


              {e.id != "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" && (
                <div style={{ position: 'relative', marginLeft: 5, height: '40px', lineHeight: '40px', zIndex: 1, float: 'left', fontSize: '12px', color: "#333", fontWeight: "bold" }}>{p ? getTimeStr(p.duration) : ""}</div>)}
             


              

             
            
            </div>


            <div style={{ fontSize: '10px', lineHeight: '20px', width: '80%', marginLeft: 40, display: "inline-block" }}>

             
                {p ? p.start_date : ""}<br/>
             
                {p ? p.end_date : ""}
            
              </div>

            {arArr && arArr.length > 0 && <div style={{ fontSize: '10px', lineHeight: '20px', width: '80%', marginLeft: 40, display: "inline-block" }}>

              {arArr && arArr.map((ar) => {

                return (<div> <Threshold hours={ar.amber_hours} opacity={ar.amber ? 1 : 0.3} mins={ar.amber_mins} type="amber" size={10} /> &nbsp;

                  <Threshold hours={ar.red_hours} opacity={ar.red ? 1 : 0.3} mins={ar.red_mins} type="red" size={10} /></div>)
              })
              }
            </div>} 

            
          
            {p && p.process_duration > 0 &&  <div style={{ height: '30px', position: 'relative', float: 'left', width: '100%' }}>

              <div style={{ position: 'relative', marginLeft: '19px', fontSize: "14px", height: 20, lineHeight: '20px', zIndex: 1 }}>
                {p && p.process_duration > 0 && (<SvgIcon style={{ color: "#d2d2d2" }} type={'icon-map-connect-full'} />)}

                <span style={{ display: 'inline-block', height: 20, marginLeft: 5, lineHeight: '20px', fontSize: "14px" }}>  {p && p.process_duration > 0 ? getTimeStr(p.process_duration) : ""}</span>
              </div>

            </div>} 


          </div>


        })
        }

       


        <div style={{ position: 'relative', float: 'left', zIndex: 1, textAlign: 'center', width: '100%' }} onClick={() => {

          history.push(`/transaction/blockchainIntegration?transaction_id=` + currentRow?.id, { validateData: validateData });

        }}>


          <div style={{ position: 'relative', zIndex: 1, float: 'left', marginLeft: '5px' }}>
            {validateStatus == 1 ? (<Spin size="large" />) :
              <span style={{
                display: "inline-block",
                color:  "#fff" ,
                width: '30px',
                height: '30px',
                fontSize: "20px",
                backgroundColor: currentRow?.bliockchain_hex_key ? (validateStatus == 2 ? "rgb(130, 71, 229)" : "red") : "#666",
                borderRadius: '50%',
                textAlign: 'center',
                lineHeight: '30px'
              }}>

                <SvgIcon type={"icon-a-outline-polygon-matic"} />
              </span>}
          </div>
          <div style={{ position: 'relative', height: '40px', lineHeight: '40px', zIndex: 1, float: 'left', fontSize: '14px', color: "#333", fontWeight: "bold" }}>{''}</div>
          <div style={{ fontSize: '14px', float: 'left', height: '40px', lineHeight: '40px', color: "#333" }}>

          </div>
          <div style={{ fontSize: '10px', float: 'left', color: validateStatus == 2 ? "#67C23A" : "#808080", height: '40px', marginLeft:'5px', textAlign: "left", lineHeight: '20px',width:'80%'}}>
            {currentRow?.bliockchain_hex_key ? (validateStatus == 2 ? "Timestamps uploaded and validated on Polygon blockchain" : "Timestamps not validated on blockchain") : "Timestamps to be uploaded to Polygon blockchain"}
          </div>
        </div>

     

      </div></ProCard>)}

      <ProCard collapsed={collapsed}  colSpan={24} style={{ marginBlockStart: 16 }} bodyStyle={{ padding: '16px', overflow: isMP ? 'auto' : 'hidden' }} wrap title={<div style={{ fontWeight: '500', fontSize: 14 }}> Threshold Applied (Between 2 Events) </div>} extra={< EyeOutlined onClick={() => {
        setCollapsed(!collapsed);
      }} style={{ fontWeight: 'normal', fontSize: 14 }} />} bordered headerBordered>

        {alertruleEventList.length==0 && (<Empty />)}


        {alertruleEventList.map((ta) => {
          var tb=transactionAlert?.b2e?.[ta.flow_id + "_" + ta.flow_id_to]
          return (
            <ProCard ghost={true} colSpan={24} bordered wrap={isMP ? true : false}

              style={{ marginBlockStart: 5, cursor: 'pointer' }}
              headStyle={{ padding: 0, fontWeight: 'normal', fontSize:'14px'}}
              bodyStyle={{paddingLeft:25} }
             
              onClick={(e) => {
                handlegetFlowFilter([ta.flow_id, ta.flow_id_to])
              } }
            >


              <ProCard ghost={true} colSpan={isMP?24:8 }>
                {flowConf[ta.flow_id]}<span >{' -> '}</span>{flowConf[ta.flow_id_to]}
              </ProCard>

              <ProCard ghost={true} layout={isMP ? "default" : "center"} colSpan={isMP ? 24 : 8}>
                <span style={{
                  display: "inline-block",
                  color: "#fff",
                  width: '22px',
                  height: '22px',
                  fontSize: "16px",
                  backgroundColor: tb ? (tb.type == 0 ? "red" : "red" ): (getTimeByTwoEvent(ta.flow_id, ta.flow_id_to) == '-' ? "#595959" : "#67C23A"),
                  borderRadius: '50%',
                  textAlign: 'center',
                  lineHeight: '22px'
                }}>
                  <SvgIcon type={"icon-yundongguiji"} />

                </span>
                <span style={{ marginLeft: 5, fontWeight: 500 }}>{getTimeByTwoEvent(ta.flow_id, ta.flow_id_to)}</span>
              </ProCard>
              <ProCard ghost={true} layout={isMP ? "default" : "center"} colSpan={isMP ? 24 : 8}>
               
                <ProDescriptions
                  column={isMP ? 1 : 2} >
                  <ProDescriptions.Item label="Threshold" valueType="text" style={{ fontSize: '14px' }} >


                    <Threshold hours={ta.amber_hours} opacity={ta.amber ? 1 : 0.3} mins={ta.amber_mins} type="amber" size={14 }/>&nbsp;

                    <Threshold hours={ta.red_hours} opacity={ta.red ? 1 : 0.3} mins={ta.red_mins} type="red" size={14} />
                    
                  </ProDescriptions.Item>

                </ProDescriptions>
              </ProCard>

             
             

            </ProCard>
          )




        })}

        

       


      </ProCard>
      

      <ProCard style={{ marginBlockStart: 16 }} title={<><span>Detailed Timestamps</span>&nbsp; {!isMP ? <>
        <Button onClick={() => {
          setSelectValue(null)
          setCurrentFilter(null);
          setIsAdd(false)
          handlegetFlowFilter("")
        }} style={{ cursor: 'pointer', marginTop: isMP ? 10 : 0 }}>Reset View </Button>&nbsp;
        <Button onClick={() => {
          var a = { ...show }
          for (var i in a) {
            a[i] = true
          }

          setShow(a)
        }} style={{ cursor: 'pointer', marginTop: isMP ? 10 : 0 }}>Expand All</Button>&nbsp;
        <Button onClick={() => {
          var a = { ...show }
          for (var i in a) {
            a[i] = false
          }
          setShow(a)
        }} style={{ cursor: 'pointer', marginTop: isMP ? 10 : 0 }}>Collapse All</Button>&nbsp;</>:null}</>}
        bordered headerBordered={isMP ? false : true}
        extra={<Select
          style={{ width: 200 }}
          allowClear={true}
          value={selectValue}
          onClear={() => {
            setSelectValue(null)
            setCurrentFilter(null);
            setIsAdd(false)
            handlegetFlowFilter("")
          }}
          dropdownMatchSelectWidth={isMP ? true : false}
          onSelect={(a) => {
            setSelectValue(a)
            if (a == "add") {
              setCurrentFilter(null);
              setIsAdd(true)
              handleModalOpen(true);
            }
            else {
              setCurrentFilter(filterOfTimestampsMap.get(a));
             handlegetFlowFilter(filterOfTimestampsMap.get(a).value)
              setIsAdd(false)
            }
           
            
            
          }}
          placeholder={'Filter By: Timestamps'}
          
          options={filterOfTimestampsList}
        />}
      >
        {isMP && <div className="my-fond-size" style={{ height: 50,marginTop:-20 }}>
          <ProCard ghost={true} bodyStyle={{ height: 50 }} gutter={10 }>
          <ProCard ghost={true}>
              <Button size="small" onClick={() => {
              setSelectValue(null)
              setCurrentFilter(null);
              setIsAdd(false)
              handlegetFlowFilter("")
            }} style={{ cursor: 'pointer', marginTop: isMP ? 10 : 0 }}>Reset View </Button>


          </ProCard>
            <ProCard ghost={true}>
              <Button size="small" onClick={() => {
              var a = { ...show }
              for (var i in a) {
                a[i] = true
              }

              setShow(a)
            }} style={{ cursor: 'pointer', marginTop: isMP ? 10 : 0 }}>Expand All</Button>
          </ProCard>
          <ProCard ghost={true}>
              <Button size="small" onClick={() => {
              var a = { ...show }
              for (var i in a) {
                a[i] = false
              }
              setShow(a)
            }} style={{ cursor: 'pointer', marginTop: isMP ? 10 : 0 }}>Collapse All</Button>
          </ProCard>
          </ProCard>
        </div>} 

      <div style={{ backgroundColor: "#fff", position: 'relative', width: '100%', height: 'auto' }}>
       



        <Steps
            direction={'vertical'}
           
          size="default"
            style={{ float: 'left', width: isMP ? '100%' : '70%', marginLeft: isMP ? '0px' : '25%', marginTop: 0, maxWidth:'100%' }}
        >

            {flowTreeFilter.map(e => {
             
            var p = processMap[e.id]
            var ar = alertruleProcessMap[e.id]
            flowTreeAll.forEach((nn) => {
              if (nn.id == e.id) {

                e.children_length = nn.children?.length

                console.log(e.children_length)
              }
            })
              var arr = [



                <Step className={p ? "title-hover" : ""} style={{ cursor: p ? 'pointer' : 'initial' }} status="wait" icon={


                  <span id={ e.id+"_"} onClick={() => {
                 show[e.id] = !show[e.id]
                 setShow({ ...show })
                  console.log(show)
                }} className="my-font-size"  style={{
                  display: "inline-block",
                  fontSize:"22px",
                  color: "#fff",
                  width: '33px',
                  height: '33px',
                  backgroundColor: e.id == 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' ? "#fff" : (p ? (p.event_count > 0 ? transactionAlert[e.id] ? (transactionAlert[e.id].red > 0 ? "red" : "#DE8205") : color[e.icon] : "#595959") : "#595959"),
                  borderRadius: '50%',
                  textAlign: 'center',
                  lineHeight: '33px'
                }}>
                  <SvgIcon style={{ color: '#fff' }} type={e.icon} />
                </span>



                } title={<div style={{ color: e.id == 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' ? "#fff" : "#333" }} onClick={() => {
                show[e.id] = !show[e.id]
                setShow({ ...show })

                }}> <span className="my-title" style={{ paddingRight: '20px', fontWeight: 500, display: 'block', width: '100%', textAlign: "left", fontSize: "16px", lineHeight: "20px", height: 20 }}>{e.name}</span>

                  {p && <span className="my-title" style={{ paddingRight: '20px', display: 'block', width: '100%', textAlign: "left", fontSize: "16px", lineHeight: "20px", height: 20 }}>Starting time: {p ? p.start_date : ""} </span>}
                  {p && <span className="my-title" style={{ paddingRight: '20px', display: 'block', width: '100%', textAlign: "left", fontSize: "16px", lineHeight: "20px", height: 20 }}>Ending time: {p ? p.end_date : ""}</span>} 

                  {p && <span className="my-title" style={{ display: 'block', textAlign: "left", fontSize: "14px", lineHeight: "20px", height: 20 }}>Process Duration: {p ? getTimeStr(p.duration) : "0h 00m"}</span>}</div>} description={<div >{

                  e.children?.map((c) => {
                    if (!show[e.id]) {

                      return
                    }

                    var te = transactioneventMap.get(c.id)

                   

                    var event_duration=null
                    if (te ) {
                     
                        
                      event_duration = te.event_duration
                        
                      
                      
                    }
                   

                    return (

                      (te || access.canAdmin) && <ProCard

                        style={{ marginBottom: 25, width: '100%' }}
                        title={
                         
                            <div className="timestamp-hover" style={{ marginLeft: 22, fontSize: "12px", display: 'inline-block', width: '100%', border: "1px solid #d2d2d2", padding: "5px", borderRadius: '5px', fontWeight: 'normal' }}>

                              <div>{c.name}</div>
                              <div>
                                  <CalendarOutlined /> {moment(te?.event_time).format('DD MMMM YYYY')} &nbsp;&nbsp;&nbsp;&nbsp;<FieldTimeOutlined /> {moment(te?.event_time).format('h:mm a') }
                              </div>



                             

                               <div style={{ position: 'absolute', backgroundColor: '#fff',borderRadius:5, left: -35,top:65, fontWeight: 400 }}> {event_duration}</div>


                            </div>


                           

                            }
                        collapsibleIconRender={({ collapsed: buildInCollapsed }: { collapsed: boolean }) =>
                          <div style={{ display: 'inline-block', position: 'absolute', width: 20, color: "#d5d5d5", marginLeft: -12.5 }}>< AimOutlined style={{ background: "#fff", position: 'absolute',top:25 }} /></div>
                        }
                        collapsible={ true }
                        defaultCollapsed
                        bodyStyle={{ marginTop: 28, marginLeft:20 }}
                        onCollapse={(collapse) => console.log(collapse)}
                        extra={
                          (!te ? <Access accessible={access.canAdmin} fallback={<div></div>}><Button
                            size="small"
                            onClick={(e) => {
                              addTransactionevent({ transaction_id: currentRow?.id, flow_id: c.id })
                              message.success(<FormattedMessage
                                id="pages.modifySuccessful"
                                defaultMessage="Modify is successful"
                              />);
                            }}
                          >
                            Execution Event
                          </Button></Access> : "")
                        }
                      >
                        
                        <ProDescriptions labelStyle={{ fontSize: '12px' }} className="my-descriptions-item" editable={access.canAdmin ? {
                         
                          onSave: async (keypath, newInfo, oriInfo) => {
                            var d = { id: te?.id, ...newInfo }
                            
                            updateTransactionevent(d)
                            message.success(<FormattedMessage
                              id="pages.modifySuccessful"
                              defaultMessage="Modify is successful"
                            />);
                            return true;
                          },
                        } : null}
                          column={isMP ? 1 : 2} >
                          <ProDescriptions.Item label="Work order ID"  dataIndex="work_order_id" valueType="text" >
                            {te?.work_order_id} 
                          </ProDescriptions.Item>
                          <ProDescriptions.Item label="Product Type"  dataIndex="product_type" valueType="text">
                          {te?.product_type}
                          </ProDescriptions.Item>
                          <ProDescriptions.Item label="Tank ID"  dataIndex="tank_id" valueType="text">
                           {te?.tank_id}
                          </ProDescriptions.Item>
                          <ProDescriptions.Item label="Volume"  dataIndex="volume" valueType="text">
                            {te?.volume}
                          </ProDescriptions.Item>
                          <ProDescriptions.Item label="Unit of Measurement"  dataIndex="unit_of_measurement" valueType="text">
                           {te?.unit_of_measurement}
                          </ProDescriptions.Item >
                          
                          {
                            access.canAdmin && <ProDescriptions.Item label="Event Time"  dataIndex="event_time" valueType="text">
                               {moment(te?.event_time).format('YYYY-MM-DD HH:mm:ss')}
                              </ProDescriptions.Item>
                            }
                          
                            
                        </ProDescriptions>
                      </ProCard>

                    )

                  })


                }</div>} />
            ]

            
              if (e.id == "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" ) {
                if (show["a7332eb0-d3c9-11ed-a0d9-55ccaa27cc37"]) {
                
                  return arr
                } else {
                  return null
                }
               
              } else {
                return arr
              }
            //return arr


            
          })
          }


        </Steps>
      </div>
      
        </ProCard>

       


     


       
      <div style={{ marginTop:15, paddingLeft: 0 }}>
        <Button
          style={isMP?{ width:'100%' }:null}
          type="primary"
          onClick={async () => {
            history.back()
          }}
        >Return to previous page</Button>
        {/*<Button
          style={isMP ? { width: '100%', marginTop: 15 } : { marginLeft:10 }}
          type="primary"
          onClick={async () => {
            history.push('/Dashboard')
          }}
        >Return to dashboard</Button>*/ } 
      </div>
     

    </PageContainer>
  </div>)
}
  export default Detail;
