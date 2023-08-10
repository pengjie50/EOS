import {
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ModalForm,
  ProFormTreeSelect,
  ProFormInstance

} from '@ant-design/pro-components';
import { JettyListItem } from '../data.d';
import { FormattedMessage, useIntl, useModel } from '@umijs/max';
import { Modal, Form } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import { organization } from '../../../system/company/service';
import { company } from '../../../system/company/service';
import { tree } from "@/utils/utils";
import { currentUser } from '../../../../services/ant-design-pro/api';
export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: Partial<JettyListItem>) => void;
  onSubmit: (values: Partial<JettyListItem>) => Promise<void>;
  updateModalOpen: boolean;
  values: Partial<JettyListItem>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const restFormRef = useRef<ProFormInstance>();
  const intl = useIntl();
  const [terminalList, setTerminalList] = useState<any>({});
  const {
    onSubmit,
    onCancel,
    updateModalOpen,
    values,
  } = props;
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  useEffect(() => {


    organization({ type: "Terminal", sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setTerminalList(b)

    });





  }, [true]);
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
            defaultMessage: 'Reset',
          }),
        },
        resetButtonProps: {
          onClick: () => {
            restFormRef.current?.resetFields();
           
          },
        },
      }}
      title={intl.formatMessage({
        id: 'pages.jetty.mod',
        defaultMessage: 'Modify Jetty',
      })}
    >
      <ProFormText
        name="name"
        label={intl.formatMessage({
          id: 'pages.jetty.xxx',
          defaultMessage: 'Jetty No.',
        })}
        width="md"
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
      <ProFormText
        name="depth_alongside"
        label={intl.formatMessage({
          id: 'pages.jetty.depthAlongside',
          defaultMessage: 'Depth Approaches (M)',
        })}
        width="md"
      />
      <ProFormText
        name="depth_approaches"
        label={intl.formatMessage({
          id: 'pages.jetty.depthApproaches',
          defaultMessage: 'Depth Approaches (M)',
        })}
        width="md"
      />
      <ProFormText
        name="max_loa"
        label={intl.formatMessage({
          id: 'pages.jetty.maxLOA',
          defaultMessage: 'Max. LOA (M)',
        })}
        width="md"
      />
      <ProFormText
        name="min_loa"
        label={intl.formatMessage({
          id: 'pages.jetty.minLOA',
          defaultMessage: 'Min. LOA (M)',
        })}
        width="md"
      />
      <ProFormText
        name="max_displacement"
        label={intl.formatMessage({
          id: 'pages.jetty.maxDisplacement',
          defaultMessage: 'Max. Displacement (MT)D',
        })}
        width="md"
      />
      <ProFormText
        name="mla_envelop_at_mhws_3m"
        label={intl.formatMessage({
          id: 'pages.jetty.mlaEnvelopAtMHWS3m',
          defaultMessage: 'MLA Envelop At MHWS 3.0m (Unless Otherwise Specified) (M)',
        })}
        width="md"

      />

      {currentUser?.role_type != 'Terminal' && <ProFormSelect
        name="terminal_id"
        label={intl.formatMessage({
          id: 'pages.jetty.terminals',
          defaultMessage: 'Terminal',
        })}
        width="md"
        valueEnum={terminalList}
      />}

     

    </ModalForm>

  );
};

export default UpdateForm;
