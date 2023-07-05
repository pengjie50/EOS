import {
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ModalForm,
  ProFormInstance,
  ProFormDependency
} from '@ant-design/pro-components';
import { InterfacedataListItem } from '../data.d';
import { FormattedMessage, useIntl, useModel } from '@umijs/max';
import { Modal, Form } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import { organization } from '../../../system/company/service';


export type CreateFormProps = {
  onCancel: (flag?: boolean, formVals?: Partial<InterfacedataListItem>) => void;
  onSubmit: (values: Partial<InterfacedataListItem>) => Promise<void>;
  createModalOpen: boolean;
  
};

const UpdateForm: React.FC<CreateFormProps> = (props) => {
  const restFormRef = useRef<ProFormInstance>();
  const intl = useIntl();
  const [terminalList, setTerminalList] = useState<any>({});
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  useEffect(() => {


    organization({type: "Terminal", sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setTerminalList(b)

    });





  }, [true]);
  const {
    onSubmit,
    onCancel,
    createModalOpen,

  } = props;

  
  return (
   
    <ModalForm
      modalProps={{ destroyOnClose: true }}
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
              defaultMessage: 'Reset',
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
          id: 'pages.interfacedata.add',
          defaultMessage: 'Add Interfacedata',
        })}
      >
      <ProFormSelect
        name="type"
        label="DE Name"
        width="md"
      
       
        valueEnum={{
          1: "DE 1",
          2: "DE 2",
          3: "DE 3",
          4: "DE 4",
          5: "DE 5",
        }}
      />
      <ProFormDependency name={['type']}>
        {({ type }) => {
          if (type) {
          

            var arr = {
              1: {
                "toai_arrival_id": "string",
                "toai_arrival_id_status": "string",
                "toai_pilot_on_board_for_mooring_time": "2023-07-04T00:24:15.078Z",
                "toai_jetty_berth_location": "string",
                "toai_imo_number": "string",
                "toai_vessel_name": "string",
                "toai_vessel_size_dwt": 0,
                "toai_work_order_items": [
                  {
                    "work_order_id": "string"
                  }
                ],
                "toai_first_line_rope_ashore_time": "2023-07-04T00:24:15.078Z",
                "toai_all_fast_time": "2023-07-04T00:24:15.078Z",
                "toai_pilot_on_board_for_unmooring_time": "2023-07-04T00:24:15.078Z",
                "toai_documentation_on_board_time": "2023-07-04T00:24:15.078Z",
                "toai_agent": "string",
                "verified": "NOT APPLICABLE"
              },

              2:

              {
                "towoi_work_order_id": "string",
                "towoi_work_order_status": "string",
                "toiwo_work_order_customer_name": "string",
                "towoi_nor_tendered_time": "2023-07-03T23:59:51.801Z",
                "towoi_work_order_operation_type": "string",
                "towoi_nor_accepted_time": "2023-07-03T23:59:51.801Z",
                "towoi_hose_connect_end_time": "2023-07-03T23:59:51.801Z",
                "towoi_hose_disconnect_end_time": "2023-07-03T23:59:51.801Z",
                "towoi_work_order_surveyor": "string",
                "verified": "NOT APPLICABLE"
              },
                
              3: {
                "tosi_work_order_id": "string",
                "tosi_tank_number": "string",
                "tosi_work_order_sequence_number": "string",
                "tosi_product_name": "string",
                "tosi_product_quantity_in_l-obs": 0,
                "tosi_product_quantity_in_l-15-c": 0,
                "tosi_product_quantity_in_mt": 0,
                "tosi_product_quantity_in_mtv": 0,
                "tosi_product_quantity_in_Bls-60-f": 0,
                "tosi_cargo_start_first_foot_start_time": "2023-07-04T00:07:01.678Z",
                "tosi_first_foot_end_time": "2023-07-04T00:07:01.678Z",
                "tosi_first_foot_clear_time": "2023-07-04T00:07:01.678Z",
                "tosi_first_foot_resume_time": "2023-07-04T00:07:01.678Z",
                "tosi_cargo_end_time": "2023-07-04T00:07:01.678Z",
                "tosi_cargo_cease_items": [
                  {
                    "cease_time": "2023-07-04T00:07:01.678Z",
                    "continue_time": "2023-07-04T00:07:01.678Z"
                  }
                ],
                "verified": "NOT APPLICABLE"
              }, 
              4:
                {
                  "pilot_order_no": "string",
                  "pilot_imo_no": "string",
                  "pilot_location_to": "string",
                  "pilot_location_from": "string",
                  "pilot_service_request_time_agent_toa": "2023-07-04T00:09:02.844Z",
                  "pilot_service_request_time": "2023-07-04T00:09:02.844Z",
                  "pilot_booking_confirmed_time": "2023-07-04T00:09:02.844Z",
                  "pilot_arrival_time": "2023-07-04T00:09:02.844Z",
                  "pilot_cancellation_requestor": "string",
                  "pilot_onboard_time": "2023-07-04T00:09:02.844Z",
                  "pilotage_start_time": "2023-07-04T00:09:02.844Z",
                  "pilotage_end_time": "2023-07-04T00:09:02.844Z",
                  "pilotage_delay_start_time": "2023-07-04T00:09:02.844Z",
                  "pilotage_delay_duration": 0,
                  "pilotage_delay_reason": "string",
                  "verified": "NOT APPLICABLE"
                }
              ,5: {
                "lqb_order_creation_time": "2023-07-04T00:11:36.964Z",
                "lqb_pilot_on_board_time": "2023-07-04T00:11:36.964Z",
                "pilot_lqb_imo_no": "string",
                "pilot_lqb_location_to": "string",
                "pilot_lqb_location_from": "string",
                "lqb_agent_acknowledgment_time": "2023-07-04T00:11:36.964Z",
                "verified": "NOT APPLICABLE"
              }
            
            }


         
           
              
             

            restFormRef.current?.setFieldValue("json_string", JSON.stringify(arr[type]))

            return <ProFormTextArea
              name="json_string"
              label="Json String"
              width="lg"
              initialValue={JSON.stringify(arr[type])}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.rules.required"
                      defaultMessage=""
                    />
                  ),
                },
              ]}
            />

           /* var jArr = []
            type.forEach((t) => {
              var j = {}
              arr[t].forEach((a) => {
                
                j[a.label.replace(new RegExp(" ", 'g'), "").replace(new RegExp(/[-_()/]/, 'g'), "")] = "xxx"
               
              })
              jArr.push(j)
            })
           

            return <ProFormTextArea
              name="json_string"
              label="Json String"
              width="lg"
              initialValue={JSON.stringify(jArr)}
              rules={ [
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.rules.required"
                      defaultMessage=""
                    />
                  ),
                },
              ] }
            />

            return arr[type].map((a) => {
              return <ProFormText
                name={a.label.replace(new RegExp(" ", 'g'), "").replace(new RegExp(/[-_()/]/, 'g'), "")}
                label={a.label}
                width="md"
                rules={a.require?[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.rules.required"
                        defaultMessage=""
                      />
                    ),
                  },
                ]:null}
              />
            })*/
          }
          
        }
        }
        </ProFormDependency>
    </ModalForm>
     
  );
};

export default UpdateForm;
