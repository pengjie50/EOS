import { GridContent, ProFormSelect, ProFormDateRangePicker, ProCard } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { EyeOutlined } from '@ant-design/icons';
import { Card, theme, Progress, Statistic, Badge } from 'antd';
import React, { useEffect, useState } from 'react';
const { Divider } = ProCard;
import { flow } from './system/flow/service';
import { SvgIcon } from '@/components' // 自定义组件
import {  isPC } from "@/utils/utils";


const Welcome: React.FC = () => {
  const { token } = theme.useToken();
  const { initialState } = useModel('@@initialState');
  const [flowList, setFlowList] = useState<any>([]);
  const [isMP, setIsMP] = useState<boolean>(!isPC());
  useEffect(() => {
   
    flow({ pageSize: 300, current: 1, type: 0, sorter: { sort: 'ascend' } }).then((res) => {
      res.data.push({ name: 'Total Duration', icon: 'icon-daojishi' })
      res.data.push({ name: 'Breached threshold between 2 events', icon: 'icon-yundongguiji' })
      
      setFlowList(res.data)
    })
   
  },[])
  var color = {
    'icon-daojishimeidian': '#A13736',
    'icon-matou': '#ED7D31',
    'icon-a-tadiao_huaban1': '#ED7D31',
    'icon-zhuanyunche': '#70AD47',
    'icon-matou1': '#70AD47',
    'icon-daojishi': '#13C2C2',
    'icon-yundongguiji': '#13C2C2'
  }
  return (
    <GridContent  className="dashboard">

      <ProCard ghost={true} bodyStyle={isMP ? { padding: '5px' } : {}} wrap >

        <ProCard wrap={isMP} >
          <ProCard ghost={true} colSpan={{xs:24,md:12}} bodyStyle={{ padding:  '5px 0px 5px 0px', fontSize: '14px' }} >
            Transactions Overview (Advario - 01/01/23 to 27/04/23)
          </ProCard>
          <ProCard ghost={true} colSpan={{ xs: 24, md: 6 }} >
            <ProFormSelect
              name="select"
              label=""
              valueEnum={{
                open: '1111',
                closed: '2222',
              }}
              placeholder="Filter By: Terminals"

            />
          </ProCard>
          <ProCard ghost={true} colSpan={{ xs: 24, md: 6 }} bodyStyle={{ paddingLeft: 10 }} >
            <ProFormDateRangePicker name="dateRange" />
          </ProCard>
        </ProCard>


        <ProCard ghost={true} style={{ marginBlockStart: 16, marginLeft: -4 }} gutter={8} wrap={isMP} >
          <ProCard colSpan={{ xs: 24, md: 12 }}  wrap title={<div style={{ fontWeight: 'normal', fontSize: 14 }}> No of Transaction</div>} extra={< EyeOutlined style={{ fontWeight: 'normal', fontSize: 14 }} />} bordered headerBordered>

            <ProCard colSpan={24} ghost={true} bodyStyle={{ fontSize: '30px', lineHeight: '30px', height:'30px' }} >
              <div>50%</div>
            </ProCard>
            <ProCard ghost={true} colSpan={24} >
             
              <Progress percent={50} strokeColor="#13C2C2" size={['100%', 10]} strokeLinecap="butt" showInfo={false} />
            </ProCard>
            

            <ProCard ghost={true} style={{ marginBlockStart: 2 }} gutter={2}>
              <div style={{ float: 'left', lineHeight: '22px', height: '22px', fontSize: '14px', marginRight: '16px' }}>
                <span>Total</span><span style={{ marginLeft:'8px' }}>300</span>
              </div>
              <div style={{ float: 'left', lineHeight: '22px', height: '22px', fontSize: '14px', marginRight: '16px' }}>
                <span>Completed</span> <span style={{ marginLeft: '8px' }}>200</span>
              </div>
              <div style={{ float: 'left', lineHeight: '22px', height: '22px', fontSize: '14px', marginRight: '16px' }}>
                <span>Open</span> <span style={{ marginLeft: '8px' }}>100</span>
              </div>
            </ProCard>
          </ProCard>

          <ProCard colSpan={{ xs: 24, md: 12 }} style={{ marginBlockStart: isMP ? 16:0,marginLeft:4 }} wrap title={<div style={{ fontWeight: 'normal', fontSize: 14 }}> Average Total Duration Per Transaction</div>} extra={< EyeOutlined style={{ fontWeight: 'normal', fontSize: 14 }} />} bordered headerBordered>

            <ProCard ghost={true} colSpan={24} wrap bodyStyle={{
              paddingBottom:11
            }} >

              <ProCard.Group ghost={true} direction={'row'} bodyStyle={{ paddingLeft: 10, backgroundColor: "#70AD47", borderRadius: '10px' }}>
                <ProCard ghost={true} bodyStyle={{ padding: 5 }}>
                  <Statistic title="All Time" value={36} suffix=" h"  />
                </ProCard>
                <Divider type={'vertical'} />
                <ProCard ghost={true} bodyStyle={{ padding: 5}}>
                  <Statistic title="12 Month Average" value={30} suffix=" h" />
                </ProCard>
                <Divider type={'vertical'} />
                <ProCard ghost={true} bodyStyle={{ padding: 5}}>
                  <Statistic title="30 Day Average" value={31} suffix=" h" />
                </ProCard>

              </ProCard.Group>
            </ProCard>

          </ProCard>
        </ProCard>


        <ProCard  colSpan={34} style={{ marginBlockStart: 16 }}  bodyStyle={{ padding: '16px', overflow: isMP ? 'auto' : 'hidden' }} wrap title={<div style={{ fontWeight: 'normal', fontSize: 14 }}> Overview of Threshold Breached in Transactions </div>} extra={< EyeOutlined style={{ fontWeight: 'normal', fontSize: 14 }} />} bordered headerBordered>

          <table className="boder-table" style={{ width: isMP?'350%':'100%' }} border="0" cellpadding="0" cellspacing="0" >
            <tr>
              <th></th>

              {
                flowList.map((e,i) => {
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
              <td>56</td>
              <td>30</td>
              <td>35</td>
              <td>22</td>
              <td>26</td>
              <td>15</td>
              <td>32</td>
            </tr>
            <tr style={{ textAlign: 'center',height: 30, }} >
              <td style={{ fontWeight: '500', textAlign: 'left' }}>% of breaches</td>
              <td>40%</td>
              <td>22%</td>
              <td>25%</td>
              <td>16%</td>
              <td>19%</td>
              <td>10%</td>
              <td>15%</td>
            </tr>
            <tr style={{ textAlign: 'center', height: 30 }} >
              <td style={{ fontWeight: '500', textAlign: 'left' }}>Avg. Duration</td>
              <td>2h 10m</td>
              <td>4h 10m</td>
              <td>2h 10m</td>
              <td>0h 45m</td>
              <td>2h 10m</td>
              <td>2h 10m</td>
              <td></td>
            </tr>
          </table>
        </ProCard>


        <ProCard colSpan={24} style={{ marginBlockStart: 16 }}  wrap title={<div style={{ fontWeight: 'normal', fontSize: 14 }}> Open Transactions (Advario - 01/01/23 to 27/04/23) </div>} extra={< EyeOutlined style={{ fontWeight: 'normal', fontSize: 14 }} />} bordered headerBordered >
         
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
              <tr style={{ textAlign: 'center', height: 60 }}>
                  <td>#118</td>
                  <td>5/04/2023</td>
                  <td>1234</td>
                  <td>ABC</td>
                  <td>Advario</td>
                  <td>OTK3</td>
                  <td>366,500/ 50,000</td>
                {
                  flowList.map((e, i) => {
                    return <td>

                      <div style={{ position: 'relative', float: 'left', zIndex: 1, textAlign: 'center', height:"50px", width: '100%' }}>


                        <div style={{ position: 'absolute', zIndex: 0, top: 12, left: i == 0 ? '50%' : 0, width: i == 0 || i == 4 ? '50%' : (i > 4 ? '0' : '100%'), height: 2, backgroundColor: '#8aabe5', overflow: 'hidden', }}></div>

                        <div style={{ position: 'relative', zIndex: 1 }}>
                          {i < 5 && (
                            <span style={{
                              display: "inline-block",
                              color: "#fff",
                              width: '25px',
                              height: '25px',
                              fontSize: "20px",
                              backgroundColor: color[e.icon],
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
                              width: '65px',
                              height: '25px',
                              fontSize: "14px",
                              backgroundColor: "#13C2C2",
                              borderRadius: '50%',
                              textAlign: 'center',
                              lineHeight: '25px'
                            }}>

                              5h 45m
                            </span>
                          )}

                          {i == 6 && (
                          
                            <Badge count={5} style={{ boxShadow: 'none',marginTop:8 }}>
                              <SvgIcon style={{ fontSize: "20px", color: 'red', marginTop: 8 }} type={'icon-2'} />
                              </Badge>
                             
                             
                          )}
                         
                        </div>
                        {i <5 && (
                          <div style={{ position: 'relative', zIndex: 1, fontSize: '12px', color: "#333", lineHeight: "12px" }}>{'2h 15m'}</div>
                        )}
                        
                      </div>

                    </td>
                  })
                }

                </tr>

                <tr style={{ textAlign: 'center', height: 60 }}>
                  <td>#118</td>
                  <td>5/04/2023</td>
                  <td>1234</td>
                  <td>ABC</td>
                  <td>Advario</td>
                  <td>OTK3</td>
                  <td>366,500/ 50,000</td>
                  {
                    flowList.map((e, i) => {
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
                                backgroundColor: color[e.icon],
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
                                width: '65px',
                                height: '25px',
                                fontSize: "14px",
                                backgroundColor: "#13C2C2",
                                borderRadius: '50%',
                                textAlign: 'center',
                                lineHeight: '25px'
                              }}>

                                5h 45m
                              </span>
                            )}

                            {i == 6 && (

                              <Badge count={5} style={{ boxShadow: 'none' }}>
                                <SvgIcon style={{ fontSize: "20px", color: 'red' }} type={'icon-2'} />
                              </Badge>


                            )}

                          </div>
                          {i < 5 && (
                            <div style={{ position: 'relative', zIndex: 1, fontSize: '12px', color: "#333", lineHeight: "12px" }}>{'2h 15m'}</div>
                          )}

                        </div>

                      </td>
                    })
                  }

                </tr>

                <tr style={{ textAlign: 'center', height: 60 }}>
                  <td>#118</td>
                  <td>5/04/2023</td>
                  <td>1234</td>
                  <td>ABC</td>
                  <td>Advario</td>
                  <td>OTK3</td>
                  <td>366,500/ 50,000</td>
                  {
                    flowList.map((e, i) => {
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
                                backgroundColor: color[e.icon],
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
                                width: '65px',
                                height: '25px',
                                fontSize: "14px",
                                backgroundColor: "#13C2C2",
                                borderRadius: '50%',
                                textAlign: 'center',
                                lineHeight: '25px'
                              }}>

                                5h 45m
                              </span>
                            )}

                            {i == 6 && (

                              <Badge count={5} style={{ boxShadow: 'none' }}>
                                <SvgIcon style={{ fontSize: "20px", color: 'red' }} type={'icon-2'} />
                              </Badge>


                            )}

                          </div>
                          {i < 5 && (
                            <div style={{ position: 'relative', zIndex: 1, fontSize: '12px', color: "#333", lineHeight: "12px" }}>{'2h 15m'}</div>
                          )}

                        </div>

                      </td>
                    })
                  }

                </tr>
                <tr style={{ textAlign: 'center', height: 60 }}>
                  <td>#118</td>
                  <td>5/04/2023</td>
                  <td>1234</td>
                  <td>ABC</td>
                  <td>Advario</td>
                  <td>OTK3</td>
                  <td>366,500/ 50,000</td>
                  {
                    flowList.map((e, i) => {
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
                                backgroundColor: color[e.icon],
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
                                width: '65px',
                                height: '25px',
                                fontSize: "14px",
                                backgroundColor: "#13C2C2",
                                borderRadius: '50%',
                                textAlign: 'center',
                                lineHeight: '25px'
                              }}>

                                5h 45m
                              </span>
                            )}

                            {i == 6 && (

                              <Badge count={5} style={{ boxShadow: 'none' }}>
                                <SvgIcon style={{ fontSize: "20px", color: 'red' }} type={'icon-2'} />
                              </Badge>


                            )}

                          </div>
                          {i < 5 && (
                            <div style={{ position: 'relative', zIndex: 1, fontSize: '12px', color: "#333", lineHeight: "12px" }}>{'2h 15m'}</div>
                          )}

                        </div>

                      </td>
                    })
                  }

                </tr>
              </tbody>
            </table>
          </ProCard>
        </ProCard>



      </ProCard>

    
       
        
     
    </GridContent>
  );
};

export default Welcome;
