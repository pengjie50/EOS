import {
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormDependency,
  ModalForm,
  ProCard,
  ProFormGroup,
  ProFormDigit,
  ProFormTreeSelect,
  ProFormInstance,
  ProFormCheckbox
  
} from '@ant-design/pro-components';
import { AlertruleListItem } from '../data.d';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Modal, Form, Button } from 'antd';
import { flow } from '../../system/flow/service';
import { tree, isPC } from "@/utils/utils";
import React, { useRef, useState, useEffect } from 'react';
import { SvgIcon } from '@/components' // 自定义组件
import { PlusCircleOutlined, PlusOutlined, MinusOutlined, MinusCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: any) => void;
  onSubmit: (values:any) => Promise<void>;
  updateModalOpen: boolean;
  values: any;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const restFormRef = useRef<ProFormInstance>();
  const intl = useIntl();
  const [flowConf, setFlowConf] = useState<any>({});

  const [flowMap, setFlowMap] = useState<any>({});
  const [flowList, setFlowList] = useState<any>([]);
  const [isMP, setIsMP] = useState<boolean>(!isPC());
  const {
    onSubmit,
    onCancel,
    updateModalOpen,
    values,
  } = props;

  useEffect(() => {
    if (!updateModalOpen) {


    } else {
      flow({ pageSize: 300, current: 1, type: 0, sorter: { sort: 'ascend' } }).then((res) => {
        var b = {
          "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa": intl.formatMessage({
            id: 'pages.alertrule.entireTransaction',
            defaultMessage: 'Entire Transaction',
          })
        }
        res.data.forEach((r) => {
          b[r.id] = r.name
        })
        setFlowConf(b)

      });

      flow({ pageSize: 1000, current: 1, sorter: { sort: 'ascend' } }).then((res) => {
        var m = {}
        res.data = res.data.map((r) => {
          m[r.id] = r
          r['value'] = r.id
          r['title'] = r.name
          return r
        })

        setFlowList(tree(res.data, "                                    ", 'pid'))
        setFlowMap(m)
      });


    }

  }, [props.updateModalOpen]);


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
        open={props.updateModalOpen}
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
          id: 'pages.alertrule.mod',
          defaultMessage: '修改权限',
        })}
      >
      { /*<ProFormSelect
        name="flow_id"
        width="md"
        label={intl.formatMessage({
          id: 'pages.alertrule.process',
          defaultMessage: 'Process Name',
        })}
        valueEnum={flowConf}
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="pages.role.rules.flow_id"
                defaultMessage=""
              />
            ),
          },
        ]}
      />*/}

      <div style={{ float: 'left', width: '100%', display: "block", marginBottom: "10px" }}>
        <div style={{ fontWeight: "bold" }}>Input applicable condition(s) for threshold to be applied</div>
        <span style={{ fontSize: "12px" }}>If no conditions are input, threshold defined will be applied to all transactions</span>
      </div>

      
        <ProFormDependency name={['size_of_vessel_from', 'size_of_vessel_to']}>
          {({ size_of_vessel_to, size_of_vessel_from }) => {

            return (<ProFormGroup>


              <ProFormSelect
                name="from_to"
                width="lg"
                label={intl.formatMessage({
                  id: 'pages.alertrule.sizeOfVessel',
                  defaultMessage: 'Condition:  Size Of Vessel',
                })}

                initialValue={"0-25"}
                valueEnum={{
                  "0-25": "1. GP (General Purpose): Less than 24.99 DWT",
                  "25-45": "2. MR (Medium Range): 25 to 44.99 DWT",
                  "45-80": "3. LR1 (Long Range 1): 45 to 79.99 DWT",
                  "80-120": "4. AFRA (AFRAMAX): 80 to 119.99 DWT",
                  "120-160": "5. LR2 (Long Range 2): 120 to 159.99 DWT",
                  "160-320": "6. VLCC (Very Large Crude Carrier): 160 to 319.99 DWT",
                  "320-1000000": "7. ULCC (Ultra-Large Crude Carrier): More than 320 DWT",
                }} />


            </ProFormGroup>)
          }}
        </ProFormDependency>
      <div>Condition:  Total Nominated Quantity</div>
     
        <ProFormDependency name={[ 'total_nominated_quantity_to_m', 'total_nominated_quantity_from_m']}>
          {({  total_nominated_quantity_to_m, total_nominated_quantity_from_m }) => {
            
        
              return (
                <ProFormGroup>
                  <ProFormDigit  label={<FormattedMessage
                    id="pages.alertrule.from"
                    defaultMessage="From"
                    
                  />}
                    name="total_nominated_quantity_from_m" width="xs" min={1} max={10000000}
                    rules={[
                     
                      {
                        validator: (rule, value, callback) => {
                          if (total_nominated_quantity_to_m && value >= total_nominated_quantity_to_m) {
                            callback("Incorrect interval")
                          } else {
                            callback()
                          }
                        }

                      }
                    ]}
                  />

                  <ProFormDigit width={100} label={<FormattedMessage
                    id="pages.alertrule.to"
                    defaultMessage="To"
                  />}
                    rules={[
                      
                      {
                        validator: (rule, value, callback) => {
                          if (total_nominated_quantity_from_m && value <= total_nominated_quantity_from_m) {
                            callback("Incorrect interval")
                          } else {
                            callback()
                          }
                        }

                      }
                    ]}
                    name="total_nominated_quantity_to_m" width="xs" min={1} max={10000000} />
                  <ProFormSelect
                    name="total_nominated_quantity_unit"
                    width={280}
                    allowClear={false}
                    label={intl.formatMessage({
                      id: 'pages.alertrule.unitOfMeasurement',
                      defaultMessage: 'Unit of Measurement (UOM)',
                    })}

                    initialValue={"m"}
                    valueEnum={{ m: "Metric Tonnes (MT)", b: "Barrels (Bal-60-F)" }}


                  />
                
                </ProFormGroup>)
            }
          }
        </ProFormDependency>
      

      {values.total_nominated_quantity_from_b != null && values.total_nominated_quantity_to_b != null && (
        <ProFormDependency name={['total_nominated_quantity_to_b', 'total_nominated_quantity_from_b']}>
          {({ total_nominated_quantity_to_b, total_nominated_quantity_from_b }) => {


            return (
              <ProFormGroup>
                <ProFormDigit label={<FormattedMessage
                  id="pages.alertrule.from"
                  defaultMessage="Total Nominated Quantity From"
                />}
                  name="total_nominated_quantity_from_b" width="sm" min={1} max={10000000}
                  rules={[

                    {
                      validator: (rule, value, callback) => {
                        if (total_nominated_quantity_to_b && value >= total_nominated_quantity_to_b) {
                          callback("Incorrect interval")
                        } else {
                          callback()
                        }
                      }

                    }
                  ]}
                />

                <ProFormDigit label={<FormattedMessage
                  id="pages.alertrule.to"
                  defaultMessage="To"
                />}
                  rules={[

                    {
                      validator: (rule, value, callback) => {
                        if (total_nominated_quantity_from_b && value <= total_nominated_quantity_from_b) {
                          callback("Incorrect interval")
                        } else {
                          callback()
                        }
                      }

                    }
                  ]}
                  name="total_nominated_quantity_to_b" width="sm" min={1} max={10000000} />
                <ProFormSelect
                  name="total_nominated_quantity_unit"
                  width={180}
                  allowClear={false}
                  label={intl.formatMessage({
                    id: 'pages.alertrule.unitOfMeasurement',
                    defaultMessage: 'Unit of Measurement (UOM)',
                  })}

                  initialValue={"b"}
                  valueEnum={{ m: "Metric Tonnes (MT)", b: "Barrels (Bal-60-F)" }}


                />

              </ProFormGroup>)
          }
          }
        </ProFormDependency>
      )}
      

      <div style={{ float: 'left', width: '100%', display: "block", marginBottom: "10px" }}>
        <div style={{ fontWeight: "bold" }}>Define Threshold Duration</div>
        {values.type != 1 && (<span style={{ fontSize: "12px" }}>Select for one process or for the entire transaction</span>)}
      </div>
      {values.type != 1 && (<ProFormGroup>
            <ProFormSelect
              name="flow_id"
              width="md"
              label={intl.formatMessage({
                id: 'pages.alertrule.process',
                defaultMessage: 'Process Name',
              })}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.rules.required"
                      defaultMessage="This field cannot be empty！"
                    />
                  ),
                }
              ]}
              valueEnum={flowConf}
              fieldProps={{
                showSearch: false,
               // labelInValue: true,
               // mode: 'multiple',
              }}

            />
          </ProFormGroup>)
        }


      {values.type == 1 && (< ProFormDependency name={["flow_id",  "flow_id_to"]} >
        {(aa) => {

          return (<ProFormGroup>
          <ProFormTreeSelect
            name={"flow_id"}
            label={intl.formatMessage({
              id: 'pages.alertrule.from',
              defaultMessage: 'From',
            })}

            placeholder="Please select"
            allowClear
            width="md"
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.rules.required"
                    defaultMessage="This field cannot be empty！"
                  />
                ),
              },
              {
                validator: (rule, value, callback) => {

                  if (value && flowMap[value].pid == '                                    ') {
                    callback("Please select Event")
                  }

                  if (aa["flow_id_to"] && value && (flowMap[aa[ "flow_id_to"]].sort <= flowMap[value].sort)) {
                    callback((flowMap[dd[ta + "_to"]].sort == flowMap[value].sort) ? "Events cannot be the same" : 'Events in "From" field cannot be later than Events in "To" field')
                  } else {
                    callback()
                  }
                }
              }
            ]}
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


              dropdownMatchSelectWidth: isMP ? true : false,


              treeNodeFilterProp: 'name',
              fieldNames: {
                label: 'name',
              },
            }}
          />

          <ProFormTreeSelect
            name={"flow_id_to"}
            label={intl.formatMessage({
              id: 'pages.alertrule.to',
              defaultMessage: 'To',
            })}
            placeholder="Please select"
            allowClear
            width="md"
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.rules.required"
                    defaultMessage="This field cannot be empty！"
                  />
                ),
              },
              {
                validator: (rule, value, callback) => {
                  if (value && flowMap[value].pid == '                                    ') {
                    callback("Please select Event")
                  }
                  if (aa["flow_id_"] && value && (flowMap[aa[ "flow_id_"]].sort >= flowMap[value].sort)) {
                    callback((flowMap[dd[ta + "_from"]].sort == flowMap[value].sort) ? "Events cannot be the same" : 'Events in "From" field cannot be later than Events in "To" field')
                  } else {
                    callback()
                  }
                }
              }
            ]}
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


              dropdownMatchSelectWidth: isMP ? true : false,


              treeNodeFilterProp: 'name',
              fieldNames: {
                label: 'name',
              },
            }}
          />
        </ProFormGroup>)


        }}</ProFormDependency>)}
     
      <div style={{ width: '100%' }}>
        
        <div style={{ float: 'left', width: '265px', fontWeight: "bold", color: "#DE8205" }}>
          <SvgIcon style={{ color: "#DE8205" }} type="icon-yuan" /> Amber
        </div>
        <div style={{ float: 'left', width: '40%', fontWeight: "bold", color: "red" }}>
          <SvgIcon style={{ color: "red" }} type="icon-yuan" /> Red
        </div>

      </div>



      <ProFormDependency name={["amber_" + 'hours', "amber_" + 'mins',  "red_" + 'hours',  "red_" + 'mins']} >
        {(aa) => {


          var isShowRed = true
          var ah = "amber_" + 'hours'
          var am = "amber_" + 'mins'
          var rh = "red_" + 'hours'
          var rm = "red_" + 'mins'
          if (!aa[ah] && !aa[am] && !aa[rh] && !aa[rm]) {
            isShowRed = false
          } else {

            if ((aa[rh] || aa[rm]) && (aa[ah] || aa[am])) {

              if ((aa[ah] ? aa[ah] * 3600 : 0) + (aa[am] ? aa[am] * 60 : 0) >= (aa[rh] ? aa[rh] * 3600 : 0) + (aa[rm] ? aa[rm] * 60 : 0)) {
                isShowRed = true
              } else {
                isShowRed = false
              }


            } else {
              isShowRed = false
            }



          }
          return ([<ProFormGroup>
       
            <ProFormDigit label={<FormattedMessage
              id="pages.alertrule.hours"
              defaultMessage="Hours"
            />} name={"amber_" + 'hours'} rules={[
              {
                validator: (rule, value, callback) => {
                  if (aa["amber_" + 'hours'] > 0 || aa["amber_" + 'mins'] > 0 || aa["red_" + 'hours'] > 0 || aa["red_" + 'mins'] > 0) {
                    callback()
                  } else {
                    callback(" ")
                  }
                }

              },
              {
                validator: (rule, value, callback) => {
                  if (isShowRed) {
                    callback(" ")
                  } else {
                    callback()
                  }
                }

              }
              ]} width={ 100} min={0} max={1000} />

        <ProFormDigit label={<FormattedMessage
          id="pages.alertrule.mins"
              defaultMessage="Mins"
            />} name={"amber_" + 'mins'} rules={[
              {
                validator: (rule, value, callback) => {
                  if (aa["amber_" + 'hours'] > 0 || aa["amber_" + 'mins'] > 0 || aa["red_" + 'hours'] > 0 || aa["red_" + 'mins'] > 0) {
                    callback()
                  } else {
                    callback(" ")
                  }
                }

              },
              {
                validator: (rule, value, callback) => {
                  if (isShowRed) {
                    callback(" ")
                  } else {
                    callback()
                  }
                }

              }
              ]} width={100} min={0} max={60}/>


        <ProFormDigit label={<FormattedMessage
          id="pages.alertrule.hours"
              defaultMessage="Hours"
            />} name={"red_" + 'hours'} rules={[
              {
                validator: (rule, value, callback) => {
                  if (aa["amber_" + 'hours'] > 0 || aa["amber_" + 'mins'] > 0 || aa["red_" + 'hours'] > 0 || aa["red_" + 'mins'] > 0) {
                    callback()
                  } else {
                    callback(" ")
                  }
                }

              }
              ]} width={100} min={0} max={1000} />

        <ProFormDigit label={<FormattedMessage
          id="pages.alertrule.mins"
              defaultMessage="Mins"
            />} name={"red_" + 'mins'} rules={[
              {
                validator: (rule, value, callback) => {
                  if (aa["amber_" + 'hours'] > 0 || aa["amber_" + 'mins'] > 0 || aa["red_" + 'hours'] > 0 || aa["red_" + 'mins'] > 0) {
                    callback()
                  } else {
                    callback(" ")
                  }
                }

              }
              ]} width={100} min={0} max={60}  />
          </ProFormGroup>, <div style={{ marginTop: '-20px', color: 'red', display: aa["amber_" + 'hours'] > 0 || aa["amber_" + 'mins'] > 0 || aa["red_" + 'hours'] > 0 || aa["red_" + 'mins'] > 0 ? 'none' : "block" }}>Please enter compulsory threshold alert field for either Amber or Red</div>,

            <div style={{ marginLeft: '0px', marginTop: '-10px', color: 'red', display: isShowRed ? 'block' : "none" }}>Duration for "Red" should not be shorter than "Amber" status</div>
          ])
        }}
      </ProFormDependency>
      <div style={{ float: 'left', width: '100%', display: "block", marginBottom: "10px" }}>
        <div style={{ fontWeight: "500", fontSize: '14px' }}>Email Notification</div>
        <span ><ExclamationCircleOutlined /> Specify the email address and which level of alert they should be notified of.
        </span>
      </div>
      <ProCard ghost={true}>
        <ProCard
          ghost={true}
          colSpan={isMP ? 20 : 20}

          title={<span style={{ fontWeight: 'initial' }}>Email Address</span>}
          extra={
            <Button type="primary" shape="circle" onClick={() => {
              var arr = restFormRef?.current?.getFieldValue('emailArr')
              if (!arr) {
                arr = []
              }
              arr.push(new Date().getTime())
              restFormRef?.current?.setFieldsValue({ emailArr: arr })
            }} icon={<PlusOutlined />} />


          }

        >


          <ProFormDependency name={['emailArr']} >


            {
              (aa) => {
                var arr = []
                aa?.emailArr?.map((a, index) => {

                  arr.push(<ProFormGroup><ProFormText

                    fieldProps={{

                      addonAfter: index > 0 ? (

                        <MinusOutlined onClick={() => {

                          var arr = restFormRef?.current?.getFieldValue('emailArr')
                          arr.splice(index, 1)
                          restFormRef?.current?.setFieldsValue({ emailArr: arr })

                        }} />) : null
                    }}
                    width="md"
                    name={a + "_email"}
                    label=""
                    rules={[
                      {
                        validator: (rule, value, callback) => {
                          if (!value) {
                            callback()
                          }
                          var emailReg = /^\w{3,}(\.\w+)*@[A-z0-9]+(\.[A-z]{2,5}){1,2}$/;

                          var isFalse = !emailReg.test(value)
                          if (isFalse) {
                            callback(" Invalid email address is entered. ")
                          } else {
                            callback()
                          }


                        }


                      }
                    ]}
                  />

                    <ProFormDependency name={['typeArr']} >

                      {(cc) => {
                        var v = []
                        cc.typeArr?.forEach((f) => {

                          v.push("amber_" + 'hours')
                          v.push( "amber_" + 'mins')
                          v.push( "red_" + 'hours')
                          v.push( "red_" + 'mins')
                        })


                        return <ProFormDependency name={v} >
                          {(cc) => {

                            var isAmber = false
                            var isRed = false

                            for (var i in cc) {
                              if (i.indexOf("amber_") > -1 && cc[i]) {
                                isAmber = true
                              }

                              if (i.indexOf("red_") > -1 && cc[i]) {
                                isRed = true
                              }
                            }
                            var arr1 = []
                            if (isAmber) {

                              arr1.push({
                                label: 'Amber',
                                value: 'a',

                              })
                            }
                            if (isRed) {

                              arr1.push({
                                label: 'Red',
                                value: 'r',

                              })
                            }
                            return <ProFormCheckbox.Group

                              name={a + "_send_type_select"}
                              label=""
                              options={arr1}
                            />
                          }
                          }
                        </ProFormDependency>


                      }}

                    </ProFormDependency>


                  </ProFormGroup>)
                })
                return arr
              }
            }

          </ProFormDependency>
        </ProCard>
      </ProCard>
    </ModalForm>
     
  );
};

export default UpdateForm;
