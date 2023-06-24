
import {
  ProCard,
  ProFormCheckbox,
  PageContainer,
  ProFormDateRangePicker,
  DragSortTable,
  ProFormText,
  ProColumns,
  ProForm,
  ProList,
  ModalForm,
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
import { FileTextOutlined, FileAddOutlined, ArrowRightOutlined, DeleteOutlined, ExclamationCircleOutlined, CloseOutlined, MenuOutlined } from '@ant-design/icons';
import { reportTemplate, addReportTemplate,updateReportTemplate, removeReportTemplate,addReport } from '../service';
import { fieldUniquenessCheck } from '@/services/ant-design-pro/api';

import RcResizeObserver from 'rc-resize-observer';
import { Button, Drawer, Input, message, Modal, Radio } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import { flow } from '../../system/flow/service';
import { alertrule } from '../../alertrule/service';
import { organization } from '../../system/company/service';
import numeral from 'numeral';
import moment from 'moment'
import { jetty } from '../../system/jetty/service';
import { isPC } from "@/utils/utils";
const { confirm } = Modal;
//MP
import { InfiniteScroll, List, NavBar, Space, DotLoading } from 'antd-mobile'
import { parseInt, template } from 'lodash';
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

export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: Partial<any>) => void;
  onSubmit: (values: Partial<any>) => Promise<void>;
  createModalOpen: boolean;

};
const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  //const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const [processes, setProcesses] = useState<any>([]);
  const [events, setEvents] = useState<any>([]);
  const [organizationList, setOrganizationList] = useState<any>({});
  const [jettyList, setJettyList] = useState<any>({});
  const [flowConf, setFlowConf] = useState<any>({});
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [templateList, setTemplateList] = useState<any>([]);
  const [templateMap, setTemplateMap] = useState<any>({});

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [templateName, setTemplateName] = useState("");

  const [report_type, setReport_type] = useState(1);
  
  const [isMP, setIsMP] = useState<boolean>(!isPC());

 
  const [selectedColumns, setSelectedColumns] = useState<any>([]);
  

  const [availableColumns, setAvailableColumns] = useState<any>([]);
  
  
 

  const [fields, setFields] = useState<any>([]);
  const getOrganizationName = () => {
    if (currentUser?.role_type == "Super") {
      return 'Organization'
    }
    if (currentUser?.role_type == "Trader") {
      return 'Terminal'
    }
    if (currentUser?.role_type == "Terminal") {
      return 'Customer'
    }
  }


  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  
  
  const [selectedRowKeys1, setSelectedRowKeys1] = useState<any[]>([]);
  
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
        'op': 'in',
        'data': [1,2,3]
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
    jetty({  sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setJettyList(b)

    });


    organization({ sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setOrganizationList(b)








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


    if (report_type == 2) {
      columns = columns2
    }


    setAvailableColumns(columns.filter((a) => {
      return !a.mustSelect
    }))
    


    setSelectedColumns(columns.filter((a) => {
      return a.mustSelect
    }))
   




  }, [report_type]);

  
  var columns= [
   
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Total/ Current Duration" />,
      dataIndex: 'total_duration',

    },
    {

      title: <FormattedMessage id="pages.transaction.xxx" defaultMessage="Current Process" />,
      dataIndex: 'flow_pid',
     
    },
    {

      title: getOrganizationName(),
      dataIndex: 'organization_id',

    },
    {
      title: <FormattedMessage id="pages.transaction.jettyName" defaultMessage="Jetty Name" />,
      dataIndex: 'jetty_id',

    },
    {
      title: <FormattedMessage id="pages.transaction.arrivalID" defaultMessage="Arrival ID" />,
      dataIndex: 'arrival_id',

    },
    {
      title: <FormattedMessage id="pages.transaction.imoNumber" defaultMessage="IMO Number" />,
      dataIndex: 'imo_number',

    },
    {
      title: <FormattedMessage id="pages.transaction.vesselName" defaultMessage="Vessel Name" />,
      dataIndex: 'vessel_name',

    },
    {
      title: <FormattedMessage id="pages.transaction.vesselName" defaultMessage="Vessel Size" />,
      dataIndex: 'size_of_vessel',

    },
    {
      title: <FormattedMessage id="pages.transaction.productType" defaultMessage="Product Type" />,
      dataIndex: 'product_type',

    },
    {
      title: <FormattedMessage id="pages.transaction.xxx" defaultMessage="Total Nominated Quantity (Bls-60-F)" />,
      dataIndex: 'total_nominated_quantity_b',

    },
    {
      title: (<FormattedMessage id="pages.transaction.transactionID" defaultMessage="EOS ID" />),
      dataIndex: 'eos_id',
      mustSelect: true
    },
    {
      title: <FormattedMessage id="pages.transaction.xxx" defaultMessage="Transaction Status" />,
      dataIndex: 'status',
      mustSelect: true
    },
    {
      title: <FormattedMessage id="pages.transaction.startOfTransaction" defaultMessage="Start Of Transaction" />,
      dataIndex: 'start_of_transaction',
      mustSelect: true
    },
    {
      title: <FormattedMessage id="pages.transaction.endOfTransaction" defaultMessage="End Of Transaction" />,
      dataIndex: 'end_of_transaction',
      mustSelect: true

    },
   
    {
      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Number of Amber Alert" />,
      dataIndex: 'amber_alert_num',
      mustSelect: true
     
    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Number of Red Alert" />,
      dataIndex: 'red_alert_num',
      mustSelect: true
      
    },
   
   
  ];

  const columns2 = [
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Type of Last Change" />,
      dataIndex: 'duration',

    },
    {
    title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="EOS ID" />,
      dataIndex: 'flow_id',
      mustSelect: true

  },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Work Order ID" />,
      dataIndex: 'flow_id_to',
      mustSelect: true

    },

    {
      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Description" />,
      dataIndex: 'event_time',
      mustSelect: true

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Value" />,
      dataIndex: 'duration',
      mustSelect: true

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Type of Data" />,
      dataIndex: 'duration',
      mustSelect: true

    }
]
  const columns3 = [
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Type of Last Change" />,
      dataIndex: 'duration',

    },
    {
      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="EOS ID" />,
      dataIndex: 'flow_id',
      mustSelect: true

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Work Order ID" />,
      dataIndex: 'flow_id_to',
      mustSelect: true

    },

    {
      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Description" />,
      dataIndex: 'event_time',
      mustSelect: true

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Value" />,
      dataIndex: 'duration',
      mustSelect: true

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Type of Data" />,
      dataIndex: 'duration',
      mustSelect: true

    }
  ]
 
  const formRef = useRef<ProFormInstance>();
  const onlyCheck = (rule: any, value: any, callback: (arg0: string | undefined) => void) => {


    fieldUniquenessCheck({ where: { name: value, type:[1,2,3], company_id: currentUser?.company_id }, model: 'Userconfig' }).then((res) => {

      if(templateMap[template_name] && templateMap[template_name].name==value){
           callback(undefined); 
      }
      if (res.data) {

        callback(intl.formatMessage({
          id: 'pages.xxx',
          defaultMessage: 'This name is already in use',
        }))
      } else {
        callback(undefined); // 必须返回一个callback
      }
    });

  }
  const onlyCheck2 = (rule: any, value: any, callback: (arg0: string | undefined) => void) => {


    fieldUniquenessCheck({ where: { name: value, company_id: currentUser?.company_id }, model: 'Report' }).then((res) => {

     
      if (res.data) {

        callback(intl.formatMessage({
          id: 'pages.xxx',
          defaultMessage: 'This name is already in use',
        }))
      } else {
        callback(undefined); // 必须返回一个callback
      }
    });

  }


  const {
    onSubmit,
    onCancel,
    createModalOpen,

  } = props;
  return (
  
      
    <ModalForm width={'90%'}
      title="Create New Report"
      open={props.createModalOpen}
      onFinish={props.onSubmit}
      onOpenChange={(vi) => {
        if (!vi) {
          props.onCancel();
        }

      }}
      modalProps={{ destroyOnClose: true }}
      formRef={formRef} submitter={{

        render: (_, dom) => <div style={{ padding: 20, backgroundColor: "#fff", position: 'relative', height: isMP ? 240 : 80 }}>

        
         
            <Button style={{ width: isMP ? '100%' : null }} onClick={() => {


              formRef.current?.resetFields()
              setAvailableColumns(columns)
             
              setSelectedColumns([])
             
          } }>
            Reset
          </Button>

          <Button style={{ marginLeft: isMP ? 0 : 20, marginTop: isMP ? 20 : 0,width: isMP ? '100%' : null }} icon={<FileTextOutlined />}  type="primary" onClick={ async () => {
            var reportName = formRef.current?.getFieldValue("name")
            var templateName = formRef.current?.getFieldValue("templateName")
            var data = formRef.current?.getFieldsValue()
            
            data.selected_fields = fields

            var report_type = data.report_type
            delete data.report_type
            delete data.useExisting

            if (data.time_period && data.time_period != '0') {
             
              data.dateArr = [new Date((new Date()).getTime() - 3600 *24* 1000 * parseInt(data.time_period)), new Date()]

              if (data.dateRange) {
                delete data.dateRange
              }
              
            }
             // var ok = { name: reportName, value: JSON.stringify(data) , template_name: templateName ? templateName : null }

            var ok = await handleAGenerateReport({ name: reportName, value: data,  type: report_type,template_name: templateName ? templateName : null })
           
            if (ok) {
              props.onSubmit({})
              history.push(`/Report/ReportSummary`, ok);
           }

           

          } }>Generate Report</Button>
          <Button style={{ marginLeft: isMP ? 0 : 20, marginTop: isMP ? 20 : 0, width: isMP ? '100%' : null }} onClick={() => {
            setIsModalOpen(true)

           

          }} type="primary" icon={<FileAddOutlined />}>Save Template</Button>
         <Modal title="Save Template" open={isModalOpen} onOk={async () => {

            var templateName = formRef.current?.getFieldValue("templateName")
            var data = formRef.current?.getFieldsValue()
            var report_type = data.report_type
            delete data.report_type
            delete data.useExisting
            delete data.report_name
            data.selected_fields = fields
           
            if (data.time_period && data.time_period != '0') {

              data.dateArr = [new Date((new Date()).getTime() - 3600*24 * 1000 * parseInt(data.time_period)), new Date()]

              if (data.dateRange) {
                delete data.dateRange
              }

            }
            
            if (data.save_type=='b') {
              await handleUpdate({ name: templateName, value: data, id: data.template_name, type: report_type })
            } else {
              await handleAdd({ name: templateName, value: data, type: report_type })
            }
            
            getReportTemplate()
            setIsModalOpen(false)

            props.onSubmit({})


          }} onCancel={() => { setIsModalOpen(false) }}>

            <ProFormText label="save_type" name="save_type" hidden initialValue="a" />

            <ProFormDependency name={['template_name','save_type']}>
              {({ template_name, save_type }) => {

               
                if (template_name) {
                  if (save_type == "b") {
                          
                    formRef.current?.setFieldValue("templateName", templateMap[template_name].name)
                  } else {
                     
                    formRef.current?.setFieldValue("templateName", null)
                  }
                
                  return (<>

                    <ProCard ghost={true} wrap={isMP ? true : false} gutter={0} bodyStyle={{ marginBottom: 20 }}>
                      <ProCard ghost={true} colSpan={isMP ? 24 : 10} bodyStyle={{ marginBottom: 20 }} >
                        <Button type={save_type == "a" ? 'primary' : "default"} style={{width:'100%'}}  onClick={() => {
                          formRef.current?.setFieldValue("save_type",'a')

                        } } >New Template</Button>
                      </ProCard>
                      <ProCard ghost={true} colSpan={isMP ? 24 : 14} style={{ paddingLeft: isMP ? 0 : 10 }}>
                        <Button type={save_type == "b" ? 'primary' : "default"} style={{ width: '100%' }} onClick={() => {
                          formRef.current?.setFieldValue("save_type", 'b')

                        }} >Replace Existing Template</Button>
                      </ProCard>
                    </ProCard>
                    

                   

                   
                    
                 


                 
                    

                      <ProFormText label="Template Name" name="templateName" style={{ width: '100%' }} rules={[
                        {
                          required: true,
                          message: (
                            <FormattedMessage
                              id="pages.rules.required"
                              defaultMessage=""
                            />
                          ),
                        }, { validator: onlyCheck }
                      ]} />

                   
                    
                  
                    </>
                  )
                
                   


                  


                } else {
                  formRef.current?.setFieldValue("templateName", null)
                  return (<ProForm.Group style={{ marginTop: 20 }} >
                    <ProFormText label="Template Name" name="templateName" width="md" rules={[
                      {
                        required: true,
                        message: (
                          <FormattedMessage
                            id="pages.rules.required"
                            defaultMessage=""
                          />
                        ),
                      }, { validator: onlyCheck }
                    ]} />
                  </ProForm.Group >)
                }

              }}
             </ProFormDependency>


            
           
          </Modal></div>,
      }}>

     
      <ProFormRadio.Group
        name="useExisting"
        initialValue="new"
        label="Generate your report with a new set of report parameters or from a saved report template. "
        onChange={(v) => {
          var o = formRef.current?.getFieldValue('useExisting')
          formRef.current?.resetFields()
          formRef.current?.setFieldValue('useExisting', o)
          setAvailableColumns(columns)
         
          setSelectedColumns([])
          

        } }
        options={[
          {
            label: 'New Report',
            value: 'new',
          },
          {
            label: 'Existing Report Template',
            value: 'existing',
          },
          
        ]}
      />

     


      

      <ProFormDependency name={['useExisting', 'report_type', 'template_name']}>
        {({ useExisting, report_type, template_name }) => {

          setReport_type(report_type)
          return <>

          

            {useExisting == "existing" && <ProFormSelect name="template_name" label="Selected Template" fieldProps={{
        options: templateList, onChange: (() => {
          var id = formRef.current?.getFieldValue("template_name")
          try {
            var value = eval('(' + templateMap[id].value + ')');
            value.report_type = templateMap[id].type+""
            formRef.current?.setFieldsValue(value)
          
           

            if (!value.selected_fields) {
              value.selected_fields = []
            }
            var arr = columns.filter((c) => {

              return value.selected_fields.some((cc) => {
                return cc == c.dataIndex
              })
            })
            setSelectedColumns(arr)
            



            setAvailableColumns(columns.filter((a) => {
              return !arr.some((b) => {
                return a.dataIndex == b.dataIndex
              })
            }))

          

            setFields(value.selected_fields)

          } catch (e) {

          }


        })
            }} width="lg" />}
            {((useExisting == "existing" && template_name) || useExisting == "new") && <ProFormSelect

              valueEnum={
                {
                  '1': "Transaction Summary",
                  '2': "Transaction Details",
                  '3': "Alert Reports"
                }}
              width="lg"
              name="report_type"
              label="Report Type"

            />}
            {report_type && <ProFormText name="name" label="Name of Report:" width='lg' rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.rules.required"
                    defaultMessage="This field cannot be empty！"
                  />
                ),
              }, { validator: onlyCheck2 }

            ]} />}

          

     
       
    

   


            {report_type  && <ProCard title="Output Filter" colSpan={24} headerBordered collapsible={true} headStyle={{ backgroundColor: "#d4d4d4" }}>

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

                    return time_period == 0 ? < ProFormDateRangePicker name="dateRange" label=" " /> : null
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
                  valueEnum={organizationList}

                  width="sm"
                  name="organization_id"
                  label={getOrganizationName()}

                />
              </ProForm.Group>
              {false && <ProForm.Group label="Threshold Breached:">
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

              </ProForm.Group>}

            </ProCard>}

            {report_type  && <RcResizeObserver
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
                <ProCard title="" ghost={isMP ? true : false} colSpan={isMP ? 24 : 12} >
                  <div>

                    <DragSortTable
                      toolBarRender={() => [
                        <Button key="3" type="primary" onClick={() => {


                          var arr=availableColumns.filter((a) => {
                            return !selectedRowKeys.some((b) => {
                              return  b.dataIndex==a.dataIndex
                            })
                          })

                         
                          setAvailableColumns(arr)


                          setSelectedColumns(selectedColumns.concat(selectedRowKeys))

                          setSelectedRowKeys([])
                          setSelectedRowKeys1([])
                       

                        }}>
                          {'>>'}
                        </Button>,
                      ]}
                      options={false}
                      headerTitle="Available:"
                      
                      columns={[{
                        title: '',
                        dataIndex: 'title',
                      }]}
                      rowSelection={{
                        selectedRowKeys: selectedRowKeys.map((a)=>a.dataIndex),
                        onChange: (_, selectedRows) => {
                          console.log(selectedRows)
                          setSelectedRowKeys(selectedRows);
                        },
                      }}
                      rowKey="dataIndex"
                      search={false}
                      pagination={false}
                      dataSource={availableColumns}
                      dragSortKey="title"
                      dragSortHandlerRender={(rowData: any, idx: any) => (
                        <div style={{ cursor: 'grab' }} >
                         
                         {idx + 1} - {rowData.title}
                        </div>
                      )}
                      onDragSortEnd={(newDataSource: any) => {
                       // console.log('排序后的数据', newDataSource);
                        //setDatasource2(newDataSource);
                       // message.success('修改列表排序成功');
                      } }
                    />






                 

                  </div>
                </ProCard>
                <ProCard title="" ghost={isMP ? true : false } colSpan={isMP ? 24 : 12}>
                  <div >


                    <DragSortTable
                      toolBarRender={() => [
                        <Button key="3" type="primary" onClick={() => {


                          var selectedRowKeys2 = selectedRowKeys1.filter((a) => {

                             return !columns.filter((b) => {
                              return b.mustSelect
                             }).some((c) => {
                               return c.dataIndex == a.dataIndex
                             })


                          })

                          var arr = selectedColumns.filter((a) => {
                            return !selectedRowKeys2.some((b) => {
                              return b.dataIndex == a.dataIndex
                            })
                          })


                          setSelectedColumns(arr)


                          setAvailableColumns(availableColumns.concat(selectedRowKeys2))

                          setSelectedRowKeys([])
                          setSelectedRowKeys1([])

                        }}>
                          {'<<'}
                        </Button>
                      ]}
                      options={false}
                      headerTitle="Selected:"
                      
                      columns={[{
                        title: '',
                        dataIndex: 'title',
                      }]}
                      rowSelection={{
                        selectedRowKeys: selectedRowKeys1.map((a) => a.dataIndex),
                        onChange: (_, selectedRows) => {
                          setSelectedRowKeys1(selectedRows);
                        },
                      }}
                      rowKey="dataIndex"
                      search={false}
                      pagination={false}
                      dataSource={selectedColumns}
                      dragSortKey="title"
                      dragSortHandlerRender={(rowData: any, idx: any) => (
                        <div style={{ cursor: 'grab' }} >

                          {idx + 1} - {rowData.title}
                        </div>
                      )}
                      onDragSortEnd={(newDataSource: any) => {
                        // console.log('排序后的数据', newDataSource);
                       setSelectedColumns(newDataSource);
                        // message.success('修改列表排序成功');
                      }}
                    />

                   

                  </div>
                </ProCard>
              </ProCard>









            </RcResizeObserver>}


          </>
      
        }}



      </ProFormDependency>
        </ModalForm>

   
  );
};

export default UpdateForm;
