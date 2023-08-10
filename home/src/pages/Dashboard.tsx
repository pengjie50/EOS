import { GridContent, ProFormSelect, ProFormDateRangePicker, ProCard, ProFormGroup, ProFormInstance, ProFormDatePicker, ProTable, ProForm } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { EyeOutlined } from '@ant-design/icons';
import { Card, theme, Progress, Statistic, Badge, message, Tooltip, Button, Empty, ConfigProvider, Steps, Pagination } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
const { Divider } = ProCard;
import { flow } from './system/flow/service';
import { jetty } from './system/jetty/service';
import { getAlertBytransactionId } from './alert/service';

import { alertrule } from './alertrule/service';
import { organization } from './system/company/service';
import { transaction, transactionevent, statistics } from './transaction/service';
import { SvgIcon, getDurationInfo } from '@/components' // 自定义组件
import { isPC, tree } from "@/utils/utils";
import { Calendar } from 'antd-mobile'
import { history, FormattedMessage } from '@umijs/max';
import numeral from 'numeral';
import { useAccess, Access } from 'umi';
//import KeepAlive, { withAliveScope, useAliveController } from 'react-activation'

const { Step } = Steps;
// use your custom format
numeral().format('0%');
import moment from 'moment';
import { read } from 'xlsx';

const getFilterStr = (organization_id, organizationMap, dateArr, status, title) => {

  var arr = organization_id.map((a) => {

    return organizationMap[a]?.name
  })
  var dateStr = dateArr[0] && dateArr[1] ? (arr?.length>0?' - ':"") + moment(dateArr[0]).format('DD/MM/YYYY') + ' to ' + moment(dateArr[1]).format('DD/MM/YYYY') : ''
  var terminalStr = (organization_id ? arr.join(",") : "")

 // var statusStr = (status === '' ? '' : (status == 1 ? 'Closed' : 'Open'))
  var statusStr = ""
  if (status == "Open") {
    statusStr = "Open"
  } else {
    statusStr=status.join(",").replace("0", "Open").replace("1", "Closed").replace("2", "Cancelled")
  }
  
  if (terminalStr || dateStr) {
    return statusStr + ' ' + title + ' (' + terminalStr + dateStr + ')'
  } else {
    return statusStr + ' ' + title
  }


}


import {  KeepAliveContext,useLocation } from '@umijs/max';


import { useContext } from 'react';




  


   












const getTimeStr = (time) => {
  return (time ? parseInt((time / 3600) + "") : 0) + "h " + (time ? parseInt((time % 3600) / 60) : 0) + "m"
}
const Welcome: React.FC = () => {


  
  const { token } = theme.useToken();
  const { initialState } = useModel('@@initialState');
  const [flowList, setFlowList] = useState<any>([]);
  const [isMP, setIsMP] = useState<boolean>(!isPC());
  const [transactionList, setTransactionList] = useState<any>([]);
  const [transactionMap, setTransactionMap] = useState<any>({});
  const [organizationList, setOrganizationList] = useState<any>([]);

  const [isLoding, setIsLoding] = useState<boolean>(false);
  
  const { updateTab, dropByCacheKey } = React.useContext(KeepAliveContext);
  
  
  const [flowTreeAll, setFlowTreeAll] = useState<any>([]);

  const [flowConf, setFlowConf] = useState<any>({});
 

  const [transactionAlert, setTransactionAlert] = useState<any>({});
  const [organizationMap, setOrganizationMap] = useState<any>({});

  const [avg_duration, setAvg_duration] = useState<any>({});

  const [collapsed1, setCollapsed1] = useState<boolean>(localStorage.getItem('collapsed1')==='true');
  const [collapsed2, setCollapsed2] = useState<boolean>(localStorage.getItem('collapsed2') ==='true');
  const [collapsed3, setCollapsed3] = useState<boolean>(localStorage.getItem('collapsed3') ==='true');
  const [collapsed4, setCollapsed4] = useState<boolean>(localStorage.getItem('collapsed4') ==='true');


  const [organization_id, setOrganization_id] = useState<any>([]);
  const [dateArr, setDateArr] = useState<any>(['', '']);
  const [status, setStatus] = useState<any>([]);
 
  const formRef = useRef<ProFormInstance>();
 // const [terminal_id, setTerminal_id] = useState(false);
  const [tab, setTab] = useState('Self');
  const access = useAccess();
 
  const { currentUser } = initialState || {};
  const [statisticsObj, setStatisticsObj] = useState<any>([]);
  useEffect(() => {

    if (dateArr[0] && !dateArr[1]) {
      return
    }
    if (!dateArr[0] && dateArr[1]) {
      return
    }
    const hide = message.loading(<FormattedMessage
      id="pages.loading"
      defaultMessage="Loading"
    />);


    let p = { pageSize: 100000, current: 1 }
    if (organization_id && organization_id.length > 0) {
      p.organization_id = {
        'field': 'organization_id',
        'op': 'in',
        'data': organization_id
      }
    }


    if (status && status.length) {
      p.status = {
        'field': 'status',
        'op': 'in',
        'data': status
      }
    }

    if (dateArr[0] && dateArr[1]) {

      dateArr[1] = new Date((new Date(dateArr[1])).getTime() + 3600 * 24 * 1000 - 1)

      p.start_of_transaction = {
        'field': 'start_of_transaction',
        'op': 'between',
        'data': dateArr
      }


    }

    flow({ type: 0, sorter: { sort: 'ascend' } }).then((res) => {
      res.data.push({ name: 'Entire Duration', icon: 'icon-daojishi', pid: '                                    ', id: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' })
      res.data.push({ name: 'Between 2 Events', icon: 'icon-yundongguiji', pid: '                                    ', id: 'b2e' })

      var m = {}
      var ss = res.data.map((bb) => { m[bb.id] = bb; return { ...bb } })
      setFlowConf(m)
      var all = tree(ss, "                                    ", 'pid')

      setFlowTreeAll(all)



      setFlowList(res.data)
      // getAlertrule(all)
      flow({ isGetAll: true, sorter: { sort: 'ascend' } }).then((res2) => {
        var mm = {}
        res2.data.forEach((bb) => { mm[bb.id] = bb })
        get(mm)
      })
     

    })
   


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


      /* [
         {
           label: 'Manager',
           options: [
             { label: 'Jack', value: 'jack' },
             { label: 'Lucy', value: 'lucy' },
           ],
         },
         {
           label: 'Engineer',
           options: [{ label: 'yiminghe', value: 'Yiminghe' }],
         },
       ]*/




    });
   
    const getAlertrule = (flowTreeAll) => {
      alertrule({
        transaction_id: "", tab: {
          'field': 'tab',
          'op': 'eq',
          'data': tab
        }
      }).then((res) => {
        var b = {}
        res.data.forEach((r) => {
          b[r.id] = r
        })

        setAlertruleMap(b)
        get()
      });
    }






    const get = (flowConf_) => {
     
      statistics({
        ...p, tab: {
          'field': 'tab',
          'op': 'eq',
          'data': tab
        }
      }).then((res) => {

        setStatisticsObj(res.data)

        transaction({
          ...p, tab: {
            'field': 'tab',
            'op': 'eq',
            'data': tab
          }, status: {
            'field': 'status',
            'op': 'in',
            'data': status.length == 0 ? [0] : status.filter((s) => { return s == 0 })
          }
        }).then((res) => {

          hide()
          setTransactionList(res.data)

          var tm = {}
          var ids = res.data.map((t) => {
            tm[t.id] = t
            return t.id
          })

          transactionevent({
            transaction_id: {
              'field': 'transaction_id',
              'op': 'in',
              'data': ids
            }, sorter: { event_time: 'ascend' }
          }).then((res) => {
            var m = {}
            res.data.forEach((a) => {
              if (!m[a.transaction_id]) {
                m[a.transaction_id] = {
                  eventList: [], processMap: {},
                }
              }
              m[a.transaction_id].eventList.push(a)

            })
            for (var kk in m) {
              var eventList = m[kk].eventList
              var processMap = {}
              var info = getDurationInfo(eventList, flowConf_)
              var td = 0
              var e, s
              e = new Date(info.ee.event_time).getTime()
              s = new Date(info.se.event_time).getTime()

              var currentRow_ = tm[kk]
              if (currentRow_?.status == 0  ) {
                if (!info.isEnd) {
                  
                  e = new Date().getTime()
                }
               
                td = (e - s) / 1000
              } else {
                e = new Date(currentRow_.end_of_transaction).getTime()
                td = currentRow_.total_duration
              }




              eventList.forEach((a, index) => {

                var obj = processMap[a.flow_pid]
                if (!obj) {
                  obj = { duration: 0, process_duration: 0, status: 0, event_count: 0, eventArr: [], isFinish: false }
                }
                obj.eventArr.push(a)


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

                if (currentRow_?.status == 0 && currentRow_?.flow_id == k && !info.isEnd) {
                  processMap[k].duration = ((new Date()).getTime() - (new Date(ps.event_time)).getTime()) / 1000
                }

                processMap[k].event_count = processMap[k].eventArr.length
              }



              processMap["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"] = { duration: td, start_date: new Date(s), end_date: new Date(e) }


              m[kk].processMap = processMap

            }






            setTransactionMap(m)
          });

        });


      });





      getAlertBytransactionId({
        tab: {
          'field': 'tab',
          'op': 'eq',
          'data': tab
        }
      }).then((res) => {
        var m = {}


        res.data.forEach((a) => {


          if (!m[a.transaction_id]) {
            m[a.transaction_id] = {}
          }
          if (a.alertrule_type != 1) {
            if (!m[a.transaction_id][a.flow_id]) {
              m[a.transaction_id][a.flow_id] = {
                red: 0,
                amber: 0
              }
            }

            if (a.type == 0) {
              m[a.transaction_id][a.flow_id].amber++
            } else {
              m[a.transaction_id][a.flow_id].red++
            }

          } else {
            if (!m[a.transaction_id]['b2e']) {
              m[a.transaction_id]['b2e'] = {
                red: 0,
                amber: 0
              }
            }

            if (a.type == 0) {
              m[a.transaction_id]['b2e'].amber++
            } else {
              m[a.transaction_id]['b2e'].red++
            }
          }



        })

        setTransactionAlert(m)




      });
    }



  }, [isLoding, tab])

 
  var color = {
    'icon-daojishimeidian': '#70AD47',
    'icon-matou': '#70AD47',
    'icon-habor': '#70AD47',
    'icon-zhuanyunche': '#70AD47',
    'icon-matou1': '#70AD47',
    'icon-daojishi': '#70AD47',
    'icon-yundongguiji': '#70AD47'
  }
  const getOrganizationName = () => {
   
    if (access.canAdmin) {
      return 'Organization'
    }
    if (!(access.canAdmin || access.dashboard_tab())) {
      return 'Customer'
    }
    if (access.dashboard_tab()) {
      return 'Customer'
    }
    
   
  }

  const customizeRenderEmpty = () => {


    return <Empty description={'No transaction record'} />



  }


  

  return (

            
                

    <GridContent  className="dashboard">
     
      <ProCard ghost={true} bodyStyle={isMP ? { padding: '5px' } : {}} wrap >


        <ProCard colSpan={24} bodyStyle={{ padding: '5px 0px 5px 25px', fontWeight: '500' }} >
          <div className="page_title"> {getFilterStr(organization_id, organizationMap, dateArr, status, "Transactions Overview")}</div>
        </ProCard>

        <Access accessible={access.dashboard_tab()} fallback={<div></div>}> <ProCard

          // title={<div className="my-font-size" style={{ height: 14, lineHeight: '14px', fontSize: 12 }}>Threshold set by</div>}
          headStyle={{ height: 14, lineHeight: '14px', fontSize: 12 }}
          className="my-tab"
          tabs={{
            type: 'card',
            //tabPosition,
            activeKey: tab,
            items: [
              {
                label: <div title={"Threshold set by " + currentUser?.company_name }>{currentUser?.company_name}</div>,
                key: 'Self',
                children: null,
              },
              {
                label: <div title={"Threshold set by Others"}>Others</div>,
                key: 'Others',
                children: null,
              }
            ],
            onChange: (key) => {
              setTab(key);

            },
          }}
        />
          </Access>

        <ProCard wrap={isMP} gutter={8}>

          <ProForm<any> formRef={formRef} layout={isMP?'vertical':'inline'}
            
            onReset={() => {
              setOrganization_id([])
              setStatus([])
              setDateArr([])
            }}
            
            submitter={{
              searchConfig: {
               
                submitText: 'Search',
              },
              onSubmit: () => {
                setIsLoding(!isLoding)
              },
              render: (props, doms) => {
                return doms
              },
            }}
            >
           <ProFormGroup>

            <ProFormSelect
          
              name="organization_id"
                label=""
                width={isMP ? 'lg' : 240}
              fieldProps={{
                options: organizationList ,
                mode: 'multiple',
                maxTagCount:0,
                maxTagPlaceholder: (omittedValues) => {
                  return omittedValues.length + " Selected" 
                },
                showSearch: false,
                multiple: true

              } }
              onChange={(a) => {
                if (a) {
                  setOrganization_id(a)
                } else {
                  setOrganization_id([])

                }

              }}
             
              placeholder={"Filter By: " + getOrganizationName() }

            />
            <ProFormSelect
              name="status"
                fieldProps={{
                  mode: 'multiple',
                  maxTagCount: 0,
                  maxTagPlaceholder: (omittedValues) => {
                    return omittedValues.length + " Selected"
                  },
                }}
              label=""
                width={isMP ? 'lg' : 180}
              onChange={(a) => {
                if (a) {
                  setStatus(a)
                } else {
                  setStatus([])

                }

              }}
              valueEnum={{
                0: 'Open',
                1: 'Closed',
                2: 'Cancelled'
              }}
              placeholder="Filter By: Status"

            />
              <ProFormDateRangePicker width={isMP ? 'lg' : 380}  name="dateRange" fieldProps={{ placeholder: ['Start Date (From) ', 'Start Date (To) '] }} onChange={(a, b) => {


              setDateArr(b)



              }} />

            </ProFormGroup>
          </ProForm>

         
        
         
        </ProCard>


        <ProCard collapsed={collapsed4} colSpan={24} style={{ marginBlockStart: 16 }} wrap title={<div className="page_title">  {getFilterStr(organization_id, organizationMap, dateArr, "Open", "Transactions") + " ( Count:" + transactionList.length + " )"} </div>} extra={< EyeOutlined onClick={() => {
          setCollapsed4(!collapsed4);
          localStorage.setItem('collapsed4', !collapsed4);
        }} style={{ fontWeight: 'normal', fontSize: 14 }} />} bordered headerBordered >

          <ProCard ghost={true} colSpan={24} bodyStyle={{ overflow: isMP ? 'auto' : 'hidden' }}>




            <ConfigProvider renderEmpty={customizeRenderEmpty}> <ProTable<any, API.PageParams>

              pagination={{ showTotal:false, size: "default" }}
              className="mytable2"

              rowKey="id"
              scroll={{ x: 2700, y: 300 }}
              size="small"
              search={false}
              options={false}
              dataSource={transactionList}
              // pagination={false }
              columns={[

                {
                  title: (
                    <FormattedMessage
                      id="pages.transaction.transactionID"
                      defaultMessage="EOS ID"
                    />
                  ),
                  dataIndex: 'eos_id',
                  width:80,
                  renderText: (dom, entity) => {
                    return entity.eos_id
                  },
                  render: (dom, entity) => {
                    return (
                      <a

                        onClick={() => {

                          history.push(`/transaction/detail`, { transaction_id: entity.id, tab });
                          // setShowDetail(true);
                        }}
                      >
                        {"E"+dom}
                      </a>
                    );
                  },
                },
                {

                  title: <FormattedMessage id="pages.transaction.xxx" defaultMessage="Start Of Transaction" />,
                  dataIndex: 'start_of_transaction',
                  width: 200,
                  //sorter: true,
                  // defaultSortOrder: 'descend',
                  valueType: 'dateTime',
                  hideInSearch: true,
                },
                {
                  title: <span>imo_number</span>,
                  dataIndex: 'imo_number'
                  
                },
                {
                  title: <span>Vessel Name</span>,
                  dataIndex: 'vessel_name'
                  
                
                },

                {
                  title: "Trader",
                  dataIndex: 'trader_name',
                  width: 200,
                 
                  align: "center",
                 
                  render: (dom, entity) => {

                    return entity.trader_name
                  }
                },
                {
                  title: "Terminal",
                  dataIndex: 'terminal_name',
                  width: 200,
                
               
                  align: "center",
                  render: (dom, entity) => {
                  
                      return entity.terminal_name
                  },
                },

                {
                  title: <span>Jetty Name</span>,
                  dataIndex: 'jetty_name',
                  
                  align: "center",
                  search: {
                    transform: (value) => {
                      if (value) {
                        return {
                          'jetty_id': {
                            'field': 'jetty_id',
                            'op': 'eq',
                            'data': value
                          }
                        }
                      }

                    }
                  }
                },

                {
                  title: <FormattedMessage id="pages.alertrule.xxx" defaultMessage="Total Nominated Quantity (MT) / (BLS-60-F)" />,
                  dataIndex: 'product_quantity_in_mt',
                  width: 400,
                  align: "center",
                  hideInSearch: true,
                  valueType: "text",
                  render: (dom, entity) => {
                    if (dom) {


                      return numeral(dom).format('0,0') + " / " + numeral(entity.product_quantity_in_bls_60_f).format('0,0')
                    }

                  },
                },
              
               

              ].concat(flowList.map((e, i) => {


                return {
                  title: e.name,
                  dataIndex: 'vessel_name',
                  width: 160,
                  align: "center",
                  valueType: 'text',
                  render: (dom, entity) => {
                    var p = transactionMap[entity.id]?.processMap[e.id]
                    var val = p?.duration
                   var total_duration = val
                  /*  var eventArr=p?.eventArr
                    if (entity.status == 0 && eventArr?.length > 0 && entity.flow_id==e.id) {
                      val = ((new Date()).getTime() - (new Date(eventArr[0].event_time)).getTime()) / 1000
                    }
                   

                    var eventList = transactionMap[entity.id]?.eventList
                    var total_duration = entity.total_duration
                    if (entity.status == 0 && eventList?.length>0 ) {
                      total_duration = ((new Date()).getTime() - (new Date(eventList[0].event_time)).getTime())/1000
                    }*/

                    
                    var ta = transactionAlert[entity.id]?.[e.id]
                    return <div style={{ position: 'relative', float: 'left', zIndex: 1, textAlign: 'center', height: "50px", width: '100%' }}>


                      <div style={{ position: 'absolute', zIndex: 0, top: 12, left: i == 0 ? '50%' : 0, width: i == 0 || i == 4 ? (i == 0 ? '70%' : "50%") : (i > 4 ? '0' : '120%'), height: 2, backgroundColor: '#8aabe5', overflow: 'hidden', }}></div>

                      <div style={{ position: 'relative', zIndex: 1 }}>
                        {i < 5 && (
                          <span style={{
                            display: "inline-block",
                            color: "#fff",
                            width: '25px',
                            height: '25px',
                            fontSize: "20px",
                            backgroundColor: p ? (p.event_count > 0 ? (ta ? (ta.red > 0 ? "red" : "#DE7E39") : color[e.icon]) : "#595959") : "#595959",
                            borderRadius: '50%',
                            textAlign: 'center',
                            lineHeight: '25px'
                          }}>

                            <SvgIcon type={e.icon} />
                          </span>
                        )}
                        {i == 5 && (
                          <span style={{
                            display: "inline-block",
                            color: "#fff",
                            width: '25px',
                            height: '25px',
                            fontSize: "18px",
                            backgroundColor: ta ? (ta.red > 0 ? "red" : "#DE7E39") : "#70ad47",
                            borderRadius: '30px',
                            textAlign: 'center',
                            lineHeight: '25px'
                          }}>
                            <SvgIcon type="icon-shalou" />

                          </span>
                        )}

                        {i == 6 && (

                          <Badge count={ta ? ta?.amber + ta?.red : 0} style={{ boxShadow: 'none', marginTop: 8 }}>
                            <SvgIcon style={{ fontSize: "20px", color: (!ta || (ta?.amber == 0 && ta?.red == 0) ? '#d5d5d5' : (ta.red > 0 ? "red" : "#ED7D31")), marginTop: 8 }} type={(!ta || (ta?.amber == 0 && ta?.red == 0)) ? 'icon-tixingshixin' : 'icon-2'} />
                          </Badge>


                        )}

                      </div>
                      {i < 5 && (
                        <div style={{ position: 'relative', zIndex: 1, fontSize: '12px', color: "#333", lineHeight: "12px" }}>{p ? (p.event_count > 0 ? parseInt((val / 3600) + "") + "h " + parseInt((val % 3600) / 60) + "m" : "") : ""}</div>
                      )}
                      {i == 5 && (
                        <div style={{ position: 'relative', zIndex: 1, fontSize: '12px', color: "#333", lineHeight: "12px" }}> {parseInt((total_duration / 3600) + "") + "h " + parseInt((total_duration % 3600) / 60) + "m"}</div>
                      )}
                    </div>
                  }
                }



              }))}

            /></ConfigProvider>



          </ProCard>
        </ProCard>



        <ProCard ghost={true} style={{ marginBlockStart: 16, marginLeft: -4 }} gutter={8} wrap={isMP} >
          <ProCard collapsed={collapsed1} colSpan={{ xs: 24, md: 12 }} wrap title={<div className="page_title"> No. Of Transaction</div>} extra={< EyeOutlined onClick={() => {
            setCollapsed1(!collapsed1);
            localStorage.setItem('collapsed1', !collapsed1);
          }} style={{ fontWeight: 'normal', fontSize: 14 }} />} bordered headerBordered>

            <ProCard colSpan={24} ghost={true} bodyStyle={{ fontSize: '30px', lineHeight: '30px', height: '30px' }} >
              <div onClick={() => {
                dropByCacheKey("/transactions");
                history.push(`/transactions`, { organization_id, dateArr, status: [] });

              }} style={{ cursor: 'pointer', float: 'left', lineHeight: '22px', height: '22px', fontSize: '14px', marginRight: '16px', width: isMP ? '100%' : 'auto' }}>
                <span style={{ fontWeight: 500 }}>Total</span><span style={{ marginLeft: '8px' }}>{statisticsObj?.no_of_transaction?.total}</span>
              </div> 
            </ProCard>
            <ProCard ghost={true} colSpan={24} >



              {

                [1].map(() => {
                  var closed =0
                  var open = 0
                  var cancelled = 0
                  if (statisticsObj?.no_of_transaction?.total != 0) {
                     closed = parseInt((statisticsObj?.no_of_transaction?.closed / statisticsObj?.no_of_transaction?.total) * 100 + "")
                     open = parseInt((statisticsObj?.no_of_transaction?.open / statisticsObj?.no_of_transaction?.total) * 100 + "")
                    cancelled = parseInt((statisticsObj?.no_of_transaction?.cancelled / statisticsObj?.no_of_transaction?.total) * 100 + "")

                    if (closed + open + cancelled != 100) {
                      open += (100 - (closed + open + cancelled))
                    }
                  }

                 

                 


                  return < Tooltip title={"closed: " + closed + "% | open: " + open + "% | cancelled:" + cancelled + "%"} overlayStyle={{ maxWidth: 600 }}>
                    <div style={{ overflow: 'hidden',borderRadius: 5, height: 22,lineHeight:"22px", width: '100%', backgroundColor: "#333", color: "#fff" }}>
                        <div style={{  height: 22, width: closed + '%', backgroundColor: "rgb(19, 194, 194)", float: 'left', textAlign: "center" }}>{closed + '%'}</div>
                        <div style={{ height: 22, width: open + '%', backgroundColor: "#00b578", float: 'left', textAlign: "center" }}>{open + '%'}</div>
                        <div style={{  height: 22, width: cancelled + '%', backgroundColor: "#333", float: 'left', textAlign: "center" }}>{cancelled + '%'}</div>
                      </div>
                  </Tooltip>
                })
                  

                

              }

              
             
            </ProCard>
            

            <ProCard ghost={true} style={{ marginBlockStart: 22 }} gutter={2}>
              
              <div onClick={() => {
                dropByCacheKey("/transactions");
                history.push(`/transactions`, { organization_id, dateArr, status: ['1']});

              }} style={{ cursor: 'pointer', float: 'left', lineHeight: '22px', height: '22px', fontSize: '14px', marginRight: '16px' }}>
                <span style={{ fontWeight: 500 }}><SvgIcon style={{ color: "rgb(19, 194, 194)" }} type="icon-youjiantou" /> Closed</span> <span style={{ marginLeft: '8px' }}>{statisticsObj?.no_of_transaction?.closed}</span>
              </div>
              <div onClick={() => {
                dropByCacheKey("/transactions");
                history.push(`/transactions`, { organization_id, dateArr, status: ['0'] });

              }} style={{ cursor: 'pointer', float: 'left', lineHeight: '22px', height: '22px', fontSize: '14px', marginRight: '16px' }}>
                <span style={{ fontWeight: 500 }}><SvgIcon style={{ color:"#00b578" }}  type="icon-youjiantou" /> Open</span> <span style={{ marginLeft: '8px' }}>{statisticsObj?.no_of_transaction?.open}</span>
              </div>
              <div onClick={() => {
                dropByCacheKey("/transactions");
                history.push(`/transactions`, {organization_id, dateArr, status: ['2'] });

              }} style={{ cursor: 'pointer', float: 'left', lineHeight: '22px', height: '22px', fontSize: '14px', marginRight: '16px' }}>
                <span style={{ fontWeight: 500 }}><SvgIcon style={{ color: "#333" }}  type="icon-youjiantou" /> Cancelled</span> <span style={{ marginLeft: '8px' }}>{statisticsObj?.no_of_transaction?.cancelled}</span>
              </div>
            </ProCard>
          </ProCard>

          <ProCard collapsed={collapsed2} colSpan={{ xs: 24, md: 12 }} style={{ marginBlockStart: isMP ? 16 : 0, marginLeft: 4 }} wrap title={<div className="page_title"> Average Total Duration Per Completed Transaction</div>} extra={< EyeOutlined onClick={() => {
            setCollapsed2(!collapsed2);
            localStorage.setItem('collapsed2', !collapsed2);
          }} style={{ fontWeight: 'normal', fontSize: 14 }} />} bordered headerBordered>

            <ProCard ghost={true} colSpan={24} wrap bodyStyle={{
              paddingBottom:11
            }} >

              <ProCard.Group className="my-font-size" ghost={true} direction={'row'} bodyStyle={{ paddingLeft: 10, backgroundColor: "#d2faf5",  borderRadius: '10px' }}>
                <ProCard ghost={true} bodyStyle={{ padding: 5, textAlign: isMP ? 'center' : 'left', }}>

                  <Statistic title={dateArr[0] && dateArr[1] ? <span style={{ fontSize: 16, display: 'inline-block', color: "#000", lineHeight: '16px', height: 30 }}>Selected Filter Period</span> : <span style={{ fontSize: 16, display: 'inline-block', lineHeight: '16px', height: 30 }}>All Time &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>}
                    value={statisticsObj?.average_total_duration_per_transaction?.all_time ? getTimeStr(statisticsObj?.average_total_duration_per_transaction?.all_time) : "-"}
                    suffix={statisticsObj?.average_total_duration_per_transaction?.all_time ? "" : ""} />
                </ProCard>
                <Divider type={'vertical'} />
                <ProCard ghost={true} bodyStyle={{ padding: 5, textAlign: isMP ? 'center' : 'left' }}>
                  <Statistic title={<span style={{ fontSize: 16, display: 'inline-block', lineHeight: '16px', height: 30 }}>12 Month Average</span>} value={statisticsObj?.average_total_duration_per_transaction?.month_12 ? getTimeStr(statisticsObj?.average_total_duration_per_transaction?.month_12)  : "-"} suffix={statisticsObj?.average_total_duration_per_transaction?.month_12 ? "" : ""} />
                </ProCard>
                <Divider type={'vertical'} />
                <ProCard ghost={true} bodyStyle={{ padding: 5, textAlign: isMP ? 'center' : 'left' }}>
                  <Statistic title={<span style={{ fontSize: 16, display: 'inline-block', lineHeight: '16px', height: 30 }}>30 Day Average</span>} value={statisticsObj?.average_total_duration_per_transaction?.day_30 ? getTimeStr(statisticsObj?.average_total_duration_per_transaction?.day_30 ) : "-"} suffix={statisticsObj?.average_total_duration_per_transaction?.day_30 ? "" : ""} />
                </ProCard>

              </ProCard.Group>
            </ProCard>

          </ProCard>
        </ProCard>


        <ProCard collapsed={collapsed3} colSpan={34} style={{ marginBlockStart: 16 }} bodyStyle={{ padding: '20px' }} wrap title={<div className="page_title"> Overview Of Threshold Breached In Transactions </div>} extra={< EyeOutlined onClick={() => {
          setCollapsed3(!collapsed3);
          localStorage.setItem('collapsed3', !collapsed3);
        }} style={{ fontWeight: 'normal', fontSize: 14 }} />} bordered headerBordered>


          {isMP &&   <Steps
            direction={'vertical'}
            size="default"
           
          >
            {
              flowList.map((e, i) => {

                return <Step status="finish" onClick={() => {
                  var is=false
                  if (tab == "Self") {
                    if (access.canAlertList() ) {
                      is = true
                    }
                  } else if (tab == "Others") {
                    if (access.alert_list_tab() ) {
                      is = true
                    }
                  }
                  if (access.canAdmin) {
                    is = true
                  }
                  if (is) {
                    dropByCacheKey("/threshold/alert");
                    history.push(`/threshold/alert`, { organization_id, dateArr, flow_id: e.id, status, tab })

                  }
                 
                  

                }} icon={


                  <span className="my-font-size" style={{
                    display: "inline-block",
                    color: "#fff",
                    width: '30px',
                    height: '30px',
                    fontSize: "20px",
                  
                    backgroundColor: statisticsObj?.threshold_reached?.no[e.id]?.color || color[e.icon],
                    borderRadius: '50%',
                    textAlign: 'center',
                    lineHeight: '30px'
                  }}>

                    <SvgIcon type={e.icon} />
                  </span>} title={<div style={{ width: '100', display: 'inline-block', marginLeft: 40, marginTop: -70 }}><div style={{ fontWeight: 500, height: '30px', lineHeight:"18px" }}>{e.name}</div>

                    <ProCard ghost={true} wrap={true} bodyStyle={{marginBottom:15} }>

                      <ProCard ghost={true}>
                        <ProCard ghost={true} colSpan={14}>
                          No. Of Threshold Breach
                        </ProCard>
                        <ProCard ghost={true} colSpan={10}>
                          {statisticsObj?.threshold_reached?.no[e.id]?.count || 0}
                        </ProCard>

                      </ProCard>
                      <ProCard ghost={true}>
                        <ProCard ghost={true} colSpan={14}>
                          % Of Breaches
                        </ProCard>
                        <ProCard ghost={true} colSpan={10}>
                          {statisticsObj?.threshold_reached?.percentage[e.id] || 0}%
                        </ProCard>
                      </ProCard>
                      <ProCard ghost={true}>
                        <ProCard ghost={true} colSpan={14}>
                          Avg. Duration
                        </ProCard>
                        <ProCard ghost={true} colSpan={10}>
                          {(statisticsObj?.threshold_reached?.avg_duration?.[e.id]) && statisticsObj?.threshold_reached?.avg_duration?.[e.id]?.avg != 0 ? getTimeStr(statisticsObj?.threshold_reached?.avg_duration?.[e.id]?.avg) : '-'}
                        </ProCard>
                      </ProCard>
                    </ProCard>



                  </div>}  >


                  
                </Step>
              })
            }
           
          </Steps>}






          {!isMP &&  <div style={{ width: '100%', overflow: 'auto' }}>

            <table className="boder-table" style={{ width: 1300 }} border="0" cellpadding="0" cellspacing="0" >
              <tr>
                <th></th>

                {
                  flowList.map((e, i) => {


                    return <th>
                      <div style={{ position: 'relative', float: 'left', zIndex: 1, paddingBottom: 10, textAlign: 'center', width: '100%' }}>


                        <div style={{ position: 'absolute', zIndex: 0, top: 20, left: i == 0 ? '50%' : 0, width: i == 0 || i == 4 ? '50%' : (i > 4 ? '0' : '100%'), height: 2, backgroundColor: '#8aabe5', overflow: 'hidden', }}></div>

                        <div style={{ position: 'relative', zIndex: 1, cursor: 'pointer' }} onClick={() => {
                          var is = false
                          if (tab == "Self") {
                            if (access.canAlertList()) {
                              is = true
                            }
                          } else if (tab == "Others") {
                            if (access.alert_list_tab()) {
                              is = true
                            }
                          }
                          if (access.canAdmin) {
                            is = true
                          }
                          if (is) {
                            dropByCacheKey("/threshold/alert");
                            history.push(`/threshold/alert`, { organization_id, dateArr, flow_id: e.id, status, tab })

                          }

                        }}>
                          <span className="my-font-size" style={{
                            display: "inline-block",
                            color: "#fff",
                            width: '40px',
                            height: '40px',
                            fontSize: "30px",
                            backgroundColor: statisticsObj?.threshold_reached?.no[e.id]?.color || color[e.icon],
                            borderRadius: '50%',
                            textAlign: 'center',
                            lineHeight: '40px'
                          }}>

                            <SvgIcon type={e.icon} />
                          </span>
                        </div>
                        <div style={{ position: 'relative', zIndex: 1, fontSize: '14px', color: "#333", fontWeight: "500" }}>{e.name}</div>
                      </div>

                    </th>
                  })
                }


              </tr>
              <tr style={{ textAlign: 'center', height: 30 }}>
                <td style={{ fontWeight: '500', textAlign: 'left' }}>No. Of Threshold Breach</td>
                {
                  flowList.map((e, i) => {

                    return <td>{statisticsObj?.threshold_reached?.no[e.id]?.count || 0}</td>
                  })

                }

              </tr>
              <tr style={{ textAlign: 'center', height: 30, }} >
                <td style={{ fontWeight: '500', textAlign: 'left' }}>% Of Breaches</td>
                {
                  flowList.map((e, i) => {

                    return <td>{statisticsObj?.threshold_reached?.percentage[e.id] || 0}%</td>
                  })

                }
              </tr>
              <tr style={{ textAlign: 'center', height: 30 }} >
                <td style={{ fontWeight: '500', textAlign: 'left' }}>Avg. Duration</td>
                {
                  flowList.map((e, i) => {

                    return <td>{(statisticsObj?.threshold_reached?.avg_duration?.[e.id]) && statisticsObj?.threshold_reached?.avg_duration?.[e.id]?.avg != 0 ? getTimeStr(statisticsObj?.threshold_reached?.avg_duration?.[e.id]?.avg) : '-'}</td>
                  })

                }
                <td></td>
              </tr>
            </table>
          </div>}

          
        </ProCard>


       



      </ProCard>

    
       
        
     
    </GridContent>
  );
};

export default Welcome;
