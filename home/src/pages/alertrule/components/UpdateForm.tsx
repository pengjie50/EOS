import {
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ModalForm,
  ProFormGroup,
  ProFormDigit,
  ProFormInstance,
  ProFormCheckbox
  
} from '@ant-design/pro-components';
import { AlertruleListItem } from '../data.d';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Modal, Form } from 'antd';
import { flow } from '../../system/flow/service';

import React, { useRef, useState, useEffect } from 'react';
import { SvgIcon } from '@/components' // 自定义组件


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
        var b = {}
        res.data.forEach((r) => {
          b[r.id] = r.name
        })
        setFlowConf(b)

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

        <ProFormText
          name="total_nominated_quantity_unit"
          width="sm"
          label={intl.formatMessage({
            id: 'pages.alertrule.unitOfMeasurement',
            defaultMessage: 'Unit of Measurement (UOM)',
          })}

          initialValue={"Metric Tonnes (MT)"}



        />
      </ProFormGroup>
      <ProFormGroup>
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
      </ProFormGroup>


     
      <div style={{ width: '100%' }}>
        
        <div style={{ float: 'left', width: '40%', fontWeight: "bold", color: "#DE8205" }}>
          <SvgIcon style={{ color: "#DE8205" }} type="icon-yuan" /> Amber
        </div>
        <div style={{ float: 'left', width: '40%', fontWeight: "bold", color: "red" }}>
          <SvgIcon style={{ color: "red" }} type="icon-yuan" /> Red
        </div>

      </div>
      <ProFormGroup>
       
        <ProFormDigit label={<FormattedMessage
          id="pages.alertrule.hours"
          defaultMessage="Size of vessel From"
        />} name={"amber_" + 'hours'} width="xs" min={0} max={1000} />

        <ProFormDigit label={<FormattedMessage
          id="pages.alertrule.mins"
          defaultMessage="To"
        />} name={"amber_" + 'mins'} width="xs" min={0} max={60}/>


        <ProFormDigit label={<FormattedMessage
          id="pages.alertrule.hours"
          defaultMessage="Size of vessel From"
        />} name={"red_" + 'hours'} width="xs" min={0} max={1000} />

        <ProFormDigit label={<FormattedMessage
          id="pages.alertrule.mins"
          defaultMessage="To"
        />} name={"red_" + 'mins'} width="xs" min={0} max={60}  />
      </ProFormGroup>
      <div style={{ float: 'left', width: '100%', display: "block", marginBottom: "10px" }}>
        <div style={{ fontWeight: "bold" }}>Email Notification</div>
        <span style={{ fontSize: "12px" }}>Please use commas to separate multiple email addresses</span>
      </div>
      <ProFormGroup>

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
