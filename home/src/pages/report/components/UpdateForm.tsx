
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
  ProFormRadio,
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
import { reportTemplate, addReportTemplate, updateReportTemplate, removeReportTemplate, addReport } from '../service';
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



const handleAGenerateReport = async (fields: any) => {
  /* const hide = message.loading(<FormattedMessage
     id="pages.adding"
     defaultMessage="Adding"
   />);*/
  try {

    var cc = null
    var obj = await addReport({ ...fields }).then((res) => {
      cc = res.data

    });
    // hide();
    /*  message.success(<FormattedMessage
        id="pages.addedSuccessfully"
        defaultMessage="Added successfully"
      />);*/
    console.log("vvvvvvvvvvvv", cc)
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
  updateModalOpen: boolean;
  values: any;

};
const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  //const [updateModalOpen, handleModalOpen] = useState<boolean>(false);
  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  

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
  const [isMP, setIsMP] = useState<boolean>(!isPC());


  const [selectedColumns, setSelectedColumns] = useState<any>([]);
  const [selectedFilterColumns, setSelectedFilterColumns] = useState<any>([]);

  const [availableColumns, setAvailableColumns] = useState<any>([]);
  const [availableFilterColumns, setAvailableFilterColumns] = useState<any>([]);



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


  const [selectedRowKeys, setSelectedRowKeys] = useState<TransactionListItem[]>([]);


  const [selectedRowKeys1, setSelectedRowKeys1] = useState<TransactionListItem[]>([]);

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

  var {
    onSubmit,
    onCancel,
    updateModalOpen,
    values
  } = props;
 
  useEffect(() => {
   
    if (values) {
 
      if (!values.selected_fields) {
        values.selected_fields = []
      } 
      var arr = columns.filter((c) => {

        return values.selected_fields.some((cc) => {
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

      setFields(values.selected_fields)
    }



    getReportTemplate()
    jetty({ sorter: { name: 'ascend' } }).then((res) => {
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





    setAvailableColumns(columns)
    setAvailableFilterColumns(columns)




  }, [values]);


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
  const onlyCheck = (rule: any, value: any, callback: (arg0: string | undefined) => void) => {


    fieldUniquenessCheck({ where: { name: value, type: 1, company_id: currentUser?.company_id }, model: 'Userconfig' }).then((res) => {

      if (templateMap[template_name] && templateMap[template_name].name == value) {
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


  

 
  return (
    

    <ModalForm width={'90%'}
      title="Template Info"
      initialValues={values}
      open={props.updateModalOpen}
      onFinish={props.onSubmit}
      onOpenChange={(vi) => {
        if (!vi) {
          props.onCancel();
        }

      }}
      modalProps={{ destroyOnClose: true }}
      formRef={formRef} submitter={{

        render: (_, dom) => null,
      }}>


      {/* <ProFormRadio.Group
        name="useExisting"
        initialValue="new"
        label="Generate your report with a new set of report parameters or from a saved report template. "
        onChange={(v) => {
          var o = formRef.current?.getFieldValue('useExisting')
          formRef.current?.resetFields()
          formRef.current?.setFieldValue('useExisting', o)
          setAvailableColumns(columns)
          setAvailableFilterColumns(columns)
          setSelectedColumns([])
          setSelectedFilterColumns([])

        }}
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
      />*/ } 






      <ProFormDependency name={['useExisting', 'report_type', 'template_name']}>
        {({ useExisting, report_type, template_name }) => {
          return <>



            {useExisting == "existing" && <ProFormSelect name="template_name" label="Name of Template:" fieldProps={{
              options: templateList, onChange: (() => {
                var id = formRef.current?.getFieldValue("template_name")
                try {
                  var value = eval('(' + templateMap[id].value + ')');
                  value.report_type = templateMap[id].type + ""
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


              })
            }} width="lg" />}
            {((useExisting == "existing" && template_name) || useExisting == "new") && <ProFormSelect

              valueEnum={
                {
                  '1': "All Data",
                  '2': "Transaction Information",
                  '3': "Threshold Alerts"
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










            {report_type && <ProCard title="Output Filter" colSpan={24} headerBordered collapsible={true} headStyle={{ backgroundColor: "#d4d4d4" }}>

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
              {report_type != 1 && <ProForm.Group label="Threshold Breached:">
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

            {report_type && <RcResizeObserver
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
                       
                      ]}
                      options={false}
                      headerTitle="Available:"

                      columns={[{
                        title: '',
                        dataIndex: 'title',
                      }]}
                      rowSelection={{
                        onChange: (_, selectedRows) => {
                          setSelectedRowKeys(selectedRows);
                        },
                      }}
                      rowKey="dataIndex"
                      search={false}
                      pagination={false}
                      dataSource={availableFilterColumns}
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
                      }}
                    />








                  </div>
                </ProCard>
                <ProCard title="" ghost={isMP ? true : false} colSpan={isMP ? 24 : 12}>
                  <div >


                    <DragSortTable
                      toolBarRender={() => [
                       
                      ]}
                      options={false}
                      headerTitle="Selected:"

                      columns={[{
                        title: '',
                        dataIndex: 'title',
                      }]}
                      rowSelection={{
                        onChange: (_, selectedRows) => {
                          setSelectedRowKeys1(selectedRows);
                        },
                      }}
                      rowKey="dataIndex"
                      search={false}
                      pagination={false}
                      dataSource={selectedFilterColumns}
                      dragSortKey="title"
                      dragSortHandlerRender={(rowData: any, idx: any) => (
                        <div style={{ cursor: 'grab' }} >

                          {idx + 1} - {rowData.title}
                        </div>
                      )}
                      onDragSortEnd={(newDataSource: any) => {
                        // console.log('排序后的数据', newDataSource);
                        setSelectedFilterColumns(newDataSource);
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
