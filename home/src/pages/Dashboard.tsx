import { GridContent, ProFormSelect, ProFormDateRangePicker, ProCard, ProFormDatePicker } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { EyeOutlined } from '@ant-design/icons';
import { Card, theme, Progress, Statistic, Badge, message, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
const { Divider } = ProCard;
import { flow } from './system/flow/service';
import { jetty } from './system/jetty/service';
import { getAlertBytransactionId } from './alert/service';
import { producttype } from './system/producttype/service';
import { alertrule } from './alertrule/service';
import { terminal } from './system/terminal/service';
import { transaction, transactionevent, statistics } from './transaction/service';
import { SvgIcon } from '@/components' // 自定义组件
import { isPC, tree } from "@/utils/utils";
import { Calendar } from 'antd-mobile'
import { history, FormattedMessage } from '@umijs/max';
import numeral from 'numeral';


// use your custom format
numeral().format('0%');
import moment from 'moment';
import { read } from 'xlsx';

const getFilterStr = (terminal_id, terminalList, dateArr,status,title) => {
  var dateStr = dateArr[0] && dateArr[1] ? ' - ' + moment(dateArr[0]).format('DD/MM/YYYY') + ' to ' + moment(dateArr[1]).format('DD/MM/YYYY') :''
  var terminalStr = (terminal_id ? terminalList[terminal_id] : "")

  var statusStr = (status === '' ? '' : (status == 1 ? 'Closed' : 'Open'))
  if (terminalStr || dateStr) {
    return statusStr + ' ' + title +' (' + terminalStr + dateStr + ')'
  } else {
    return statusStr + ' ' + title
  }
  
 
}
const getTimeStr = (time) => {
  return parseInt((time / 3600) + "") + "h " + parseInt((time % 3600) / 60) + "m"
}
const Welcome: React.FC = () => {
  const { token } = theme.useToken();
  const { initialState } = useModel('@@initialState');
  const [flowList, setFlowList] = useState<any>([]);
  const [isMP, setIsMP] = useState<boolean>(!isPC());
  const [transactionList, setTransactionList] = useState<any>([]);
  const [transactionMap, setTransactionMap] = useState<any>({});
  const [terminalList, setTerminalList] = useState<any>({});
  const [jettyList, setJettyList] = useState<any>({});
  
  const [flowTreeAll, setFlowTreeAll] = useState<any>([]);
  const [producttypeList, setProducttypeList] = useState<any>({});
  const [transactionAlert, setTransactionAlert] = useState<any>({});
  const [alertruleMap, setAlertruleMap] = useState<any>({});

  const [avg_duration, setAvg_duration] = useState<any>({});

  const [collapsed1, setCollapsed1] = useState<boolean>(localStorage.getItem('collapsed1')==='true');
  const [collapsed2, setCollapsed2] = useState<boolean>(localStorage.getItem('collapsed2') ==='true');
  const [collapsed3, setCollapsed3] = useState<boolean>(localStorage.getItem('collapsed3') ==='true');
  const [collapsed4, setCollapsed4] = useState<boolean>(localStorage.getItem('collapsed4') ==='true');


  const [terminal_id, setTerminal_id] = useState<any>("");
  const [dateArr, setDateArr] = useState<any>(['', '']);
  const [status, setStatus] = useState<any>("");
 

 // const [terminal_id, setTerminal_id] = useState(false);



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
    if (terminal_id) {
      p.terminal_id = {
          'field': 'terminal_id',
          'op': 'eq',
          'data': terminal_id
        } 
    }


    if (status!=="") {
      p.status = {
          'field': 'status',
          'op': 'eq',
          'data': status
        }
    }
   
    if (dateArr[0] && dateArr[1]) {



      p.start_of_transaction =  {
          'field': 'start_of_transaction',
          'op': 'gte',
          'data': dateArr[0]
        }

        p.end_of_transaction = {
            'field': 'end_of_transaction',
            'op': 'lte',
            'data': dateArr[1]
          }
    } 


    statistics(p).then((res) => {
      
      setStatisticsObj(res.data)

      transaction({ ...p, status:0 }).then((res) => {

        hide()
        setTransactionList(res.data)

       var ids= res.data.map((t) => {
          return t.id
        })

        transactionevent({
          transaction_id: {
            'field': 'transaction_id',
            'op': 'in',
            'data': ids
          }  ,sorter: { event_time: 'ascend' }
        }).then((res) => {
          var m = {}
          res.data.forEach((a) => {
            if (!m[a.transaction_id]) {
              m[a.transaction_id] = {
                eventList: [], processMap: {}
              }
            }
            m[a.transaction_id].eventList.push(a)

          })
          for (var kk in m) {
            var eventList = m[kk].eventList
            var processMap = {}



            eventList.forEach((a, index) => {

              var obj = processMap[a.flow_pid]
              if (!obj) {
                obj = { duration: 0, process_duration: 0, status: 0, event_count: 0, eventArr: [], isFinish: false }
              }
              obj.eventArr.push(a)
              if (a.flow_id == "66ba5680-d912-11ed-a7e5-47842df0d9cc") {

                obj.isFinish = true
              }

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

              processMap[k].event_count = processMap[k].eventArr.length
            }





            
            m[kk].processMap = processMap

          }

          var num = 0
          var to = {}
          for (var k in m) {
            var p = m[k].processMap

            for (var j in p) {
              if (!to[j]) {
                to[j] = { count: 0, duration: 0, avg: 0 }
              }
              if (p[j].isFinish) {

                to[j].duration += p[j].duration
                to[j].count++
                to[j].avg = to[j].duration / to[j].count

              }


            }
          }
          console.log("dddddddddddddddddddddddd")
          console.log(to)
          setAvg_duration(to)


          setTransactionMap(m)
        });

      });

      
    });

    

    

    jetty({ pageSize: 3000, current: 1, sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setJettyList(b)

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
    flow({ pageSize: 300, current: 1, type: 0, sorter: { sort: 'ascend' } }).then((res) => {
      res.data.push({ name: 'Entire Duration', icon: 'icon-daojishi', pid: '                                    ',id:'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' })
      res.data.push({ name: 'Breached Threshold Between 2 Events', icon: 'icon-yundongguiji', pid: '                                    ',id:'b2e' })
      var ss = res.data.map((bb) => { return { ...bb } })
      console.log(ss)
      var all = tree(ss, "                                    ", 'pid')
      console.log(all)
      setFlowTreeAll(all)

     
      
      setFlowList(res.data)
     // getAlertrule(all)
     
      get()

    })
    const getAlertrule = (flowTreeAll)=>{
      alertrule({ pageSize: 3000,transaction_id:"", current: 1 }).then((res) => {
        var b = {}
        res.data.forEach((r) => {
          b[r.id] = r
        })

        setAlertruleMap(b)
        get()
      });
    }
   

    

   

    const get = () => {
      getAlertBytransactionId({ pageSize: 300, current: 1 }).then((res) => {
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
        console.log(m)
        setTransactionAlert(m)




      });
    }
    

   
  }, [terminal_id, dateArr,status])
  var color = {
    'icon-daojishimeidian': '#70AD47',
    'icon-matou': '#70AD47',
    'icon-a-tadiao_huaban1': '#70AD47',
    'icon-zhuanyunche': '#70AD47',
    'icon-matou1': '#70AD47',
    'icon-daojishi': '#13C2C2',
    'icon-yundongguiji': '#13C2C2'
  }
  return (
    <GridContent  className="dashboard">

      <ProCard ghost={true} bodyStyle={isMP ? { padding: '5px' } : {}} wrap >

        <ProCard wrap={isMP} gutter={8}>
          <ProCard ghost={true} colSpan={{ xs: 24, md: 10 }} bodyStyle={{ padding: '5px 0px 5px 0px', fontWeight:'500', fontSize: '14px' }} >
            {getFilterStr(terminal_id, terminalList, dateArr, status,"Transactions Overview")}
          </ProCard>
          <ProCard ghost={true} colSpan={{ xs: 24, md: 4 }} >
            <ProFormSelect
              name="select"
              label=""
              onChange={(a) => {
                if (a) {
                  setTerminal_id(a)
                } else {
                  setTerminal_id("")
                  
                }
                
              } }
              valueEnum={terminalList}
              placeholder="Filter By: Terminals"

            />
          </ProCard>
          <ProCard ghost={true} colSpan={{ xs: 24, md:4 }} >
            <ProFormSelect
              name="select"
              label=""
              onChange={(a) => {
                if (a) {
                  setStatus(a)
                } else {
                  setStatus("")

                }

              }}
              valueEnum={{
                0:'Open',
                1: 'Closed',
                2: 'Cancelled'
              }}
              placeholder="Filter By: Status"

            />
          </ProCard>
          <ProCard ghost={true}  colSpan={{ xs: 24, md: 6 }}  >

           
            <ProFormDateRangePicker name="dateRange" fieldProps={{ placeholder: ['Date (From) ', 'Date (To) '] }}   onChange={(a, b) => {


                setDateArr(b)



              }} />
            
            
          </ProCard>
        </ProCard>


        <ProCard ghost={true} style={{ marginBlockStart: 16, marginLeft: -4 }} gutter={8} wrap={isMP} >
          <ProCard collapsed={collapsed1} colSpan={{ xs: 24, md: 12 }} wrap title={<div style={{ fontWeight: '500', fontSize: 14 }}> No. Of Transaction</div>} extra={< EyeOutlined onClick={() => {
            setCollapsed1(!collapsed1);
            localStorage.setItem('collapsed1', !collapsed1);
          }} style={{ fontWeight: 'normal', fontSize: 14 }} />} bordered headerBordered>

            <ProCard colSpan={24} ghost={true} bodyStyle={{ fontSize: '30px', lineHeight: '30px', height: '30px' }} >
              <div onClick={() => {
                history.push(`/Transactions`, { terminal_id, dateArr, status: "" });

              }} style={{ cursor: 'pointer', float: 'left', lineHeight: '22px', height: '22px', fontSize: '14px', marginRight: '16px', width: isMP ? '100%' : 'auto' }}>
                <span style={{ fontWeight: 500 }}>Total</span><span style={{ marginLeft: '8px' }}>{statisticsObj?.no_of_transaction?.total}</span>
              </div> 
            </ProCard>
            <ProCard ghost={true} colSpan={24} >



              {

                [1].map(() => {

                  var closed = parseInt((statisticsObj?.no_of_transaction?.closed / statisticsObj?.no_of_transaction?.total) * 100+"")
                  var open = parseInt((statisticsObj?.no_of_transaction?.open / statisticsObj?.no_of_transaction?.total) * 100 + "")
                  var cancelled = parseInt((statisticsObj?.no_of_transaction?.cancelled / statisticsObj?.no_of_transaction?.total) * 100 + "")

                  if (closed + open + cancelled!=100) {
                    open += (100 - (closed + open + cancelled))
                  }


                  return < Tooltip title={"closed: " + closed + "% | open: " + open + "% | cancelled:" + cancelled + "%"} overlayStyle={{ maxWidth: 600 }}>
                    <div style={{ overflow: 'hidden',borderRadius: 5, height: 22, width: '100%', backgroundColor: "#333", color: "#fff" }}>
                        <div style={{  height: 22, width: closed + '%', backgroundColor: "rgb(19, 194, 194)", float: 'left', textAlign: "center" }}>{closed + '%'}</div>
                        <div style={{ height: 22, width: open + '%', backgroundColor: "#00b578", float: 'left', textAlign: "center" }}>{open + '%'}</div>
                        <div style={{  height: 22, width: cancelled + '%', backgroundColor: "#333", float: 'left', textAlign: "center" }}>{cancelled + '%'}</div>
                      </div>
                  </Tooltip>
                })
                  

                

              }

              
             
            </ProCard>
            

            <ProCard ghost={true} style={{ marginBlockStart: 13 }} gutter={2}>
              
              <div onClick={() => {
                history.push(`/Transactions`, { terminal_id, dateArr, status: 1 });

              }} style={{ cursor: 'pointer', float: 'left', lineHeight: '22px', height: '22px', fontSize: '14px', marginRight: '16px' }}>
                <span style={{ fontWeight: 500 }}><SvgIcon style={{ color: "rgb(19, 194, 194)" }} type="icon-youjiantou" /> Closed</span> <span style={{ marginLeft: '8px' }}>{statisticsObj?.no_of_transaction?.closed}</span>
              </div>
              <div onClick={() => {
                history.push(`/Transactions`, { terminal_id, dateArr, status: 0 });

              }} style={{ cursor: 'pointer', float: 'left', lineHeight: '22px', height: '22px', fontSize: '14px', marginRight: '16px' }}>
                <span style={{ fontWeight: 500 }}><SvgIcon style={{ color:"#00b578" }}  type="icon-youjiantou" /> Open</span> <span style={{ marginLeft: '8px' }}>{statisticsObj?.no_of_transaction?.open}</span>
              </div>
              <div onClick={() => {
                history.push(`/Transactions`, { terminal_id, dateArr, status: 2 });

              }} style={{ cursor: 'pointer', float: 'left', lineHeight: '22px', height: '22px', fontSize: '14px', marginRight: '16px' }}>
                <span style={{ fontWeight: 500 }}><SvgIcon style={{ color: "#333" }}  type="icon-youjiantou" /> Cancelled</span> <span style={{ marginLeft: '8px' }}>{statisticsObj?.no_of_transaction?.cancelled}</span>
              </div>
            </ProCard>
          </ProCard>

          <ProCard collapsed={collapsed2} colSpan={{ xs: 24, md: 12 }} style={{ marginBlockStart: isMP ? 16 : 0, marginLeft: 4 }} wrap title={<div style={{ fontWeight: '500', fontSize: 14 }}> Average Total Duration Per Completed Transaction</div>} extra={< EyeOutlined onClick={() => {
            setCollapsed2(!collapsed2);
            localStorage.setItem('collapsed2', !collapsed2);
          }} style={{ fontWeight: 'normal', fontSize: 14 }} />} bordered headerBordered>

            <ProCard ghost={true} colSpan={24} wrap bodyStyle={{
              paddingBottom:11
            }} >

              <ProCard.Group ghost={true} direction={'row'} bodyStyle={{ paddingLeft: 10, backgroundColor: "#70AD47", borderRadius: '10px' }}>
                <ProCard ghost={true} bodyStyle={{ padding: 5, textAlign: isMP ? 'center' : 'left' }}>

                  <Statistic title={dateArr[0] && dateArr[1] ? "Selected Filter Period" : (<span>All Time &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>)} value={parseInt(statisticsObj?.average_total_duration_per_transaction?.all_time / 3600 + "")} suffix=" h"  />
                </ProCard>
                <Divider type={'vertical'} />
                <ProCard ghost={true} bodyStyle={{ padding: 5, textAlign: isMP ? 'center' : 'left' }}>
                  <Statistic title="12 Month Average" value={statisticsObj?.average_total_duration_per_transaction?.month_12 ? parseInt(statisticsObj?.average_total_duration_per_transaction?.month_12 / 3600 + "") : "-"} suffix={statisticsObj?.average_total_duration_per_transaction?.month_12 ? " h" : ""} />
                </ProCard>
                <Divider type={'vertical'} />
                <ProCard ghost={true} bodyStyle={{ padding: 5, textAlign: isMP ? 'center' : 'left' }}>
                  <Statistic title="30 Day Average" value={statisticsObj?.average_total_duration_per_transaction?.day_30 ? parseInt(statisticsObj?.average_total_duration_per_transaction?.day_30 / 3600 + "") : "-"} suffix={statisticsObj?.average_total_duration_per_transaction?.day_30 ? " h":""} />
                </ProCard>

              </ProCard.Group>
            </ProCard>

          </ProCard>
        </ProCard>


        <ProCard collapsed={collapsed3} colSpan={34} style={{ marginBlockStart: 16 }} bodyStyle={{ padding: '16px', overflow: isMP ? 'auto' : 'hidden' }} wrap title={<div style={{ fontWeight: '500', fontSize: 14 }}> Overview Of Threshold Breached In Transactions </div>} extra={< EyeOutlined onClick={() => {
          setCollapsed3(!collapsed3);
          localStorage.setItem('collapsed3', !collapsed3);
        }} style={{ fontWeight: 'normal', fontSize: 14 }} />} bordered headerBordered>

          <table className="boder-table" style={{ width: isMP?'350%':'100%' }} border="0" cellpadding="0" cellspacing="0" >
            <tr>
              <th></th>

              {
                flowList.map((e, i) => {

                
                  return <th>
                    <div style={{ position: 'relative', float: 'left', zIndex: 1, paddingBottom:10, textAlign: 'center', width: '100%' }}>


                      <div style={{ position: 'absolute', zIndex: 0, top: 20, left: i == 0 ? '50%' : 0, width: i == 0 || i == 4 ? '50%' : (i > 4 ? '0' : '100%'), height: 2, backgroundColor: '#8aabe5', overflow: 'hidden', }}></div>

                      <div style={{ position: 'relative', zIndex: 1, cursor: 'pointer' }} onClick={() => {
                        history.push(`/threshold/alert?flow_id=` + e.id);
                      }}>
                        <span style={{
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
            <tr style={{ textAlign: 'center', height:30 }}>
              <td style={{ fontWeight: '500', textAlign: 'left' }}>No. Of Threshold Breach</td>
              {
                flowList.map((e, i) => {

                  return <td>{statisticsObj?.threshold_reached?.no[e.id]?.count || 0}</td>
                })

              }
              
            </tr>
            <tr style={{ textAlign: 'center',height: 30, }} >
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

                  return <td>{(statisticsObj?.threshold_reached?.avg_duration?.[e.id]) && statisticsObj?.threshold_reached?.avg_duration?.[e.id]?.avg !=0?getTimeStr(statisticsObj?.threshold_reached?.avg_duration?.[e.id]?.avg):'-'}</td>
                })

              }
              <td></td>
            </tr>
          </table>
        </ProCard>


        <ProCard collapsed={collapsed4} colSpan={24} style={{ marginBlockStart: 16 }} wrap title={<div style={{ fontWeight: '500', fontSize: 14 }}>  {getFilterStr(terminal_id, terminalList, dateArr, 0, "Transactions")} </div>} extra={< EyeOutlined onClick={() => {
          setCollapsed4(!collapsed4);
          localStorage.setItem('collapsed4', !collapsed4);
        }} style={{ fontWeight: 'normal', fontSize: 14 }} />} bordered headerBordered >
         
          <ProCard ghost={true} colSpan={24} bodyStyle={{  overflow: isMP ? 'auto' : 'hidden' }}>
            <table style={{ width: isMP ? '350%' : '100%' }} className="scroll-table" border="0" cellpadding="0" cellspacing="0" >
              <thead>
              <tr style={{ lineHeight: '15px' }}>
                <th>EOS ID</th>
                <th>Start Date</th>
                <th>IMO No.</th>
                <th>Vessel Name</th>
                <th>Terminal</th>
                <th>Jetty</th>
                <th>Total Nominated Quantity
                  (BLS-60-F)/ (MT)</th>
              {
                flowList.map((e, i) => {
                  return <th>
           
                      {e.name}
               
                  </th>
                })
              }


                </tr>
              </thead>
              <tbody >


                {
                  transactionList.map((e, i) => {
                    var transaction = e
                    var t_id=e.id
                    return <tr style={{ textAlign: 'center', height: 60 }}>
                      <td onClick={() => {
                        history.push(`/transaction/detail?transaction_id=` + e.id);
                      }}  style={{ cursor: 'pointer' }}><a>{e.eos_id}</a></td>
                      <td>{moment(e.start_of_transaction).format('DD/MM/YYYY')  }</td>
                      <td>{e.imo_number}</td>
                      <td>{e.vessel_name}</td>
                      <td>{terminalList[e.terminal_id]}</td>
                      <td>{jettyList[e.jetty_id] }</td>
                     
                      <td>{numeral(e.total_nominated_quantity_b).format('0,0')} / {numeral(e.total_nominated_quantity_m).format('0,0')}</td>
                      {
                        flowTreeAll.map((e, i) => {
                          
                          var p = transactionMap[t_id]?.processMap[e.id]
                          var val = p?.duration
                          var total_duration = transaction.total_duration
                          var ta = transactionAlert[t_id]?.[e.id]
                         
                          return <td>

                            <div style={{ position: 'relative', float: 'left', zIndex: 1, textAlign: 'center', height: "50px", width: '100%' }}>


                              <div style={{ position: 'absolute', zIndex: 0, top: 12, left: i == 0 ? '50%' : 0, width: i == 0 || i == 4 ? '50%' : (i > 4 ? '0' : '100%'), height: 2, backgroundColor: '#8aabe5', overflow: 'hidden', }}></div>

                              <div style={{ position: 'relative', zIndex: 1 }}>
                                {i < 5 && (
                                  <span style={{
                                    display: "inline-block",
                                    color: "#fff",
                                    width: '25px',
                                    height: '25px',
                                    fontSize: "20px",
                                    backgroundColor: p ? (p.event_count > 0 ? (ta ? (ta.red > 0 ? "red" : "#DE8205") : color[e.icon]) :"#595959" ): "#595959",
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
                                    backgroundColor: ta ? (ta.red > 0 ? "red" : "#DE8205") : "#13c2c2",
                                    borderRadius: '30px',
                                    textAlign: 'center',
                                    lineHeight: '25px'
                                  }}>
                                    <SvgIcon type="icon-shalou" /> 
                                   
                                  </span>
                                )}

                                {i == 6 && (

                                  <Badge count={ta?ta?.amber + ta?.red:0} style={{ boxShadow: 'none', marginTop: 8 }}>
                                    <SvgIcon style={{ fontSize: "20px", color: (!ta || (ta?.amber == 0 && ta?.red == 0) ? '#d5d5d5' : (ta.red > 0 ? "red" : "#ED7D31")), marginTop: 8 }} type={(!ta || (ta?.amber == 0 && ta?.red == 0) )? 'icon-tixingshixin' : 'icon-2'} />
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

                          </td>
                        })
                      }

                    </tr>
                  })
                }


             

               
              </tbody>
            </table>
          </ProCard>
        </ProCard>



      </ProCard>

    
       
        
     
    </GridContent>
  );
};

export default Welcome;
