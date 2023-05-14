import { GridContent, ProFormSelect, ProFormDateRangePicker, ProCard, ProFormDatePicker } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { EyeOutlined } from '@ant-design/icons';
import { Card, theme, Progress, Statistic, Badge, message } from 'antd';
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
const Welcome: React.FC = () => {
  const { token } = theme.useToken();
  const { initialState } = useModel('@@initialState');
  const [flowList, setFlowList] = useState<any>([]);
  const [isMP, setIsMP] = useState<boolean>(!isPC());
  const [transactionList, setTransactionList] = useState<any>([]);
  const [transactionMap, setTransactionMap] = useState<any>([]);
  const [terminalList, setTerminalList] = useState<any>({});
  const [jettyList, setJettyList] = useState<any>({});
  
  const [flowTreeAll, setFlowTreeAll] = useState<any>([]);
  const [producttypeList, setProducttypeList] = useState<any>({});
  const [transactionAlert, setTransactionAlert] = useState<any>({});
  const [alertruleMap, setAlertruleMap] = useState<any>({});

  

  const [collapsed1, setCollapsed1] = useState<boolean>(localStorage.getItem('collapsed1')==='true');
  const [collapsed2, setCollapsed2] = useState<boolean>(localStorage.getItem('collapsed2') ==='true');
  const [collapsed3, setCollapsed3] = useState<boolean>(localStorage.getItem('collapsed3') ==='true');
  const [collapsed4, setCollapsed4] = useState<boolean>(localStorage.getItem('collapsed4') ==='true');


  const [terminal_id, setTerminal_id] = useState<any>("");
  const [dateArr, setDateArr] = useState<any>(['', '']);

  const [dateMPArr, setDateMPArr] = useState<any>(['', '']);

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
      p.terminal_id = terminal_id
    }
   
    if (dateArr[0] && dateArr[1]) {



      p.start_of_transaction__gt = dateArr[0]

      p.start_of_transaction__lt = dateArr[1]
    } 


    statistics(p).then((res) => {
      
      setStatisticsObj(res.data)
      //p.status=0
      transaction(p).then((res) => {

        hide()
        setTransactionList(res.data)

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
      res.data.push({ name: 'Total Duration', icon: 'icon-daojishi', pid: '                                    ',id:'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' })
      res.data.push({ name: 'Breached threshold between 2 events', icon: 'icon-yundongguiji', pid: '                                    ',id:'b2e' })
      var ss = res.data.map((bb) => { return { ...bb } })
      console.log(ss)
      var all = tree(ss, "                                    ", 'pid')
      console.log(all)
      setFlowTreeAll(all)

     
      
      setFlowList(res.data)
      getAlertrule(all)
     


    })
    const getAlertrule = (flowTreeAll)=>{
      alertrule({ pageSize: 3000, current: 1 }).then((res) => {
        var b = {}
        res.data.forEach((r) => {
          b[r.id] = r
        })

        setAlertruleMap(b)
        get()
      });
    }
   

    transactionevent({
      pageSize: 1000, current: 1, sorter: { event_time: 'ascend' }
    }).then((res) => {
      var m = {}
      res.data.forEach((a) => {
        if (!m[a.transaction_id]) {
          m[a.transaction_id] = {
            eventList: [], totalDuration: 0, processMap: {}
          }
        }
        m[a.transaction_id].eventList.push(a)

      })
      for (var k in m) {
        var eventList = m[k].eventList
        var processMap = {}
        try {
          m[k].totalDuration=parseInt(((new Date(eventList[eventList.length - 1].event_time)).getTime() - (new Date(eventList[0].event_time)).getTime()) / 1000 + "")
        } catch (e) {

        }

        eventList.forEach((a, index) => {

          var obj = processMap[a.flow_pid]
          if (!obj) {
            obj = { duration: 0, process_duration: 0, status: 0, event_count: 0 }
          }
          var next = eventList[index + 1]
          if (next) {

            if (next.flow_pid != a.flow_pid) {

              obj.process_duration = parseInt(((new Date(eventList[index + 1].event_time)).getTime() - (new Date(a.event_time)).getTime()) / 1000 + "")
            }

            var val = parseInt(((new Date(next.event_time)).getTime() - (new Date(a.event_time)).getTime()) / 1000 + "")
            obj.duration += val



          }

          obj.event_count++

          processMap[a.flow_pid]=obj



        })
        m[k].processMap = processMap

      }
      console.log(m)
      setTransactionMap(m)
    });

   

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
    

   
  }, [terminal_id, dateArr])
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

        <ProCard wrap={isMP} >
          <ProCard ghost={true} colSpan={{ xs: 24, md: 12 }} bodyStyle={{ padding: '5px 0px 5px 0px', fontWeight:'500', fontSize: '14px' }} >
            {'Transactions Overview (' + (terminal_id?terminalList[terminal_id]:"") + ' - ' + dateArr[0] + ' to ' + dateArr[1]+')'}
          </ProCard>
          <ProCard ghost={true} colSpan={{ xs: 24, md: 6 }} >
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
          <ProCard ghost={true}  colSpan={{ xs: 24, md: 6 }} bodyStyle={{ paddingLeft: isMP?0:10 }} >

            {
              isMP && (
                [<ProCard ghost={true} colSpan={11} key="2"> <ProFormDatePicker onChange={(a, b) => {
                  
                 
                  setDateArr((preDateArr) => {
                    preDateArr[0] = b
                    return [...preDateArr]
                  })


                }} name="date" label="" /> </ProCard>,
                  <ProCard ghost={true} bodyStyle={{ textAlign: 'center' }}   colSpan={2}>to</ProCard>,
                  <ProCard ghost={true} colSpan={11} key="2"><ProFormDatePicker onChange={(a, b) => {

                  
                   

                    setDateArr((preDateArr) => {
                      preDateArr[1] = b
                      return [...preDateArr]
                    })

                  

                  }} name="date" label="" /></ProCard>]

              )
            }
            {
              !isMP && (<ProFormDateRangePicker name="dateRange" onChange={(a, b) => {


                setDateArr(b)



              }} />)
            }
            
          </ProCard>
        </ProCard>


        <ProCard ghost={true} style={{ marginBlockStart: 16, marginLeft: -4 }} gutter={8} wrap={isMP} >
          <ProCard collapsed={collapsed1} colSpan={{ xs: 24, md: 12 }} wrap title={<div style={{ fontWeight: '500', fontSize: 14 }}> No of Transaction</div>} extra={< EyeOutlined onClick={() => {
            setCollapsed1(!collapsed1);
            localStorage.setItem('collapsed1', !collapsed1);
          }} style={{ fontWeight: 'normal', fontSize: 14 }} />} bordered headerBordered>

            <ProCard colSpan={24} ghost={true} bodyStyle={{ fontSize: '30px', lineHeight: '30px', height:'30px' }} >
              <div>{numeral(statisticsObj?.no_of_transaction?.completed / statisticsObj?.no_of_transaction?.total).format('0%')}</div>
            </ProCard>
            <ProCard ghost={true} colSpan={24} >
             
              <Progress percent={(statisticsObj?.no_of_transaction?.completed / statisticsObj?.no_of_transaction?.total) * 100} strokeColor="#13C2C2" size={['100%', 10]} strokeLinecap="butt" showInfo={false} />
            </ProCard>
            

            <ProCard ghost={true} style={{ marginBlockStart: 2 }} gutter={2}>
              <div style={{ float: 'left', lineHeight: '22px', height: '22px', fontSize: '14px', marginRight: '16px' }}>
                <span>Total</span><span style={{ marginLeft: '8px' }}>{statisticsObj?.no_of_transaction?.total}</span>
              </div>
              <div style={{ float: 'left', lineHeight: '22px', height: '22px', fontSize: '14px', marginRight: '16px' }}>
                <span>Completed</span> <span style={{ marginLeft: '8px' }}>{statisticsObj?.no_of_transaction?.completed}</span>
              </div>
              <div style={{ float: 'left', lineHeight: '22px', height: '22px', fontSize: '14px', marginRight: '16px' }}>
                <span>Open</span> <span style={{ marginLeft: '8px' }}>{statisticsObj?.no_of_transaction?.open}</span>
              </div>
            </ProCard>
          </ProCard>

          <ProCard collapsed={collapsed2} colSpan={{ xs: 24, md: 12 }} style={{ marginBlockStart: isMP ? 16 : 0, marginLeft: 4 }} wrap title={<div style={{ fontWeight: '500', fontSize: 14 }}> Average Total Duration Per Transaction</div>} extra={< EyeOutlined onClick={() => {
            setCollapsed2(!collapsed2);
            localStorage.setItem('collapsed2', !collapsed2);
          }} style={{ fontWeight: 'normal', fontSize: 14 }} />} bordered headerBordered>

            <ProCard ghost={true} colSpan={24} wrap bodyStyle={{
              paddingBottom:11
            }} >

              <ProCard.Group ghost={true} direction={'row'} bodyStyle={{ paddingLeft: 10, backgroundColor: "#70AD47", borderRadius: '10px' }}>
                <ProCard ghost={true} bodyStyle={{ padding: 5 }}>
                  <Statistic title="All Time" value={parseInt(statisticsObj?.average_total_duration_per_transaction?.all_time/3600+"")} suffix=" h"  />
                </ProCard>
                <Divider type={'vertical'} />
                <ProCard ghost={true} bodyStyle={{ padding: 5}}>
                  <Statistic title="12 Month Average" value={statisticsObj?.average_total_duration_per_transaction?.month_12 ? parseInt(statisticsObj?.average_total_duration_per_transaction?.month_12 / 3600 + "") : "-"} suffix={statisticsObj?.average_total_duration_per_transaction?.month_12 ? " h" : ""} />
                </ProCard>
                <Divider type={'vertical'} />
                <ProCard ghost={true} bodyStyle={{ padding: 5}}>
                  <Statistic title="30 Day Average" value={statisticsObj?.average_total_duration_per_transaction?.day_30 ? parseInt(statisticsObj?.average_total_duration_per_transaction?.day_30 / 3600 + "") : "-"} suffix={statisticsObj?.average_total_duration_per_transaction?.day_30 ? " h":""} />
                </ProCard>

              </ProCard.Group>
            </ProCard>

          </ProCard>
        </ProCard>


        <ProCard collapsed={collapsed3} colSpan={34} style={{ marginBlockStart: 16 }} bodyStyle={{ padding: '16px', overflow: isMP ? 'auto' : 'hidden' }} wrap title={<div style={{ fontWeight: '500', fontSize: 14 }}> Overview of Threshold Breached in Transactions </div>} extra={< EyeOutlined onClick={() => {
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
                      <div style={{ position: 'relative', zIndex: 1, fontSize: '14px', color: "#333", fontWeight: "500" }}>{e.name}</div>
                    </div>
                    
                  </th>
                })
               }
              
             
            </tr>
            <tr style={{ textAlign: 'center', height:30 }}>
              <td style={{ fontWeight: '500', textAlign: 'left' }}>No. of Threshold Breach</td>
              {
                flowList.map((e, i) => {

                  return <td>{statisticsObj?.threshold_reached?.no[e.id] || 0}</td>
                })

              }
              
            </tr>
            <tr style={{ textAlign: 'center',height: 30, }} >
              <td style={{ fontWeight: '500', textAlign: 'left' }}>% of breaches</td>
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

                  return <td>{statisticsObj?.threshold_reached?.avg_duration[e.id]}</td>
                })

              }
              <td></td>
            </tr>
          </table>
        </ProCard>


        <ProCard collapsed={collapsed4} colSpan={24} style={{ marginBlockStart: 16 }} wrap title={<div style={{ fontWeight: '500', fontSize: 14 }}> {'Open Transactions (' + (terminal_id ? terminalList[terminal_id] : "") + ' - ' + dateArr[0] + ' to ' + dateArr[1] + ')'} </div>} extra={< EyeOutlined onClick={() => {
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
                   
                    var t_id=e.id
                    return <tr style={{ textAlign: 'center', height: 60 }}>
                      <td onClick={() => {
                        history.push(`/transaction/detail?transaction_id=` + e.id);
                      }} title={e.id} style={{ cursor: 'pointer' }}><a>{e.id.substr(0, 8) + "..."}</a></td>
                      <td>{moment(e.start_of_transaction).format('DD/MM/YYYY')  }</td>
                      <td>{e.imo_number}</td>
                      <td>{e.vessel_name}</td>
                      <td>{terminalList[e.terminal_id]}</td>
                      <td>{jettyList[e.jetty_id] }</td>
                     
                      <td>{e.total_nominated_quantity_b} / {e.total_nominated_quantity_m}</td>
                      {
                        flowTreeAll.map((e, i) => {
                          
                          var p = transactionMap[t_id]?.processMap[e.id]
                          var val = p?.duration
                          var total_duration = transactionMap[t_id]?.totalDuration
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
                                    width: '75px',
                                    height: '18px',
                                    fontSize: "14px",
                                    backgroundColor: ta ? (ta.red > 0 ? "red" : "#DE8205") : "#13c2c2",
                                    borderRadius: '30px',
                                    textAlign: 'center',
                                    lineHeight: '18px'
                                  }}>

                                    {parseInt((total_duration / 3600) + "") + "h " + parseInt((total_duration % 3600) / 60) + "m"}
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
