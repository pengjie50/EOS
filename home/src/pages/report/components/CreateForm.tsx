
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
  ProFormDigitRange,
  ProFormInstance,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, useModel, formatMessage, history } from '@umijs/max';
import { FileTextOutlined, FileAddOutlined, ArrowRightOutlined, DeleteOutlined, ExclamationCircleOutlined, CloseOutlined, MenuOutlined } from '@ant-design/icons';
import { reportTemplate, addReportTemplate,updateReportTemplate, removeReportTemplate,addReport } from '../service';
import { fieldUniquenessCheck, fieldSelectData } from '@/services/ant-design-pro/api';

import RcResizeObserver from 'rc-resize-observer';
import { Button, Drawer, Input, message, Modal, Radio, Empty, Select } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import { flow } from '../../system/flow/service';
import { alertrule } from '../../alertrule/service';
import { organization } from '../../system/company/service';
import numeral from 'numeral';
import moment from 'moment'
import { jetty } from '../../system/jetty/service';
import { isPC } from "@/utils/utils";
const { confirm } = Modal;

import { useAccess, Access } from 'umi';
//MP
import { InfiniteScroll, List, NavBar, Space, DotLoading } from 'antd-mobile'
import { parseInt, template } from 'lodash';

//import access from '../../../access';
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
  const [product_nameData, setProduct_nameData] = useState<any>({});

  const [eos_idData, setEos_idData] = useState<any>({});

  const [terminal_idData, setTerminal_idData] = useState<any>({});
  const [statusData, setStatusData] = useState<any>({});
  const [jetty_nameData, setJetty_nameData] = useState<any>({});
  const [organization_idData, setOrganization_idData] = useState<any>({});

  const [alertrule_typeData, setAlertrule_typeData] = useState<any>({});
  const [vessel_size_dwtData, setVessel_size_dwtData] = useState<any>({});
  


  const [threshold_organization_idData, setThreshold_organization_idData] = useState<any>({});
  
  
  const [jetty_idData, setJetty_idData] = useState<any>({});
  
  const [trader_idData, setTrader_idData] = useState<any>({});
  
  const [templateName, setTemplateName] = useState("");

  const [report_type, setReport_type] = useState(1);
  
  const [isMP, setIsMP] = useState<boolean>(!isPC());

  const access = useAccess();
  const [selectedColumns, setSelectedColumns] = useState<any>([]);
  

  const [availableColumns, setAvailableColumns] = useState<any>([]);
  
  
  const [imo_numberData, setImo_numberData] = useState<any>({});

  const [fields, setFields] = useState<any>([]);
  const getOrganizationName = () => {
    if (access.canAdmin) {
      return 'Organization'
    }
    if (!(access.canAdmin || access.dashboard_tab())) {
      return 'Terminal'
    }
    if (access.dashboard_tab()) {
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
        a.label = <span>{access.canReportTemplateDel() && < DeleteOutlined onClick={() => {

          handleRemove([b], () => {
            formRef.current?.resetFields()
            getReportTemplate()
          })
        }} />} {b.name} </span>
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
    if (currentUser?.role_type == "Trader") {
      columns.splice(2, 1);
    } else if (currentUser?.role_type == "Terminal") {
      columns.splice(3, 1);
    }

    if (report_type == 2) {
      columns = columns2
    }
    if (report_type == 3) {

      
      columns = columns3
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
      dataIndex: 'flow_id',
     
    },
    {
      title: access.transactions_list_tab() ? "Customer" : <FormattedMessage id="pages.transaction.jettyName" defaultMessage="Trader" />,
      dataIndex: 'trader_id',

    },
    {
      title: <FormattedMessage id="pages.transaction.jettyName" defaultMessage="Terminal" />,
      dataIndex: 'terminal_id',

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
      title: <FormattedMessage id="pages.transaction.xxx" defaultMessage="Vessel Size" />,
      dataIndex: 'vessel_size_dwt',

    },
    {
      title: <FormattedMessage id="pages.transaction.productType" defaultMessage="Product Type" />,
      dataIndex: 'product_name',

    },
    {
      title: <FormattedMessage id="pages.transaction.xxx" defaultMessage="Total Nominated Quantity (Bls-60-F)" />,
      dataIndex: 'product_quantity_in_bls_60_f',

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

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Process" />,
      dataIndex: 'process',

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Description" />,
      dataIndex: 'description',

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Value" />,
      dataIndex: 'value',

    },

    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Type of Data" />,
      dataIndex: 'type_of_data',

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Time Created" />,
      dataIndex: 'created_time',

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Alert Type" />,
      dataIndex: 'alert_type',

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Alert Triggered Time" />,
      dataIndex: 'alert_triggered_time',

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Threshold Type" />,
      dataIndex: 'threshold_type',

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Threshold Limit" />,
      dataIndex: 'threshold_limit',

    },
   
    {
    title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="EOS ID" />,
      dataIndex: 'eos_id',
      mustSelect: true

  },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Work Order ID" />,
      dataIndex: 'work_order_id',
      mustSelect: true

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Sequence No." />,
      dataIndex: 'sequence_num',
      mustSelect: true

    },
  

    {
      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Threshold/Alert" />,
      dataIndex: 'threshold_or_alert',
      mustSelect: true

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Alert ID" />,
      dataIndex: 'alert_id',
      mustSelect: true

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Threshold ID" />,
      dataIndex: 'alertrule_id',
      mustSelect: true

    }
]
  const columns3 = [
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="IMO Number" />,
      dataIndex: 'imo_number',
     

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Threshold Vessel Size" />,
      dataIndex: 'ar.vessel_size_dwt_from',

    },
    {
      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Threshold Nominated Quantity Range" />,
      dataIndex: 'ar.product_quantity_in_mt_from',
    

    },
    {
      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Transaction Vessel Size" />,
      dataIndex: 't.vessel_size_dwt',


    },

    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Transaction Nominated Quantity Range" />,
      dataIndex: 't.product_quantity_in_bls_60_f',
     

    },

    {
      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Product Type" />,
      dataIndex: 't.product_name',
      

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Terminal" />,
      dataIndex: 't.terminal_id',
     

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Trader" />,
      dataIndex: 't.trader_id',
     

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Alert ID" />,
      dataIndex: 'alert_id',
      mustSelect: true

    },
    {
      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Alert Type" />,
      dataIndex: 'type',
      mustSelect: true

    }, 

    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Alert Triggered Time" />,
      dataIndex: 'create_time',
      mustSelect: true

    },

    {
      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Threshold ID" />,
      dataIndex: 'alertrule_id',
      mustSelect: true

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Threshold Type" />,
      dataIndex: 'alertrule_type',
      mustSelect: true

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Threshold Limit" />,
      dataIndex: 'amber_hours',
      mustSelect: true

    },
    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="EOS ID" />,
      dataIndex: 'eos_id',
      mustSelect: true

    }, 

    {

      title: <FormattedMessage id="pages.transaction.ccc" defaultMessage="Total / Current Duration" />,
      dataIndex: 'duration',
      mustSelect: true

    }
  ]
 
  const formRef = useRef<ProFormInstance>();
  const onlyCheck = (rule: any, value: any, callback: (arg0: string | undefined) => void) => {


    fieldUniquenessCheck({ where: { name: value, type: [1, 2, 3], company_id: currentUser?.company_id }, model: 'Userconfig' }).then((res) => {
      var template_nam=formRef.current?.getFieldValue("template_name")
      if (templateMap && templateMap[template_nam] && templateMap[template_nam].name==value){
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

          <Access accessible={access.canReportAdd()} fallback={<div></div>}> <Button style={{ marginLeft: isMP ? 0 : 20, marginTop: isMP ? 20 : 0,width: isMP ? '100%' : null }} icon={<FileTextOutlined />}  type="primary" onClick={ async () => {
            await formRef.current?.validateFields(['name'])
           

            var reportName = formRef.current?.getFieldValue("name")
            var templateName = formRef.current?.getFieldValue("templateName")
            var data = formRef.current?.getFieldsValue()
            var report_type = data.report_type
           
            if (report_type < 4) {
              
              data.selected_fields = selectedColumns.map((c) => { return c.dataIndex })
            } else {
              data.selected_fields=[]
            }
            
            

           
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

           

          }}>Generate Report</Button></Access>
          <Access accessible={access.canReportAddWithTemplate()} fallback={<div></div>}><Button style={{ marginLeft: isMP ? 0 : 20, marginTop: isMP ? 20 : 0, width: isMP ? '100%' : null }} onClick={() => {
            setIsModalOpen(true)

           

          }} type="primary" icon={<FileAddOutlined />}>Save Template</Button></Access>
         <Modal title="Save Template" open={isModalOpen} onOk={async () => {
            await formRef.current?.validateFields(['templateName'])
            var templateName = formRef.current?.getFieldValue("templateName")
            var data = formRef.current?.getFieldsValue()
            var report_type = data.report_type
            delete data.report_type
            delete data.useExisting
            delete data.report_name
            data.selected_fields = selectedColumns.map((c) => { return c.dataIndex })
            if (report_type < 4) {
              data.selected_fields = selectedColumns.map((c) => { return c.dataIndex })
            } else {
              data.selected_fields = []
            }
           
            if (data.time_period && data.time_period != '0') {

              data.dateArr = [new Date((new Date()).getTime() - 3600*24 * 1000 * parseInt(data.time_period)), new Date()]

              if (data.dateRange) {
                delete data.dateRange
              }

            }
            
            if (data.save_type=='b') {
              await handleUpdate({ name: templateName, value: data, id: data.template_name, type: report_type })
            } else {

             
              await handleAdd({ name: templateName, value: data, type: parseInt(report_type) })
            }
            
            getReportTemplate()
            setIsModalOpen(false)

           // props.onSubmit({})


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
                        <Access accessible={access.canReportTemplateList()} fallback={<div></div>}> <Button type={save_type == "b" ? 'primary' : "default"} style={{ width: '100%' }} onClick={() => {
                          formRef.current?.setFieldValue("save_type", 'b')

                        }} >Replace Existing Template</Button> </Access>
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
          access.canReportAddWithTemplate()? {
            label: 'Existing Report Template',
            value: 'existing',
          }:null,
          
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

            setTimeout(() => {


            
          
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
            }, 1000)
          } catch (e) {

          }
              

        })
            }} width="lg" />}
            {((useExisting == "existing" && template_name) || useExisting == "new") && <ProFormSelect

              valueEnum={currentUser?.role_type=="Super"?
                {
                  '1': "Transaction Summary",
                  '2': "Transaction Details",
                  '3': "Alert Reports",
                  '4': "Super User Activity Log",
                  '5': "Login Log",
                  '6': "User Activity Log",
                  '7': "API Activity"
                     
                } : {
                  '1': "Transaction Summary",
                  '2': "Transaction Details",
                  '3': "Alert Reports"
                  

                }
}
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
              <ProFormDependency name={['time_period', 'dateRange']}>
                {({ time_period, dateRange }) => {
                  var dateArr=[]
                  if (time_period && time_period != '0') {

                    dateArr = [new Date((new Date()).getTime() - 3600 * 24 * 1000 * parseInt(time_period)), new Date()]



                  } else {
                    if (dateRange) {
                      dateArr = dateRange
                    }
                  }

                  

                  return <> {report_type && report_type < 4 && <ProForm.Group >
                    <ProFormSelect
                      name="eos_id"
                      label="EOS ID"
                      width="sm"
                      valueEnum={eos_idData}
                      fieldProps={
                        {

                         

                          dropdownMatchSelectWidth: isMP ? true : false,
                          mode: 'multiple',
                          maxTagCount: 0,
                          maxTagPlaceholder: (omittedValues) => {
                            return omittedValues.length + " Selected"
                          },
                          
                       

                          notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
                          showSearch: true,
                          allowClear: true,
                          onFocus: () => {
                            fieldSelectData({ model: "Transaction", value: '', field: 'eos_id', Op: true, where: dateArr.length>0?{ 'start_of_transaction': { "between": dateArr } }:null }).then((res) => {

                              setEos_idData(res.data)
                            })
                          },
                          onSearch: (newValue: string) => {

                            fieldSelectData({ model: "Transaction", value: newValue, field: 'eos_id', Op: true, where: dateArr.length > 0 ? { 'start_of_transaction': { "between": dateArr } } : null }).then((res) => {
                              setEos_idData(res.data)
                            })

                          }
                        }}
                    />

                    <ProFormSelect

                      width="sm"
                      name="jetty_name"
                      label="Jetty"
                      valueEnum={jetty_nameData}
                      fieldProps={{
                        mode: 'multiple',
                        maxTagCount: 0,
                        maxTagPlaceholder: (omittedValues) => {
                          return omittedValues.length + " Selected"
                        },
                        onFocus: () => {
                          fieldSelectData({ model: "Transaction", value: '', field: 'jetty_name', Op: true, where: dateArr.length > 0 ? { 'start_of_transaction': { "between": dateArr } } : null }).then((res) => {
                            setJetty_nameData(res.data)
                          })
                        },
                        onSearch: (newValue: string) => {

                          fieldSelectData({ model: "Transaction", value: newValue, field: 'jetty_name', Op: true, where: dateArr.length > 0 ? { 'start_of_transaction': { "between": dateArr } } : null }).then((res) => {
                            setJetty_nameData(res.data)
                          })

                        },
                        notFoundContent: <Empty />,
                      }}
                    />
                    <ProFormSelect
                      name="imo_number"
                      label="IMO Number"
                      width="sm"
                      valueEnum={imo_numberData}
                      fieldProps={
                        {
                          mode: 'multiple',
                          maxTagCount: 0,
                          maxTagPlaceholder: (omittedValues) => {
                            return omittedValues.length + " Selected"
                          },
                          notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
                          showSearch: true,
                          dropdownMatchSelectWidth: isMP ? true : false,
                          allowClear: true,
                          onFocus: () => {
                            fieldSelectData({ model: "Transaction", value: '', field: 'imo_number', Op: true, where: dateArr.length > 0 ? { 'start_of_transaction': { "between": dateArr } } : null }).then((res) => {
                              setImo_numberData(res.data)
                            })
                          },
                          onSearch: (newValue: string) => {

                            fieldSelectData({ model: "Transaction", value: newValue, field: 'imo_number', Op: true, where: dateArr.length > 0 ? { 'start_of_transaction': { "between": dateArr } } : null }).then((res) => {
                              setImo_numberData(res.data)
                            })

                          }
                        }}
                    />








                    <ProFormSelect
                      name="product_name"
                      label="Product Type"
                      width="sm"
                      valueEnum={product_nameData}
                      fieldProps={{
                        mode: 'multiple',
                        maxTagCount: 0,
                        maxTagPlaceholder: (omittedValues) => {
                          return omittedValues.length + " Selected"
                        },
                        notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
                        showSearch: true,
                        allowClear: true,
                        onFocus: () => {
                          fieldSelectData({ model: "Transaction", value: '', field: 'product_name', Op: true, where: dateArr.length > 0 ? { 'start_of_transaction': { "between": dateArr } } : null }).then((res) => {
                            setProduct_nameData(res.data)
                          })
                        },
                        onSearch: (newValue: string) => {

                          fieldSelectData({ model: "Transaction", value: newValue, field: 'product_name', Op: true, where: dateArr.length > 0 ? { 'start_of_transaction': { "between": dateArr } } : null }).then((res) => {
                            setProduct_nameData(res.data)
                          })

                        }
                      }}
                    />
                    <ProFormSelect


                      fieldProps={{
                        mode: 'multiple',
                        maxTagCount: 0,
                        maxTagPlaceholder: (omittedValues) => {
                          return omittedValues.length + " Selected"
                        },
                        notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
                        showSearch: true,
                        allowClear: true,
                        onFocus: () => {
                          fieldSelectData({ model: "Transaction", value: '', field: 'status', Op: true, where: dateArr.length > 0 ? { 'start_of_transaction': { "between": dateArr } } : null }).then((res) => {
                            var o={
                              0: "Open",
                              1: "Closed",
                              2: "Cancelled"
                              }
                            
                            for (var k in res.data) {
                              res.data[k] =o[k]
                             }
                            setStatusData(res.data)
                          })
                        },
                        onSearch: (newValue: string) => {

                          fieldSelectData({ model: "Transaction", value: newValue, field: 'status', Op: true, where: dateArr.length > 0 ? { 'start_of_transaction': { "between": dateArr } } : null }).then((res) => {
                            var o = {
                              0: "Open",
                              1: "Closed",
                              2: "Cancelled"
                            }

                            for (var k in res.data) {
                              res.data[k] = o[k]
                            }
                            setStatusData(res.data)
                          })

                        }
                      }}

                      valueEnum={statusData }
                      width="sm"
                      name="status"
                      label="Status"

                    />



                    

                     <ProFormSelect
                      valueEnum={organization_idData}
                      fieldProps={{
                        mode: 'multiple',
                        maxTagCount: 0,
                        maxTagPlaceholder: (omittedValues) => {
                          return omittedValues.length + " Selected"
                        },
                        notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
                        showSearch: true,
                        allowClear: true,
                        onFocus: () => {
                          fieldSelectData({ model: "Transaction", value: '', field: 'organization_id', Op: true, where: dateArr.length > 0 ? { 'start_of_transaction': { "between": dateArr } } : null }).then((res) => {
                            
                            setOrganization_idData(res.data)
                          })
                        },
                        onSearch: (newValue: string) => {

                          fieldSelectData({ model: "Transaction", value: newValue, field: 'organization_id', Op: true, where: dateArr.length > 0 ? { 'start_of_transaction': { "between": dateArr } } : null }).then((res) => {
                           
                            setOrganization_idData(res.data)
                          })

                        }
                      }}
                        width="sm"
                        name="organization_id"
                        label={getOrganizationName()}
                      />

                    

                    
                       <ProFormSelect
                      valueEnum={threshold_organization_idData}
                      fieldProps={{
                        mode: 'multiple',
                        maxTagCount: 0,
                        maxTagPlaceholder: (omittedValues) => {
                          return omittedValues.length + " Selected"
                        },
                        notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
                        showSearch: true,
                        allowClear: true,
                        onFocus: () => {
                          fieldSelectData({ model: "Transaction", value: '', field: 'organization_id', Op: true, where: dateArr.length > 0 ? { 'start_of_transaction': { "between": dateArr } } : null }).then((res) => {

                            setThreshold_organization_idData(res.data)
                          })
                        },
                        onSearch: (newValue: string) => {

                          fieldSelectData({ model: "Transaction", value: newValue, field: 'organization_id', Op: true, where: dateArr.length > 0 ? { 'start_of_transaction': { "between": dateArr } } : null }).then((res) => {

                            setThreshold_organization_idData(res.data)
                          })

                        }
                      }}
                        width="sm"
                      name="threshold_organization_id"
                        label={"Threshold created by"}
                      />

                    
                    {((currentUser?.role_type == "Trader" && report_type != 1) || (currentUser?.role_type == "Terminal") || (currentUser?.role_type == "Super" && report_type != 3)) && <ProFormSelect
                      width="sm"
                      name="alertrule_type"
                    
                      valueEnum={alertrule_typeData}
                      fieldProps={{
                        mode: 'multiple',
                        maxTagCount: 0,
                        maxTagPlaceholder: (omittedValues) => {
                          return omittedValues.length + " Selected"
                        },
                        notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
                        showSearch: true,
                        allowClear: true,
                        onFocus: () => {
                          fieldSelectData({ model: "Transaction", value: '', field: 'alertrule_type', Op: true, where: dateArr.length > 0 ? { 'start_of_transaction': { "between": dateArr } } : null }).then((res) => {

                            setAlertrule_typeData(res.data)
                          })
                        },
                        onSearch: (newValue: string) => {

                          fieldSelectData({ model: "Transaction", value: newValue, field: 'alertrule_type', Op: true, where: dateArr.length > 0 ? { 'start_of_transaction': { "between": dateArr } } : null }).then((res) => {

                            setAlertrule_typeData(res.data)
                          })

                        }
                      }}
                      label="Threshold Type"

                    />}






                    {((currentUser?.role_type == "Trader" && report_type != 1) || (currentUser?.role_type == "Terminal") || (currentUser?.role_type == "Super" && report_type != 3)) && <ProFormSelect
                      width="sm"
                      name="vessel_size_dwt"
                      

                      valueEnum={vessel_size_dwtData}
                      fieldProps={{
                        mode: 'multiple',
                        dropdownMatchSelectWidth: isMP ? true : false,
                        maxTagCount: 0,
                        maxTagPlaceholder: (omittedValues) => {
                          return omittedValues.length + " Selected"
                        },
                        notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
                        showSearch: true,
                        allowClear: true,
                        onFocus: () => {
                          fieldSelectData({ model: "Transaction", value: '', field: 'vessel_size_dwt', Op: true, where: dateArr.length > 0 ? { 'start_of_transaction': { "between": dateArr } } : null }).then((res) => {

                            setVessel_size_dwtData(res.data)
                          })
                        },
                        onSearch: (newValue: string) => {

                          fieldSelectData({ model: "Transaction", value: newValue, field: 'vessel_size_dwt', Op: true, where: dateArr.length > 0 ? { 'start_of_transaction': { "between": dateArr } } : null }).then((res) => {

                            setVessel_size_dwtData(res.data)
                          })

                        }
                      }}
                      

                     
                      label="Vessel Size"

                    />}

                    {((currentUser?.role_type == "Trader" && report_type != 1) || (currentUser?.role_type == "Terminal") || (currentUser?.role_type == "Super")) && <ProFormDigitRange
                      label="Total Nominated Quantity"
                      name="total_nominated_quantity"
                      style={{ width: 100 }}
                      separator="-"
                      placeholder={['From', 'To']}


                    />}

                    <ProFormSelect
                      width="sm"
                      name="uom"
                      label="UOM"
                      initialValue={"Bls-60-F"}
                      valueEnum={{
                        "L-obs": "L-obs",
                        "L-15-C": "L-15-C",
                        "Mt": "Mt",
                        "MtV": "MtV",
                        "Bls-60-F": "Bls-60-F",

                      }}


                    />







                  </ProForm.Group>}</>
                }
                }

              </ProFormDependency>



             
            </ProCard>}

            { report_type && report_type < 4   && <RcResizeObserver
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
                       
                       setSelectedColumns(newDataSource);
                       
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
