import {
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ModalForm,
  ProFormDigit,
  ProFormGroup,
  ProFormInstance,
  ProFormDependency,
  ProCard,
  ProFormTreeSelect,
  ProFormCheckbox
} from '@ant-design/pro-components';
import { AlertruleListItem } from '../data.d';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Modal, Form } from 'antd';
import { flow } from '../../system/flow/service';
import { tree } from "@/utils/utils";
import React, { useRef, useState, useEffect } from 'react';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { SvgIcon } from '@/components' // 自定义组件
export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: Partial<AlertruleListItem>) => void;
  onSubmit: (values: Partial<AlertruleListItem>) => Promise<void>;
  createModalOpen: boolean;
  values: Partial<AlertruleListItem>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const restFormRef = useRef<ProFormInstance>();

  restFormRef?.current?.setFieldsValue({ events: [] })
  const intl = useIntl();
  const [flowConf, setFlowConf] = useState<any>({});
  const [flowList, setFlowList] = useState<any>([]);
  const {
    onSubmit,
    onCancel,
    createModalOpen,
    values,
  } = props;

  useEffect(() => {
    if (!createModalOpen) {


    } else {
      flow({ pageSize: 300, current: 1, type: 0, sorter: { sort: 'ascend' } }).then((res) => {
        var b = {"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa":"Total Duration"}
        res.data.forEach((r) => {
          b[r.id] = r.name
        })
        setFlowConf(b)

      });

      flow({ pageSize: 1000, current: 1, sorter: { sort: 'ascend' } }).then((res) => {

        res.data = res.data.map((r) => {
          r['value'] = r.id
          r['title'] = r.name
          return r
        })

        setFlowList(tree(res.data, "                                    ", 'pid'))

      });

     
    }

  }, [props.createModalOpen]);
  return (
   
    <ModalForm
      modalProps={{ destroyOnClose: true }}
      initialValues={values}
      onOpenChange={(vi) => {
        if (!vi) {
          props.onCancel();
        }
          
      }}
     
      
      formRef={restFormRef}
        onFinish={props.onSubmit}
      open={props.createModalOpen}
        submitter={{
          searchConfig: {
            resetText: intl.formatMessage({
              id: 'pages.reset',
              defaultMessage: '重置',
            }),
          },
          resetButtonProps: {
            onClick: () => {
              restFormRef.current?.resetFields();
              //   setModalVisible(false);
            },
          },
        }}
        title={intl.formatMessage({
          id: 'pages.alertrule.add',
          defaultMessage: '新增报警规则',
        })}
    >

      <div style={{ float: 'left', width: '100%', display: "block",marginBottom:"10px" }}>
        <div style={{  fontWeight: "bold" }}>Input applicable condition(s) for threshold to be applied</div>
        <span style={{fontSize:"12px"} }>If no conditions are input, threshold defined will be applied to all transactions</span>
      </div>
      <ProFormGroup>
        <ProFormDigit label={<FormattedMessage
          id="pages.alertrule.from"
          defaultMessage="Size of vessel From"
        />}

          name="size_of_vessel_from" width="sm" min={1} max={10000000} />

        <ProFormDigit label={<FormattedMessage
          id="pages.alertrule.to"
          defaultMessage="To"
        />}

          name="size_of_vessel_to" width="sm" min={1} max={10000000} />
      </ProFormGroup>
      <ProFormGroup>
        <ProFormDigit label={<FormattedMessage
          id="pages.alertrule.from"
          defaultMessage="Total nominated quantity From"
        />}
          name="total_nominated_quantity_from_m" width="sm" min={1} max={10000000}

        />

        <ProFormDigit label={<FormattedMessage
          id="pages.alertrule.to"
          defaultMessage="To"
        />}

          name="total_nominated_quantity_to_m" width="sm" min={1} max={10000000} />

        <ProFormSelect
          name="total_nominated_quantity_unit"
          width="sm"
          label={intl.formatMessage({
            id: 'pages.alertrule.unitOfMeasurement',
            defaultMessage: 'Unit of Measurement (UOM)',
          })}

          initialValue={"m"}
          valueEnum={{ m: "Metric Tonnes (MT)", b:"Barrels (Bal-60-F)" } }


        />
      </ProFormGroup>
      {/*<ProFormGroup>
        <ProFormDigit label={<FormattedMessage
          id="pages.alertrule.from"
          defaultMessage="Total nominated quantity From"
        />}
          name="total_nominated_quantity_from_b" width="sm" min={1} max={10000000}

        />

        <ProFormDigit label={<FormattedMessage
          id="pages.alertrule.to"
          defaultMessage="To"
        />}

          name="total_nominated_quantity_to_b" width="sm" min={1} max={10000000} />
        <ProFormText
          name="total_nominated_quantity_unit2"
          width="sm"
          label={intl.formatMessage({
            id: 'pages.alertrule.unitOfMeasurement',
            defaultMessage: 'Unit of Measurement (UOM)',
          })}
          
          initialValue={"Barrels (Bal-60-F)"}
        />
      </ProFormGroup>*/ } 


      <div style={{ float: 'left', width: '100%', display: "block", marginBottom: "10px" }}>
        <div style={{ fontWeight: "bold" }}>Define threshold duration</div>
        <span style={{ fontSize: "12px" }}>Select for one process or for the entire transaction</span>
      </div>
      <ProFormGroup>
        <ProFormSelect
          name="flow_id"
          width="md"
          label={intl.formatMessage({
            id: 'pages.alertrule.process',
            defaultMessage: 'Process Name',
          })}
          valueEnum={flowConf}
          fieldProps={{
            labelInValue: true,
            mode: 'multiple',
          }}

        />
      </ProFormGroup>
    
      

      <ProFormDependency name={['flow_id']}>
        {({ flow_id }) => {
          if (flow_id?.length > 0) {
            var arr=flow_id.map((a) => {
              return (<ProFormGroup>
                <span style={{ lineHeight: '80px', height: 80, width: 120, display: "inline-block" }}>{a.label}</span>
                <ProFormDigit initialValue="2" label={<FormattedMessage
                  id="pages.alertrule.hours"
                  defaultMessage="Size of vessel From"
                />} name={a.value + "_amber_" + 'hours'} width="xs" min={0} max={1000}/>

                <ProFormDigit initialValue="15" label={<FormattedMessage
                  id="pages.alertrule.mins"
                  defaultMessage="To"
                />} name={a.value + "_amber_" + 'mins'} width="xs" min={0} max={60} />
             

                <ProFormDigit initialValue="2" label={<FormattedMessage
                  id="pages.alertrule.hours"
                  defaultMessage="Size of vessel From"
                />} name={a.value + "_red_" + 'hours'} width="xs" min={0} max={1000} />

                <ProFormDigit initialValue="30" label={<FormattedMessage
                  id="pages.alertrule.mins"
                  defaultMessage="To"
                />} name={a.value + "_red_" + 'mins'} width="xs" min={0} max={60}  />
              </ProFormGroup>
              )
            })
            arr.unshift(<div style={{ width: '100%' }}>
              <div style={{ float: 'left', width: '25%', display: "block", fontWeight: "bold" }}>
               Process
              </div>
              <div style={{ float: 'left', width: '35%', fontWeight: "bold", color:"#DE8205" }}>
                <SvgIcon style={{ color: "#DE8205" }} type="icon-yuan" /> Amber
              </div>
              <div style={{ float: 'left', width: '30%', fontWeight: "bold", color: "red" }}>
                <SvgIcon style={{ color: "red" }} type="icon-yuan" /> Red
              </div>
             
            </div>)
            return arr
          }
          
          
         
        }}

       
      </ProFormDependency>

      <div style={{ float: 'left', width: '100%', display: "block",marginBottom:'10px' }}>
        Threshold Settings between two events
      </div>


      <ProFormDependency name={['events']}>
        {({ events }) => {
          
          if (events?.length > 0) {
            var arr = events.map((a,index) => {
              return (<><ProFormGroup>
                <ProFormTreeSelect
                  name={a +"_from"}
                  label={intl.formatMessage({
                    id: 'pages.alertrule.from',
                    defaultMessage: 'From',
                  })}
                  placeholder="Please select"
                  allowClear
                  width="md"
                  request={async () => {
                    return flow({ pageSize: 1000, current: 1, sorter: { sort: 'ascend' } }).then((res) => {

                      res.data = res.data.map((r) => {
                        r['value'] = r.id
                        r['title'] = r.name
                        return r
                      })

                      // setFlowList(tree(res.data, "                                    ", 'pid'))
                      return tree(res.data, "                                    ", 'pid')
                    });

                  }}

                  // tree-select args
                  fieldProps={{
                    showArrow: false,


                    dropdownMatchSelectWidth: false,


                    treeNodeFilterProp: 'name',
                    fieldNames: {
                      label: 'name',
                    },
                  }}
                />

                <ProFormTreeSelect
                  name={a + "_to" }
                  label={intl.formatMessage({
                    id: 'pages.alertrule.to',
                    defaultMessage: 'To',
                  })}
                  placeholder="Please select"
                  allowClear
                  width="md"

                  request={async () => {
                    return flow({ pageSize: 1000, current: 1, sorter: { sort: 'ascend' } }).then((res) => {

                      res.data = res.data.map((r) => {
                        r['value'] = r.id
                        r['title'] = r.name
                        return r
                      })

                     // setFlowList(tree(res.data, "                                    ", 'pid'))
                      return tree(res.data, "                                    ", 'pid')
                    });

                  }}

                  // tree-select args
                  fieldProps={{
                    showArrow: false,


                    dropdownMatchSelectWidth: false,


                    treeNodeFilterProp: 'name',
                    fieldNames: {
                      label: 'name',
                    },
                  }}
                />
                </ProFormGroup>

                <ProFormGroup>
                  <SvgIcon style={{ color: "#DE8205" }} type="icon-yuan" />
                <ProFormDigit initialValue="2" label={<FormattedMessage
                  id="pages.alertrule.hours"
                  defaultMessage="Size of vessel From"
                />} name={a + "_amber_" + 'hours'} width="xs" min={0} max={1000} />

                <ProFormDigit initialValue="15" label={<FormattedMessage
                  id="pages.alertrule.mins"
                  defaultMessage="To"
                />} name={a + "_amber_" + 'mins'} width="xs" min={0} max={60} />

                  <SvgIcon style={{ color: "red" }} type="icon-yuan" />
                <ProFormDigit initialValue="2" label={<FormattedMessage
                  id="pages.alertrule.hours"
                  defaultMessage="Size of vessel From"
                />} name={a + "_red_" + 'hours'} width="xs" min={0} max={1000} />

                <ProFormDigit initialValue="30" label={<FormattedMessage
                  id="pages.alertrule.mins"
                  defaultMessage="To"
                />} name={a + "_red_" + 'mins'} width="xs" min={0} max={60}/>
                < MinusCircleOutlined onClick={() => {
                  var arr = restFormRef?.current?.getFieldValue('events')
                  arr.splice(index, 1)
                  restFormRef?.current?.setFieldsValue({ events: arr })
                }} />
              </ProFormGroup></>
              )
            })
            
            return arr
          }
          
          
         
        }}

        
      </ProFormDependency>


     

      
      
      <div><PlusCircleOutlined onClick={()=>{
        var arr = restFormRef?.current?.getFieldValue('events')
        if (!arr) {
          arr=[]
        }
        arr.push(new Date().getTime())
        restFormRef?.current?.setFieldsValue({ events: arr })
      }}/></div>

      
      <div style={{ float: 'left', width: '100%', display: "block", marginBottom: "10px" }}>
        <div style={{ fontWeight: "bold" }}>Email Notification</div>
        <span style={{ fontSize: "12px" }}>Please use commas to separate multiple email addresses</span>
      </div>

      <ProFormGroup>

        <ProFormCheckbox.Group
          name="events"
          hidden
          label="Threshold Exceeded"
          options={[]}
        />
     
        

      <ProFormText
        width="md"
        name="email"
        label={<FormattedMessage
          id="pages.alertrule.email1"
          defaultMessage="Email Address of Users to Receive Notifications"
        />}

        />
        <ProFormCheckbox.Group
          name="send_email_select"
          label="Threshold Exceeded"
          options={['Amber', 'Red']}
        />
        </ProFormGroup>
    </ModalForm>
     
  );
};

export default UpdateForm;
