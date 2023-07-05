import {
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ModalForm,
  ProFormInstance
  
} from '@ant-design/pro-components';
import { TransactionListItem } from '../data.d';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Modal, Form } from 'antd';
import React, { useRef, useEffect, useState } from 'react';
import { company } from '../../system/company/service';



import { jetty } from '../../system/jetty/service';

export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: Partial<TransactionListItem>) => void;
  onSubmit: (values: Partial<TransactionListItem>) => Promise<void>;
  createModalOpen: boolean;
  
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const restFormRef = useRef<ProFormInstance>();
  const intl = useIntl();
  const [terminalList, setTerminalList] = useState<any>({});
  const [traderList, setTraderList] = useState<any>({});


  const [jettyList, setJettyList] = useState<any>({});
  useEffect(() => {


    company({  type:'Trader',sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setTraderList(b)

    });

    company({ type: 'Terminal', sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setTerminalList(b)

    });

    jetty({ sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setJettyList(b)

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
          id: 'pages.transaction.add',
          defaultMessage: 'Add Transaction',
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
        }}
      />




      <ProFormText
        name="eos_id"
        label={intl.formatMessage({
          id: 'pages.transaction.eosId',
          defaultMessage: 'EOS ID',
        })}
        width="md"

      />
      <ProFormText
        name="start_of_transaction"
        label={intl.formatMessage({
          id: 'pages.transaction.name',
          defaultMessage: 'Start of Transaction',
        })}
        width="md"

      />
        <ProFormText
        name="end_of_transaction"
          label={intl.formatMessage({
            id: 'pages.transaction.name',
            defaultMessage: 'End of Transaction',
          })}
          width="md"
          
      />
     
     
      <ProFormText
        name="arrival_id"
        label={intl.formatMessage({
          id: 'pages.transaction.arrivalID',
          defaultMessage: 'ArrivalID',
        })}
        width="md"

      />
      <ProFormText
        name="product_name"
        label={intl.formatMessage({
          id: 'pages.transaction.name',
          defaultMessage: 'Product Type',
        })}
        width="md"

      />
      <ProFormText
        name="imo_number"
        label={intl.formatMessage({
          id: 'pages.transaction.name',
          defaultMessage: 'IMO Number',
        })}
        width="md"

      />
      <ProFormSelect
        name="terminal_id"
        label={intl.formatMessage({
          id: 'pages.transaction.terminals',
          defaultMessage: 'Terminal',
        })}
        width="md"
        valueEnum={terminalList}
      />
      <ProFormSelect
        name="trader_id"
        label={intl.formatMessage({
          id: 'pages.transaction.xxx',
          defaultMessage: 'Trader',
        })}
        width="md"
        valueEnum={traderList}
      />


      <ProFormSelect
        name="jetty_id"
        label={intl.formatMessage({
          id: 'pages.transaction.jetty',
          defaultMessage: 'Jetty Name',
        })}
        width="md"
        valueEnum={jettyList}
      />
     
      <ProFormText
        name="vessel_name"
        label={intl.formatMessage({
          id: 'pages.transaction.name',
          defaultMessage: 'Vessel Name',
        })}
        width="md"

      />
      <ProFormText
        name="vessel_size_dwt"
        label={intl.formatMessage({
          id: 'pages.alertrule.vessel_size_dwt',
          defaultMessage: 'Size Of Vessel',
        })}
        width="md"

      />

      <ProFormText
        name="product_quantity_in_mt"
        label={intl.formatMessage({
          id: 'pages.alertrule.totalNominatedQuantityM',
          defaultMessage: 'Total Nominated Quantity (MT)',
        })}
        width="md"

      />
      <ProFormText
        name="product_quantity_in_bls_60_f"
        label={intl.formatMessage({
          id: 'pages.alertrule.totalNominatedQuantityB',
          defaultMessage: 'Total Nominated Quantity (Bal-60-F)',
        })}
        width="md"

      />
     
      <ProFormText
        name="total_duration"
        label={intl.formatMessage({
          id: 'pages.transaction.name',
          defaultMessage: 'Entire Duration (s)',
        })}
        width="md"

      />
      
     
     
    </ModalForm>
     
  );
};

export default UpdateForm;
