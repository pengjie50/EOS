import {
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormDigit,
  ProFormTextArea,
  ModalForm,
  ProFormInstance

} from '@ant-design/pro-components';
import { JettyListItem } from '../data.d';
import { FormattedMessage, useIntl, useModel } from '@umijs/max';
import { Modal, Form, Empty } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import { organization } from '../../../system/company/service';

import { fieldUniquenessCheck, fieldSelectData } from '@/services/ant-design-pro/api';
import { isPC } from "@/utils/utils";
export type CreateFormProps = {
  onCancel: (flag?: boolean, formVals?: Partial<JettyListItem>) => void;
  onSubmit: (values: Partial<JettyListItem>) => Promise<void>;
  createModalOpen: boolean;

};

const UpdateForm: React.FC<CreateFormProps> = (props) => {
  const restFormRef = useRef<ProFormInstance>();
  const intl = useIntl();



  const [depth_alongsideData, setDepth_alongsideData] = useState<any>({});
  const [depth_approachesData, setDepth_approachesData] = useState<any>({});

  const [max_loaData, setMax_loaData] = useState<any>({});
  const [min_loaData, setMin_loaData] = useState<any>({});
  const [max_displacementData, setMax_displacementData] = useState<any>({});
  const [mla_envelop_at_mhws_3mData, setMla_envelop_at_mhws_3mData] = useState<any>({});

  const [isMP, setIsMP] = useState<boolean>(!isPC());
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};

  const [terminalList, setTerminalList] = useState<any>({});
  const onlyCheck = (rule: any, value: any, callback: (arg0: string | undefined) => void) => {


    fieldUniquenessCheck({ where: { name: value }, model: 'Jetty' }).then((res) => {

      if (res.data) {

        callback(intl.formatMessage({
          id: 'pages.xxx',
          defaultMessage: 'Chosen Jetty No. already exist within EOS',
        }))
      } else {
        callback(undefined);
      }
    });

  }
  useEffect(() => {


    organization({ type: "Terminal", sorter: { name: 'ascend' } }).then((res) => {
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

          },
        },
      }}
      title={intl.formatMessage({
        id: 'pages.jetty.add',
        defaultMessage: 'Add Jetty',
      })}
    >
      <ProFormText
        name="name"
        label={intl.formatMessage({
          id: 'pages.jetty.xxx',
          defaultMessage: 'Jetty No.',
        })}
        width="lg"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="pages.rules.required"
                defaultMessage=""
              />
            ),
          }, { validator: onlyCheck }
        ]}
      />
      <ProFormText
        name="depth_alongside"
        label={intl.formatMessage({
          id: 'pages.jetty.depthAlongside',
          defaultMessage: 'Depth Approaches (M)',
        })}
        width="lg"
      />
      <ProFormText
        name="depth_approaches"
        label={intl.formatMessage({
          id: 'pages.jetty.depthApproaches',
          defaultMessage: 'Depth Approaches (M)',
        })}
        width="lg"
      />
      <ProFormText
        name="max_loa"
        label={intl.formatMessage({
          id: 'pages.jetty.maxLOA',
          defaultMessage: 'Max. LOA (M)',
        })}
        width="lg"
      />
      <ProFormText
        name="min_loa"
        label={intl.formatMessage({
          id: 'pages.jetty.minLOA',
          defaultMessage: 'Min. LOA (M)',
        })}
        width="lg"
      />
      <ProFormText
        name="max_displacement"
        label={intl.formatMessage({
          id: 'pages.jetty.maxDisplacement',
          defaultMessage: 'Max. Displacement (MT)',
        })}
        width="lg"
      />
      <ProFormText
        name="mla_envelop_at_mhws_3m"
        label={intl.formatMessage({
          id: 'pages.jetty.mlaEnvelopAtMHWS3m',
          defaultMessage: 'MLA Envelop At MHWS 3.0m (Unless Otherwise Specified) (M)',
        })}
        width="lg"

      />
      {/*
      <ProFormSelect
        name="depth_alongside"
        label="Depth Alongside (M)"
        width="lg"
        valueEnum={depth_alongsideData}
        fieldProps={
          {
            notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
            showSearch: true,
            dropdownMatchSelectWidth: isMP ? true : false,
            allowClear: true,

            onFocus: () => {
              fieldSelectData({ model: "Jetty", value: '', field: 'depth_alongside' }).then((res) => {
                setDepth_alongsideData(res.data)
              })
            },
            onSearch: (newValue: string) => {
              if (!newValue) {
                return
              }
              fieldSelectData({ model: "Jetty", value: newValue, field: 'depth_alongside' }).then((res) => {
                setDepth_alongsideData({ [newValue + ""]: newValue, ...res.data })

                setDepth_alongsideData(val => {
                 
                  restFormRef.current?.setFieldValue("depth_alongside", newValue + "")
                  return val

                })

               
              })

            }
          }}
      />

      <ProFormSelect
        name="depth_approaches"
        label="Depth Approaches (M)"
        width="lg"
        valueEnum={depth_approachesData}
        fieldProps={
          {
            notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
            showSearch: true,
            dropdownMatchSelectWidth: isMP ? true : false,
            allowClear: true,

            onFocus: () => {
              fieldSelectData({ model: "Jetty", value: '', field: 'depth_approaches' }).then((res) => {
                setDepth_approachesData(res.data)
              })
            },
            onSearch: (newValue: string) => {
              if (!newValue) {
                return
              }
              fieldSelectData({ model: "Jetty", value: newValue, field: 'depth_approaches' }).then((res) => {
                setDepth_approachesData({ [newValue + ""]: newValue, ...res.data })

                setDepth_approachesData(val => {
                  
                  restFormRef.current?.setFieldValue("depth_approaches", newValue + "")
                  return val

                })

               
              })

            }
          }}
      />
      <ProFormSelect
        name="max_loa"
        label="Max. LOA (M)"
        width="lg"
        valueEnum={max_loaData}
        fieldProps={
          {
            notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
            showSearch: true,
            dropdownMatchSelectWidth: isMP ? true : false,
            allowClear: true,

            onFocus: () => {
              fieldSelectData({ model: "Jetty", value: '', field: 'max_loa' }).then((res) => {
                setMax_loaData(res.data)
              })
            },
            onSearch: (newValue: string) => {
              if (!newValue) {
                return
              }
              fieldSelectData({ model: "Jetty", value: newValue, field: 'max_loa' }).then((res) => {
                setMax_loaData({ [newValue + ""]: newValue, ...res.data })

                setMax_loaData(val => {

                  restFormRef.current?.setFieldValue("max_loa", newValue + "")
                  return val

                })

                
              })

            }
          }}
      />
      <ProFormSelect
        name="min_loa"
        label="Min. LOA (M)"
        width="lg"
        valueEnum={min_loaData}
        fieldProps={
          {
            notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
            showSearch: true,
            dropdownMatchSelectWidth: isMP ? true : false,
            allowClear: true,

            onFocus: () => {
              fieldSelectData({ model: "Jetty", value: '', field: 'min_loa' }).then((res) => {
                setMin_loaData(res.data)
              })
            },
            onSearch: (newValue: string) => {
              if (!newValue) {
                return
              }
              fieldSelectData({ model: "Jetty", value: newValue, field: 'min_loa' }).then((res) => {
                setMin_loaData({ [newValue + ""]: newValue, ...res.data })

                setMin_loaData(val => {

                  restFormRef.current?.setFieldValue("min_loa", newValue + "")
                  return val

                })

                
              })

            }
          }}
      />

      <ProFormSelect
        name="max_displacement"
        label="Max. Displacement (MT)D"
        width="lg"
        valueEnum={max_displacementData}
        fieldProps={
          {
            notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
            showSearch: true,
            dropdownMatchSelectWidth: isMP ? true : false,
            allowClear: true,

            onFocus: () => {
              fieldSelectData({ model: "Jetty", value: '', field: 'max_displacement' }).then((res) => {
                setMax_displacementData(res.data)
              })
            },
            onSearch: (newValue: string) => {
              if (!newValue) {
                return
              }
              fieldSelectData({ model: "Jetty", value: newValue, field: 'max_displacement' }).then((res) => {
                setMax_displacementData({ [newValue + ""]: newValue, ...res.data })

                setMax_displacementData(val => {

                  restFormRef.current?.setFieldValue("max_displacement", newValue + "")
                  return val

                })

                
              })

            }
          }}
      />

      <ProFormSelect
        name="mla_envelop_at_mhws_3m"
        label="MLA Envelop At MHWS 3.0m (Unless Otherwise Specified) (M)"
        width="lg"
        valueEnum={mla_envelop_at_mhws_3mData}
        fieldProps={
          {
            notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
            showSearch: true,
            dropdownMatchSelectWidth: isMP ? true : false,
            allowClear: true,

            onFocus: () => {
              fieldSelectData({ model: "Jetty", value: '', field: 'mla_envelop_at_mhws_3m' }).then((res) => {
                setMla_envelop_at_mhws_3mData(res.data)
              })
            },
            onSearch: (newValue: string) => {
              if (!newValue) {
                return
              }
              fieldSelectData({ model: "Jetty", value: newValue, field: 'mla_envelop_at_mhws_3m' }).then((res) => {
                setMla_envelop_at_mhws_3mData({ [newValue + ""]: newValue, ...res.data })

                setMla_envelop_at_mhws_3mData(val => {

                  restFormRef.current?.setFieldValue("mla_envelop_at_mhws_3m", newValue + "")
                  return val

                })

                
              })

            }
          }}
      />

*/ }


      {currentUser?.role_type != 'Terminal' && <ProFormSelect
        name="terminal_id"
        label={intl.formatMessage({
          id: 'pages.jetty.terminals',
          defaultMessage: 'Terminal',
        })}
        width="lg"
        valueEnum={terminalList}
      />}

    </ModalForm>

  );
};

export default UpdateForm;
