import React, { useRef, useState, useEffect, useCallback } from 'react';
import { PageContainer, ProCard, ProColumns, ProDescriptions, ProFormGroup, ProFormSelect, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { AlertOutlined, SafetyCertificateOutlined, CheckOutlined, CloseOutlined, InfoCircleOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { FormattedMessage, useIntl, useLocation, useModel, history } from '@umijs/max';
import { TransactionList, TransactionListItem } from '../data.d';
import { transaction, transactionevent, addTransactionevent, writetoBC, validateBC } from '../service';
import { Button, Space, Steps, Icon, Select, message, Spin, Drawer } from 'antd';
import { flow } from '../../system/flow/service';
import { filterOfTimestamps, addFilterOfTimestamps, updateFilterOfTimestamps } from '../../account/filterOfTimestamps/service';
import { getAlertBytransactionId } from '../../alert/service';
import { SvgIcon } from '@/components' // 自定义组件
import { tree, isPC } from "@/utils/utils";
import { useAccess, Access } from 'umi';
import FilterForm from '../../account/filterOfTimestamps/components/FilterForm';
import { rearg } from 'lodash';


import { jetty } from '../../system/jetty/service';
import { alertrule } from '../../alertrule/service';
import { InfiniteScroll, List, NavBar, DotLoading } from 'antd-mobile'
import numeral from 'numeral';
var moment = require('moment');



const { Step } = Steps;


const is_do = (transactioneventList: any[], id: any) => {
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
  const [currentRow2, setCurrentRow2] = useState<TransactionListItem>();
  const [currentRow3, setCurrentRow3] = useState<TransactionListItem>();
  const [blockchainRow, setBlockchainRowRow] = useState<any>([

  ]);

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

  const [jettyList, setJettyList] = useState<any>({});
 

  const [alertruleMap, setAlertruleMap] = useState<any>({});

  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [show, setShow] = useState<any>({});
  const access = useAccess();

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const [currentEventRow, setCurrentEventRow] = useState<any>(null);
  var transaction_id = useLocation().search.split("=")[1]
  var m = {}

  var yesCount = 0
  var headValidated_ = false
  if (useLocation().state.validateData?.head_data?.Verified == "True") {
    
    headValidated_=true
  }

  const [headValidated, setHeadValidated] = useState<any>(headValidated_);
  useLocation().state.validateData?.event_data?.forEach((v) => {
    m[v.EventSubStage] = v.Verified
    if (v.Verified == "True" && v.EventSubStage != 100600 && v.EventSubStage !=400900) {
      yesCount++
    }


  })
 
  const [bc_header_data, setBc_header_data] = useState<any>(useLocation().state.validateData?.bc_head_data);
  const [bc_event_data, setBc_event_data] = useState<any>(useLocation().state.validateData?.bc_event_data);
  

  const [validateData, setValidateData] = useState<any>(m);
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [isAdd, setIsAdd] = useState<boolean>(false);

  const [totalDuration, setTotalDuration] = useState<any>(0);

  const [flowConf, setFlowConf] = useState<any>({});
  const [flowMap, setFlowMap] = useState<any>({});
  const [isMP, setIsMP] = useState<boolean>(!isPC());



  const columns2: ProColumns<TransactionListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.xxx"
          defaultMessage="Transaction Data"
        />
      ),
      dataIndex: 'title'
    
      
    },
    {
      title: (
        <FormattedMessage
          id="pages.xxx"
          defaultMessage="Value On EOS System"
        />
      ),
      dataIndex: 'value'


    },
    {
      title: (
        <FormattedMessage
          id="pages.xxx"
          defaultMessage="Value On Blockchain"
        />
      ),
      dataIndex: 'bc_value'


    },
    {
      title: (
        <FormattedMessage
          id="pages.xxx"
          defaultMessage="Validation Status"
        />
      ),
      align: 'center',
      dataIndex: 'validation_status',
      render: (dom, entity) => {

        if (currentRow?.blockchain_hex_key) {
          if (dom === 1) {
            return <span><CheckOutlined style={{ color: 'green' }} /></span>
          } else {
            return <span><CloseOutlined style={{ color: 'red' }} /></span>
          }
        } else {
          return "-"
        }
        
      }

    },


  ]
  

  const columns3: ProColumns<TransactionListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.xxx"
          defaultMessage="Event Data"
        />
      ),
      dataIndex: 'title'


    },
    {
      title: (
        <FormattedMessage
          id="pages.xxx"
          defaultMessage="Value On EOS System"
        />
      ),
      dataIndex: 'value'


    },
    {
      title: (
        <FormattedMessage
          id="pages.xxx"
          defaultMessage="Value On Blockchain"
        />
      ),
      dataIndex: 'bc_value'


    },
    {
      title: (
        <FormattedMessage
          id="pages.xxx"
          defaultMessage="Validation Status"
        />
      ),
      align: 'center',
      dataIndex: 'validation_status',
      render: (dom, entity) => {

        if (currentRow?.blockchain_hex_key) {
          if (dom === 1) {
            return <span><CheckOutlined style={{ color: 'green' }} /></span>
          } else {
            return <span><CloseOutlined style={{ color: 'red' }} /></span>
          }

        } else {
          return "-"
        }
      }

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
      render: (dom, entity) => {
        
          return "E"+dom
       

      },
    },

    
    {
      title: <FormattedMessage id="pages.transaction.startOfTransaction" defaultMessage="Start of transaction" />,
      dataIndex: 'start_of_transaction',
     
      hideInSearch: true,
      render: (dom, entity) => {
      
        return moment(dom).format('DD MMM YYYY HH:mm') 
       
       
      },
    },
    {
      title: <FormattedMessage id="pages.transaction.endOfTransaction" defaultMessage="End of transaction" />,
      dataIndex: 'end_of_transaction',
     
      hideInSearch: true,
      render: (dom, entity) => {
       

        return dom ? moment(dom).format('DD MMM YYYY HH:mm') :"-"
       

      },
    },
    {
      title: <FormattedMessage id="pages.transaction.status" defaultMessage="Status" />,
      dataIndex: 'status',
      valueEnum: {
        0:  "Open",
        1: "Closed",
        2: "Cancelled" 
      },
      render: (dom, entity) => {

        var obj = {
          0: "Open",
          1: "Closed",
          2: "Cancelled"
        }
       
          return obj[dom+""]
       

      },
    },
    {
      title: <FormattedMessage id="pages.transaction.arrivalID" defaultMessage="Arrival ID" />,
      dataIndex: 'arrival_id',
      hideInSearch: true,
      render: (dom, entity) => {
       
          return dom
       

      },
    },

   /* {
      title: <FormattedMessage id="pages.transaction.currentProcess" defaultMessage="Current Process" />,
      dataIndex: 'flow_id',
     // valueEnum: flowConf,
      render: (dom, entity) => {
        if (!isMP) {
          return dom
        }
        if (entity.validated) {
          return <div><div style={{ height: isMP?'auto': '60px' }}>{flowConf[dom]}</div><div><CheckOutlined style={{ color: 'green' }} /></div></div>
        } else {
          return <div><div style={{ height: isMP?'auto': '60px' }}>{flowConf[dom]}</div><div><CloseOutlined style={{ color: 'red' }} /></div></div>
        }

      },

    },*/
   

    {
      title: <FormattedMessage id="pages.transaction.imoNumber" defaultMessage="IMO Number" />,
      dataIndex: 'imo_number',
      hideInSearch: true,
      valueType: 'text',
      render: (dom, entity) => {
        
          return dom
        

      },
    },
    {
      title: <FormattedMessage id="pages.transaction.vesselName" defaultMessage="Vessel Name" />,
      dataIndex: 'vessel_name',
      valueType: 'text',
      render: (dom, entity) => {
      
          return dom
      

      },
    },
    {
      title: <FormattedMessage id="pages.transaction.terminalName" defaultMessage="Terminal Name" />,
      dataIndex: 'terminal_id',
     // valueEnum: terminalList,
      render: (dom, entity) => {
        
          return entity.terminal_name
        

      },
    },
    {
      title: <FormattedMessage id="pages.transaction.jettyName" defaultMessage="Jetty Name" />,
      dataIndex: 'jetty_id',
      //valueEnum: jettyList,
      render: (dom, entity) => {
       
          return entity.jetty_name
       

      },
    },
    {
      title: <FormattedMessage id="pages.transaction.xxx" defaultMessage="Trader Name" />,
      dataIndex: 'trader_name',
     
    },
    {
      title: <FormattedMessage id="pages.transaction.xxx" defaultMessage="Agent" />,
      dataIndex: 'agent',

    },
    {
      title: <FormattedMessage id="pages.transaction.xxx" defaultMessage="Arrival Status" />,
      dataIndex: 'arrival_id_status',

    },
    {
      title: <FormattedMessage id="pages.transaction.xxx" defaultMessage="Vessel Size" />,
      dataIndex: 'vessel_size_dwt',

    },
    {
      title: <FormattedMessage id="pages.transaction.xxx" defaultMessage="Berthing Rilotage ID" />,
      dataIndex: 'BerthingRilotageID',

    },
    
    {
      title: <FormattedMessage id="pages.transaction.xxx" defaultMessage="Pilotage Location From1" />,
      dataIndex: 'PilotageLocationFrom1',

    },
    {
      title: <FormattedMessage id="pages.transaction.xxx" defaultMessage="Pilotage Location To1" />,
      dataIndex: 'PilotageLocationTo1',

    },


    {
      title: <FormattedMessage id="pages.transaction.xxx" defaultMessage="Unberthing Pilotage ID" />,
      dataIndex: 'UnberthingPilotageID',

    },
   
    {
      title: <FormattedMessage id="pages.transaction.xxx" defaultMessage="Pilotage Location From2" />,
      dataIndex: 'PilotageLocationFrom2',

    },
    {
      title: <FormattedMessage id="pages.transaction.xxx" defaultMessage="Pilotage Location To2" />,
      dataIndex: 'PilotageLocationTo2',

    },
   
    
    /*{
      title: <FormattedMessage id="pages.transaction.productType" defaultMessage="Product Type" />,
      dataIndex: 'product_name',
     // valueEnum: producttypeList,
      render: (dom, entity) => {
        
          return dom
       

      },
    },
    {
      title: <FormattedMessage id="pages.alertrule.throughputVolume1" defaultMessage="Total Nominated Quantity (MT)" />,
      dataIndex: 'product_quantity_in_mt',
      hideInSearch: true,
      valueType: "text",

      render: (dom, entity) => {
      
        if (dom) {
          dom = numeral(dom).format('0,0')
        } else {
          dom = ''
        }
       
          return dom
      

      },

      
    },
    {
      title: <FormattedMessage id="pages.alertrule.throughputVolume1" defaultMessage="Total Nominated Quantity (Bls-60-F)" />,
      dataIndex: 'product_quantity_in_bls_60_f',
      hideInSearch: true,
      valueType: 'text',
      render: (dom, entity) => {
        if (dom) {
          dom = numeral(dom).format('0,0')
        } else {
          dom=''
        }
       
          return dom
       
       

      }
      
    },

    {
      title: <FormattedMessage id="pages.transaction.totalDuration" defaultMessage="Entire Duration (Till Date)" />,
      dataIndex: 'total_duration',
      hideInSearch: true,
      render: (dom, entity) => {

         
        if (dom > 0 && entity.status == 1) {
          dom = parseInt((dom / 3600) + "") + "h " + parseInt((dom % 3600) / 60) + "m"

        } else {
          dom='-'
        }
       
          return dom
       

      },
      
      valueType: 'text',
    }*/
  ];
  
  const columnsBlockchain: ProColumns<TransactionListItem>[] = [

    {
      title: <FormattedMessage id="pages.blockchainIntegration.stage" defaultMessage="Stage" />,
      dataIndex: 'stage',
      valueEnum:flowConf,
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.blockchainIntegration.timeStamp" defaultMessage="Time Stamp" />,
      dataIndex: 'time_stamp',
      
      render: (dom, entity) => {
        return moment(dom).format('DD MMM YYYY HH:mm:ss')
      },
      
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.blockchainIntegration.activity" defaultMessage="Activity" />,
      dataIndex: 'activity',
      valueEnum: flowConf,
      hideInSearch: true
    },
    {
      title: <FormattedMessage id="pages.blockchainIntegration.validated" defaultMessage="Validation Status" />,
      dataIndex: 'validated',
      align:"center",
      
      render: (dom, entity) => {


        if (currentRow?.blockchain_hex_key) {
          if (validateData[entity.code] === 'True') {
            return <span><CheckOutlined style={{ color: validateData[entity.code] === 'True' ? 'green' : 'red' }} />&nbsp;&nbsp;&nbsp;&nbsp;<InfoCircleOutlined style={{ color: validateData[entity.code] === 'True' ? 'green' : 'red' }} onClick={() => {
              eventRowClick(entity)
            }} /></span>

          } else {
            return <span><CloseOutlined style={{ color: validateData[entity.code] === 'True' ? 'green' : 'red' }} />&nbsp;&nbsp;&nbsp;&nbsp;<InfoCircleOutlined style={{ color: validateData[entity.code] === 'True' ? 'green' : 'red' }} onClick={() => {
              eventRowClick(entity)
            }} /></span>

          }
        } else {
          return  "-"
        }
       
       
      
       
            


          
       
      }
    }
  ];
  useEffect(() => {
    jetty({ pageSize: 3000, current: 1, sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setJettyList(b)

    });

    alertrule({ pageSize: 3000, current: 1, type: 0 }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.flow_id] = r
      })
      setAlertruleMap(b)

    });

   
   
    //setTransaction_id(transaction_id)
    handlegetFlow = (f: any) => {
      var fidMap = {}
     
      flow({  sorter: { sort: 'ascend' } }).then((res) => {

        var b = {}
        var flowMap_ = {}
        res.data.forEach((r) => {
          b[r.id] = r.name
          flowMap_[r.id] = r.code
        })
        setFlowConf(b)
        setFlowMap(flowMap_)
        var ss = res.data.map((bb) => { return { ...bb } })
        var all = tree(ss, "                                    ", 'pid')
        setFlowTreeAll(all)

        if (f && f.length > 0) {

          res.data.forEach((a) => {
            if (a.pid && f.some((c) => {
              return c == a.id
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
        


        setFlowList(res.data)
        res.data = tree(res.data, "                                    ", 'pid')
        setFlowTree(res.data)


        transactionevent({
          transaction_id: transaction_id, sorter: { event_time: 'ascend' }
        }).then((res) => {
          res.data=res.data.filter((a) => {
            return a.flow_id != "1e026150-d910-11ed-a7e5-47842df0d9cc" && a.flow_id != "66ba5680-d912-11ed-a7e5-47842df0d9cc"
          })

          setTransactioneventList(res.data)
          var reMap = {}
          var blockchainRow = res.data.map((a) => {

            var EventSubStage = flowMap_[a.flow_id]


          

            if (!reMap[flowMap_[a.flow_id]]) {

              reMap[flowMap_[a.flow_id]] = 0
            }

            reMap[flowMap_[a.flow_id]] += 1
           

            EventSubStage = EventSubStage + (("00" + (reMap[flowMap_[a.flow_id]] - 1)).slice(-2))

           

           
            var b = {
              stage: a.flow_pid, time_stamp: a.event_time, activity: a.flow_id, ...a, code: EventSubStage
            }
            return b
          })

          setBlockchainRowRow(blockchainRow)


          transaction({ pageSize: 1, current: 1, id: transaction_id }).then((res2) => {
            var transactionInfo = res2.data[0]

            var BerthingPilotage = {}
            var UnberthingPilotage = {}

            res.data.forEach((te) => {
              if (te.order_no && te.location_to && te.location_from) {
              

                if (te.flow_pid == "9f2431b0-d3c9-11ed-a0d9-55ccaa27cc37") {
                  
                  BerthingPilotage = te
                }

                if (te.flow_pid == "a7332eb0-d3c9-11ed-a0d9-55ccaa27cc37") {
                 
                  UnberthingPilotage = te
                }
              }

            })

            transactionInfo.BerthingPilotageID = BerthingPilotage.order_no ? parseInt(BerthingPilotage.order_no) : null,
              transactionInfo.PilotageLocationFrom1 = BerthingPilotage.location_from || null,
              transactionInfo.PilotageLocationTo1 = BerthingPilotage.location_to || null,
              transactionInfo.UnberthingPilotageID = UnberthingPilotage.order_no ? parseInt(UnberthingPilotage.order_no) : null,
              transactionInfo.PilotageLocationFrom2 = UnberthingPilotage.location_from || null,
              transactionInfo.PilotageLocationTo2 = UnberthingPilotage.location_to || null








            transactionInfo.validated = headValidated ? 1 : 0

            var arr = []

            var dMap = {

              "EOSID": "eos_id",
              "ArrivalID": "arrival_id",
              "StartOfTransaction": "start_of_transaction",
              "EndOfTransaction": "end_of_transaction",
              "Jetty": "jetty_name",
              "VesselName": "vessel_name",
              "TerminalName": "terminal_name",
              "TraderName": "trader_name",
              "Agent": "agent",
              "Status": "status",
              "VesselSize": "vessel_size_dwt",
              "ArrivalStatus": "arrival_id_status",
              "IMONumber": "imo_number",
              "BerthingRilotageID": "BerthingRilotageID",

              "PilotageLocationFrom1": "PilotageLocationFrom1",
              "PilotageLocationTo1": "PilotageLocationTo1",

              "UnberthingPilotagel": "UnberthingPilotagel",
              "PilotageLocationFrom2": "PilotageLocationFrom2",
              "PilotageLocationTo2": "PilotageLocationTo2"

            }

            for (var k in transactionInfo) {

              var c = columns.find((a) => { return a.dataIndex == k })
              if (c) {
                var r = {}

                r['title'] = c.title
                r['validated'] = false

                r['value'] = c.render ? c.render(transactionInfo[k], transactionInfo) : transactionInfo[k]
                var obj = {}
                for (var m in bc_header_data) {
                  obj[dMap[m]] = bc_header_data[m]

                }
                r['bc_value'] = c.render ? c.render(obj[k], obj) : obj[k]


                r['validation_status'] = headValidated ? 1 : 0

                arr.push(r)
              }


            }

            setCurrentRow2(arr)

            setCurrentRow(transactionInfo)

          });













        });


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


    
    
    
    return () => {

    };
  },
    []
  );

  var color = {
    'icon-daojishimeidian': '#A13736',
    'icon-matou': '#ED7D31',
    'icon-habor': '#70AD47',
    'icon-zhuanyunche': '#70AD47',
    'icon-matou1': '#595959'
  }



  var eventRowClick = (record) => {
    var arr = []
    var columns3_ = [
      {
        title: "EOS ID",
        dataIndex: 'eos_id',

      },
      {
        title: "Event Sub Stage",
        dataIndex: 'code'

      },
      {
        title: "Event Time",
        dataIndex: 'event_time'


      },
      {
        title: "Product Quantity (Bls-60-f)",
        dataIndex: 'product_quantity_in_bls_60_f',

      },
      {
        title: "Tank ID",
        dataIndex: 'tank_number',

      },
      {
        title: "Work Order ID",
        dataIndex: 'work_order_id',

      },
      {
        title: "Sequence No.",
        dataIndex: 'work_order_sequence_number',

      },
     
    
      {
        title: "Sequence Status",
        dataIndex: 'work_order_sequence_number_status',

      },
    
      {
        title: "Surveyor Name",
        dataIndex: 'work_order_surveyor',

      },
     


    ]
    var dMap = {
      "EOSID": "eos_id",
      "EventSubStage": "code",
      "Timestamp": "event_time",
      "Field1": "product_quantity_in_bls_60_f",
      "Field2": "tank_number",
      "Field3": "work_order_id",
      "Field4": "work_order_sequence_number",
      "Field5": "work_order_operation_type",
      "Field6": "product_name",
      "Field7": "work_order_status",
      "Field8": "work_order_sequence_number_status",
      "Field9": "work_order_surveyor"
    }
    if (record.delay_reason) {

      dMap.Field5 = "delay_reason"
      columns3_.push({
        title: "Delay Reason",
        dataIndex: 'delay_reason',

      })
    } else {

      columns3_.push({
        title: "Operation Type",
        dataIndex: 'work_order_operation_type',

      })
       
    }

    if (record.location_from) {
      dMap.Field6 = "location_from"
      columns3_.push({
        title: "Location From",
        dataIndex: 'location_from',

      })
    } else {
      columns3_.push({
        title: "Product Name",
        dataIndex: 'product_name',

      })
    }
    if (record.location_to) {
      dMap.Field7 = "location_to"
      columns3_.push({
        title: "Location To",
        dataIndex: 'location_to',

      })
    } else {
      columns3_.push({
        title: "Work order Status",
        dataIndex: 'work_order_status',

      })
    }

   

    
   


    for (var k in record) {

      var c = columns3_.find((a) => { return a.dataIndex == k })
      if (c) {
        var r = {}

        r['title'] = c.title
        r['validated'] = false




        r['value'] = c.render ? c.render(record[k], record) : record[k]


        if (c.dataIndex == "event_time") {
          r['value'] = moment(new Date(r['value'])).format('DD MMM YYYY HH:mm:ss')
        }
        var obj = {}
        var bc_event_data_one = bc_event_data.find((j) => {
          return j.EventSubStage == record.code
        })






        for (var m in bc_event_data_one) {
          obj[dMap[m]] = bc_event_data_one[m]

        }
        r['bc_value'] = c.render ? c.render(obj[k], obj) : obj[k]

        if (c.dataIndex == "event_time") {
          r['bc_value'] = moment(new Date(r['bc_value'])).format('DD MMM YYYY HH:mm:ss')

        }
        if (r['bc_value'] == "") {
          r['bc_value'] =null
        }

        if (r['bc_value'] == 0) {
          r['bc_value'] = null
        }

        if (r['value'] == "") {
          r['value'] = null
        }

        if (r['value'] == 0) {
          r['value'] = null
        }


       
      
          r['validation_status'] = (r['value'] == r['bc_value'] ? 1 : 0)
        

       

        arr.push(r)
      }


    }

    setCurrentRow3(arr)


    

    setShowDetail(true);

    setCurrentEventRow(record)
  }

  return (<div
    style={{
      background: '#F5F7FA',
    }}
  >
    <PageContainer

      header={{
        title: "Status Of Transactions Data Verified Against Polygon Blockchain"

      }}

    >
     
      {true && (<ProTable<any>
        headerTitle="Transaction Information"
        columns={columns2}
        dataSource={currentRow2 ? currentRow2: []}
        rowKey="key"
        pagination={false}
        search={false}
        options={false }
        
        bordered size="small"

      />)}

      {false && (<><div style={{ height: 30, lineHeight: '30px', fontWeight: "bold" }}>Transaction</div> <ProDescriptions<any>
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


      {!isMP && (<ProTable<any>

        toolBarRender={() => [

          <span>
            Total: {blockchainRow?.length} &nbsp; &nbsp; Validated <CheckOutlined style={{ color: 'green' }} />: {yesCount}&nbsp; &nbsp; Failed <CloseOutlined style={{ color: 'red' }} />: {blockchainRow?.length - yesCount }
          </span>,
          
         
          ,
        ]}


        headerTitle={<span>Transaction Stages and Activities </span>}
        columns={columnsBlockchain}
        dataSource={blockchainRow ? blockchainRow : []}
        rowKey="key"
       
        pagination={false}
        search={false}
        options={false}
        bordered size="small"

      />)}

      {isMP && (<>

        <div style={{ height: 30, lineHeight: '30px', fontWeight: "bold" }}>Transaction Stages and Activities</div>
        <div style={{marginBottom:10} }>
          <span>
            Total: {blockchainRow?.length} &nbsp; &nbsp; Validated <CheckOutlined style={{ color: 'green' }} />: {yesCount}&nbsp; &nbsp; Failed <CloseOutlined style={{ color: 'red' }} />: {blockchainRow?.length - yesCount}
          </span>
        </div>
        <List>
            {blockchainRow.map((item, index) => (
            
            <List.Item key={index}>

              <ProDescriptions<any>
                  className="jetty-descriptions"
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
                  columns={columnsBlockchain as ProDescriptionsItemProps<any>[]}
              />

            </List.Item>
          ))}
        </List>
       
      </>)}
     









      <div style={{ marginTop: 15, paddingLeft: 0 }} className="re-back">
        <Button

          type="default"
          onClick={async () => {
            history.back()
          }}
        >Return To Detailed Transaction</Button>
      </div>

      <Drawer
        width={isMP ? '100%' : 800}
        open={showDetail}
        onClose={() => {
          setCurrentEventRow(undefined);
          setShowDetail(false);
        }}
        closable={isMP ? true : false}
      >
        <ProTable<any>
          headerTitle="Event Detail"

          
        columns={columns3}
          dataSource={currentRow3 ? currentRow3 : []}
          rowKey="key"
          pagination={false}
          search={false}
          options={false}

          bordered size="small"

        />
      </Drawer>

    </PageContainer>
  </div>)
}
export default Detail;
