import React, { useRef, useState, useEffect, useCallback } from 'react';
import { PageContainer, ProCard, ProColumns, ProDescriptions, ProFormGroup, ProFormSelect, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { AlertOutlined, SafetyCertificateOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { FormattedMessage, useIntl, useLocation, useModel, history } from '@umijs/max';
import { TransactionList, TransactionListItem } from '../data.d';
import { transaction, transactionevent, addTransactionevent } from '../service';
import { Button, Space, Steps, Icon, Select, message, Spin } from 'antd';
import { flow } from '../../system/flow/service';
import { filterOfTimestamps, addFilterOfTimestamps, updateFilterOfTimestamps } from '../../account/filterOfTimestamps/service';
import { getAlertBytransactionId } from '../../alert/service';
import { SvgIcon } from '@/components' // 自定义组件
import { tree, isPC } from "@/utils/utils";
import FilterForm from '../../account/filterOfTimestamps/components/FilterForm';
import { rearg } from 'lodash';
import { terminal } from '../../system/terminal/service';
import { producttype } from '../../system/producttype/service';
import { jetty } from '../../system/jetty/service';
import { alertrule } from '../../alertrule/service';
import { InfiniteScroll, List, NavBar, DotLoading } from 'antd-mobile'

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
  const [blockchainRow, setBlockchainRowRow] = useState<any>([
    {
      stage: 'Berthing', time_stamp: '2 Apr 2023 1.10pm', activity: 'Pilot Confirmed Service Time', validated: 1
    },
    {
      stage: 'Berthing', time_stamp: '2 Apr 2023 1.10pm', activity: 'Vessel All Fast', validated: 1
    }
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
       render: (dom, entity) => {
        if (entity.validated) {
          return <div><div>{dom}</div><div><CheckOutlined style={{ color: 'green' }} /></div></div>
        } else {
          return <div><div>{dom}</div><div><CloseOutlined style={{ color: 'red' }} /></div></div>
        }

      },
    },

    
    {
      title: <FormattedMessage id="pages.transaction.startOfTransaction" defaultMessage="Start of transaction" />,
      dataIndex: 'start_of_transaction',
      valueType: 'dateTime',
      hideInSearch: true,
      render: (dom, entity) => {
        if (entity.validated) {
          return <div><div>{dom}</div><div><CheckOutlined style={{ color: 'green' }} /></div></div>
        } else {
          return <div><div>{dom}</div><div><CloseOutlined style={{ color: 'red' }} /></div></div>
        }
       
      },
    },
    {
      title: <FormattedMessage id="pages.transaction.endOfTransaction" defaultMessage="End of transaction" />,
      dataIndex: 'end_of_transaction',
      valueType: 'dateTime',
      hideInSearch: true,
      render: (dom, entity) => {
        if (entity.validated) {
          return <div><div>{dom}</div><div><CheckOutlined style={{ color: 'green' }} /></div></div>
        } else {
          return <div><div>{dom}</div><div><CloseOutlined style={{ color: 'red' }} /></div></div>
        }

      },
    },
    {
      title: <FormattedMessage id="pages.transaction.status" defaultMessage="Status" />,
      dataIndex: 'status',
      valueEnum: {
        0: { text: <FormattedMessage id="pages.transaction.active" defaultMessage="Active" />, status: 'Success' },
        1: { text: <FormattedMessage id="pages.transaction.closed" defaultMessage="Closed" />, status: 'Default' },
        2: { text: <FormattedMessage id="pages.transaction.cancelled" defaultMessage="Cancelled" />, status: 'Default' }
      },
      render: (dom, entity) => {
        if (entity.validated) {
          return <div><div>{dom}</div><div><CheckOutlined style={{ color: 'green' }} /></div></div>
        } else {
          return <div><div>{dom}</div><div><CloseOutlined style={{ color: 'red' }} /></div></div>
        }

      },
    },
    {
      title: <FormattedMessage id="pages.transaction.arrivalID" defaultMessage="Arrival ID" />,
      dataIndex: 'arrival_id',
      hideInSearch: true,
      render: (dom, entity) => {
        if (entity.validated) {
          return <div><div>{dom}</div><div><CheckOutlined style={{ color: 'green' }} /></div></div>
        } else {
          return <div><div>{dom}</div><div><CloseOutlined style={{ color: 'red' }} /></div></div>
        }

      },
    },

    {
      title: <FormattedMessage id="pages.transaction.currentProcess" defaultMessage="Current Process" />,
      dataIndex: 'flow_id',
      valueEnum: flowConf,
      render: (dom, entity) => {
        if (entity.validated) {
          return <div><div>{dom}</div><div><CheckOutlined style={{ color: 'green' }} /></div></div>
        } else {
          return <div><div>{dom}</div><div><CloseOutlined style={{ color: 'red' }} /></div></div>
        }

      },

    },
   

    {
      title: <FormattedMessage id="pages.transaction.imoNumber" defaultMessage="IMO Number" />,
      dataIndex: 'imo_number',
      hideInSearch: true,
      valueType: 'text',
      render: (dom, entity) => {
        if (entity.validated) {
          return <div><div>{dom}</div><div><CheckOutlined style={{ color: 'green' }} /></div></div>
        } else {
          return <div><div>{dom}</div><div><CloseOutlined style={{ color: 'red' }} /></div></div>
        }

      },
    },
    {
      title: <FormattedMessage id="pages.transaction.vesselName" defaultMessage="Vessel Name" />,
      dataIndex: 'vessel_name',
      valueType: 'text',
      render: (dom, entity) => {
        if (entity.validated) {
          return <div><div>{dom}</div><div><CheckOutlined style={{ color: 'green' }} /></div></div>
        } else {
          return <div><div>{dom}</div><div><CloseOutlined style={{ color: 'red' }} /></div></div>
        }

      },
    },
    {
      title: <FormattedMessage id="pages.transaction.terminalName" defaultMessage="Terminal Name" />,
      dataIndex: 'terminal_id',
      valueEnum: terminalList,
      render: (dom, entity) => {
        if (entity.validated) {
          return <div><div>{terminalList[dom]}</div><div><CheckOutlined style={{ color: 'green' }} /></div></div>
        } else {
          return <div><div>{terminalList[dom]}</div><div><CloseOutlined style={{ color: 'red' }} /></div></div>
        }

      },
    },
    {
      title: <FormattedMessage id="pages.transaction.jettyName" defaultMessage="Jetty Name" />,
      dataIndex: 'jetty_id',
      valueEnum: jettyList,
      render: (dom, entity) => {
        if (entity.validated) {
          return <div><div>{jettyList[dom]}</div><div><CheckOutlined style={{ color: 'green' }} /></div></div>
        } else {
          return <div><div>{jettyList[dom]}</div><div><CloseOutlined style={{ color: 'red' }} /></div></div>
        }

      },
    },


    {
      title: <FormattedMessage id="pages.transaction.productType" defaultMessage="Product Type" />,
      dataIndex: 'product_type_id',
      valueEnum: producttypeList,
      render: (dom, entity) => {
        if (entity.validated) {
          return <div><div>{producttypeList[dom]}</div><div><CheckOutlined style={{ color: 'green' }} /></div></div>
        } else {
          return <div><div>{producttypeList[dom]}</div><div><CloseOutlined style={{ color: 'red' }} /></div></div>
        }

      },
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
    }
  ];
  
  const columnsBlockchain: ProColumns<TransactionListItem>[] = [

    {
      title: <FormattedMessage id="pages.blockchainIntegration.stage" defaultMessage="Stage" />,
      dataIndex: 'stage',
      valueType: 'dateTime',
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
      hideInSearch: true
    },
    {
      title: <FormattedMessage id="pages.blockchainIntegration.validated" defaultMessage="Validated ( with Blockchain)" />,
      dataIndex: 'validated',
      render: (dom, entity) => {
        if (dom == 1) {
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


    transactionevent({
      pageSize: 1000, current: 1, transaction_id: transaction_id, sorter: { event_time: 'ascend' }
    }).then((res) => {
      var processMap = new Map()
      try {
        setTotalDuration(parseInt(((new Date(res.data[res.data.length - 1].event_time)).getTime() - (new Date(res.data[0].event_time)).getTime()) / 1000 + ""))
      } catch (e) {

      }

      res.data = res.data.map((a, index) => {





        var obj = processMap.get(a.flow_pid)
        if (!obj) {
          obj = { duration: 0, process_duration: 0, status: 0, event_count: 0 }
        }
        var next = res.data[index + 1]
        if (next) {

          if (next.flow_pid != a.flow_pid) {

            obj.process_duration = parseInt(((new Date(res.data[index + 1].event_time)).getTime() - (new Date(a.event_time)).getTime()) / 1000 + "")
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
    handleget = getFilterOfTimestamps
    getFilterOfTimestamps()

    transaction({ pageSize: 1, current: 1, id: transaction_id }).then((res) => {

     
      res.data[0].validated=true
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
        title: "Transactions Validation"

      }}

    >
     
      {!isMP && (<ProTable<any>
        headerTitle="Transaction"
        columns={columns}
        dataSource={currentRow ? [currentRow]: []}
        rowKey="key"
        pagination={false}
        search={false}
       
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
        headerTitle={"Transaction Stages and Activities"}
        columns={columnsBlockchain}
        dataSource={blockchainRow ? blockchainRow : []}
        rowKey="key"
        pagination={false}
        search={false}
       
        bordered size="small"

      />)}

      {isMP && (<>

        <div style={{ height: 30, lineHeight: '30px', fontWeight:"bold" }}>Transaction Stages and Activities</div>
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
     













    </PageContainer>
  </div>)
}
export default Detail;
