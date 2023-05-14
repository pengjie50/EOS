import React, { useRef, useState, useEffect,useCallback } from 'react';
import { PageContainer, ProCard, ProColumns, ProDescriptions, ProFormGroup, ProFormSelect, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { AlertOutlined, SafetyCertificateOutlined, FormOutlined,CheckOutlined, EyeOutlined, ExclamationCircleOutlined } from '@ant-design/icons'; 
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
import numeral from 'numeral';
var moment = require('moment');
const { Step } = Steps;
const { confirm } = Modal;

const is_do=(transactioneventList: any[],id: any) =>{
  return transactioneventList.find((a) => {
    return a.flow_id == id
  })
}
var handleget: () => void
var handlegetFlow: (f: any) => void
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
const Detail: React.FC<any> = (props) => {

  const [currentFilter, setCurrentFilter] = useState<any>();
  const [currentRow, setCurrentRow] = useState<TransactionListItem>();
  const [flowTree, setFlowTree] = useState<any>([]);
  const [flowTreeAll, setFlowTreeAll] = useState<any>([]);
  const [flowList, setFlowList] = useState<any>([]);
  const [summaryList, setSummaryList] = useState<any>([]);
  const [transactionAlert, setTransactionAlert] = useState<any>([]);
  const [transactioneventList, setTransactioneventList] = useState<any>([]);
  const [transactioneventMap, setTransactioneventMap] = useState<any>(new Map());
  const [processMap, setProcessMap] = useState<any>(new Map());
 // const [transaction_id, setTransaction_id] = useState<any>("");
  const [filterOfTimestampsList, setFilterOfTimestampsList] = useState<any>([{ value: 'add', label: 'Add new template' }]);
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
  var transaction_id = useLocation().search.split("=")[1]
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [isAdd, setIsAdd] = useState<boolean>(false);

  const [totalDuration, setTotalDuration] = useState<any>(0);

  const [flowConf, setFlowConf] = useState<any>({});
  const [isMP, setIsMP] = useState<boolean>(!isPC());

  const [validateStatus, setValidateStatus] = useState<any>(0);
  const [validateData, setValidateData] = useState<any>([]);
  const [selectValue, setSelectValue] = useState<any>(null);
  
  const getTimeStr=(time)=>{
    return parseInt((time / 3600) + "") + "h " + parseInt((time % 3600) / 60) + "m"
  }

  const access = useAccess();
  const columns: ProColumns<TransactionListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.transaction.transactionID"
          defaultMessage="EOS ID"
        />
      ),
      dataIndex: 'id',
      render: (dom, entity) => {
        return !isMP?entity.id.substr(0, 8) + "...":dom
          
        
      },
    },

    {
      title: (
        <FormattedMessage
          id="pages.transaction.timeFrame"
          defaultMessage="Time frame"
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
      title: <FormattedMessage id="pages.transaction.startOfTransaction" defaultMessage="Start of transaction" />,
      dataIndex: 'start_of_transaction',
      valueType: 'date',
      
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.transaction.endOfTransaction" defaultMessage="End of transaction" />,
      dataIndex: 'end_of_transaction',
      valueType: 'date',
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.transaction.status" defaultMessage="Status" />,
      dataIndex: 'status',
      valueEnum: {
        0: { text: <FormattedMessage id="pages.transaction.active" defaultMessage="Active" /> },
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
      title: <FormattedMessage id="pages.transaction.imoNumber" defaultMessage="IMO Number" />,
      dataIndex: 'imo_number',
      hideInSearch: true,
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
      valueEnum: terminalList
    },
    {
      title: <FormattedMessage id="pages.transaction.jettyName" defaultMessage="Jetty Name" />,
      dataIndex: 'jetty_id',
      valueEnum: jettyList
    },


    {
      title: <FormattedMessage id="pages.transaction.productType" defaultMessage="Product Type" />,
      dataIndex: 'product_type',
      //valueEnum: producttypeList,
    },
    {
      title: <FormattedMessage id="pages.alertrule.throughputVolume1" defaultMessage="Total nominated quantity (MT)" />,
      dataIndex: 'total_nominated_quantity_m',
      hideInSearch: true,
      valueType: "text",
      render: (dom, entity) => {
        if (dom !=null) {
          return numeral(dom).format('0,0') 
        }

      },
    },
    {
      title: <FormattedMessage id="pages.alertrule.throughputVolume1" defaultMessage="Total nominated quantity (Bal-60-F)" />,
      dataIndex: 'total_nominated_quantity_b',
      hideInSearch: true,
      valueType: 'text',
      render: (dom, entity) => {
        if (dom != null) {
          return numeral(dom).format('0,0')
        }

      },
    },

    {
      title: <FormattedMessage id="pages.transaction.totalDuration" defaultMessage="Total Duration (Till Date)" />,
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
    jetty({ pageSize: 3000, current: 1, sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setJettyList(b)

    });

    alertrule({ pageSize: 3000, current: 1}).then((res) => {
      var b = {}
      var c = []
      res.data.forEach((r) => {
        if (r.type != 1) {
          b[r.flow_id] = r
        } else {
          setCollapsed(false)
          c.push(r)
        }
        
      })
      setAlertruleProcessMap(b)
      setAlertruleEventList(c)


    });


    getAlertBytransactionId({ pageSize: 300, current: 1, transaction_id: transaction_id }).then((res) => {
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

    producttype({ pageSize: 3000, current: 1, sorter: { name: 'ascend' } }).then((res) => {
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

    });
    //setTransaction_id(transaction_id)
    handlegetFlow = (f: any) => {

     // f.push("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
      var currentRow_
      setCurrentRow((currentRow) => {
        currentRow_ = currentRow
        return currentRow
      })
      var fidMap = {}
      flow({ pageSize: 300, current: 1, sorter: { sort: 'ascend' } }).then((res) => {
       
        res.data.push({
          name: currentRow_?.status == 1 ? 'Total Duration' : 'Current Duration', icon: 'icon-daojishi', pid: '                                    ', id: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' })
        var b = {}
        res.data.forEach((r) => {
          b[r.id] = r.name
        })
        setFlowConf(b)

        var ss = res.data.map((bb) => { return {...bb} })
        var all = tree(ss, "                                    ", 'pid')
          setFlowTreeAll(all)

        if (f && f.length > 0) {
          
          res.data.forEach((a) => {
            if (a.pid && f.some((c) => {
              return c==a.id
            })) {
              fidMap[a.pid] = true
            }



          })
          for (var k in fidMap) {

            f.push(k)
          }
         
          res.data = res.data.filter((a) => {
            return f.some((b) => {

              return a.id == b
            })
          })

          res.data.push({
            name: currentRow_?.status == 1 ? 'Total Duration' : 'Current Duration', icon: 'icon-daojishi', pid: '                                    ', id: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' })
        }
        console.log("dddddddddd",res.data)

      
        setFlowList(res.data)
        res.data = tree(res.data, "                                    ", 'pid')
        setFlowTree(res.data)


       

      });
     }
    

    
    
    
    transactionevent({ pageSize: 1000, current: 1, transaction_id: transaction_id,sorter: { event_time: 'ascend' }
    }).then((res) => {
      var processMap = new Map()
      try {
        setTotalDuration(parseInt(((new Date(res.data[res.data.length - 1].event_time)).getTime() - (new Date(res.data[0].event_time)).getTime()) / 1000 + ""))
      } catch (e) {

      }
  
      res.data = res.data.map((a, index) => {

        var obj=processMap.get(a.flow_pid)
        if (!obj) {
          obj = { duration: 0, process_duration:0, status:0,event_count:0 }
        } 
          var next = res.data[index + 1]
          if (next) {
           
            if (next.flow_pid != a.flow_pid) {

              obj.process_duration = parseInt(((new Date(res.data[index + 1].event_time)).getTime() - (new Date(a.event_time)).getTime()) / 1000 + "")
            } else {
              var val = parseInt(((new Date(next.event_time)).getTime() - (new Date(a.event_time)).getTime()) / 1000 + "")
              obj.duration += val
            }

           

            a.duration = getTimeStr(val) 
            
          }
          
          obj.event_count++

        processMap.set(a.flow_pid, obj)

        transactioneventMap.set(a.flow_id, a);


        
        
        return a

      })
      setProcessMap(processMap)
      setTransactioneventList(res.data)




});
    const getFilterOfTimestamps = async () => {
    
      filterOfTimestamps({ pageSize: 300, current: 1, user_id: currentUser?.id, type: 0 }).then((res) => {

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
        res.data.push({ value: 'add', label: 'Add new template' })
        setFilterOfTimestampsList(res.data)
        setFilterOfTimestampsMap(m)

      });
    }
    handleget=getFilterOfTimestamps
    getFilterOfTimestamps()

    transaction({ pageSize: 1, current: 1, id: transaction_id }).then((res) => {


      setCurrentRow(res.data[0])
      handlegetFlow([])
      if (res.data[0].status == 1) {
        setValidateStatus(1)
        validateBC({ id: res.data[0].id }).then((res) => {
          if (res.data.length==0) {
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
    []
  );

  var color = {
    'icon-daojishimeidian': '#70AD47',
    'icon-matou': '#70AD47',
    'icon-a-tadiao_huaban1': '#70AD47',
    'icon-zhuanyunche': '#70AD47',
    'icon-matou1': '#70AD47',
    'icon-daojishi': '#70AD47'
  }
 
  return (<div
    style={{
      background: '#F5F7FA',
    }}
  >
    <PageContainer

      header={{
        title: false

      }}

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
          handlegetFlow(value.value)
            handleModalOpen(false);
            setCurrentFilter(value);

          
        }}
        onDelete={async (value) => {
          handleRemove([currentFilter], (success) => {
            if (success) {
              handleModalOpen(false);
              setSelectValue(null)
              handleget()
            }
            
          })

        }}
        onCancel={() => {
          handleModalOpen(false);
         
        }}
        createModalOpen={createModalOpen}
        values={currentFilter || {}}
      />
      {!isMP && (<ProTable<any>
        columns={columns}
        dataSource={currentRow?[currentRow]:[]}
        rowKey="key"
        pagination={false}
        search={false}
        toolBarRender={false}
        bordered size="small"

      />)}

      {isMP && (<> <ProDescriptions<any>
        bordered={true}
        size="small"
        layout="horizontal"
        column={1}
        title={currentRow?.process_name}
        request={async () => ({
          data: currentRow || {},
        })}
        params={{
          id: currentRow?.id,
        }}
        columns={columns as ProDescriptionsItemProps<any>[]}
      /></>)

        }

    
      {!isMP && (<ProCard ghost={true} style={{ marginBlockStart:  16  }}><div style={{ width: '100%', height: 'auto', overflow: 'auto', padding: "10px", backgroundColor: "#FFF" }}>
        <div style={{ position: 'relative', float: 'left', zIndex: 1, textAlign: 'left', marginRight: 10 }}>

          <div style={{ position: 'relative', zIndex: 1, fontSize: '14px', color: "#808080" }}>Processes</div>
          <div style={{ position: 'relative', zIndex: 1, height: '40px', }}>

          </div>
          <div style={{ fontSize: '14px', color: "#808080" }}>
            Duration
          </div>
          <div style={{ fontSize: '10px', color: "#808080" }}>
            Threshold
          </div>
        </div>
        {flowTreeAll.map((e, i) => {

          var p = processMap.get(e.id)
          var ar = alertruleProcessMap[e.id]
         
          return [
            <div style={{ position: 'relative', float: 'left', zIndex: 1, textAlign: 'center', width: '10%' }}>


              <div style={{ position: 'absolute', zIndex: 0, top: 40, left: i == 0 ? '50%' : 0, width: (i == 0 || i==5)? '50%' : '100%', height: 2, backgroundColor: '#8aabe5', overflow: 'hidden', }}></div>
              <div style={{ position: 'relative', zIndex: 1, fontSize: '14px', color: "#333", fontWeight: "bold" }}>{e.name}</div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                {e.id != "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" && (<span style={{
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

                  <span style={{
                    marginTop: 7,
                    display: "inline-block",
                    color: "#fff",
                    width: '80px',
                    height: '25px',
                    fontSize: "14px",
                    backgroundColor: currentRow?.status == 1 ? (transactionAlert[e.id] ? (transactionAlert[e.id].red > 0 ? "red" : "#DE8205") : color[e.icon]):"#595959",      
                    borderRadius: '50%',
                    textAlign: 'center',
                    lineHeight: '25px'
                  }}>

                    {totalDuration > 0 ? getTimeStr(totalDuration) : ""}
                  </span>

                  )} 

              </div>
              <div style={{ fontSize: '14px', color: "#333", height: 20, lineHeight: "20px" }}>
                {p && p.event_count == e.children.length ? getTimeStr(p.duration) : ""}
              </div>
              <div style={{ fontSize: '10px' }}>
                {ar && (<SvgIcon style={{ color: "#DE8205" }} type="icon-yuan" />)} {ar ? ar.amber_hours + "h " + ar.amber_mins + "m" : ""} {ar && (<SvgIcon style={{ color: "red" }} type="icon-yuan" />)} {ar ? ar.red_hours + "h " + ar.red_mins + "m" : ""}
              </div>
            </div>,

            
              e.id != "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"?
                (<div style={{ width: '4.5%', position: 'relative', float: 'left', textAlign: 'center', display: i >= flowTreeAll.length-2 ? "none" : "block" }}>
              <div style={{ position: 'absolute', zIndex: 0, top: 40, width: '100%', height: 2, backgroundColor: '#8aabe5', overflow: 'hidden', }}></div>
              <div style={{ position: 'relative', marginTop: '35px', fontSize: "20px", zIndex: 1 }}>

                {p && p.process_duration > 0 && (<SvgIcon type={'icon-map-link-full'} />)}

              </div>
              <div style={{ fontSize: '10px' }}>
                {p && p.process_duration > 0 ? getTimeStr(p.process_duration):"" }
              </div>
            </div>):null


          ]


        })
        }




        <div style={{ position: 'relative', cursor: "pointer", float: 'left', zIndex: 1, width: '140px', textAlign: 'center' }} onClick={() => {

          history.push(`/transaction/blockchainIntegration?transaction_id=` + currentRow?.id, { validateData: validateData } );
        
        } }>

          <div style={{ position: 'relative', zIndex: 1, fontSize: '14px', height: 25, color: "#333" }}></div>
          <div style={{ position: 'relative', zIndex: 1, height: '30px', }}>

            {validateStatus == 1 ? (<Spin />) :

              <span style={{
                display: "inline-block",
                color: validateStatus == 2 ? "#fff" : "#A6A6A6",
                width: '30px',
                height: '30px',
                fontSize: "20px",
                backgroundColor: validateStatus == 2 ? "#67C23A" : "#E7E6E6",
                borderRadius: '50%',
                textAlign: 'center',
                lineHeight: '30px'
              }}>

                <CheckOutlined />

              </span>

              }
            
          </div>
          <div style={{ fontSize: '10px', color: validateStatus == 2 ? "#67C23A" : "#808080", width: "100%s" }}>
            Timestamps to be validated on blockchain
          </div>

        </div>

      </div></ProCard>)}






      {isMP && (<ProCard ghost={true} style={{ marginBlockStart: 16 }}><div style={{ width: '100%', height: 'auto', overflow: 'auto', padding: "10px", backgroundColor: "#FFF" }}>
        <div style={{ position: 'relative', float: 'left', zIndex: 1, textAlign: 'left', marginRight: 10, width: '100%' }}>
          <div style={{ float: 'left', width: 40, height: 40, width: '40px' }}>
            
          </div>
          <div style={{ position: 'relative', zIndex: 1, marginLeft: 5, fontSize: '14px', color: "#808080", width: '30%', float: 'left' }}>
            Processes
          </div>
         
          <div style={{ fontSize: '14px', color: "#808080", float: 'left', width: '15%' }}>
            Duration
          </div>
          <div style={{ fontSize: '14px', color: "#808080", float: 'left', width: '40%', textAlign: 'center' }}>
            Threshold
          </div>
        </div>
        {flowTreeAll.map((e, i) => {

          var p = processMap.get(e.id)
          var ar = alertruleProcessMap[e.id]
          return [
            <div style={{ position: 'relative', float: 'left', zIndex: 1, textAlign: 'left', width: '100%' }}>


              <div style={{ position: 'relative', zIndex: 1, float: 'left' }}>

                {e.id != "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" && (
                  <span style={{
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
                  <span style={{
                    marginTop: 5,
                    display: "inline-block",
                    color: "#fff",
                    width: '70px',
                    height: '25px',
                    fontSize: "14px",
                    backgroundColor: currentRow?.status == 1 ? (transactionAlert[e.id] ? (transactionAlert[e.id].red > 0 ? "red" : "#DE8205") : color[e.icon]) : "#595959",
                    borderRadius: '50%',
                    textAlign: 'center',
                    lineHeight: '25px'
                  }}>

                    {totalDuration > 0 ? getTimeStr(totalDuration) : ""}
                  </span>

                  )}
              </div>
              <div style={{ position: 'relative', marginLeft: 5, height: '40px', lineHeight: '40px', width: '30%', zIndex: 1, float: 'left', fontSize: '12px', color: "#333", fontWeight: "bold" }}>{e.name}</div>
              {e.id != "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" && (
                <div style={{ fontSize: '12px', float: 'left', height: '40px', lineHeight: '40px', width: '15%', color: "#333" }}>
                  {p && p.event_count == e.children.length ? getTimeStr(p.duration) : ""}
                </div>)}
              <div style={{ fontSize: '10px', height: '40px', lineHeight: '40px', textAlign: 'center', width: '40%', display: "inline-block", float:'right'  }}>
                {ar && (<SvgIcon style={{ color: "#DE8205" }} type="icon-yuan" />)} {ar ? ar.amber_hours + "h " + ar.amber_mins + "m" : ""} {ar && (<SvgIcon style={{ color: "red" }} type="icon-yuan" />)} {ar ? ar.red_hours + "h " + ar.red_mins + "m" : ""}
              </div>
            </div>,

            e.id != "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" ?(
            <div style={{ height: '30px', position: 'relative', float: 'left', textAlign: 'center' }}>
              <div style={{ position: 'absolute', zIndex: 0, left: 20, height: '100%', width: 2, backgroundColor: '#8aabe5', overflow: 'hidden', }}></div>
              <div style={{ position: 'relative', marginLeft: '19px', fontSize: "14px", height: 20, lineHeight: '20px', zIndex: 1 }}>
                {p && p.process_duration > 0 && (<SvgIcon type={'icon-map-connect-full'} />)}
                
                <span style={{ display: 'inline-block', height: 20, marginLeft: 5, lineHeight: '20px', fontSize: "14px" }}>  {p && p.process_duration > 0 ? getTimeStr(p.process_duration) : ""}</span>
              </div>
             
            </div>):null


          ]


        })
        }

       


        <div style={{ position: 'relative', float: 'left', zIndex: 1, textAlign: 'center', width: '100%' }} onClick={() => {

          history.push(`/transaction/blockchainIntegration?transaction_id=` + currentRow?.id, { validateData: validateData });

        }}>


          <div style={{ position: 'relative', zIndex: 1, float: 'left', marginLeft: '5px' }}>
            {validateStatus == 1 ? (<Spin size="large" />) :
              <span style={{
                display: "inline-block",
                color: validateStatus == 2 ? "#fff" : "#A6A6A6",
                width: '30px',
                height: '30px',
                fontSize: "20px",
                backgroundColor: validateStatus == 2 ? "#67C23A" : "#E7E6E6",
                borderRadius: '50%',
                textAlign: 'center',
                lineHeight: '30px'
              }}>

                <CheckOutlined />
              </span>}
          </div>
          <div style={{ position: 'relative', height: '40px', lineHeight: '40px', zIndex: 1, float: 'left', fontSize: '14px', color: "#333", fontWeight: "bold" }}>{''}</div>
          <div style={{ fontSize: '14px', float: 'left', height: '40px', lineHeight: '40px', color: "#333" }}>

          </div>
          <div style={{ fontSize: '10px', float: 'left', color: validateStatus == 2 ? "#67C23A" : "#808080", height: '40px', marginLeft:'5px', textAlign: "left", lineHeight: '40px'}}>
            Timestamps to be validated on blockchain
          </div>
        </div>

     

      </div></ProCard>)}

      <ProCard collapsed={collapsed} colSpan={34} style={{ marginBlockStart: 16 }} bodyStyle={{ padding: '16px', overflow: isMP ? 'auto' : 'hidden' }} wrap title={<div style={{ fontWeight: '500', fontSize: 14 }}> Threshold Applied (Between 2 Events) </div>} extra={< EyeOutlined onClick={() => {
        setCollapsed(!collapsed);
      }} style={{ fontWeight: 'normal', fontSize: 14 }} />} bordered headerBordered>

        {alertruleEventList.length==0 && (<Empty />)}


        {alertruleEventList.map((ta) => {
          var tb=transactionAlert?.b2e?.[ta.flow_id + "_" + ta.flow_id_to]
          return (
            <ProCard ghost={true} colSpan={isMP ? 24 : 12} 
              collapsibleIconRender={({
                collapsed: buildInCollapsed,
              }: {
                collapsed: boolean;
              }) => (buildInCollapsed ? <span> </span> : <span> </span>)}
              style={{ marginBlockStart: 5 }}
              headStyle={{ padding: 0, fontWeight: 'normal', fontSize:'14px'}}
              bodyStyle={{paddingLeft:25} }
              collapsible
              defaultCollapsed
              onClick={(e) => {
                handlegetFlow([ta.flow_id, ta.flow_id_to])
              } }
              title={(<div style={{ position: 'relative', height: 30, lineHeight: '30px', marginBottom: "10px" }}>

                <div style={{ float: "left",  paddingLeft: '10px' }}>
                  <span style={{
                    display: "inline-block",
                    color: "#fff",
                    width: '100px',
                    height: '25px',
                    fontSize: "14px",
                    backgroundColor: tb ? tb.type == 0 ? "#DE8205" : "red" : (getTimeByTwoEvent(ta.flow_id, ta.flow_id_to) == '-' ? "#595959" : "#67C23A"),
                    borderRadius: '50%',
                    textAlign: 'center',
                    lineHeight: '25px'
                  }}>

                    {getTimeByTwoEvent(ta.flow_id, ta.flow_id_to)}
                  </span>
                </div>
                <div style={{ float: "left", paddingLeft: '10px', fontWeight: 'normal', fontSize: '14px' }}>
                  {flowConf[ta.flow_id]}<span >{' -> '}</span>{flowConf[ta.flow_id_to]}
                </div>

              </div>) }

            >

             
              <ProDescriptions
                column={isMP ? 1 : 2} >
                <ProDescriptions.Item label="Threshold" valueType="text" style={{fontSize:'14px'} } >
                  <SvgIcon style={{ color: "#DE8205" }} type="icon-yuan" /> {ta.amber_hours + "h " + ta.amber_mins + "m "} <SvgIcon style={{ color: "red", marginLeft: 5 }}  type="icon-yuan" />  {ta.red_hours + "h " + ta.red_mins + "m "} 
                </ProDescriptions.Item>
               
               


              </ProDescriptions>

            </ProCard>
          )




        })}

        

       


      </ProCard>
      

      <ProCard  style={{ marginBlockStart: 16 }} title={'Detailed Timestamps' }
        bordered headerBordered
        extra={<Select
          style={{ width: 200 }}
          allowClear={true}
          value={selectValue}
          onClear={() => {
            setCurrentFilter(null);
            setIsAdd(false)
            handlegetFlow("")
          } }
          dropdownMatchSelectWidth={ false}
          onSelect={(a) => {
            setSelectValue(a)
            if (a == "add") {
              setCurrentFilter(null);
              setIsAdd(true)
              handleModalOpen(true);
            }
            else {
              setCurrentFilter(filterOfTimestampsMap.get(a));
              handlegetFlow(filterOfTimestampsMap.get(a).value)
              setIsAdd(false)
            }
           
            
            
          }}
          placeholder={'Filter By: Timestamps'}
          
          options={filterOfTimestampsList}
        />}
      >

       


      <div style={{ backgroundColor: "#fff", position: 'relative', width: '100%', height: 'auto', overflow:'auto' }}>
       



        <Steps
          direction={'vertical'}
          size="default"
          style={{ float: 'left', width: '99%', marginLeft: "1%", marginTop:  0, maxHeight: '400px', overflow: 'auto' }}
        >

          {flowTree.map(e => {
            var p = processMap.get(e.id)
            var ar = alertruleProcessMap[e.id]
            flowTreeAll.forEach((nn) => {
              if (nn.id == e.id) {

                e.children_length = nn.children?.length

                console.log(e.children_length)
              }
            })
            var arr = [



              <Step style={{ cursor: 'pointer' }} status="finish" icon={


                <span onClick={() => {
                  show[e.id] = !show[e.id]
                  setShow({ ...show })
                  console.log(show)
                }} style={{
                  display: "inline-block",

                  color: "#fff",
                  width: '35px',
                  height: '35px',
                  backgroundColor: e.id == 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' ? "#fff" : (p ? (p.event_count > 0 ? transactionAlert[e.id] ? (transactionAlert[e.id].red > 0 ? "red" : "#DE8205") : color[e.icon] : "#595959") : "#595959"),
                  borderRadius: '50%',
                  textAlign: 'center',
                  lineHeight: '35px'
                }}>
                  <SvgIcon style={{ color: '#fff' }} type={e.icon} />
                </span>



              } title={<div style={{ color: e.id == 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' ? "#fff":"none" }} onClick={() => {
                show[e.id] = !show[e.id]
                setShow({ ...show })
                console.log(show)
                }}> <span style={{ paddingRight: '20px', width: 135, display: "inline-block", textAlign: "left", fontSize: "16px", lineHeight: "20px", height: 20 }}>{e.name}</span>
                <span style={{ paddingLeft: '20px', display: "inline-block", textAlign: "left", fontSize: "14px", lineHeight: "20px", height: 20 }}>{p && p.event_count == e.children_length ? getTimeStr(p.duration) : ""}</span></div>} description={<div >{

                  e.children?.map(c => {
                    if (!show[e.id]) {

                      return
                    }

                    var te = transactioneventMap.get(c.id)
                    return (

                      <ProCard
                        
                        style={{ marginTop: 10, maxWidth: "100%"}}
                        title={<span style={{ fontSize: "12px", backgroundColor: "#F2F2F2", padding: "5px", borderRadius: '5px', fontWeight: 'normal' }}>{(te ? moment(te?.event_time).format('YYYY-MM-DD HH:mm:ss') + "   " : "") + c.name}</span>}
                        collapsibleIconRender={({ collapsed: buildInCollapsed }: { collapsed: boolean }) =>
                          <span style={{ color: "#6495ED", marginLeft: -4 }}>-</span>
                        }
                        collapsible={te ? true : false}
                        defaultCollapsed
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

                        <ProDescriptions editable={access.canAdmin ? {
                         
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
                          <ProDescriptions.Item label="Work order ID" dataIndex="work_order_id" valueType="text" >
                           {te?.work_order_id}
                          </ProDescriptions.Item>
                          <ProDescriptions.Item label="Product Type" dataIndex="product_type" valueType="text">
                            {te?.product_type}
                          </ProDescriptions.Item>
                          <ProDescriptions.Item label="Tank ID" dataIndex="tank_id" valueType="text">
                            {te?.tank_id}
                          </ProDescriptions.Item>
                          <ProDescriptions.Item label="Volume" dataIndex="volume" valueType="text">
                            {te?.volume}
                          </ProDescriptions.Item>
                          <ProDescriptions.Item label="Unit of Measurement" dataIndex="unit_of_measurement" valueType="text">
                            {te?.unit_of_measurement}
                          </ProDescriptions.Item>
                          
                            {
                              access.canAdmin && <ProDescriptions.Item label="Event Time" dataIndex="event_time" valueType="text">
                                {moment(te?.event_time).format('YYYY-MM-DD HH:mm:ss')}
                              </ProDescriptions.Item>
                            }
                          
                            
                        </ProDescriptions>
                      </ProCard>

                    )

                  })


                }</div>} />
            ]



            //return arr


            return arr
          })
          }


        </Steps>
      </div>
      
        </ProCard>

       





       
      


    </PageContainer>
  </div>)
}
  export default Detail;
