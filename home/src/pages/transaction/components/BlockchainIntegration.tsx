import React, { useRef, useState, useEffect, useCallback } from 'react';
import { PageContainer, ProCard, ProColumns, ProDescriptions, ProFormGroup, ProFormSelect, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { AlertOutlined, SafetyCertificateOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { FormattedMessage, useIntl, useLocation, useModel, history } from '@umijs/max';
import { TransactionList, TransactionListItem } from '../data.d';
import { transaction, transactionevent, addTransactionevent, writetoBC, validateBC } from '../service';
import { Button, Space, Steps, Icon, Select, message, Spin } from 'antd';
import { flow } from '../../system/flow/service';
import { filterOfTimestamps, addFilterOfTimestamps, updateFilterOfTimestamps } from '../../account/filterOfTimestamps/service';
import { getAlertBytransactionId } from '../../alert/service';
import { SvgIcon } from '@/components' // 自定义组件
import { tree, isPC } from "@/utils/utils";
import { useAccess, Access } from 'umi';
import FilterForm from '../../account/filterOfTimestamps/components/FilterForm';
import { rearg } from 'lodash';
import { terminal } from '../../system/terminal/service';
import { producttype } from '../../system/producttype/service';
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
  const [terminalList, setTerminalList] = useState<any>({});
  const [jettyList, setJettyList] = useState<any>({});
  const [producttypeList, setProducttypeList] = useState<any>({});

  const [alertruleMap, setAlertruleMap] = useState<any>({});

  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [show, setShow] = useState<any>({});
  const access = useAccess();
  var transaction_id = useLocation().search.split("=")[1]
  var m = {}

  var yesCount = 0
  useLocation().state.validateData.forEach((v) => {
    m[v.EventSubStage] = v.Verified
    if (v.Verified == "True") {
      yesCount++
    }


  })
  const [validateData, setValidateData] = useState<any>(m);
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [isAdd, setIsAdd] = useState<boolean>(false);

  const [totalDuration, setTotalDuration] = useState<any>(0);

  const [flowConf, setFlowConf] = useState<any>({});
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
          defaultMessage="Details"
        />
      ),
      dataIndex: 'value'


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


        if (dom=== 1) {
          return <span><CheckOutlined style={{ color: 'green' }} /></span>
        } else {
          return <span><CloseOutlined style={{ color: 'red' }} /></span>
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
        if(!isMP){
          return "E"+dom
        }
        if (entity.validated) {
          return <div><div style={{ height: isMP ? 'auto' : '60px' }}>{"E" + dom}</div><div><CheckOutlined style={{ color: 'green' }} /></div></div>
        } else {
          return <div><div style={{ height: isMP ? 'auto' : '60px' }}>{"E" + dom}</div><div><CloseOutlined style={{ color: 'red' }} /></div></div>
        }

      },
    },

    
    {
      title: <FormattedMessage id="pages.transaction.startOfTransaction" defaultMessage="Start of transaction" />,
      dataIndex: 'start_of_transaction',
      valueType: 'dateTime',
      hideInSearch: true,
      render: (dom, entity) => {
        if (!isMP) {
          return moment(new Date(dom)).format('DD/MM/YYYY HH:mm') 
        }
        if (entity.validated) {
          return <div><div style={{ height: isMP?'auto': '60px' }}>{dom}</div><div><CheckOutlined style={{ color: 'green' }} /></div></div>
        } else {
          return <div><div style={{ height: isMP?'auto': '60px' }}>{dom}</div><div><CloseOutlined style={{ color: 'red' }} /></div></div>
        }
       
      },
    },
    {
      title: <FormattedMessage id="pages.transaction.endOfTransaction" defaultMessage="End of transaction" />,
      dataIndex: 'end_of_transaction',
      valueType: 'dateTime',
      hideInSearch: true,
      render: (dom, entity) => {
        if (!isMP) {

          return dom?moment(new Date(dom)).format('DD/MM/YYYY HH:mm') :"-"
        }
        if (entity.validated) {
          return <div><div style={{ height: isMP?'auto': '60px' }}>{dom}</div><div><CheckOutlined style={{ color: 'green' }} /></div></div>
        } else {
          return <div><div style={{ height: isMP?'auto': '60px' }}>{dom}</div><div><CloseOutlined style={{ color: 'red' }} /></div></div>
        }

      },
    },
    {
      title: <FormattedMessage id="pages.transaction.status" defaultMessage="Status" />,
      dataIndex: 'status',
      valueEnum: {
        0: { text: <FormattedMessage id="pages.transaction.active" defaultMessage="Open" /> },
        1: { text: <FormattedMessage id="pages.transaction.closed" defaultMessage="Closed" /> },
        2: { text: <FormattedMessage id="pages.transaction.cancelled" defaultMessage="Cancelled" /> }
      },
      render: (dom, entity) => {
        if (!isMP) {
          return dom
        }
        if (entity.validated) {
          return <div><div style={{ height: isMP?'auto': '60px' }}>{dom}</div><div><CheckOutlined style={{ color: 'green' }} /></div></div>
        } else {
          return <div><div style={{ height: isMP?'auto': '60px' }}>{dom}</div><div><CloseOutlined style={{ color: 'red' }} /></div></div>
        }

      },
    },
    {
      title: <FormattedMessage id="pages.transaction.arrivalID" defaultMessage="Arrival ID" />,
      dataIndex: 'arrival_id',
      hideInSearch: true,
      render: (dom, entity) => {
        if (!isMP) {
          return dom
        }
        if (entity.validated) {
          return <div><div style={{ height: isMP?'auto': '60px' }}>{dom}</div><div><CheckOutlined style={{ color: 'green' }} /></div></div>
        } else {
          return <div><div style={{ height: isMP?'auto': '60px' }}>{dom}</div><div><CloseOutlined style={{ color: 'red' }} /></div></div>
        }

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
        if (!isMP) {
          return dom
        }
        if (entity.validated) {
          return <div><div style={{ height: isMP?'auto': '60px' }}>{dom}</div><div><CheckOutlined style={{ color: 'green' }} /></div></div>
        } else {
          return <div><div style={{ height: isMP?'auto': '60px' }}>{dom}</div><div><CloseOutlined style={{ color: 'red' }} /></div></div>
        }

      },
    },
    {
      title: <FormattedMessage id="pages.transaction.vesselName" defaultMessage="Vessel Name" />,
      dataIndex: 'vessel_name',
      valueType: 'text',
      render: (dom, entity) => {
        if (!isMP) {
          return dom
        }
        if (entity.validated) {
          return <div><div style={{ height: isMP?'auto': '60px' }}>{dom}</div><div><CheckOutlined style={{ color: 'green' }} /></div></div>
        } else {
          return <div><div style={{ height: isMP?'auto': '60px' }}>{dom}</div><div><CloseOutlined style={{ color: 'red' }} /></div></div>
        }

      },
    },
    {
      title: <FormattedMessage id="pages.transaction.terminalName" defaultMessage="Terminal Name" />,
      dataIndex: 'terminal_id',
     // valueEnum: terminalList,
      render: (dom, entity) => {
        if (!isMP) {
          return terminalList[dom]
        }
        if (entity.validated) {
          return <div><div style={{ height: isMP?'auto': '60px' }}>{terminalList[dom]}</div><div><CheckOutlined style={{ color: 'green' }} /></div></div>
        } else {
          return <div><div style={{ height: isMP?'auto': '60px' }}>{terminalList[dom]}</div><div><CloseOutlined style={{ color: 'red' }} /></div></div>
        }

      },
    },
    {
      title: <FormattedMessage id="pages.transaction.jettyName" defaultMessage="Jetty Name" />,
      dataIndex: 'jetty_id',
      //valueEnum: jettyList,
      render: (dom, entity) => {
        if (!isMP) {
          return jettyList[dom]
        }
        if (entity.validated) {
          return <div><div style={{ height: isMP?'auto': '60px' }}>{jettyList[dom]}</div><div><CheckOutlined style={{ color: 'green' }} /></div></div>
        } else {
          return <div><div style={{ height: isMP?'auto': '60px' }}>{jettyList[dom]}</div><div><CloseOutlined style={{ color: 'red' }} /></div></div>
        }

      },
    },


    {
      title: <FormattedMessage id="pages.transaction.productType" defaultMessage="Product Type" />,
      dataIndex: 'product_name',
     // valueEnum: producttypeList,
      render: (dom, entity) => {
        if (!isMP) {
          return dom
        }
        if (entity.validated) {
          return <div><div style={{ height: isMP?'auto': '60px' }}>{dom}</div><div><CheckOutlined style={{ color: 'green' }} /></div></div>
        } else {
          return <div><div style={{ height: isMP?'auto': '60px' }}>{dom}</div><div><CloseOutlined style={{ color: 'red' }} /></div></div>
        }

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
        if (!isMP) {
          return dom
        }
        if (entity.validated) {
          return <div><div style={{ height: isMP?'auto': '60px' }}>{dom}</div><div><CheckOutlined style={{ color: 'green' }} /></div></div>
        } else {
          return <div><div style={{ height: isMP?'auto': '60px' }}>{dom}</div><div><CloseOutlined style={{ color: 'red' }} /></div></div>
        }

      },

      
    },
    {
      title: <FormattedMessage id="pages.alertrule.throughputVolume1" defaultMessage="Total Nominated Quantity (Bal-60-F)" />,
      dataIndex: 'product_quantity_in_bls_60_f',
      hideInSearch: true,
      valueType: 'text',
      render: (dom, entity) => {
        if (dom) {
          dom = numeral(dom).format('0,0')
        } else {
          dom=''
        }
        if (!isMP) {
          return dom
        }
        if (entity.validated) {
          return <div><div style={{ height: isMP?'auto': '60px' }}>{dom}</div><div><CheckOutlined style={{ color: 'green' }} /></div></div>
        } else {
          return <div><div style={{ height: isMP?'auto': '60px' }}>{dom}</div><div><CloseOutlined style={{ color: 'red' }} /></div></div>
        }

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
        if (!isMP) {
          return dom
        }
        if (entity.validated) {
          return <div><div style={{ height: isMP?'auto': '60px' }}>{dom}</div><div><CheckOutlined style={{ color: 'green' }} /></div></div>
        } else {
          return <div><div style={{ height: isMP?'auto': '60px' }}>{dom}</div><div><CloseOutlined style={{ color: 'red' }} /></div></div>
        }

      },
      
      valueType: 'text',
    }
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
      valueType: 'dateTime',
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


        if (validateData[entity.activity] === 'True') {
          return <span><CheckOutlined style={{ color:'green' }} /></span>
        } else {
          return <span><CloseOutlined style={{ color: 'red' }} /></span>
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
        console.log("dddddddddd", res.data)


        setFlowList(res.data)
        res.data = tree(res.data, "                                    ", 'pid')
        setFlowTree(res.data)


        transactionevent({
          pageSize: 1000, current: 1, transaction_id: transaction_id, sorter: { event_time: 'ascend' }
        }).then((res) => {


          setTransactioneventList(res.data)

          var blockchainRow = res.data.map((a) => {
            var b = {
              stage: a.flow_pid, time_stamp: a.event_time, activity: a.flow_id, validated: yesCount ? 1 : 0
            }
            return b
          })

          setBlockchainRowRow(blockchainRow)

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


    
    
    transaction({ pageSize: 1, current: 1, id: transaction_id }).then((res) => {

     
      res.data[0].validated = yesCount ? 1 : 0

      var arr=[]
      for (var k in res.data[0]) {

        var c = columns.find((a) => { return a.dataIndex == k })
        if (c) {
          var r = {}
          
          r['title'] = c.title
          r['validated'] = false

          r['value'] = c.render ? c.render(res.data[0][k], res.data[0]) : res.data[0][k]
          r['validation_status'] = 1

          arr.push(r)
        }
        

      }
      
      setCurrentRow2(arr)

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
    'icon-habor': '#70AD47',
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
        title: "Status Of Transactions Data Verified Against Polygon Blockchain"

      }}

    >
     
      {!isMP && (<ProTable<any>
        headerTitle="Transaction Information"
        columns={columns2}
        dataSource={currentRow2 ? currentRow2: []}
        rowKey="key"
        pagination={false}
        search={false}
        options={false }
        
        bordered size="small"

      />)}

      {isMP && (<><div style={{ height: 30, lineHeight: '30px', fontWeight: "bold" }}>Transaction</div> <ProDescriptions<any>
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
          <Access accessible={access.canAdmin} fallback={<div></div>}> <Button
            type="primary"
            key="primary"
            onClick={() => {
              
              writetoBC({ id: currentRow?.id }).then((res) => {
                
              })
            }}
          >
            WritetoBC
          </Button></Access>
         
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
        >Return to detailed transaction</Button>
      </div>



    </PageContainer>
  </div>)
}
export default Detail;
