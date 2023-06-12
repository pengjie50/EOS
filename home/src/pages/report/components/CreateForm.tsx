
import {
  ProCard,
  ProFormCheckbox,
  PageContainer,
  ProFormDateRangePicker,
  ProFormText,
  ProColumns,
  ProList,
  ProForm,
  ProFormRadio ,
  FooterToolbar,
  ProFormTextArea,
  ProFormSelect,
  ProFormDependency,
  Search,
  ProFormInstance,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, useModel, formatMessage, history } from '@umijs/max';
import { FileTextOutlined, FileAddOutlined, ArrowRightOutlined, DeleteOutlined, ExclamationCircleOutlined,CloseOutlined} from '@ant-design/icons';
import { reportTemplate, addReportTemplate,updateReportTemplate, removeReportTemplate,addReport } from '../service';


import RcResizeObserver from 'rc-resize-observer';
import { Button, Drawer, Input, message, Modal, Radio } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import { flow } from '../../system/flow/service';
import { alertrule } from '../../alertrule/service';
import { terminal } from '../../system/terminal/service';
import numeral from 'numeral';
import moment from 'moment'
import { jetty } from '../../system/jetty/service';
import { isPC } from "@/utils/utils";
const { confirm } = Modal;
//MP
import { InfiniteScroll, List, NavBar, Space, DotLoading } from 'antd-mobile'
import { template } from 'lodash';
/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */



const handleAGenerateReport= async (fields: any) => {
 /* const hide = message.loading(<FormattedMessage
    id="pages.adding"
    defaultMessage="Adding"
  />);*/
  try {

    var cc=null
    var obj = await addReport({ ...fields }).then((res) => {
      cc = res.data

    });
   // hide();
  /*  message.success(<FormattedMessage
      id="pages.addedSuccessfully"
      defaultMessage="Added successfully"
    />);*/
    console.log("vvvvvvvvvvvv",cc)
    return cc;
  } catch (error) {
   // hide();
    message.error(<FormattedMessage
      id="pages.addingFailed"
      defaultMessage="Generate failed, please try again!"
    />);
    return false;
  }
};




const handleAdd = async (fields: any) => {
  const hide = message.loading(<FormattedMessage
    id="pages.adding"
    defaultMessage="Adding"
  />);
  try {
    await addReportTemplate({ ...fields });
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
    await updateReportTemplate({ ...fields });
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
        removeReportTemplate({
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
const TableList: React.FC = () => {
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const [processes, setProcesses] = useState<any>([]);
  const [events, setEvents] = useState<any>([]);
  const [terminalList, setTerminalList] = useState<any>({});
  const [jettyList, setJettyList] = useState<any>({});
  const [flowConf, setFlowConf] = useState<any>({});
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [templateList, setTemplateList] = useState<any>([]);
  const [templateMap, setTemplateMap] = useState<any>({});

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [templateName, setTemplateName] = useState("");
  const [isMP, setIsMP] = useState<boolean>(!isPC());

 
  const [selectedColumns, setSelectedColumns] = useState<any>([]);
  const [selectedFilterColumns, setSelectedFilterColumns] = useState<any>([]);

  const [availableColumns, setAvailableColumns] = useState<any>([]);
  const [availableFilterColumns, setAvailableFilterColumns] = useState<any>([]);
  


  const [fields, setFields] = useState<any>([]);



  const [selectedRowKeys, setSelectedRowKeys] = useState<ReactText[]>([]);
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: ReactText[]) => setSelectedRowKeys(keys),
  };
  
  const [selectedRowKeys1, setSelectedRowKeys1] = useState<ReactText[]>([]);
  const rowSelection1 = {
    selectedRowKeys1,
    onChange: (keys: ReactText[]) => setSelectedRowKeys1(keys),
  };
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();
  const [responsive, setResponsive] = useState(false);

  const getReportTemplate = async () => {

    reportTemplate({
      type: {
        'field': 'type',
        'op': 'eq',
        'data': 1
      }
    }).then((res) => {

      var m = {}
      res.data = res.data.map((b) => {

        m[b.id] = b
        var a = {}
        a.value = b.id
        a.label = <span><DeleteOutlined onClick={() => {

          handleRemove([b], () => {
            formRef.current?.resetFields()
            getReportTemplate()
          })
        }} /> {b.name} </span>
        return a
      })

      setTemplateList(res.data)
      setTemplateMap(m)

    });
  }
  useEffect(() => {


   
    getReportTemplate()
    jetty({ pageSize: 3000, current: 1, sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setJettyList(b)

    });


    terminal({ pageSize: 3000, current: 1, sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setTerminalList(b)








    });

    flow({ sorter: { sort: 'ascend' } }).then((res) => {
      var b = {
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa": intl.formatMessage({
          id: 'pages.alertrule.entireTransaction',
          defaultMessage: 'Entire Transaction',
        })
      }
      var p = {
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa": intl.formatMessage({
          id: 'pages.alertrule.entireTransaction',
          defaultMessage: 'Entire Transaction',
        })
      }


      res.data.forEach((r) => {
        if (r.type == 0) {

          p[r.id] = r.name
        }
        b[r.id] = r.name
      })
      setFlowConf(b)
      setProcesses(p)


      //  var treeData = tree(res.data, "                                    ", 'pid')
      // setFlowTree(treeData)

      alertrule({
        type: {
          'field': 'type',
          'op': 'eq',
          'data': 1
        }
      }).then((res2) => {
        var d = {}



        res2.data.forEach((r) => {

          d[r.flow_id + "_" + r.flow_id_to] = b[r.flow_id] + " -> " + b[r.flow_id_to]
        })

        setEvents(d)

      });
    });





    setAvailableColumns(columns)
    setAvailableFilterColumns(columns)




  }, [true]);


  const columns: ProColumns<any>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.transaction.transactionID"
          defaultMessage="EOS ID"
        />
      ),
      dataIndex: 'eos_id',
      hideInSearch: true,
     
      sorter: true,
      defaultSortOrder: 'descend',
      render: (dom, entity) => {
        return (
          <a

            onClick={() => {

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
      title: <FormattedMessage id="pages.transaction.startOfTransaction" defaultMessage="Start Of Transaction" />,
      dataIndex: 'start_of_transaction',
      sorter: true,
      defaultSortOrder: 'descend',
      valueType: 'date',
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.transaction.endOfTransaction" defaultMessage="End Of Transaction" />,
      dataIndex: 'end_of_transaction',
      valueType: 'date',
      hideInSearch: true,
    },
   
    {
      title: <FormattedMessage id="pages.transaction.vesselName" defaultMessage="Vessel Name" />,
      dataIndex: 'vessel_name',
      valueType: 'text',
    },


    {
      title: <FormattedMessage id="pages.transaction.productType" defaultMessage="Product Type" />,
      dataIndex: 'product_type',
      // valueEnum: producttypeList,
    },
    {
      title: <FormattedMessage id="pages.transaction.arrivalID" defaultMessage="Arrival ID" />,
      dataIndex: 'arrival_id',
      hideInSearch: true
    },

    {
      title: <FormattedMessage id="pages.transaction.imoNumber" defaultMessage="IMO Number" />,
      dataIndex: 'imo_number',
      valueType: 'text',
    },
    {

      title: <FormattedMessage id="pages.transaction.xxx" defaultMessage="Process" />,
      dataIndex: 'flow_pid',
      valueEnum: flowConf,
      hideInSearch: true,
    },
  
    {
      title: <FormattedMessage id="pages.transaction.jettyName" defaultMessage="Jetty Name" />,
      dataIndex: 'jetty_id',
      valueEnum: jettyList,
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
      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Activity (From)" />,
      dataIndex: 'flow_id',
      valueType: 'text',
    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Activity (To)" />,
      dataIndex: 'flow_id_to',
      valueType: 'text',
    },

    {
      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Timestamp" />,
      dataIndex: 'event_time',
      valueType: 'text',
    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Total Duration By Process" />,
      dataIndex: 'duration',
      valueType: 'text',
    },

    {
      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Number of Amber Alert Breached" />,
      dataIndex: 'amber_alert_num',
      valueType: 'text',
    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Number of Red Alert Breached" />,
      dataIndex: 'red_alert_num',
      valueType: 'text',
    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Total Duration by Transaction" />,
      dataIndex: 'total_duration',
      valueType: 'text',
    },
   
  ];

  const formRef = useRef<ProFormInstance>();

  return (
    <PageContainer header={{
    //  title: 'Report Template',
      breadcrumb: {},
    }}>
     
      
      <ProForm formRef={formRef} submitter={{

        render: (_, dom) => <div style={{ padding: 20, backgroundColor: "#fff", position: 'relative', height: isMP ? 240 : 80 }}>

          <div style={{ position: 'absolute', left: isMP ? 0 : 20 }}> <Button

            type="primary"
            onClick={async () => {
              history.back()
            }}
          >Return to previous page</Button>
          </div>


          <div style={{ position: 'absolute', right: isMP ? 0 : 20 }}>



         
            <Button style={{ width: isMP ? '100%' : null }} onClick={() => {



              formRef.current?.resetFields()
              setSelectedColumns([])
              setSelectedFilterColumns([])
          } }>
            Reset
          </Button>

          <Button style={{ marginLeft: isMP ? 0 : 20, marginTop: isMP ? 20 : 0,width: isMP ? '100%' : null }} icon={<FileTextOutlined />}  type="primary" onClick={ async () => {
            var reportName = formRef.current?.getFieldValue("name")
            var templateName = formRef.current?.getFieldValue("templateName")
            var data = formRef.current?.getFieldsValue()
            data.selected_fields = fields


            if (data.time_period && data.time_period != '0') {
             
              data.dateArr = [new Date((new Date()).getTime() - 3600 *24* 1000 * parseInt(data.time_period)), new Date()]

              if (data.dateRange) {
                delete data.dateRange
              }
              
            }
             // var ok = { name: reportName, value: JSON.stringify(data) , template_name: templateName ? templateName : null }

            var ok = await handleAGenerateReport({ name: reportName, value: data, template_name: templateName ? templateName : null })
           
           if (ok) {
              history.push(`/Report/ReportSummary`, ok);
           }

           

          } }>Generate Report</Button>
          <Button style={{ marginLeft: isMP ? 0 : 20, marginTop: isMP ? 20 : 0, width: isMP ? '100%' : null }} onClick={() => {
            setIsModalOpen(true)

           

          }} type="primary" icon={<FileAddOutlined />}>Save Template</Button>
        </div> <Modal title="Save Template" open={isModalOpen} onOk={async () => {

            var templateName = formRef.current?.getFieldValue("templateName")
            var data=formRef.current?.getFieldsValue()
            data.selected_fields = fields

            if (data.time_period && data.time_period != '0') {

              data.dateArr = [new Date((new Date()).getTime() - 3600*24 * 1000 * parseInt(data.time_period)), new Date()]

              if (data.dateRange) {
                delete data.dateRange
              }

            }
            
            if (data.save_type=='b') {
              await handleUpdate({ name: templateName, value: data, id: data.template_name })
            } else {
             await handleAdd({ name: templateName, value: data })
            }
            
            getReportTemplate()
            setIsModalOpen(false)

          }} onCancel={() => { setIsModalOpen(false) }}>

            <ProFormDependency name={['template_name','save_type']}>
              {({ template_name, save_type }) => {

               
                if (template_name) {
                  if (save_type == "b") {
                    formRef.current?.setFieldValue("templateName", templateMap[template_name].name)
                  } else {
                    formRef.current?.setFieldValue("templateName", null)
                  }
                
                  return (<><ProForm.Group >

                    <ProFormRadio.Group
                      radioType="button"
                      
                      name="save_type"
                      label=""
                      initialValue="a"
                      options={[
                        {
                          label: 'New Template',
                          value: 'a',
                        },
                        {
                          label: 'Replace Existing Template',
                          value: 'b',
                        },
                      
                      ]}
                    />
                    
                  </ProForm.Group >


                    <ProForm.Group  >
                    
                    
                     <ProFormText label="Template Name"  name="templateName" width="md" />

                   
                    
                    </ProForm.Group >
                    </>
                  )
                
                   


                  


                } else {
                  formRef.current?.setFieldValue("templateName", null)
                  return (<ProForm.Group style={{ marginTop: 20 }} >
                    <ProFormText label="Template Name" name="templateName" width="md" />
                  </ProForm.Group >)
                }

              }}
             </ProFormDependency>


            
           
          </Modal></div>,
      }}>
      <ProCard title="Select Saved Template" colSpan={24} headerBordered headStyle={{ backgroundColor: "#d4d4d4" }}>
          <ProForm.Group >
            <ProFormSelect name="template_name" label="Name of Template:" fieldProps={{ options: templateList, onChange:(()=>{
              var id = formRef.current?.getFieldValue("template_name")
              try {
                var value = eval('(' + templateMap[id].value + ')');

                formRef.current?.setFieldsValue(value)

                if (!value.selected_fields) {
                  value.selected_fields=[]
                }
               var arr= columns.filter((c) => {

                  return value.selected_fields.some((cc) => {
                    return cc == c.dataIndex
                  })
                })
                setSelectedColumns(arr)
                setSelectedFilterColumns(arr)



                setAvailableColumns(columns.filter((a) => {
                  return !arr.some((b) => {
                    return a.dataIndex == b.dataIndex
                  })
                }))

                setAvailableFilterColumns(columns.filter((a) => {
                  return !arr.some((b) => {
                    return a.dataIndex == b.dataIndex
                  })
                }))

                setFields(value.selected_fields)

              } catch (e) {

              }
             

            }) }} width={250} />





            <ProFormText name="name" label="Name of Report:" width={250} rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.rules.required"
                    defaultMessage="This field cannot be empty！"
                  />
                ),
              }

            ]} />

          

        </ProForm.Group>

      </ProCard>

   


      <ProCard title="Output Filter" colSpan={24} headerBordered collapsible={true} headStyle={{ backgroundColor: "#d4d4d4" }}>

          <ProForm.Group  >


            <ProFormRadio.Group
              name="time_period"
              label="Time Period:"
              options={[
                {
                  label: 'Last 1 Year',
                  value: '360',
                },
                {
                  label: 'Last 6 months',
                  value: '180',
                },
                {
                  label: 'Last 3 months',
                  value: '90',
                },
                {
                  label: 'Last month',
                  value: '30',
                },
                {
                  label: 'Last week',
                  value: '7',
                },
               {
                 label: 'Specific Date Range',
                  value: '0',
                }
              ]}
            />
            <ProFormDependency name={['time_period']}>
              {({ time_period }) => {
              
                return time_period==0 ?< ProFormDateRangePicker name="dateRange" label=" " />:null
              }}
              </ProFormDependency>
        
        </ProForm.Group>
        <ProForm.Group >
          <ProFormText
            name="imo_number"
            label="IMO Number"

          />
          <ProFormSelect

            width="sm"
            name="jetty_id"
            label="Jetty"
            valueEnum={jettyList}

          />
            <ProFormText
              width="sm"
            name="vessel_name"
            label="Vessel Name"

          />
          </ProForm.Group>
          <ProForm.Group >
          <ProFormText
            name="product_type"
            label="Product Type"

          />
          <ProFormSelect
            valueEnum={
              {
                0: {
                  text: <FormattedMessage id="pages.transaction.active" defaultMessage="Open" />
                },
                1: { text: <FormattedMessage id="pages.transaction.closed" defaultMessage="Closed" /> },
                2: { text: <FormattedMessage id="pages.transaction.cancelled" defaultMessage="Cancelled" /> }
              }}
              width="sm"
            name="status"
            label="Status"

          />
          <ProFormSelect
            valueEnum={terminalList}

              width="sm"
            name="terminal_id"
            label="Terminal"

          />
        </ProForm.Group>
        <ProForm.Group label="Threshold Breached:">
          <ProFormSelect

            name="flow_id"
            width="lg"
            label={intl.formatMessage({
              id: 'pages.alertrule.entireTransactionAndProcesses',
              defaultMessage: 'Entire Transaction And Processes',
            })}
            valueEnum={processes}
            fieldProps={{
              labelInValue: false,
              dropdownMatchSelectWidth: isMP ? true : false,
              mode: 'multiple',
            }}

          />

          <ProFormSelect
            name="flow_id_to"
            width="lg"
            label={intl.formatMessage({
              id: 'pages.alertrule.betweenTwoEvents',
              defaultMessage: 'Between Two Events',
            })}
            valueEnum={events}
              fieldProps={{
                dropdownMatchSelectWidth: isMP ? true : false,
              labelInValue: false,
              mode: 'multiple',
            }}

          />

        </ProForm.Group>

      </ProCard>

      <RcResizeObserver
        key="resize-observer"
        onResize={(offset) => {
          setResponsive(offset.width < 596);
        }}
      >
        <ProCard
          title="Report Fields"
          headStyle={{ backgroundColor: "#d4d4d4" }}
          collapsible={true}
          extra=""
          split={responsive ? 'horizontal' : 'vertical'}
          bordered
          headerBordered
        >
            <ProCard title="Available Fields" colSpan={isMP?24:12 } >
            <div style={{ height: 360, overflow: 'auto' }}>

                <ProList<any>

                  rowKey="dataIndex"
                  rowSelection={rowSelection}
                onItem={(record, index) => {
                  console.log(record)
                }}

                  toolBarRender={() => {
                    return [
                      <Button key="3" type="primary" onClick={() => {


                      var arr1=[]

                        selectedRowKeys.forEach((a) => {
                          arr1.push(availableFilterColumns[a].dataIndex)
                        })

                       
                        

                        var arr = fields.map((a) => { return a })
                        arr = arr.concat(arr1)
                       
                        var arr2 = columns.filter((c) => {

                          return arr.some((a) => {
                            return a == c.dataIndex
                          })
                        })

                       
                        setSelectedColumns(arr2)

                        setSelectedFilterColumns(arr2)

                        setAvailableColumns(columns.filter((a) => {
                          return !arr.some((b) => {
                            return a.dataIndex == b
                          })
                        }))
                        
                        setAvailableFilterColumns(availableFilterColumns.filter((a) => {
                          return !arr.some((b) => {
                            return a.dataIndex == b
                          })
                        }))

                      } }>
                        {'>>' }
                      </Button>,
                    ];
                  }}

                toolbar={{

                  search: {
                    onSearch: (value: string) => {
                      setAvailableFilterColumns(availableColumns.filter((a) => {
                        console.log(a)
                        return a.title.props.defaultMessage.indexOf(value) > -1
                      }))
                    },
                  }

                }}
                onRow={(record: any) => {
                  return {
                    onMouseEnter: () => {
                     // console.log(record);
                    },
                    onClick: () => {
                    //  console.log(record);
                    },
                  };
                }}

                
                rowKey="name"
                headerTitle=""

                dataSource={availableFilterColumns}
                showActions="hover"
                showExtra="hover"
                metas={{
                  title: {
                    dataIndex: 'title',
                  },

                    actions:{
                      render: (text, row) => {
                        return <ArrowRightOutlined onClick={() => {


                          var arr = fields.map((a) => { return a })
                          arr.push(text.props.record.dataIndex)
                          setFields(arr)
                          var arr2=columns.filter((c) => {

                            return arr.some((a) => {
                              return a == c.dataIndex
                            })
                          })
                          setSelectedColumns(arr2)

                          setSelectedFilterColumns(arr2)

                          setAvailableColumns(columns.filter((a) => {
                            return !arr.some((b) => {
                              return a.dataIndex == b
                            })
                          }))

                          setAvailableFilterColumns(availableFilterColumns.filter((a) => {
                            return !arr.some((b) => {
                              return a.dataIndex == b
                            })
                          }))
                          

                          

                        } } />;
                    }
                  }
                
                }}
              />

            </div>
            </ProCard>
            <ProCard title="Selected Fields" colSpan={isMP ? 24 : 12}>
              <div style={{ height: 360, overflow: 'auto' }}>

                <ProList<any>

                  onItem={(record, index) => {
                    console.log(record)
                  }}
                  rowSelection={rowSelection1}
                  toolBarRender={() => {
                    return [
                      <Button key="3" type="primary" onClick={() => {


                        var arr1 = []

                        selectedRowKeys1.forEach((a) => {
                          arr1.push(selectedFilterColumns[a].dataIndex)
                        })
                        

                        var arr = fields.filter((a) => {

                          return !arr1.some((g) => {
                           
                            return g==a
                          })

                        })


                        

                        setFields(arr)


                        var arr2 = columns.filter((c) => {

                          return arr.some((a) => {
                            return a == c.dataIndex
                          })
                        })
                        setSelectedColumns(arr2)

                        setSelectedFilterColumns(arr2)


                        var arr3 = columns.filter((a) => {
                          return !arr.some((b) => {
                            return a.dataIndex == b
                          })
                        })

                        setAvailableColumns(arr3)

                        setAvailableFilterColumns(arr3)

                      }}>
                        {'<<'}
                      </Button>,
                    ];
                  }}
                  toolbar={{

                    search: {
                      onSearch: (value: string) => {
                        setSelectedFilterColumns(selectedColumns.filter((a) => {
                          console.log(a)
                          return a.title.props.defaultMessage.indexOf(value) > -1
                        }))
                      },
                    }

                  }}
                  onRow={(record: any) => {
                    return {
                      onMouseEnter: () => {
                        console.log(record);
                      },
                      onClick: () => {
                        console.log(record);
                      },
                    };
                  }}


                  rowKey="name"
                  headerTitle=""

                  dataSource={selectedFilterColumns}
                  showActions="hover"
                  showExtra="hover"
                  metas={{
                    title: {
                      dataIndex: 'title',
                    },

                    actions: {
                      render: (text, row) => {
                        return <CloseOutlined onClick={() => {

                          var arr = fields.filter((a) => {

                            return a != text.props.record.dataIndex

                          })
                          setFields(arr)


                          var arr2 = columns.filter((c) => {

                            return arr.some((a) => {
                              return a == c.dataIndex
                            })
                          })
                          setSelectedColumns(arr2)

                          setSelectedFilterColumns(arr2)


                          var arr3=columns.filter((a) => {
                            return !arr.some((b) => {
                              return a.dataIndex == b
                            })
                          })

                          setAvailableColumns(arr3)

                          setAvailableFilterColumns(arr3)

                        }} />;
                      }
                    }

                  }}
                />

              </div>
          </ProCard>
        </ProCard>
      </RcResizeObserver>
      

        </ProForm>

    </PageContainer>
  );
};

export default TableList;
