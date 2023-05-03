import React, { useRef, useState, useEffect,useCallback } from 'react';
import { PageContainer, ProCard, ProColumns, ProDescriptions, ProFormGroup, ProFormSelect, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { AlertOutlined, SafetyCertificateOutlined, CheckOutlined  } from '@ant-design/icons'; 
import ProTable from '@ant-design/pro-table';
import { FormattedMessage, useIntl, useLocation, useModel } from '@umijs/max';
import { TransactionList, TransactionListItem } from '../data.d';
import { transaction, transactionevent, addTransactionevent } from '../service';
import { Button, Space, Steps, Icon, Select, message } from 'antd';
import { flow } from '../../system/flow/service';
import { filterOfTimestamps, addFilterOfTimestamps, updateFilterOfTimestamps } from '../../account/filterOfTimestamps/service';
import { getAlertBytransactionId } from '../../alert/service';
import { SvgIcon } from '@/components' // 自定义组件
import { tree,isPC } from "@/utils/utils";
import FilterForm from '../../account/filterOfTimestamps/components/FilterForm';
import { rearg } from 'lodash';
import { terminal } from '../../system/terminal/service';
import { producttype } from '../../system/producttype/service';
import { jetty } from '../../system/jetty/service';
import { alertrule } from '../../alertrule/service';

var moment = require('moment');
const { Step } = Steps;


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

  const [alertruleMap, setAlertruleMap] = useState<any>({});

  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [show, setShow] = useState<any>({});
  var transaction_id = useLocation().search.split("=")[1]
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [isAdd, setIsAdd] = useState<boolean>(false);

  const [totalDuration, setTotalDuration] = useState<any>(0);

  const [flowConf, setFlowConf] = useState<any>({});
  const [isMP, setIsMP] = useState<boolean>(!isPC());
  const columns: ProColumns<TransactionListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.transaction.transactionID"
          defaultMessage="EOS ID"
        />
      ),
      dataIndex: 'id',
      tip: 'The EOS ID is the unique key',
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
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.transaction.endOfTransaction" defaultMessage="End of transaction" />,
      dataIndex: 'end_of_transaction',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.transaction.status" defaultMessage="Status" />,
      dataIndex: 'status',
      valueEnum: {
        0: { text: <FormattedMessage id="pages.transaction.active" defaultMessage="Active" />, status: 'Success' },
        1: { text: <FormattedMessage id="pages.transaction.closed" defaultMessage="Closed" />, status: 'Default' },
        2: { text: <FormattedMessage id="pages.transaction.cancelled" defaultMessage="Cancelled" />, status: 'Default' }
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
      dataIndex: 'product_type_id',
      valueEnum: producttypeList,
    },
    {
      title: <FormattedMessage id="pages.alertrule.throughputVolume1" defaultMessage="Total nominated quantity (MT)" />,
      dataIndex: 'total_nominated_quantity_m',
      hideInSearch: true,
      valueType: "text",
      render: (dom, entity) => {
        if (entity.total_nominated_quantity_m) {


          return (entity.total_nominated_quantity_m + "").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }

      },
    },
    {
      title: <FormattedMessage id="pages.alertrule.throughputVolume1" defaultMessage="Total nominated quantity (Bal-60-F)" />,
      dataIndex: 'total_nominated_quantity_b',
      hideInSearch: true,
      valueType: 'text',
      render: (dom, entity) => {
        if (entity.total_nominated_quantity_b) {
          return (entity.total_nominated_quantity_b + "").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }

      },
    },

    {
      title: <FormattedMessage id="pages.transaction.totalDuration" defaultMessage="Total Duration" />,
      dataIndex: 'total_duration',
      hideInSearch: true,
      renderText: (val: Number) => {
        if (val > 0) {
          return parseInt(val / 60) + " Hours " + (val % 60) + " Mins"
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


  useEffect(() => {
    jetty({ pageSize: 3000, current: 1, sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setJettyList(b)

    });

    alertrule({ pageSize: 3000, current: 1, type:0 }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.flow_id] = r
      })
      setAlertruleMap(b)

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
      var fidMap = {}
      flow({ pageSize: 300, current: 1, sorter: { sort: 'ascend' } }).then((res) => {

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
        }
        console.log("dddddddddd",res.data)


        setFlowList(res.data)
        res.data = tree(res.data, "                                    ", 'pid')
        setFlowTree(res.data)


        getAlertBytransactionId({ pageSize: 300, current: 1, transaction_id: transaction_id }).then((res) => {
          var map = new Map()
          res.data.forEach((a) => {

            map.set(a.flow_id, true)
          })

          setTransactionAlert(map)


          setSummaryList(flowTree.map((a, index) => {
            return {
              no: index + 1,
              process: a.name,
              noOfActivities: 1,
              totalDuration: 1,
              thresholdBreach: transactionAlert.get(a.id),
              blockchainVerified: 0

            }
          }))

        });

      });
     }
    

    handlegetFlow([])
    
    
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
             
              obj.process_duration=parseInt(((new Date(res.data[index + 1].event_time)).getTime() - (new Date(a.event_time)).getTime()) / 1000 + "")
            }

            var val = parseInt(((new Date(next.event_time)).getTime() - (new Date(a.event_time)).getTime()) / 1000 + "")
            obj.duration += val

            a.duration = parseInt((val / 3600) + "") + " Hours " + parseInt((val % 3600) / 60) + " Mins"
            
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
          a.label = b.name
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

      });
      return () => {
       
      };
    },
    []
  );

  var color = {
    'icon-daojishimeidian': '#A13736',
    'icon-matou': '#ED7D31',
    'icon-a-tadiao_huaban1': '#70AD47',
    'icon-zhuanyunche': '#70AD47',
    'icon-matou1': '#595959'
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

    
      {!isMP && (<div style={{ width: '100%', height: 'auto', overflow: 'auto', padding: "10px", backgroundColor: "#FFF" }}>
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
          var ar = alertruleMap[e.id]
         
          return [
            <div style={{ position: 'relative', float: 'left', zIndex: 1, textAlign: 'center', width: '10%' }}>


              <div style={{ position: 'absolute', zIndex: 0, top: 40, left: i == 0 ? '50%' : 0, width: i == 0 ? '50%' : '100%', height: 2, backgroundColor: '#8aabe5', overflow: 'hidden', }}></div>
              <div style={{ position: 'relative', zIndex: 1, fontSize: '14px', color: "#333", fontWeight: "bold" }}>{e.name}</div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <span style={{
                  display: "inline-block",
                  color: "#fff",
                  width: '40px',
                  height: '40px',
                  fontSize: "30px",
                  backgroundColor: color[e.icon],
                  borderRadius: '50%',
                  textAlign: 'center',
                  lineHeight: '40px'
                }}>

                  <SvgIcon type={e.icon} />
                </span>
              </div>
              <div style={{ fontSize: '14px', color: "#333", height: 20, lineHeight: "20px" }}>
                {p && p.event_count == e.children.length ? parseInt((p.duration / 3600) + "") + " h " + parseInt((p.duration % 3600) / 60) + " m" : ""}
              </div>
              <div style={{ fontSize: '10px' }}>
                {ar && (<SvgIcon style={{ color: "#DE8205" }} type="icon-yuan" />)} {ar ? ar.amber_hours + "h " + ar.amber_mins + "m" : ""} {ar && (<SvgIcon style={{ color: "red" }} type="icon-yuan" />)} {ar ? ar.red_hours + "h " + ar.red_mins + "m" : ""}
              </div>
            </div>,


            <div style={{ width:  '4.5%', position: 'relative', float: 'left', textAlign: 'center', display: i == e.children.length ? "none" : "block" }}>
              <div style={{ position: 'absolute', zIndex: 0, top: 40, width: '100%', height: 2, backgroundColor: '#8aabe5', overflow: 'hidden', }}></div>
              <div style={{ position: 'relative', marginTop: '35px', fontSize: "20px", zIndex: 1 }}>

                {p && p.process_duration > 0 && (<SvgIcon type={'icon-map-link-full'} />)}

              </div>
              <div style={{ fontSize: '10px' }}>
                {p && p.process_duration > 0 ? parseInt((p.process_duration / 3600) + "") + " h " + parseInt((p.process_duration % 3600) / 60) + " m":"" }
              </div>
            </div>


          ]


        })
        }



        <div style={{ position: 'relative', float: 'left', zIndex: 1, textAlign: 'center' }}>
          <div style={{ position: 'absolute', zIndex: 0, top: 40, width: '50%', height: 2, backgroundColor: '#8aabe5', overflow: 'hidden', }}></div>
          <div style={{ position: 'relative', zIndex: 1, fontSize: '14px', color: "#333", fontWeight: "bold" }}>{'Current/Total Duration'}</div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span style={{
              marginTop: 10,
              display: "inline-block",
              color: "#fff",
              width: '70px',
              height: '25px',
              fontSize: "14px",
              backgroundColor: '#70AD47',
              borderRadius: '50%',
              textAlign: 'center',
              lineHeight: '25px'
            }}>

              {totalDuration > 0 ? parseInt((totalDuration / 3600) + "") + " h " + parseInt((totalDuration % 3600) / 60) + " m" :""}
            </span>

          </div>
          <div style={{ fontSize: '14px', color: "#333", height: 25, lineHeight: "25px" }}>

          </div>
          <div style={{ fontSize: '10px' }}>
            <SvgIcon style={{ color: "#DE8205" }} type="icon-yuan" /> 1h 30m  <SvgIcon style={{ color: "red" }} type="icon-yuan" /> 1h 30m
          </div>
        </div>

        <div style={{ position: 'relative', float: 'left', zIndex: 1, width:'140px', textAlign: 'center' }}>

          <div style={{ position: 'relative', zIndex: 1, fontSize: '14px', height: 30, color: "#333" }}></div>
          <div style={{ position: 'relative', zIndex: 1, height: '30px', }}>
            <span style={{
              display: "inline-block",
              color: currentRow && currentRow.bliockchain_hex_key ? "#fff" :  "#A6A6A6",
              width: '30px',
              height: '30px',
              fontSize: "20px",
              backgroundColor: currentRow && currentRow.bliockchain_hex_key ?"#67C23A":"#E7E6E6",
              borderRadius: '50%',
              textAlign: 'center',
              lineHeight: '30px'
            }}>

              <CheckOutlined />
            </span>
          </div>
          <div style={{ fontSize: '10px', color: currentRow && currentRow.bliockchain_hex_key ? "#67C23A" : "#808080", width: "100%s" }}>
            Timestamps to be validated on blockchain
          </div>

        </div>

      </div>)}






      {isMP && (<div style={{ width: '100%', height: 'auto', overflow: 'auto', padding: "10px", backgroundColor: "#FFF" }}>
        <div style={{ position: 'relative', float: 'left', zIndex: 1, textAlign: 'left', marginRight: 10 }}>
          <div style={{ float: 'left', width: 40, height:40 }}>
            
          </div>
          <div style={{ position: 'relative', zIndex: 1, fontSize: '14px', color: "#808080", marginLeft: 10, float: 'left', }}>Processes</div>
          <div style={{ position: 'relative', zIndex: 1, height: '40px', float: 'left', marginLeft: 10 }}>

          </div>
          <div style={{ fontSize: '14px', color: "#808080", float: 'left', marginLeft: 10 }}>
            Duration
          </div>
          <div style={{ fontSize: '10px', color: "#808080", float: 'left', marginLeft: 10 }}>
            Threshold
          </div>
        </div>
        {flowTreeAll.map((e, i) => {

          var p = processMap.get(e.id)
          var ar = alertruleMap[e.id]
          return [
            <div style={{ position: 'relative', float: 'left', zIndex: 1, textAlign: 'center', width: '100%' }}>


              <div style={{ position: 'relative', zIndex: 1, float: 'left' }}>
                <span style={{
                  display: "inline-block",
                  color: "#fff",
                  width: '40px',
                  height: '40px',
                  fontSize: "30px",
                  backgroundColor: color[e.icon],
                  borderRadius: '50%',
                  textAlign: 'center',
                  lineHeight: '40px'
                }}>

                  <SvgIcon type={e.icon} />
                </span>
              </div>
              <div style={{ position: 'relative', marginLeft:10,height: '40px',lineHeight: '40px',zIndex: 1, float: 'left', fontSize: '14px', color: "#333", fontWeight: "bold" }}>{e.name}</div>
              <div style={{ fontSize: '14px', float: 'left', marginLeft: 10, height: '40px',lineHeight: '40px', color: "#333" }}>
                {p && p.event_count == e.children.length ? parseInt((p.duration / 3600) + "") + " h " + parseInt((p.duration % 3600) / 60) + " m" : ""}
              </div>
              <div style={{ fontSize: '10px', height: '40px', lineHeight: '40px', marginLeft: 10, display: "inline-block" }}>
                {ar && (<SvgIcon style={{ color: "#DE8205" }} type="icon-yuan" />)} {ar ? ar.amber_hours + "h " + ar.amber_mins + "m" : ""} {ar && (<SvgIcon style={{ color: "red" }} type="icon-yuan" />)} {ar ? ar.red_hours + "h " + ar.red_mins + "m" : ""}
              </div>
            </div>,


            <div style={{ height: '30px', position: 'relative', float: 'left', textAlign: 'center', display: i == e.children.length ? "none" : "block" }}>
              <div style={{ position: 'absolute', zIndex: 0, left: 20, height: '100%', width: 2, backgroundColor: '#8aabe5', overflow: 'hidden', }}></div>
              <div style={{ position: 'relative', marginLeft: '19px', fontSize: "14px", height: 20, lineHeight: '20px', zIndex: 1 }}>
                {p && p.process_duration > 0 && (<SvgIcon type={'icon-map-connect-full'} />)}
                
                <span style={{ display: 'inline-block', height: 20, marginLeft: 5, lineHeight: '20px', fontSize: "14px" }}>  {p && p.process_duration > 0 ? parseInt((p.process_duration / 3600) + "") + " h " + parseInt((p.process_duration % 3600) / 60) + " m" : ""}</span>
              </div>
             
            </div>


          ]


        })
        }

        <div style={{ position: 'relative', float: 'left', zIndex: 1, textAlign: 'center', width: '100%' }}>


          <div style={{ position: 'relative', zIndex: 1, float: 'left' }}>
            <span style={{
              marginTop: 10,
              display: "inline-block",
              color: "#fff",
              width: '70px',
              height: '25px',
              fontSize: "14px",
              backgroundColor: '#70AD47',
              borderRadius: '50%',
              textAlign: 'center',
              lineHeight: '25px'
            }}>

              11h 55m
            </span>
          </div>
          <div style={{ position: 'relative', marginLeft: 10, height: '40px', lineHeight: '40px', zIndex: 1, float: 'left', fontSize: '14px', color: "#333", fontWeight: "bold" }}>{'Current/Total Duration'}</div>
          <div style={{ fontSize: '14px', float: 'left', marginLeft: 10, height: '40px', lineHeight: '40px', color: "#333" }}>
            
          </div>
          <div style={{ fontSize: '10px', height: '40px', lineHeight: '40px', marginLeft: 10 }}>
            <SvgIcon style={{ color: "#DE8205" }} type="icon-yuan" /> 1h 30m  <SvgIcon style={{ color: "red" }} type="icon-yuan" /> 1h 30m
          </div>
        </div>


        {currentRow && currentRow.bliockchain_hex_key && (<div style={{ position: 'relative', float: 'left', zIndex: 1, textAlign: 'center', width: '100%' }}>


          <div style={{ position: 'relative', zIndex: 1, float: 'left', marginLeft: '5px' }}>
            <span style={{
              display: "inline-block",
              color: currentRow && currentRow.bliockchain_hex_key ? "#fff" : "#A6A6A6",
              width: '30px',
              height: '30px',
              fontSize: "20px",
              backgroundColor: currentRow && currentRow.bliockchain_hex_key ? "#67C23A" : "#E7E6E6",
              borderRadius: '50%',
              textAlign: 'center',
              lineHeight: '30px'
            }}>

              <CheckOutlined />
            </span>
          </div>
          <div style={{ position: 'relative', marginLeft: 10, height: '40px', lineHeight: '40px', zIndex: 1, float: 'left', fontSize: '14px', color: "#333", fontWeight: "bold" }}>{''}</div>
          <div style={{ fontSize: '14px', float: 'left', marginLeft: 10, height: '40px', lineHeight: '40px', color: "#333" }}>

          </div>
          <div style={{ fontSize: '10px',color: currentRow && currentRow.bliockchain_hex_key ? "#67C23A" : "#808080", height: '40px', lineHeight: '40px', marginLeft: 10 }}>
            Timestamps to be validated on blockchain
          </div>
        </div>)}

     

      </div>)}


      

      <div style={{ height: 40, lineHeight:'40px', backgroundColor: "#001529", padding: '0px 5px 0px 5px' }}>
        <div style={{ float: 'left', color:"#fff" }}>
          Detailed Timestamps
        </div>
        <div style={{ float: 'right' }}>
          <Select

            onSelect={(a) => {
             
              if (a == "add") { setIsAdd(true) } else { setIsAdd(false) }
              setCurrentFilter(filterOfTimestampsMap.get(a));
              handlegetFlow(filterOfTimestampsMap.get(a).value)
              handleModalOpen(true);
            }}
            placeholder={'Filter By: Timestamps'}

            options={filterOfTimestampsList}
          />
        </div>
      </div>
      <div style={{ backgroundColor: "#fff", position: 'relative', width: '100%', height: 'auto', overflow:'auto' }}>
        <div style={{ position: "absolute", top: isMP ? 5 : 20, right: isMP ? 0 : 20, zIndex: 20, borderRadius: 5, backgroundColor: '#E7E6E6', padding: "0px 0px 5px 0px", width: isMP?"100%":300 }}>
          <div style={{ padding: 10, fontWeight: "bold", fontSize: 12 }}>Threshold Applied (Between 2 Events)</div>
          <div style={{ height: 120, overflow: 'auto' }}>
            <div style={{ position: 'relative', height: 30, lineHeight: '30px', backgroundColor: "#F2F2F2", width: '100%', marginBottom: "10px" }}>
              <div style={{ float: "left", width: '50%', paddingLeft: '10px' }}>
                Laytime
              </div>
              <div style={{ float: "left", width: '50%' }}>
                <span style={{
                  display: "inline-block",
                  color: "#fff",
                  width: '90%',
                  height: '25px',
                  fontSize: "14px",
                  backgroundColor: '#70AD47',
                  borderRadius: '50%',
                  textAlign: 'center',
                  lineHeight: '25px'
                }}>

                  11h 55m
                </span>
              </div>
            </div>
            <div style={{ position: 'relative', height: 30, lineHeight: '30px', backgroundColor: "#F2F2F2", width: '100%', marginBottom: "10px" }}>
              <div style={{ float: "left", width: '50%', paddingLeft: '10px' }}>
                Pilotage Services
              </div>
              <div style={{ float: "left", width: '50%' }}>
                <span style={{
                  display: "inline-block",
                  color: "#fff",
                  width: '90%',
                  height: '25px',
                  fontSize: "14px",
                  backgroundColor: '#A13736',
                  borderRadius: '50%',
                  textAlign: 'center',
                  lineHeight: '25px'
                }}>

                  11h 55m
                </span>
              </div>
            </div>
            <div style={{ position: 'relative', height: 30, lineHeight: '30px', backgroundColor: "#F2F2F2", width: '100%', marginBottom: "10px" }}>
              <div style={{ float: "left", width: '50%', paddingLeft: '10px' }}>
                Threshold 3
              </div>
              <div style={{ float: "left", width: '50%' }}>
                <span style={{
                  display: "inline-block",
                  color: "#fff",
                  width: '90%',
                  height: '25px',
                  fontSize: "14px",
                  backgroundColor: '#595959',
                  borderRadius: '50%',
                  textAlign: 'center',
                  lineHeight: '25px'
                }}>

                  11h 55m
                </span>
              </div>
            </div>
          </div>
        </div>
        <Steps
          direction={'vertical'}
          size="default"
          style={{ float: 'left', width: '99%', marginLeft: "1%", marginTop: isMP ? 170 : 20, maxHeight: '400px', overflow: 'auto' }}
        >

          {flowTree.map(e => {
            var p = processMap.get(e.id)

            flowTreeAll.forEach((nn) => {
              if (nn.id == e.id) {

                e.children_length = nn.children.length

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
                  backgroundColor: color[e.icon],
                  borderRadius: '50%',
                  textAlign: 'center',
                  lineHeight: '35px'
                }}>
                  <SvgIcon style={{ color: '#fff' }} type={e.icon} />
                </span>



              } title={<div onClick={() => {
                show[e.id] = !show[e.id]
                setShow({ ...show })
                console.log(show)
              }}> <span style={{ paddingRight: '20px', color: p ? (p.event_count == e.children_length ? '#6495ED' : '#52c41a') : '#999', display: "inline-block", textAlign: "right", fontSize: "16px", lineHeight: "20px", height: 20 }}>{e.name}</span>
                <span style={{ paddingLeft: '20px', color: p ? (p.event_count == e.children_length ? '#6495ED' : '#52c41a') : '#999', display: "inline-block", textAlign: "left", fontSize: "14px", lineHeight: "20px", height: 20 }}>{p && p.event_count == e.children_length ? parseInt((p.duration / 3600) + "") + " Hours " + parseInt((p.duration % 3600) / 60) + " Mins" : ""}</span></div>} description={<div >{

                  e.children.map(c => {
                    if (!show[e.id]) {

                      return
                    }

                    var te = transactioneventMap.get(c.id)
                    return (

                      <ProCard
                        style={{ marginTop: 10, maxWidth: "700px"}}
                        title={<span style={{ fontSize: "12px", backgroundColor: "#F2F2F2", padding: "5px", borderRadius: '5px', fontWeight: 'normal' }}>{(te ? moment(te?.event_time).format('YYYY-MM-DD HH:mm:ss') + "   " : "") + c.name}</span>}
                        collapsibleIconRender={({ collapsed: buildInCollapsed }: { collapsed: boolean }) =>
                          <span style={{ color: "#6495ED", marginLeft: -4 }}>-</span>
                        }
                        collapsible={te ? true : false}
                        defaultCollapsed
                        onCollapse={(collapse) => console.log(collapse)}
                        extra={
                          (!te ? <Button
                            size="small"
                            onClick={(e) => {
                              addTransactionevent({ transaction_id: currentRow?.id, flow_id: c.id })
                            }}
                          >
                            Execution Event
                          </Button> : "")
                        }
                      >

                        <ProDescriptions column={isMP ? 1 : 3} >
                          <ProDescriptions.Item label="Work order ID" valueType="text">
                            {te?.work_order_id}
                          </ProDescriptions.Item>
                          <ProDescriptions.Item label="Product Type" valueType="text">
                            {te?.product_type}
                          </ProDescriptions.Item>
                          <ProDescriptions.Item label="Tank ID" valueType="text">
                            {te?.tank_id}
                          </ProDescriptions.Item>
                          <ProDescriptions.Item label="Volume" valueType="text">
                            {te?.volume_of_product}
                          </ProDescriptions.Item>
                          <ProDescriptions.Item label="Unit of Measurement" valueType="text">
                            {te?.unit_of_measurement}
                          </ProDescriptions.Item>

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
      
      

       





       
      


    </PageContainer>
  </div>)
}
  export default Detail;
