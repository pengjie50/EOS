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
import { FormattedMessage, useIntl, useModel } from '@umijs/max';
import { Modal, Form, Divider, Button, Empty } from 'antd';
import { fieldSelectData } from '@/services/ant-design-pro/api';
import { flow } from '../../system/flow/service';
import { tree, isPC } from "@/utils/utils";
import React, { useRef, useState, useEffect } from 'react';
import { PlusCircleOutlined, PlusOutlined, MinusOutlined, MinusCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { SvgIcon } from '@/components' 
import { organization } from '../../system/company/service';
export type CreateFormProps = {
  onCancel: (flag?: boolean, formVals?: Partial<AlertruleListItem>) => void;
  onSubmit: (values: Partial<AlertruleListItem>) => Promise<void>;
  createModalOpen: boolean;

};

const UpdateForm: React.FC<CreateFormProps> = (props) => {
  const restFormRef = useRef<ProFormInstance>();
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  restFormRef?.current?.setFieldsValue({ events: [] })
  const intl = useIntl();
  const [flowConf, setFlowConf] = useState<any>({});
  const [templateList, setTemplateList] = useState<any>([]);
  const [flowMap, setFlowMap] = useState<any>({});
  const [flowList, setFlowList] = useState<any>([]);
  const [isMP, setIsMP] = useState<boolean>(!isPC());
  const [organizationList, setOrganizationList] = useState<any>([]);
  const [organizationMap, setOrganizationMap] = useState<any>({});
  const {
    onSubmit,
    onCancel,
    createModalOpen,

  } = props;

  useEffect(() => {
    if (!createModalOpen) {


    } else {

      flow({ pageSize: 300, current: 1, type: 0, sorter: { sort: 'ascend' } }).then((res) => {
        var b = {
         
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

  }, [props.createModalOpen]);
  return (

    <ModalForm
      modalProps={{ destroyOnClose: true }}
      onOpenChange={(vi) => {
        if (!vi) {
          props.onCancel();
        }

      }}

      initialValues={{ emailArr: [(new Date).getTime()], typeArr: [(new Date).getTime()] }}
      formRef={restFormRef}
      onFinish={props.onSubmit}
      open={props.createModalOpen}
      submitter={{
        searchConfig: {
          resetText: intl.formatMessage({
            id: 'pages.reset',
            defaultMessage: '',
          }),
        },
        resetButtonProps: {
          onClick: () => {
            restFormRef.current?.resetFields();
           
          },
        },
      }}
      title={intl.formatMessage({
        id: 'pages.alertrule.add',
        defaultMessage: 'Create new threshold limit setting',
      })}
    >
      {currentUser?.role_type == "Super" && <ProFormSelect

        fieldProps={
          {
            options: organizationList,
            notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
            showSearch: true,
            allowClear: true,
            onFocus: () => {
              organization({}).then((res) => {
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
              })
            },
            onSearch: (newValue: string) => {

              organization({ name: newValue }).then((res) => {
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
              })

            }
          }}
        width="lg"
        name="company_id"
        label="Organization"

      />}

      <div style={{ float: 'left', width: '100%', display: "block", marginBottom: "10px" }}>
        <div style={{ fontWeight: 500, fontSize: "14px" }}>Input Applicable Condition(s) For Threshold To Be Applied</div>
        <span><ExclamationCircleOutlined /> If more than one condition is selected, threshold defined is only applicable to transactions that fulfill ALL of the specified conditions</span>
      </div>



      <ProFormGroup>


        <ProFormSelect
          name="from_to"
          width="lg"
          label={intl.formatMessage({
            id: 'pages.alertrule.sizeOfVessel',
            defaultMessage: 'Condition:  Size Of Vessel',
          })}


          valueEnum={{
            "0-25000": "1. GP (General Purpose): Less than 24,990 DWT",
            "25000-45000": "2. MR (Medium Range): 25,000 to 44,990 DWT",
            "45000-80000": "3. LR1 (Long Range 1): 45,000 to 79,990 DWT",
            "80000-120000": "4. AFRA (AFRAMAX): 80,000 to 119,990 DWT",
            "120000-160000": "5. LR2 (Long Range 2): 120,000 to 159,990 DWT",
            "160000-320000": "6. VLCC (Very Large Crude Carrier): 160,000 to 319,990 DWT",
            "320000-1000000000": "7. ULCC (Ultra-Large Crude Carrier): More than 320,000 DWT",
          }} />


      </ProFormGroup>
      <div>Condition:  Total Nominated Quantity</div>
      <ProFormGroup>



        <ProFormDependency name={['product_quantity_to', 'product_quantity_from']}>
          {({ product_quantity_to, product_quantity_from }) => {


            return (<ProFormGroup><ProFormDigit label={<FormattedMessage

              id="pages.alertrule.from"
              defaultMessage="From"
            />}
              rules={[

                {
                  validator: (rule, value, callback) => {
                    if (product_quantity_from != null && product_quantity_to != null && product_quantity_to && value >= product_quantity_to) {
                      callback("Incorrect interval")
                    } else {
                      callback()
                    }
                  }

                }
              ]}
              name="product_quantity_from" width="xs" min={1} max={10000000}

            />

              <ProFormDigit label={<FormattedMessage
                id="pages.alertrule.to"
                defaultMessage="To"
              />}
                rules={[

                  {
                    validator: (rule, value, callback) => {
                      if (product_quantity_from != null && product_quantity_to != null && product_quantity_from && value <= product_quantity_from) {
                        callback("Incorrect interval")
                      } else {
                        callback()
                      }
                    }

                  }
                ]}
                name="product_quantity_to" width="xs" min={1} max={10000000} />

              <ProFormSelect
                name="uom"
                width={280}
                allowClear={false}
                label={intl.formatMessage({
                  id: 'pages.alertrule.unitOfMeasurement',
                  defaultMessage: 'Unit of Measurement (UOM)',
                })}

                rules={[

                  {
                    validator: (rule, value, callback) => {
                      if (product_quantity_from != null && product_quantity_to != null) {
                        if (!value) {
                          callback("Please Select Unit of Measurement")
                        } else {
                          callback()
                        }


                      } else {
                        callback()
                      }
                    }

                  }
                ]}
                valueEnum={{ mt: "Metric Tonnes (MT)", bls_60_f: "Barrels (Bls-60-F)" }}


              />
            </ProFormGroup>)

          }



          }


        </ProFormDependency>

        <div>
          <ExclamationCircleOutlined /> Note: Total Nominated Quantity refers to the sum of all quantity of operations for the vessel arrival at one jetty (e.g., 100 MT of discharge + 100 MT of loading = 200 MT of Total Nominated Quantity
        </div>
        <ProFormCheckbox.Group
          name="typeArr"
          hidden
          label="Threshold Exceeded"
          options={[]}
        />
      </ProFormGroup>
      < Divider style={{ backgroundColor: "#000" }} ></ Divider>

      < ProFormDependency name={["typeArr"]} >
        {(d) => {
          var data = restFormRef.current?.getFieldsValue()
          return <div style={{ color: 'red', display: (d.typeArr.length > 0) ? 'none' : "block" }}>Please define threshold duration!</div>
        }}
      </ProFormDependency>
      
      <ProCard
        ghost={true}
        colSpan={12}

        title={<div style={{ float: 'left', width: '100%', display: "block", marginBottom: "10px" }}>
          <div style={{ fontWeight: "500", fontSize: '14px' }}>Define Threshold Duration</div>
          <span style={{ fontSize: "12px", fontWeight: "normal" }}><ExclamationCircleOutlined /> Select threshold type</span>
        </div>}
        extra={
          <PlusCircleOutlined style={{ display: 'inline-block', paddingTop: 26 }} onClick={() => {
            var arr = restFormRef?.current?.getFieldValue('typeArr')
            if (!arr) {
              arr = []
            }
            arr.push(new Date().getTime())
            restFormRef?.current?.setFieldsValue({ typeArr: arr })
          }} />


        }

      />
      <ProFormDependency name={['typeArr']}>
        {({ typeArr }) => {
          var arr = []
          typeArr?.map((ta, index) => {
            arr.push(<>

              {index > 0 && <><Divider style={{ backgroundColor: "#d2d2d2" }}></Divider>
                <MinusCircleOutlined style={{ float: 'right', marginTop: -20 }} onClick={() => {

                  var arr = restFormRef?.current?.getFieldValue('typeArr')
                  arr.splice(index, 1)
                  restFormRef?.current?.setFieldsValue({ typeArr: arr })

                }} />

              </>}

              <ProFormGroup>
                <ProFormSelect
                  name={ta + "_type"}
                  width="md"
                  label="Threshold Type"
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
                  fieldProps={{

                    addonBefore: (<MinusOutlined onClick={() => {

                      var arr = restFormRef?.current?.getFieldValue('emailArr')
                      arr.splice(index, 1)
                      restFormRef?.current?.setFieldsValue({ emailArr: arr })

                    }} />)
                  }}
                  valueEnum={{
                    0: "Single Process",
                    1: "Between Two Events",
                    2: "Entire Transaction"

                  }}
                />
              </ProFormGroup>
              <ProFormDependency name={[ta + "_type"]} >
                {(bb) => {
                  if (bb[ta + "_type"] == 2) {

                    var flow_id = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
                    var ah = ta + "_amber_hours"
                    var am = ta + "_amber_mins"
                    var rh = ta + "_red_hours"
                    var rm = ta + "_red_mins"



                    return <ProFormDependency name={[ah, am, rh, rm]} >
                      {(aa) => {
                        var isShowRed = true
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
                        return [
                          <ProCard ghost={true} wrap={isMP ? true : false}>
                            <ProCard wrap={true} ghost={true}>
                              <ProCard ghost={true}>
                                <SvgIcon style={{ color: "#DE7E39" }} type="icon-yuan" /> Amber
                              </ProCard>
                              <ProCard ghost={true}>
                                <ProFormGroup>
                                  <ProFormDigit label={<FormattedMessage
                                    id="pages.alertrule.hours"
                                    defaultMessage="Hours"
                                  />} name={ah} rules={[
                                    {
                                      validator: (rule, value, callback) => {
                                        if (aa[ah] > 0 || aa[am] > 0 || aa[rh] > 0 || aa[rm] > 0) {
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
                                  ]} width={120} min={0} max={1000} />

                                  <ProFormDigit label={<FormattedMessage
                                    id="pages.alertrule.mins"
                                    defaultMessage="Mins"
                                  />} name={am} rules={[
                                    {
                                      validator: (rule, value, callback) => {
                                        if (aa[ah] > 0 || aa[am] > 0 || aa[rh] > 0 || aa[rm] > 0) {
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
                                  ]} width={120} min={0} max={60} />
                                </ProFormGroup>

                              </ProCard>



                            </ProCard>
                            <ProCard wrap={true} ghost={true}>
                              <ProCard ghost={true}>
                                <SvgIcon style={{ color: "red" }} type="icon-yuan" /> Red
                              </ProCard>
                              <ProCard ghost={true}>
                                <ProFormGroup>
                                  <ProFormDigit label={<FormattedMessage
                                    id="pages.alertrule.hours"
                                    defaultMessage="Hours"
                                  />} name={rh} rules={[
                                    {
                                      validator: (rule, value, callback) => {
                                        if (aa[ah] > 0 || aa[am] > 0 || aa[rh] > 0 || aa[rm] > 0) {
                                          callback()
                                        } else {
                                          callback(" ")
                                        }
                                      }

                                    }
                                  ]} width={120} min={0} max={1000} />

                                  <ProFormDigit label={<FormattedMessage
                                    id="pages.alertrule.mins"
                                    defaultMessage="Mins"
                                  />} name={rm} rules={[
                                    {
                                      validator: (rule, value, callback) => {
                                        if (aa[ah] > 0 || aa[am] > 0 || aa[rh] > 0 || aa[rm] > 0) {
                                          callback()
                                        } else {
                                          callback(" ")
                                        }
                                      }

                                    }
                                  ]} width={120} min={0} max={60} />
                                </ProFormGroup>

                              </ProCard>



                            </ProCard>

                          </ProCard>,




                          , <div style={{ marginLeft: '0px', marginTop: '-20px', color: 'red', display: aa[ah] > 0 || aa[am] > 0 || aa[rh] > 0 || aa[rm] > 0 ? 'none' : "block" }}>Duration for at least "Amber" or "Red" threshold must be entered</div>,
                          <div style={{ marginLeft: '0px', marginTop: '-10px', color: 'red', display: isShowRed ? 'block' : "none" }}>Duration for "Red" should not be shorter than "Amber" status</div>
                        ]

                      }
                      }
                    </ProFormDependency >







                  } else if (bb[ta + "_type"] == 0) {

                    return <>

                      <ProFormGroup>
                        <ProFormSelect
                          name={ta + "_flow_id"}
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

                        />
                      </ProFormGroup>
                      <ProFormDependency name={[ta + "_flow_id"]} >
                        {(cc) => {
                          if (!cc[ta + "_flow_id"]) {
                            return []
                          }
                          var flow_id = cc[ta + "_flow_id"]
                          var ah = ta + "_amber_hours"
                          var am = ta + "_amber_mins"
                          var rh = ta + "_red_hours"
                          var rm = ta + "_red_mins"






                          return <ProFormDependency name={[ah, am, rh, rm]} >
                            {(aa) => {


                              var isShowRed = true
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




                              return [
                                <ProCard ghost={true} wrap={isMP ? true : false}>
                                  <ProCard wrap={true} ghost={true}>
                                    <ProCard ghost={true}>
                                      <SvgIcon style={{ color: "#DE7E39" }} type="icon-yuan" /> Amber
                                    </ProCard>
                                    <ProCard ghost={true}>
                                      <ProFormGroup>
                                        <ProFormDigit label={<FormattedMessage
                                          id="pages.alertrule.hours"
                                          defaultMessage="Hours"
                                        />} name={ah} rules={[
                                          {
                                            validator: (rule, value, callback) => {
                                              if (aa[ah] > 0 || aa[am] > 0 || aa[rh] > 0 || aa[rm] > 0) {
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
                                        ]} width={120} min={0} max={1000} />

                                        <ProFormDigit label={<FormattedMessage
                                          id="pages.alertrule.mins"
                                          defaultMessage="Mins"
                                        />} name={am} rules={[
                                          {
                                            validator: (rule, value, callback) => {
                                              if (aa[ah] > 0 || aa[am] > 0 || aa[rh] > 0 || aa[rm] > 0) {
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
                                        ]} width={120} min={0} max={60} />
                                      </ProFormGroup>

                                    </ProCard>



                                  </ProCard>
                                  <ProCard wrap={true} ghost={true}>
                                    <ProCard ghost={true}>
                                      <SvgIcon style={{ color: "red" }} type="icon-yuan" /> Red
                                    </ProCard>
                                    <ProCard ghost={true}>
                                      <ProFormGroup>
                                        <ProFormDigit label={<FormattedMessage
                                          id="pages.alertrule.hours"
                                          defaultMessage="Hours"
                                        />} name={rh} rules={[
                                          {
                                            validator: (rule, value, callback) => {
                                              if (aa[ah] > 0 || aa[am] > 0 || aa[rh] > 0 || aa[rm] > 0) {
                                                callback()
                                              } else {
                                                callback(" ")
                                              }
                                            }

                                          }
                                        ]} width={120} min={0} max={1000} />

                                        <ProFormDigit label={<FormattedMessage
                                          id="pages.alertrule.mins"
                                          defaultMessage="Mins"
                                        />} name={rm} rules={[
                                          {
                                            validator: (rule, value, callback) => {
                                              if (aa[ah] > 0 || aa[am] > 0 || aa[rh] > 0 || aa[rm] > 0) {
                                                callback()
                                              } else {
                                                callback(" ")
                                              }
                                            }

                                          }
                                        ]} width={120} min={0} max={60} />

                                      </ProFormGroup>

                                    </ProCard>



                                  </ProCard>

                                </ProCard>


                                , <div style={{ marginLeft: '0px', marginTop: '-20px', color: 'red', display: aa[ah] > 0 || aa[am] > 0 || aa[rh] > 0 || aa[rm] > 0 ? 'none' : "block" }}>Please enter compulsory threshold alert field for either Amber or Red</div>,
                                <div style={{ marginLeft: '0px', marginTop: '-10px', color: 'red', display: isShowRed ? 'block' : "none" }}>Duration for "Red" should not be shorter than "Amber" status</div>

                              ]

                            }
                            }
                          </ProFormDependency >

                        }}
                      </ProFormDependency>
                    </>

                  } else if (bb[ta + "_type"] == 1) {
                    return < ProFormDependency name={[ta + "_from", ta + "_to"]} >
                      {(dd) => {


                        return (<><ProFormGroup>
                          <ProFormTreeSelect
                            name={ta + "_from"}
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



                                  if (dd[ta + "_to"] && value) {

                                    if (flowMap[dd[ta + "_to"]].sort < flowMap[value].sort) {

                                      callback('Events in "From" field cannot be later than Events in "To" field')

                                    } else if (flowMap[dd[ta + "_to"]].sort == flowMap[value].sort) {
                                      callback('Events cannot be the same')

                                    } else {
                                      callback()
                                    }


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
                                  r['key'] = r.id
                                  if (r.type == 0) {
                                    r['disabled'] = true
                                  }


                                  return r
                                })

                              
                                return tree(res.data, "                                    ", 'pid')
                              });

                            }}

                            // tree-select args
                            fieldProps={{
                              showArrow: false,
                              onChange: () => {
                                restFormRef.current?.validateFields([ta + "_to"], { force: true });
                              },

                              dropdownMatchSelectWidth: isMP ? true : false,


                              treeNodeFilterProp: 'name',
                              fieldNames: {
                                label: 'name',
                              },
                            }}
                          />

                          <ProFormTreeSelect
                            name={ta + "_to"}
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
                                  if (dd[ta + "_from"] && value) {

                                    if (flowMap[value].sort < flowMap[dd[ta + "_from"]].sort) {
                                      callback('Events in "From" field cannot be later than Events in "To" field')

                                    } else if (flowMap[dd[ta + "_from"]].sort == flowMap[value].sort) {
                                      callback('Events cannot be the same')

                                    } else {
                                      callback()
                                    }


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
                                  r['key'] = r.id

                                  if (r.type == 0) {
                                    r['disabled'] = true
                                  }
                                  return r
                                })

                               
                                return tree(res.data, "                                    ", 'pid')
                              });

                            }}

                            // tree-select args
                            fieldProps={{
                              showArrow: false,


                              dropdownMatchSelectWidth: isMP ? true : false,
                              onChange: () => {
                                restFormRef.current?.validateFields([ta + "_from"], { force: true });
                              },

                              treeNodeFilterProp: 'name',
                              fieldNames: {
                                label: 'name',
                              },
                            }}
                          />
                        </ProFormGroup><ProFormDependency name={[ta + "_from", ta + "_to"]} >
                            {(ee) => {
                              if (!(ee[ta + "_from"] && ee[ta + "_to"] && flowMap[dd[ta + "_from"]].sort < flowMap[dd[ta + "_to"]].sort)) {
                                return []
                              }
                              var flow_id = ee[ta + "_from"]
                              var flow_id_to = ee[ta + "_to"]
                              var ah = ta + "_amber_hours"
                              var am = ta + "_amber_mins"
                              var rh = ta + "_red_hours"
                              var rm = ta + "_red_mins"
                              return <ProFormDependency name={[ah, am, rh, rm]} >
                                {(aa) => {
                                  var isShowRed = true
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
                                  return [<ProCard ghost={true} wrap={isMP ? true : false}>
                                    <ProCard wrap={true} ghost={true}>
                                      <ProCard ghost={true}>
                                        <SvgIcon style={{ color: "#DE7E39" }} type="icon-yuan" /> Amber
                                      </ProCard>
                                      <ProCard ghost={true}>
                                        <ProFormGroup>
                                          <ProFormDigit label={<FormattedMessage
                                            id="pages.alertrule.hours"
                                            defaultMessage="Hours"
                                          />} name={ah} rules={[
                                            {
                                              validator: (rule, value, callback) => {
                                                if (aa[ah] > 0 || aa[am] > 0 || aa[rh] > 0 || aa[rm] > 0) {
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
                                          ]} width={120} min={0} max={1000} />

                                          <ProFormDigit label={<FormattedMessage
                                            id="pages.alertrule.mins"
                                            defaultMessage="To"
                                          />} name={am} rules={[
                                            {
                                              validator: (rule, value, callback) => {
                                                if (aa[ah] > 0 || aa[am] > 0 || aa[rh] > 0 || aa[rm] > 0) {
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
                                          ]} width={120} min={0} max={60} />
                                        </ProFormGroup>

                                      </ProCard>



                                    </ProCard>
                                    <ProCard wrap={true} ghost={true}>
                                      <ProCard ghost={true}>
                                        <SvgIcon style={{ color: "red" }} type="icon-yuan" /> Red
                                      </ProCard>
                                      <ProCard ghost={true}>
                                        <ProFormGroup>
                                          <ProFormDigit label={<FormattedMessage
                                            id="pages.alertrule.hours"
                                            defaultMessage="Size Of Vessel From"
                                          />} name={rh} rules={[
                                            {
                                              validator: (rule, value, callback) => {
                                                if (aa[ah] > 0 || aa[am] > 0 || aa[rh] > 0 || aa[rm] > 0) {
                                                  callback()
                                                } else {
                                                  callback(" ")
                                                }
                                              }

                                            }
                                          ]} width={120} min={0} max={1000} />

                                          <ProFormDigit label={<FormattedMessage
                                            id="pages.alertrule.mins"
                                            defaultMessage="To"
                                          />} name={rm} rules={[
                                            {
                                              validator: (rule, value, callback) => {
                                                if (aa[ah] > 0 || aa[am] > 0 || aa[rh] > 0 || aa[rm] > 0) {
                                                  callback()
                                                } else {
                                                  callback(" ")
                                                }
                                              }

                                            }
                                          ]} width={120} min={0} max={60} />

                                        </ProFormGroup>

                                      </ProCard>



                                    </ProCard>

                                  </ProCard>,




                                  <div style={{ marginLeft: '0px', marginTop: '-20px', color: 'red', display: aa[ah] > 0 || aa[am] > 0 || aa[rh] > 0 || aa[rm] > 0 ? 'none' : "block" }}>Please enter compulsory threshold alert field for either Amber or Red</div>
                                    , <div style={{ marginLeft: '0px', marginTop: '-10px', color: 'red', display: isShowRed ? 'block' : "none" }}>Duration for "Red" should not be shorter than "Amber" status</div>

                                  ]

                                }
                                }
                              </ProFormDependency >

                            }}
                          </ProFormDependency></>)
                      }}</ProFormDependency>
                  }

                }}


              </ProFormDependency>


            </>


            )



          })


          return arr
        }}
      </ProFormDependency>








      < Divider style={{ backgroundColor: "#000" }} ></ Divider>







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

            <PlusCircleOutlined onClick={() => {
              var arr = restFormRef?.current?.getFieldValue('emailArr')
              if (!arr) {
                arr = []
              }
              arr.push(new Date().getTime())
              restFormRef?.current?.setFieldsValue({ emailArr: arr })
            }} />



          }

        >


          <ProFormDependency name={['emailArr']} >


            {
              (aa) => {
                var arr = []
                var v = []
                aa.emailArr.map((a, index) => {
                  v.push(a + "_email")
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

                        cc.typeArr?.forEach((f) => {

                          v.push(f + "_amber_" + 'hours')
                          v.push(f + "_amber_" + 'mins')
                          v.push(f + "_red_" + 'hours')
                          v.push(f + "_red_" + 'mins')
                        })


                        return <ProFormDependency name={v} >
                          {(cc) => {

                            var isAmber = false
                            var isRed = false

                            for (var i in cc) {
                              if (i.indexOf("_amber_") > -1 && cc[i]) {
                                isAmber = true
                              }

                              if (i.indexOf("_red_") > -1 && cc[i]) {
                                isRed = true
                              }
                            }
                            var arr1 = []
                            if (isAmber) {

                              arr1.push({
                                label: <><SvgIcon style={{ color: "#DE7E39" }} type="icon-yuan" /> Amber</>,
                                value: 'a',

                              })
                            }
                            if (isRed) {

                              arr1.push({
                                label: <><SvgIcon style={{ color: "red" }} type="icon-yuan" /> Red</>,
                                value: 'r',

                              })
                            }

                            var emailReg = /^\w{3,}(\.\w+)*@[A-z0-9]+(\.[A-z]{2,5}){1,2}$/;

                            var r = [

                            ]

                            if (emailReg.test(cc[a + "_email"])) {
                              r.push({
                                required: true,
                                message: "Please select an alert to proceed.",
                              })
                            }



                            return <ProFormCheckbox.Group
                              rules={r}
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
