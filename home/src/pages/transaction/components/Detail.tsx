import React, { useRef, useState, useEffect, useCallback } from 'react';
import { PageContainer, ProCard, ProColumns, ProDescriptions, ProFormGroup, ProFormSelect, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { AlertOutlined, SafetyCertificateOutlined, FormOutlined, CheckOutlined, ExclamationCircleFilled, ReloadOutlined, HistoryOutlined, FieldTimeOutlined, CalendarOutlined, DownCircleOutlined, EyeOutlined, ExclamationCircleOutlined, AimOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { FormattedMessage, useIntl, useLocation, useModel, history, formatMessage } from '@umijs/max';
import { TransactionList, TransactionListItem } from '../data.d';
import { transaction, validateBC, transactionevent, transactioneventlog, addTransactionevent, updateTransactionevent } from '../service';
import { Button, Space, Steps, Icon, Select, message, Spin, Empty, Modal, Tooltip, Drawer, Badge } from 'antd';
import { flow } from '../../system/flow/service';
import { filterOfTimestamps, addFilterOfTimestamps, updateFilterOfTimestamps, removeFilterOfTimestamps } from '../../account/filterOfTimestamps/service';
import { getAlertBytransactionId } from '../../alert/service';
import { SvgIcon, getDurationInfo, keyNameMap, getDiff } from '@/components' // 自定义组件

import { Icon as Iconfy } from '@iconify/react';

import { tree, isPC } from "@/utils/utils";
import FilterForm from '../../account/filterOfTimestamps/components/FilterForm';
import { rearg } from 'lodash';
import { useAccess, Access } from 'umi';

import { alertrule } from '../../alertrule/service';
import { company, organization } from '../../system/company/service';
import numeral from 'numeral';





var moment = require('moment');

const { Step } = Steps;
const { confirm } = Modal;


var handleget: () => void
var handlegetFlow

var handlegetFlowFilter


const handleAdd = async (fields: any) => {
  const hide = message.loading(<FormattedMessage
    id="pages.adding"
    defaultMessage="Adding"
  />);
  try {
    await addFilterOfTimestamps({ ...fields });
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
        removeFilterOfTimestamps({
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

const handleUpdate = async (fields: any) => {
  const hide = message.loading(<FormattedMessage
    id="pages.modifying"
    defaultMessage="Modifying"

  />);
  try {
    await updateFilterOfTimestamps({ ...fields });
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

const Threshold: React.FC<any> = (props) => {
  const {
    hours,
    mins,
    type,
    size,
    opacity,
    ...restProps
  } = props;


  return (hours || mins) ? <span style={{ textAlign: 'left', fontSize: size, opacity: opacity, display: "inline-block", width: 120 }}><SvgIcon style={{ color: type == "amber" ? "#DE7E39" : "red" }} type="icon-yuan" /> {(hours ? hours : 0) + "h " + (mins ? mins : 0) + "m"}</span> : <span style={{ display: 'inline-block', width: 120 }}></span>
}





const Detail: React.FC<any> = (props) => {

  const [currentFilter, setCurrentFilter] = useState<any>();
  const [currentRow, setCurrentRow] = useState<TransactionListItem>();

  const [currentAlertruleRow, setCurrentAlertruleRow] = useState<TransactionListItem>();
  const [events, setEvents] = useState<any>([]);

  const [flowTreeFilter, setFlowTreeFilter] = useState<any>([]);
  const [flowTreeAll, setFlowTreeAll] = useState<any>([]);


  const [eventTree, setEventTree] = useState<any>({});


  const [flowList, setFlowList] = useState<any>([]);

  const [transactionAlert, setTransactionAlert] = useState<any>([]);
  const [processes, setProcesses] = useState<any>([]);
  const [transactioneventMap, setTransactioneventMap] = useState<any>({});
  const [transactioneventList, setTransactioneventList] = useState<any>({});
  const [processMap, setProcessMap] = useState<any>({});
  // const [transaction_id, setTransaction_id] = useState<any>("");
  const [filterOfTimestampsList, setFilterOfTimestampsList] = useState<any>([{ value: 'add', label: 'Select/create new timestamp filter' }]);
  const [filterOfTimestampsMap, setFilterOfTimestampsMap] = useState<any>(new Map());




  const [alertruleProcessMap, setAlertruleProcessMap] = useState<any>({});


  const [logObjArr, seLogObjArr] = useState<any>([]);


  const [alertruleEventList, setAlertruleEventList] = useState<any>([]);
  const [collapsed, setCollapsed] = useState(true);
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [show, setShow] = useState<any>({});
  const [organizationList, setOrganizationList] = useState<any>({});
  const [organization_id, setOrganization_id] = useState<any>([]);
  var transaction_id = useLocation()?.state?.transaction_id
  const [showDetail, setShowDetail] = useState<boolean>(false);

  const [showLog, setShowLog] = useState<boolean>(false);
  const [eventLogMap, setEventLogMap] = useState<any>({});
  const [currentEventLogList, setCurrentEventLogList] = useState<any>([]);
  const [currentEvent, setCurrentEvent] = useState<any>(null);

  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);


  const [isAdd, setIsAdd] = useState<boolean>(false);

  const [totalDuration, setTotalDuration] = useState<any>(0);

  const [flowConf, setFlowConf] = useState<any>({});
  const [flowMap, setFlowMap] = useState<any>({});
  const [isMP, setIsMP] = useState<boolean>(!isPC());

  const [validateStatus, setValidateStatus] = useState<any>(0);
  const [validateData, setValidateData] = useState<any>([]);
  const [selectValue, setSelectValue] = useState<any>(null);
  const [tab, setTab] = useState(useLocation()?.state?.tab || 'Self');

  const [thresholdExpand, setThresholdExpand] = useState<boolean>(false);

  const getTimeStr = (time) => {
    if (time < 0) {
      time = 0
    }
    return parseInt((time / 3600) + "") + "h " + parseInt((time % 3600) / 60) + "m"
  }

  const access = useAccess();
  const intl = useIntl();


  
  var sss = {}

  sss['1001'] = {
    white: ['event_time', 'agent', 'order_no', 'location_from', 'location_to']
    , grey: ['imo_number', 'vessel_name', 'vessel_size_dwt', 'arrival_id']
  }
  sss['1002'] = sss['1001']
  sss['1003'] = sss['1001']
  sss['1004'] = sss['1001']
  sss['1005'] = sss['1001']
  sss['1006'] = sss['1001']
  sss['1007'] = sss['1001']
  sss['1008'] = sss['1001']
  sss['1009'] = sss['1001']
  sss['1010'] = {
    white: ['event_time', 'agent', 'work_order_id', 'location_from', 'location_to']
    , grey: ['imo_number', 'vessel_name', 'vessel_size_dwt', 'arrival_id']
  }
  sss['2001'] = sss['1001']

  sss['2002'] = {
    white: ['event_time', 'agent', 'order_no', 'location_from', 'location_to', 'delay_reason', 'delay_duration']
    , grey: ['imo_number', 'vessel_name', 'vessel_size_dwt', 'arrival_id']
  }
  sss['2003'] = sss['1001']
  sss['2004'] = {
    white: ['event_time', 'terminal_id', 'jetty_id']
    , grey: ['imo_number', 'vessel_name', 'arrival_id']
  }
  sss['2005'] = sss['2004']
  sss['2006'] = sss['2004']
  sss['2007'] = sss['2004']


  sss['3001'] = {
    white: ['event_time', 'product_name', 'product_quantity_in_bls_60_f', 'tank_number', 'work_order_id', 'work_order_sequence_number']
    , grey: ['imo_number', 'vessel_name', 'arrival_id', 'trader_id', 'work_order_status', 'arrival_id_status', 'work_order_sequence_number_status', 'work_order_operation_type', 'work_order_surveyor', 'product_quantity_in_l_obs', 'product_quantity_in_l_15_c', 'product_quantity_in_mt', 'product_quantity_in_mtv', 'product_quantity_in_bls_60_f']
  }

  sss['3002'] = sss['3001']
  sss['3003'] = sss['3001']
  sss['3004'] = sss['3001']

  sss['3005'] = sss['3001']
  sss['3006'] = sss['3001']
  sss['3007'] = sss['3001']


  sss['4001'] = {
    white: ['event_time', 'agent', 'order_no', 'location_from', 'location_to']
    , grey: ['imo_number', 'vessel_name', 'trader_id']
  }
  sss['4002'] = sss['4001']
  sss['4003'] = sss['4001']
  sss['4004'] = sss['4001']
  sss['4005'] = sss['4001']
  sss['4006'] = sss['4001']
  sss['4007'] = sss['4001']
  sss['4008'] = sss['4001']
  sss['4009'] = sss['4001']
  sss['4010'] = sss['4001']
  sss['4011'] = sss['4001']
  sss['4012'] = sss['4001']
  sss['4013'] = {
    white: ['event_time', 'agent', 'order_no', 'location_from', 'location_to', 'delay_reason', 'delay_duration']
    , grey: ['imo_number', 'vessel_name', 'trader_id']
  }
  sss['4014'] = sss['4001']


  const columns1: ProColumns<TransactionListItem>[] = [

    {
      title: <FormattedMessage id="pages.transaction.startOfTransaction" defaultMessage="Start of transaction" />,
      dataIndex: 'start_of_transaction',
      valueType: 'date',

      align: "center",
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.transaction.endOfTransaction" defaultMessage="End of transaction" />,
      dataIndex: 'end_of_transaction',
      valueType: 'date',
      render: (dom, entity) => {
        if (entity.status == 1) {
          return dom ? moment(new Date(dom)).format('YYYY-MM-DD') : "-"
        } else {
          return "-"
        }
      },
      align: "center",
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.transaction.status" defaultMessage="Status" />,
      dataIndex: 'status',
      align: "center",
      valueEnum: {
        0: { text: <FormattedMessage id="pages.transaction.active" defaultMessage="Open" /> },
        1: { text: <FormattedMessage id="pages.transaction.closed" defaultMessage="Closed" /> },
        2: { text: <FormattedMessage id="pages.transaction.cancelled" defaultMessage="Cancelled" /> }
      },
    }

  ]

  const columns2: ProColumns<TransactionListItem>[] = [
    {
      title: <FormattedMessage id="pages.transaction.vesselName" defaultMessage="Vessel Name" />,
      dataIndex: 'vessel_name',
      align: "center",
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.transaction.imoNumber" defaultMessage="IMO Number" />,
      dataIndex: 'imo_number',
      hideInSearch: true,
      align: "center",
      valueType: 'text',
    }



  ]
  const columns3: ProColumns<TransactionListItem>[] = [
    {
      title: <FormattedMessage id="pages.transaction.terminalName" defaultMessage="Terminal Name" />,
      dataIndex: 'terminal_name',


    },
    {
      title: <FormattedMessage id="pages.transaction.terminalName" defaultMessage="Trader Name" />,
      dataIndex: 'trader_name',


    },
    {
      title: <FormattedMessage id="pages.transaction.jettyName" defaultMessage="Jetty Name" />,
      dataIndex: 'jetty_name',

    }


  ]


  const columns4: ProColumns<TransactionListItem>[] = [
    {
      title: <FormattedMessage id="pages.alertrule.throughputVolume1" defaultMessage="Total Nominated Quantity (MT)" />,
      dataIndex: 'product_quantity_in_mt',
      hideInSearch: true,
      valueType: "text",
      render: (dom, entity) => {
        if (dom != null) {
          return numeral(dom).format('0,0')
        } else {
          return '-'
        }

      },
    },
    {
      title: <FormattedMessage id="pages.alertrule.throughputVolume1" defaultMessage="Total Nominated Quantity (Bls-60-F)" />,
      dataIndex: 'product_quantity_in_bls_60_f',
      hideInSearch: true,
      valueType: 'text',
      render: (dom, entity) => {
        if (dom != null) {
          return numeral(dom).format('0,0')
        } else {
          return '-'
        }

      },
    },


  ]

  const columns5: ProColumns<TransactionListItem>[] = [
    {
      title: <FormattedMessage id="pages.transaction.productType" defaultMessage="Product Type" />,
      dataIndex: 'product_name',
      //valueEnum: producttypeList,
    },

  ]



  const columnsAlertrule: ProColumns<any>[] = [


    {
      title: (
        <FormattedMessage
          id="pages.alert.xxx"
          defaultMessage="Threshold ID"
        />
      ),

      dataIndex: 'alertrule_id',
      hideInSearch: true,
      sorter: true,
      align: "center",
      render: (dom, entity) => {
        return dom
      },
    },

    {
      title: <FormattedMessage id="pages.alertrule.type" defaultMessage="Threshold Type" />,
      dataIndex: 'type',
      sorter: true,
      hideInSearch: true,
      defaultSortOrder: 'ascend',
      valueEnum: {
        0: { text: <FormattedMessage id="pages.alertrule.singleProcess" defaultMessage="Single Process" /> },
        1: { text: <FormattedMessage id="pages.alertrule.betweenTwoEvents" defaultMessage="Between Two Events" /> },
        2: { text: <FormattedMessage id="pages.alertrule.entireTransaction" defaultMessage="Entire Transaction" /> },
      }

    },



    {
      title: (
        <FormattedMessage
          id="pages.alertrule.entireTransactionAndProcesses"
          defaultMessage="Entire Transaction And Processes"
        />
      ),
      dataIndex: 'flow_id',
      hideInTable: true,
      hideInDescriptions: true,
      valueEnum: processes,
      fieldProps: {
        notFoundContent: <Empty />,
        width: '300px',
        dropdownMatchSelectWidth: isMP ? true : false,
        mode: 'multiple',
        showSearch: false,
        multiple: true

      },
      search: {
        transform: (value) => {
          if (value.length > 0) {
            return {
              'flow_id': {
                'field': 'flow_id',
                'op': 'in',
                'data': value
              }
            }
          }

        }
      }
    },


    {
      title: (
        <FormattedMessage
          id="pages.alertrule.betweenTwoEvents"
          defaultMessage="Between Two Events"
        />
      ),
      dataIndex: 'flow_id_to',
      hideInTable: true,
      width: 200,
      hideInDescriptions: true,
      valueEnum: events,
      fieldProps: {
        notFoundContent: <Empty />,

        dropdownMatchSelectWidth: isMP ? true : false,
        width: '300px',
        mode: 'multiple',
        showSearch: false,
        multiple: true

      },
      search: {
        transform: (value) => {
          if (value.length > 0) {
            return {
              'flow_id': {
                'field': 'flow_id',
                'op': 'in',
                'data': value.map((a) => {
                  return a.split('_')[0]
                })
              },
              'flow_id_to': {
                'field': 'flow_id_to',
                'op': 'in',
                'data': value.map((a) => {
                  return a.split('_')[1]
                })
              },
            }
          }
        }
      }


    },

    {
      title: <FormattedMessage id="pages.alertrule.vesselSizeLimit" defaultMessage="Vessel Size Limit (DWT)" />,
      dataIndex: 'from_to',
      hideInTable: true,
      hideInDescriptions: true,
      fieldProps: {

        dropdownMatchSelectWidth: isMP ? true : false,
        width: '300px',

        // showSearch: true,


      },
      valueEnum: {
        "0-25000": "1. GP (General Purpose): Less than 24,990 DWT",
        "25000-45000": "2. MR (Medium Range): 25,000 to 44,990 DWT",
        "45000-80000": "3. LR1 (Long Range 1): 45,000 to 79,990 DWT",
        "80000-120000": "4. AFRA (AFRAMAX): 80,000 to 119,990 DWT",
        "120000-160000": "5. LR2 (Long Range 2): 120,000 to 159,990 DWT",
        "160000-320000": "6. VLCC (Very Large Crude Carrier): 160,000 to 319,990 DWT",
        "320000-1000000000": "7. ULCC (Ultra-Large Crude Carrier): More than 320,000 DWT",
      },
      search: {
        transform: (value) => {
          if (value) {
            return {
              'vessel_size_dwt_from': {
                'field': 'vessel_size_dwt_from',
                'op': 'eq',
                'data': value.split('-')[0]
              },
              'vessel_size_dwt_to': {
                'field': 'vessel_size_dwt_to',
                'op': 'eq',
                'data': value.split('-')[1]
              }
            }
          }

        }
      }

    },

    {
      title: (
        <FormattedMessage
          id="pages.alertrule.eee"
          defaultMessage="Threshold Process/Events"
        />
      ),
      dataIndex: 'flow_id',
      hideInSearch: true,
      valueEnum: flowConf,
      render: (dom, entity) => {
        if (entity.type == 0) {
          return flowConf[entity.flow_id]
        } else if (entity.type == 1) {
          return flowConf[entity.flow_id] + " -> " + flowConf[entity.flow_id_to]
        } else {
          return '-'
        }

      }

    },







    {
      title: <FormattedMessage id="pages.alertrule.vesselSizeLimit" defaultMessage="Vessel Size Limit (DWT)" />,
      dataIndex: 'vessel_size_dwt_from',
      onFilter: true,
      sorter: true,
      hideInSearch: true,
      valueType: 'text',

      render: (dom, entity) => {
        if (entity.vessel_size_dwt_from != null && entity.vessel_size_dwt_to) {

          var valueEnum = {
            "0-25000": "GP",
            "25000-45000": "MR",
            "45000-80000": "LR1",
            "80000-120000": "AFRA",
            "120000-160000": "LR2",
            "160000-320000": "VLCC",
            "320000-1000000000": "ULCC",
          }

          return valueEnum[entity.vessel_size_dwt_from + "-" + entity.vessel_size_dwt_to];
        } else {
          return '-'
        }

      },
    },
    {
      title: <FormattedMessage id="pages.alertrule.throughputVolume1" defaultMessage="Total Nominated Quantity (MT)" />,
      dataIndex: 'product_quantity_from',
      fieldProps: { placeholder: ['From', 'To'] },
      valueType: "digitRange",
      width: 200,
      sorter: true,
      render: (dom, entity) => {
        if (entity.uom == "mt" && entity.product_quantity_from) {
          return numeral(entity.product_quantity_from).format('0,0') + " - " + numeral(entity.product_quantity_to).format('0,0')
        } else {
          return '-'
        }

      }

    },

    {
      title: "Total Nominated Quantity (Bls-60-F)",
      dataIndex: 'product_quantityf_to',
      fieldProps: {
        placeholder: ['From', 'To']
      },
      valueType: "digitRange",
      width: 200,
      sorter: true,
      render: (dom, entity) => {
        if (entity.uom == "bls_60_f" && entity.product_quantity_from) {
          return numeral(entity.product_quantity_from).format('0,0') + " - " + numeral(entity.product_quantity_to).format('0,0')
        } else {
          return '-'
        }

      }

    },

    {
      title: <FormattedMessage id="pages.alertrule.thresholdLimit" defaultMessage="Threshold Limit" />,
      dataIndex: 'amber_hours',
      hideInSearch: true,
      valueType: 'text',
      render: (dom, entity) => {
        return (<div><div style={{ display: entity.amber_hours || entity.amber_mins ? "block" : "none" }}> <SvgIcon style={{ color: "#DE7E39" }} type="icon-yuan" />{" " + (entity.amber_hours ? entity.amber_hours : '0') + "h " + (entity.amber_mins ? entity.amber_mins : '0') + "m"}</div>
          <div style={{ display: entity.red_hours || entity.red_mins ? "block" : "none" }}><SvgIcon style={{ color: "red" }} type="icon-yuan" />{" " + (entity.red_hours ? entity.red_hours : '0') + "h " + (entity.red_mins ? entity.red_mins : '0') + "m"}</div></div>)
      },
    },
    {
      title: <FormattedMessage id="pages.alertrule.email" defaultMessage="" />,
      dataIndex: 'email',
      hideInSearch: true,
      hideInTable: true,
      hideInDescriptions: true,
      valueType: 'text',
    },

    {
      title: <FormattedMessage id="pages.alertrule.userName" defaultMessage="Date of Threshold Alert Creation" />,
      dataIndex: 'created_at',
      width: 200,
      hideInSearch: true,
      sorter: true,
      valueType: 'dateTime',
    }








  ];


  const twoEvenbox = (th) => {

    return (
      <ProCard ghost={true} colSpan={24} bordered wrap={isMP ? true : false}

        style={{ marginBlockStart: 5, cursor: 'pointer' }}
        headStyle={{ padding: 0, fontWeight: 'normal', fontSize: '14px' }}
        bodyStyle={{ paddingLeft: 25 }}

        onClick={(e) => {
          handlegetFlowFilter([th.flow_id, th.flow_id_to])
        }}
      >


        <ProCard ghost={true} colSpan={isMP ? 24 : 8}>
          {flowConf[th.flow_id]}<span >{' -> '}</span>{flowConf[th.flow_id_to]}
        </ProCard>
        <ProCard ghost={true} layout={isMP ? "default" : "center"} colSpan={isMP ? 24 : 5}>

          <ProDescriptions
            className="eventFromTo"
            column={isMP ? 1 : 1} >
            <ProDescriptions.Item contentStyle={{ paddingBottom: "0px !important" }} label="Work Order ID" valueType="text" style={{ fontSize: '14px' }} >

              {th?.work_order_id || '-'}


            </ProDescriptions.Item>
            <ProDescriptions.Item contentStyle={{ paddingBottom: "0px !important" }} label="Sequence No" valueType="text" style={{ fontSize: '14px' }} >

              {th?.work_order_sequence_number || '-'}


            </ProDescriptions.Item>

          </ProDescriptions>
        </ProCard>
        <ProCard ghost={true} layout={isMP ? "default" : "default"} colSpan={isMP ? 24 : 4}>
          <span style={{
            display: "inline-block",
            color: "#fff",
            width: '22px',
            height: '22px',
            fontSize: "16px",
            backgroundColor: th.red == 1 ? "red" : (th.amber == 1 ? "#70AD47" : (th.transaction_event_id_from && th.transaction_event_id_to ? "#70AD47" : "#595959")),
            borderRadius: '50%',
            textAlign: 'center',
            lineHeight: '22px'
          }}>
            <SvgIcon type={"icon-yundongguiji"} />

          </span>
          <span style={{ marginLeft: 5, fontWeight: 500 }}>{getTimeByTwoEvent(th.transaction_event_id_from, th.transaction_event_id_to, th)}</span>

        </ProCard>

        <ProCard ghost={true} layout={isMP ? "default" : "center"} colSpan={isMP ? 24 : 7} onClick={(ev) => { ev.stopPropagation(); setCurrentAlertruleRow(th); setShowDetail(true) }} >

          <ProDescriptions
            column={isMP ? 1 : 2} >
            <ProDescriptions.Item label="Threshold" valueType="text" style={{ fontSize: '14px' }} >

              <div style={{ display: 'flex' }}>
                <Threshold hours={th.amber_hours} opacity={th.amber ? 1 : 0.3} mins={th.amber_mins} type="amber" size={14} />&nbsp;

                <Threshold hours={th.red_hours} opacity={th.red ? 1 : 0.3} mins={th.red_mins} type="red" size={14} />
              </div>
            </ProDescriptions.Item>

          </ProDescriptions>
        </ProCard>




      </ProCard>
    )
  }







  const getTimeByTwoEvent = (from, to, a) => {
    try {
      if (!currentRow) {
        return "-"
      }


      var fromEventTime = null
      var toEventTime = null
      if (transactioneventMap && transactioneventMap[from]) {
        fromEventTime = transactioneventMap[from].event_time
      }
      if (transactioneventMap && transactioneventMap[to]) {
        toEventTime = transactioneventMap[to].event_time
      }


      if (fromEventTime && !toEventTime) {
        if (currentRow.status == 0) {
          toEventTime = new Date()
        } else {

          toEventTime = currentRow.end_of_transaction
        }
      }

      return getTimeStr((new Date(toEventTime).getTime() - new Date(fromEventTime).getTime()) / 1000)
    } catch (e) {



      return "-"
    }


  }
  useEffect(() => {




    (async function anyNameFunction() {

      var res = await transaction({
        id: {
          'field': 'id',
          'op': 'eq',
          'data': transaction_id
        }
      })

      
      var currentRow_ = res.data[0]



      if (res.data[0]?.status == 1) {
        // res.data[0].blockchain_hex_key = "sssss"
        setValidateStatus(1)

        validateBC({ id: res.data[0].id }).then((res) => {

          if (res.data) {
            


            if (res.data.bc_head_data && res.data.bc_event_data) {
              setValidateStatus(2)
              setValidateData(res.data)

              if (res.data.head_data.Verified == "False" || res.data.event_data.some((a) => {
                return a.Verified == "False"
              })) {

                setValidateStatus(3)
              }

            } else {
              setValidateStatus(0)
              setValidateData(null)
            }






          } else {

            setValidateStatus(0)
            setValidateData(null)

          }


        })
      }


      setCurrentRow(currentRow_)
      var res2 = await organization({ sorter: { name: 'ascend' } })
        var b = {}
        res2.data.forEach((r) => {

          if (r.id == res.data[0]?.trader_id || r.id == res.data[0]?.terminal_id) {

            b[r.id] = r.name
          }

        })
      setOrganizationList(b)

      var res = await flow({ sorter: { sort: 'ascend' } })

      res.data.push({
        name: currentRow_?.status == 1 ? 'Entire Duration' : 'Current Duration', icon: currentRow_?.status == 1 ? 'icon-daojishi' : 'icon-shalou', pid: '                                    ', id: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      })
      var b = {}

      var m = {}

      var p = {
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa": intl.formatMessage({
          id: 'pages.alertrule.entireTransaction',
          defaultMessage: 'Entire Transaction',
        })
      }
      var s = {}
      res.data.forEach((r) => {
        if (r.type == 0) {

          p[r.id] = r.name
        }
        b[r.id] = r.name
        m[r.id] = r
        s[r.id] = false
      })


      setProcesses(p)
      setShow(s)
      setFlowConf(b)
      setFlowMap(m)
      var ss = res.data.map((bb) => { return { ...bb } })
      var all = tree(ss, "                                    ", 'pid')
      setFlowTreeAll(all)





      setFlowList(res.data)

      var cc = res.data.map((cc) => { return { ...cc } })
      var f = tree(cc, "                                    ", 'pid')
      setFlowTreeFilter(f)



      var res2 = await transactionevent({
        transaction_id: {

          'field': 'transaction_id',
          'op': 'eq',
          'data': transaction_id
        }, sorter: { event_time: 'ascend' }
      })




      var res4 = await  flow({ isGetAll: true, sorter: { sort: 'ascend' } })
        var mm = {}
        res4.data.forEach((bb) => { mm[bb.id] = bb })


       
          var processMap = {}
          var td = 0
          var e, s
          var info
          try {
            info = getDurationInfo(res2.data, mm)

            e = new Date(info.ee.event_time).getTime()
            s = new Date(info.se.event_time).getTime()



            if (currentRow_?.status == 0) {

              if (!info.isEnd) {
                e = new Date().getTime()
              }


              td = (e - s) / 1000
            } else {

              e = new Date(currentRow_.end_of_transaction).getTime()
              td = currentRow_.total_duration
            }


            setTotalDuration(td)

          } catch (e) {

          }


          var eventTree_ = {}



          var tmap = {}
          res2.data.forEach((a, index) => {

            var obj = processMap[a.flow_pid]
            if (!obj) {
              obj = { duration: 0, process_duration: 0, status: 0, event_count: 0, eventArr: [], start_date: null }
            }
            obj.eventArr.push(a)




            tmap[a.id] = a



            var next = res2.data[index + 1]
            if (next) {

              if (next.flow_pid != a.flow_pid) {

                obj.process_duration = parseInt(((new Date(res2.data[index + 1].event_time)).getTime() - (new Date(a.event_time)).getTime()) / 1000 + "")
              }
            }

            processMap[a.flow_pid] = obj





            if (!eventTree_[a.flow_pid]) {
              eventTree_[a.flow_pid] = []
            }
            eventTree_[a.flow_pid].push(a)





          })
          setTransactioneventMap(tmap)
          setTransactioneventList(res2.data)


          setEventTree(eventTree_)


          for (var k in processMap) {
            var ps = processMap[k].eventArr[0]
            var es = processMap[k].eventArr[processMap[k].eventArr.length - 1]


            processMap[k].duration = ((new Date(es.event_time)).getTime() - (new Date(ps.event_time)).getTime()) / 1000

            if (currentRow_?.status == 0 && currentRow_?.flow_id == k && !info.isEnd) {
              processMap[k].duration = ((new Date()).getTime() - (new Date(ps.event_time)).getTime()) / 1000
            }


            processMap[k].end_date = es.event_time     //moment(new Date(es.event_time)).format('DD/MMMM/YYYY HH:mm')

            processMap[k].start_date = ps.event_time  //  moment(new Date(ps.event_time)).format('DD/MMMM/YYYY HH:mm')

            processMap[k].event_count = processMap[k].eventArr.length
          }


          processMap["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"] = { duration: td, start_date: new Date(s), end_date: new Date(e) }
          setProcessMap(processMap)

         





       
     



     

    })();




    alertrule({

      organization_id: {
        'field': 'organization_id',
        'op': 'in',
        'data': organization_id
      },
      tab: {
        'field': 'tab',
        'op': 'eq',
        'data': tab
      }, transaction_id: {
        'field': 'transaction_id',
        'op': 'eq',
        'data': transaction_id
      }
    }).then((res) => {
      var b = {}
      var c = []

      var d = {}

     
      res.data.forEach((r) => {



        if (r.type != 1) {
          if (!b[r.flow_id]) {
            b[r.flow_id] = []
          }

          b[r.flow_id].push(r)
        } else {
          setCollapsed(false)
          c.push(r)
        }







        d[r.flow_id + "_" + r.flow_id_to] = b[r.flow_id] + " -> " + b[r.flow_id_to]

      })
      for (var i in b) {
        b[i] = b[i].sort((a, b) => {
          var sa = (a.amber_hours || 0) * 60 + (a.amber_mins || 0) + (a.red_hours || 0) * 60 + (a.red_mins || 0)
          var sb = (b.amber_hours || 0) * 60 + (b.amber_mins || 0) + (b.red_hours || 0) * 60 + (b.red_mins || 0)

          return sa - sb
        })

      }




      setEvents(d)

      setAlertruleProcessMap(b)

      var cc = c.sort(function (a, b) {
        return flowMap[a.flow_id]?.sort - flowMap[b.flow_id]?.sort
      })
      setAlertruleEventList(cc)


    });


    getAlertBytransactionId({
      tab: {
        'field': 'tab',
        'op': 'eq',
        'data': tab
      },
      organization_id: {
        'field': 'organization_id',
        'op': 'in',
        'data': organization_id
      },
      transaction_id: {

        'field': 'transaction_id',
        'op': 'eq',
        'data': transaction_id
      }
    }).then((res) => {
      var map = {}


      res.data.forEach((a) => {

        if (a.alertrule_type != 1) {
          if (!map[a.flow_id]) {
            map[a.flow_id] = { amber: 0, red: 0 }
          }
          if (a.type == 0) {
            map[a.flow_id].amber++
          } else {
            map[a.flow_id].red++
          }

        } else {
          if (!map['b2e']) {

            map['b2e'] = []
          }

          map['b2e'].push(a)
        }


      })
      setTransactionAlert(map)




    });



    //setTransaction_id(transaction_id)
    handlegetFlowFilter = (f: any) => {




      setFlowList((flowList) => {



        var fidMap = {}
        var arr = flowList.map((a) => {
          return a
        });

        var ss = arr.map((bb) => { return { ...bb } })
        var all = tree(ss, "                                    ", 'pid')
        setFlowTreeAll(all)

        if (f && f.length > 0) {

          var s = { ...show }

          arr.forEach((a) => {
            if (a.pid && f.some((c) => {
              return c == a.id
            })) {

              s[a.pid] = true
              fidMap[a.pid] = true
            }



          })

          setShow(s)
          for (var k in fidMap) {

            f.push(k)
          }

          arr = arr.filter((a) => {
            return f.some((b) => {

              return a.id == b
            })
          })

          arr.push({
            name: currentRow?.status == 1 ? 'Entire Duration' : 'Current Duration', icon: 'icon-daojishi', pid: '                                    ', id: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
          })
        }




        arr = tree(arr, "                                    ", 'pid')
        setFlowTreeFilter(arr)


        return flowList
      })



    }


   


    transactioneventlog({
      transaction_id: {

        'field': 'transaction_id',
        'op': 'eq',
        'data': transaction_id
      }, sorter: { created_at: 'descend' }
    }).then((res) => {
      var eventLogMap = {}
      res.data.forEach((tel) => {



        if (!eventLogMap[tel.transaction_event_id]) {
          eventLogMap[tel.transaction_event_id] = []

        }
        eventLogMap[tel.transaction_event_id].push(tel)

        setEventLogMap(eventLogMap)
      })


    })



    const getFilterOfTimestamps = async () => {

      filterOfTimestamps({
        user_id: {
          'field': 'user_id',
          'op': 'eq',
          'data': currentUser?.id
        }, type: {
          'field': 'type',
          'op': 'eq',
          'data': 0
        }
      }).then((res) => {

        var m = new Map()
        res.data = res.data.map((b) => {

          m.set(b.id, b)
          var a = {}
          a.value = b.id
          a.label = <span><FormOutlined onClick={() => {
            handleModalOpen(true);

          }} /> {b.name} </span>
          return a
        })
        res.data.push({ value: 'add', label: 'Select/create new timestamp filter' })
        setFilterOfTimestampsList(res.data)
        setFilterOfTimestampsMap(m)

      });
    }
    handleget = getFilterOfTimestamps
    getFilterOfTimestamps()


    

    

    return () => {

    };
  },
    [tab, organization_id]
  );

  var color = {
    'icon-daojishimeidian': '#70AD47',
    'icon-matou': '#70AD47',
    'icon-habor': '#70AD47',
    'icon-zhuanyunche': '#70AD47',
    'icon-matou1': '#70AD47',
    'icon-daojishi': '#70AD47'
  }

  return (<div
    style={{
      background: '#F5F7FA',
    }}
  >

    <PageContainer

      header={{
        title: "Transaction - E" + currentRow?.eos_id

      }}



    >


      {access.transactions_list_tab() && <ProCard
        className="my-tab"
        // title={<div className="my-font-size" style={{ height: 14, lineHeight: '14px', fontSize: 12 }}>{tab == 'Terminal' ? 'This transaction is reflective of my own Terminal threshold alerts.' : 'This transaction is reflective of my customer threshold alerts'}</div>}
        headStyle={{ height: 14, lineHeight: '14px', fontSize: 12 }}

        tabs={{
          type: 'card',
          //tabPosition,
          activeKey: tab,
          items: [
            {
              label: <div title={"This transaction is reflective of " + currentUser?.company_name + " threshold alerts"}> {currentUser?.company_name}</div>,
              key: 'Self',
              children: null,
            },
            {
              label: <div title="This transaction is reflective of Others’s threshold alerts">Others</div>,
              key: 'Others',
              children: null,
            }
          ],
          onChange: (key) => {
            setTab(key);
            if (key == "Others") {



             
             
              setOrganization_id(currentUser?.accessible_organization.filter((a) => {
                return a != currentUser?.company_id

              }))
             

            } else {

              
              setOrganization_id([currentUser?.company_id])
            }

            
          },
        }}
      />}
      {currentUser?.role_type == "Super" && <ProFormSelect label="Organization" valueEnum={organizationList}
        width={isMP ? "lg" : 300}
        name="threshold_organization_id"

        //placeholder="Option to filter by organisation to view threshold alerts raised by different organisation on the system"
        fieldProps={
          {
            notFoundContent: <Empty />,
            onChange: (a) => {

              setOrganization_id(a)
            },
            dropdownMatchSelectWidth: isMP ? true : false,
            mode: 'multiple',
            showSearch: false,
            multiple: true

          }} />}

      <FilterForm
        onSubmit={async (value) => {
          value.id = currentFilter?.id
          var success
          if (isAdd) {
            success = await handleAdd(value);
          } else {
            success = await handleUpdate(value);
          }

          if (success) {
            handleModalOpen(false);

            handleget()

            setCurrentFilter(undefined);

          }
        }}

        onApply={async (value) => {
          value.id = currentRow?.id
          handlegetFlowFilter(value.value)
          handleModalOpen(false);
          setCurrentFilter(value);


        }}
        onDelete={async (value) => {
          handleRemove([currentFilter], (success) => {
            if (success) {
              handleModalOpen(false);
              setSelectValue(null)
              handleget()
              handlegetFlowFilter([])
            }

          })

        }}
        onCancel={() => {
          handleModalOpen(false);

        }}
        createModalOpen={createModalOpen}
        values={currentFilter || {}}
      />


      <ProCard ghost={true} className="my-ant-descriptions-row" style={{ marginBlockStart: 8 }} wrap={isMP ? true : false} gutter={8}>
        <ProCard
          colSpan={isMP ? 24 : 12}
          style={{ backgroundColor: "#d2faf5" }}
          layout="center"
          title={"General Information"}
          wrap={true}
          bordered
        >

          <ProCard ghost={true} >
            <ProDescriptions colon={false} contentStyle={{ fontSize: 16 }} columns={columns1 as ProDescriptionsItemProps<any>[]} dataSource={currentRow} labelStyle={{ fontSize: '18px', color: "#333", fontWeight: 500, lineHeight: "18px", padding: 0 }} layout="vertical" className="my-descriptions-item"
              column={isMP ? 1 : 3} >

            </ProDescriptions>
          </ProCard>

          <ProCard ghost={true}>


            <ProCard ghost={true} >
              <SvgIcon className="my-font-size" style={{ fontSize: 40 }} type="icon-lunchuan" />
            </ProCard>

            <ProCard ghost={true} style={{ marginLeft: 20 }} colSpan={24} >
              <ProDescriptions colon={false} style={{ display: "inline-block" }} contentStyle={{ fontSize: 16, textAlign: 'center' }} columns={columns2 as ProDescriptionsItemProps<any>[]} dataSource={currentRow} labelStyle={{ fontSize: '18px', lineHeight: "18px", color: "#333", fontWeight: 500 }} layout="vertical" className="my-descriptions-item"
                column={isMP ? 2 : 2} >

              </ProDescriptions>
            </ProCard>


          </ProCard>

          <ProCard ghost={true} >
            <ProCard ghost={true} >
              <SvgIcon className="my-font-size" style={{ fontSize: 40 }} type="icon-terminal" />
            </ProCard>

            <ProCard ghost={true} style={{ marginLeft: 20 }} colSpan={24} >
              <ProDescriptions colon={false} style={{ display: "inline-block" }} contentStyle={{ fontSize: 16 }} columns={columns3 as ProDescriptionsItemProps<any>[]} dataSource={currentRow} labelStyle={{ fontSize: '18px', color: "#333", lineHeight: "18px", fontWeight: 500 }} layout="vertical" className="my-descriptions-item"
                column={isMP ? 2 : 2} >

              </ProDescriptions>
            </ProCard>


          </ProCard>


        </ProCard>
        <ProCard
          colSpan={isMP ? 24 : 12}
          style={{ height: '100%', backgroundColor: "#d2faf5", marginTop: isMP ? 10 : 0 }}
          layout="center"
          title={"Products"}
          wrap={true}
          bordered
        >

          <ProCard ghost={true}>
            <ProDescriptions colon={false} contentStyle={{ marginTop: 0 }} columns={columns4 as ProDescriptionsItemProps<any>[]} dataSource={currentRow} labelStyle={{ fontSize: '12px', color: "#333", fontWeight: 500, lineHeight: "18px" }} layout="vertical" className="my-descriptions-item"
              column={isMP ? 1 : 2} >

            </ProDescriptions>
          </ProCard>


          <ProCard ghost={true}  >
            <ProCard ghost={true}  >
              <SvgIcon className="my-font-size" style={{ fontSize: 40 }} type="icon-huowu1" />
            </ProCard>

            <ProCard ghost={true} colSpan={24} style={{ marginLeft: 20 }} >
              <ProDescriptions colon={false} style={{ display: "inline-block" }} contentStyle={{ marginTop: 0 }} columns={columns5 as ProDescriptionsItemProps<any>[]} dataSource={currentRow} labelStyle={{ fontSize: '12px', color: "#333", fontWeight: 500, lineHeight: "18px" }} layout="vertical" className="my-descriptions-item"
                column={isMP ? 1 : 1} >

              </ProDescriptions>
            </ProCard>


          </ProCard>
        </ProCard>










      </ProCard>







      {!isMP && (<ProCard ghost={true} style={{ marginBlockStart: 16 }} ><div style={{ paddingRight: 20, width: '100%', height: 'auto', overflow: 'auto', padding: "10px", backgroundColor: "#FFF" }}>

        <div style={{ width: 2300 }}>


          <div style={{ position: 'relative', float: 'left', zIndex: 1, textAlign: 'left', marginRight: 10 }}>

            <div style={{ position: 'relative', zIndex: 1, fontSize: '14px', lineHeight: '14px', color: "#808080", height: 28, }}>Processes</div>
            <div style={{ position: 'relative', zIndex: 1, height: '40px', }}>

            </div>
            <div style={{ fontSize: '14px', height: 35, lineHeight: '35px', color: "#808080" }}>
              Duration
            </div>
            <div style={{ fontSize: '14px', height: 35, lineHeight: '35px', color: "#808080" }}>
              Start Time
            </div>
            <div style={{ fontSize: '14px', height: 35, lineHeight: '35px', color: "#808080" }}>
              End Time
            </div>
            <div style={{ fontSize: '14px', height: 35, lineHeight: '35px', color: "#808080" }} onClick={() => {
              setThresholdExpand(!thresholdExpand)
            }}>
              Threshold <DownCircleOutlined rotate={thresholdExpand ? 180 : 0} />
            </div>


          </div>
          {flowTreeAll.map((e, i) => {

            var p = processMap[e.id]
            var arArr = alertruleProcessMap[e.id]

            return [
              <div style={{ position: 'relative', float: 'left', zIndex: 1, textAlign: 'center', cursor: 'pointer', width: '10%' }} onClick={() => {
                var a = { ...show }
                a[e.id] = true
                setShow(a)

                window.scrollTo(0, document.getElementById(e.id + "_")?.getBoundingClientRect().top || 0)

              }}>


                <div style={{ position: 'absolute', zIndex: 0, top: 47, left: i == 0 ? '50%' : 0, width: (i == 0 || i == 4) ? '50%' : (i == 5 ? 0 : '100%'), height: 2, backgroundColor: '#d2d2d2', overflow: 'hidden', }}></div>
                <div style={{ position: 'relative', zIndex: 1, fontSize: '14px', height: 28, lineHeight: '14px', color: "#333", fontWeight: "bold" }}>{e.name}</div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  {e.id != "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" && (<span className="my-font-size" style={{
                    display: "inline-block",
                    color: "#fff",
                    width: '40px',
                    height: '40px',
                    fontSize: "30px",
                    backgroundColor: p ? (p.event_count > 0 ? transactionAlert[e.id] ? (transactionAlert[e.id].red > 0 ? "red" : "#DE7E39") : color[e.icon] : "#595959") : "#595959",
                    borderRadius: '50%',
                    textAlign: 'center',
                    lineHeight: '40px'
                  }}>

                    <SvgIcon type={e.icon} />
                  </span>)
                  }


                  {e.id == "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" && (
                    <div style={{ height: 40 }}>
                      <span className="my-font-size" style={{

                        display: "inline-block",
                        color: "#fff",
                        width: '40px',
                        height: '40px',
                        fontSize: "28px",
                        backgroundColor: transactionAlert[e.id] ? (transactionAlert[e.id].red > 0 ? "red" : "#DE7E39") : (currentRow?.status == 1 ? color[e.icon] : "#595959"),
                        borderRadius: '50%',
                        textAlign: 'center',
                        lineHeight: '40px'
                      }}>
                        <SvgIcon type={e.icon} />

                      </span>
                    </div>

                  )}

                </div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: "#333", height: 35, lineHeight: "35px" }}>
                  {p ? getTimeStr(p.duration) : ""}
                </div>


                <div className="my-font-size" style={{ fontSize: '18px', color: "#333", height: 35, lineHeight: "35px" }}>
                  {p ? moment(p.start_date).format('DD/MMMM/YYYY HH:mm') : ""}
                </div>
                <div className="my-font-size" style={{ fontSize: '18px', color: "#333", height: 35, lineHeight: "35px" }}>
                  {p ? moment(p.end_date).format('DD/MMMM/YYYY HH:mm') : ""}
                </div>

                <div style={{ fontSize: '12px', lineHeight: "35px", height: thresholdExpand ? 'auto' : 30, overflow: 'hidden' }}>

                  {arArr && arArr.map((ar) => {

                    return (<div style={{ display: 'flex' }} onClick={(ev) => { ev.stopPropagation(); setCurrentAlertruleRow(ar); setShowDetail(true) }}>


                      <Threshold hours={ar.amber_hours} opacity={ar.amber ? 1 : 0.3} mins={ar.amber_mins} type="amber" size={10} /> &nbsp;

                      <Threshold hours={ar.red_hours} mins={ar.red_mins} opacity={ar.red ? 1 : 0.3} type="red" size={10} /></div>)
                  })
                  }

                </div>



              </div>,


              e.id != "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" ?
                (<div style={{ width: '4.5%', position: 'relative', float: 'left', textAlign: 'center', display: i >= flowTreeAll.length - 2 ? "none" : "block" }}>
                  <div style={{ position: 'absolute', zIndex: 0, top: 47, width: '100%', height: 2, backgroundColor: '#d2d2d2', overflow: 'hidden', }}></div>
                  <div style={{ position: 'relative', marginTop: '41px', fontSize: "16px", zIndex: 1 }}>

                    {p && p.process_duration > 0 && (<SvgIcon style={{ color: "#d2d2d2" }} type={'icon-map-link-full'} />)}

                  </div>
                  <div style={{ fontSize: '12px' }}>
                    {p && p.process_duration > 0 ? getTimeStr(p.process_duration) : ""}
                  </div>
                </div>) : null


            ]


          })
          }


          <Tooltip open={tooltipOpen} onOpenChange={(open) => { setTooltipOpen(!access.canBlockchain() ? open : false) }} title="Blockchain details inaccessible based on the rights provided to this account. Please contact the administrator of the system for more details" color={"#FF4D00"} key={"#FF4D00"}>



            <div style={{ position: 'relative', cursor: "pointer", float: 'left', zIndex: 1, width: '250px', textAlign: 'center' }} onClick={() => {

              if (!access.canBlockchain()) {
                // message.error("Blockchain details inaccessible based on the rights provided to this account. Please contact the administrator of the system for more details");
                return
              }


              history.push(`/transaction/blockchainIntegration?transaction_id=` + currentRow?.id, { validateData: validateData });

            }}>

              <div style={{ position: 'relative', zIndex: 1, fontSize: '14px', height: 25, color: "#333" }}></div>
              <div style={{ position: 'relative', zIndex: 1, height: '30px', }}>

                {validateStatus == 1 ? (<Spin />) :
                  <Badge count={validateStatus == 3 ? <ExclamationCircleFilled style={{ color: 'red' }} /> : 0}>


                    <span style={{
                      display: "inline-block",
                      color: "#fff",
                      width: '30px',
                      height: '30px',
                      fontSize: "20px",
                      backgroundColor: validateStatus >= 2 ? "#5000B9" : "#666",
                      borderRadius: '50%',
                      textAlign: 'center',
                      lineHeight: '30px'
                    }}>

                      <SvgIcon type={"icon-a-outline-polygon-matic"} />

                    </span>
                  </Badge>
                }

              </div>
              <div style={{ fontSize: '10px', width: "100%" }}>
                {validateStatus == 3 ? "Timestamps not validated on blockchain" : (validateStatus == 2 ? "Timestamps uploaded and validated on Polygon blockchain" : "Timestamps to be uploaded to Polygon blockchain")}
              </div>

            </div>
          </Tooltip>
        </div></div></ProCard>)}






      {isMP && (<ProCard ghost={true} style={{ marginBlockStart: 16 }}><div style={{ width: '100%', height: 'auto', overflow: 'auto', padding: "10px", backgroundColor: "#FFF" }}>
        <div style={{ position: 'relative', float: 'left', zIndex: 1, textAlign: 'left', marginRight: 10, width: '100%' }}>
          <div style={{ float: 'left', width: 1, height: 40 }}>

          </div>
          <div style={{ position: 'relative', zIndex: 1, marginLeft: 0, fontSize: '14px', color: "#808080", width: '250px', float: 'left' }}>
            Processes
          </div>

          <div style={{ fontSize: '14px', color: "#808080", float: 'left' }}>
            Duration
          </div>

        </div>
        {flowTreeAll.map((e, i) => {

          var p = processMap[e.id]
          var arArr = alertruleProcessMap[e.id]
          return <div style={{ position: 'relative' }} >
            {i < 5 && <div style={{ position: 'absolute', zIndex: 0, left: 20, height: (i == 0 || i == 4) ? '50%' : '100%', top: (i == 0) ? '50%' : 0, width: 1, backgroundColor: '#d2d2d2', overflow: 'hidden', }}></div>}

            <div style={{ position: 'relative', float: 'left', zIndex: 1, textAlign: 'left', width: '100%' }}>


              <div style={{ position: 'relative', zIndex: 1, float: 'left' }}>

                {e.id != "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" && (
                  <span className="my-font-size" style={{
                    display: "inline-block",
                    color: "#fff",
                    width: '40px',
                    height: '40px',
                    fontSize: "30px",
                    backgroundColor: p ? (p.event_count > 0 ? transactionAlert[e.id] ? (transactionAlert[e.id].red > 0 ? "red" : "#DE7E39") : color[e.icon] : "#595959") : "#595959",
                    borderRadius: '50%',
                    textAlign: 'center',
                    lineHeight: '40px'
                  }}>

                    <SvgIcon type={e.icon} />
                  </span>)}


                {e.id == "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" && (
                  <span className="my-font-size" style={{

                    display: "inline-block",
                    color: "#fff",
                    width: '40px',
                    height: '40px',
                    fontSize: "28px",
                    backgroundColor: currentRow?.status == 1 ? (transactionAlert[e.id] ? (transactionAlert[e.id].red > 0 ? "red" : "#DE7E39") : color[e.icon]) : "#595959",
                    borderRadius: '50%',
                    textAlign: 'center',
                    lineHeight: '40px'
                  }}>
                    <SvgIcon type={e.icon} />

                  </span>

                )}
              </div>
              <div style={{ position: 'relative', marginLeft: 5, height: '40px', lineHeight: '40px', width: '200px', zIndex: 1, float: 'left', fontSize: '12px', color: "#333", fontWeight: "bold" }}>{e.name}</div>


              {e.id != "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" && (
                <div style={{ position: 'relative', marginLeft: 5, height: '40px', lineHeight: '40px', zIndex: 1, float: 'left', fontSize: '12px', color: "#333", fontWeight: "bold" }}>{p ? getTimeStr(p.duration) : ""}</div>)}







            </div>


            <div style={{ fontSize: '10px', lineHeight: '20px', width: '80%', marginLeft: 40, display: "inline-block" }}>


              {p ? moment(p.start_date).format('DD/MMMM/YYYY HH:mm') : ""}<br />

              {p ? moment(p.end_date).format('DD/MMMM/YYYY HH:mm') : ""}

            </div>

            {arArr && arArr.length > 0 && <div style={{ fontSize: '10px', lineHeight: '20px', width: '80%', marginLeft: 40, display: "inline-block" }}>

              {arArr && arArr.map((ar) => {

                return (<div style={{ display: 'flex' }} onClick={(ev) => { ev.stopPropagation(); setCurrentAlertruleRow(ar); setShowDetail(true) }}> <Threshold hours={ar.amber_hours} opacity={ar.amber ? 1 : 0.3} mins={ar.amber_mins} type="amber" size={10} /> &nbsp;

                  <Threshold hours={ar.red_hours} opacity={ar.red ? 1 : 0.3} mins={ar.red_mins} type="red" size={10} /></div>)
              })
              }
            </div>}



            {p && p.process_duration > 0 && <div style={{ height: '30px', position: 'relative', float: 'left', width: '100%' }}>

              <div style={{ position: 'relative', marginLeft: '19px', fontSize: "14px", height: 20, lineHeight: '20px', zIndex: 1 }}>
                {p && p.process_duration > 0 && (<SvgIcon style={{ color: "#d2d2d2" }} type={'icon-map-connect-full'} />)}

                <span style={{ display: 'inline-block', height: 20, marginLeft: 5, lineHeight: '20px', fontSize: "14px" }}>  {p && p.process_duration > 0 ? getTimeStr(p.process_duration) : ""}</span>
              </div>

            </div>}


          </div>


        })
        }


        <Tooltip open={tooltipOpen} onOpenChange={(open) => { setTooltipOpen(!access.canBlockchain() ? open : false) }} title="Blockchain details inaccessible based on the rights provided to this account. Please contact the administrator of the system for more details" color={"#FF4D00"} key={"#FF4D00"}>

          <div style={{ position: 'relative', float: 'left', zIndex: 1, textAlign: 'center', width: '100%' }} onClick={() => {

            if (!access.canBlockchain()) {
              //message.error("Blockchain details inaccessible based on the rights provided to this account. Please contact the administrator of the system for more details");
              return
            }

            history.push(`/transaction/blockchainIntegration?transaction_id=` + currentRow?.id, { validateData: validateData });

          }}>


            <div style={{ position: 'relative', zIndex: 1, float: 'left', marginLeft: '5px' }}>
              {validateStatus == 1 ? (<Spin size="large" />) :
                <Badge count={validateStatus == 3 ? <ExclamationCircleFilled style={{ color: 'red' }} /> : 0}>
                  <span style={{
                    display: "inline-block",
                    color: "#fff",
                    width: '30px',
                    height: '30px',
                    fontSize: "20px",
                    backgroundColor: validateStatus >= 2 ? "#5000B9" : "#666",
                    borderRadius: '50%',
                    textAlign: 'center',
                    lineHeight: '30px'
                  }}>

                    <SvgIcon type={"icon-a-outline-polygon-matic"} />
                  </span></Badge>}
            </div>
            <div style={{ position: 'relative', height: '40px', lineHeight: '40px', zIndex: 1, float: 'left', fontSize: '14px', color: "#333", fontWeight: "bold" }}>{''}</div>
            <div style={{ fontSize: '14px', float: 'left', height: '40px', lineHeight: '40px', color: "#333" }}>

            </div>
            <div style={{ fontSize: '10px', float: 'left', color: validateStatus == 2 ? "#67C23A" : "#808080", height: '40px', marginLeft: '5px', textAlign: "left", lineHeight: '20px', width: '80%' }}>
              {validateStatus == 3 ? "Timestamps not validated on blockchain" : (validateStatus == 2 ? "Timestamps uploaded and validated on Polygon blockchain" : "Timestamps to be uploaded to Polygon blockchain")}
            </div>
          </div>

        </Tooltip>

      </div></ProCard>)}

      <ProCard collapsed={collapsed} colSpan={24} style={{ marginBlockStart: 16 }} bodyStyle={{ padding: '16px', overflow: isMP ? 'auto' : 'hidden' }} wrap title={<div style={{ fontWeight: '500', fontSize: 14 }}> Threshold Applied (Between 2 Events) </div>} extra={< EyeOutlined onClick={() => {
        setCollapsed(!collapsed);
      }} style={{ fontWeight: 'normal', fontSize: 14 }} />} bordered headerBordered>

        {alertruleEventList.length == 0 || !transactionAlert && (<Empty />)}


        {transactionAlert && transactionAlert.b2e && alertruleEventList.map((th) => {
          //return JSON.stringify(th)






          return twoEvenbox(th)


        })

        }








      </ProCard>


      <ProCard style={{ marginBlockStart: 16 }} title={<><span>Detailed Timestamps</span>&nbsp; {!isMP ? <>
        <Button onClick={() => {
          setSelectValue(null)
          setCurrentFilter(null);
          setIsAdd(false)
          handlegetFlowFilter("")
        }} style={{ cursor: 'pointer', marginTop: isMP ? 10 : 0 }}>Reset View </Button>&nbsp;
        <Button onClick={() => {
          var a = { ...show }
          for (var i in a) {
            a[i] = true
          }

          setShow(a)
        }} style={{ cursor: 'pointer', marginTop: isMP ? 10 : 0 }}>Expand All</Button>&nbsp;
        <Button onClick={() => {
          var a = { ...show }
          for (var i in a) {
            a[i] = false
          }
          setShow(a)
        }} style={{ cursor: 'pointer', marginTop: isMP ? 10 : 0 }}>Collapse All</Button>&nbsp;</> : null}</>}
        bordered headerBordered={isMP ? false : true}
        extra={<Select
          style={{ width: 200 }}
          allowClear={true}
          value={selectValue}
          onClear={() => {
            setSelectValue(null)
            setCurrentFilter(null);
            setIsAdd(false)
            handlegetFlowFilter("")
          }}
          dropdownMatchSelectWidth={isMP ? true : false}
          onSelect={(a) => {
            setSelectValue(a)
            if (a == "add") {
              setCurrentFilter(null);
              setIsAdd(true)
              handleModalOpen(true);
            }
            else {
              setCurrentFilter(filterOfTimestampsMap.get(a));
              handlegetFlowFilter(filterOfTimestampsMap.get(a).value)
              setIsAdd(false)
            }



          }}
          placeholder={'Filter By: Timestamps'}

          options={filterOfTimestampsList}
        />}
      >
        {isMP && <div className="my-fond-size" style={{ height: 50, marginTop: -20 }}>
          <ProCard ghost={true} bodyStyle={{ height: 50 }} gutter={10}>
            <ProCard ghost={true}>
              <Button size="small" onClick={() => {
                setSelectValue(null)
                setCurrentFilter(null);
                setIsAdd(false)
                handlegetFlowFilter("")
              }} style={{ cursor: 'pointer', marginTop: isMP ? 10 : 0 }}>Reset View </Button>


            </ProCard>
            <ProCard ghost={true}>
              <Button size="small" onClick={() => {
                var a = { ...show }
                for (var i in a) {
                  a[i] = true
                }

                setShow(a)
              }} style={{ cursor: 'pointer', marginTop: isMP ? 10 : 0 }}>Expand All</Button>
            </ProCard>
            <ProCard ghost={true}>
              <Button size="small" onClick={() => {
                var a = { ...show }
                for (var i in a) {
                  a[i] = false
                }
                setShow(a)
              }} style={{ cursor: 'pointer', marginTop: isMP ? 10 : 0 }}>Collapse All</Button>
            </ProCard>
          </ProCard>
        </div>}

        <div style={{ backgroundColor: "#fff", position: 'relative', width: '100%', height: 'auto' }}>




          <Steps
            direction={'vertical'}

            size="default"
            style={{ float: 'left', width: isMP ? '100%' : '70%', marginLeft: isMP ? '0px' : '25%', marginTop: 0, maxWidth: '100%' }}
          >

            {flowTreeFilter.map((e, index1) => {

              var p = processMap[e.id]
              var ar = alertruleProcessMap[e.id]

              var filterEventTree = eventTree[e.id]?.filter((h) => {

                return e.children.some((m) => {
                  return m.id == h.flow_id
                })

              })


              flowTreeAll.forEach((nn) => {
                if (nn.id == e.id) {

                  e.children_length = nn.children?.length


                }
              })
              var arr = [



                <Step className={p ? "title-hover" : ""} style={{ cursor: p ? 'pointer' : 'initial' }} status="wait" icon={


                  <span id={e.id + "_"} onClick={() => {
                    show[e.id] = !show[e.id]
                    setShow({ ...show })

                  }} className="my-font-size" style={{
                    display: "inline-block",
                    fontSize: "22px",
                    color: "#fff",
                    width: '33px',
                    height: '33px',
                    backgroundColor: e.id == 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' ? "#fff" : (p ? (p.event_count > 0 ? transactionAlert[e.id] ? (transactionAlert[e.id].red > 0 ? "red" : "#DE7E39") : color[e.icon] : "#595959") : "#595959"),
                    borderRadius: '50%',
                    textAlign: 'center',
                    lineHeight: '33px'
                  }}>
                    <SvgIcon style={{ color: '#fff' }} type={e.icon} />
                  </span>



                } title={<div style={{ color: e.id == 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' ? "#fff" : "#333" }} onClick={() => {
                  show[e.id] = !show[e.id]
                  setShow({ ...show })

                }}> <span className="my-title" style={{ fontWeight: 500, display: 'block', width: '100%', textAlign: "left", fontSize: "16px", lineHeight: "20px", height: 20 }}>{e.name}</span>

                  {p && <span className="my-title" style={{ display: 'block', width: '100%', textAlign: "left", fontSize: "16px", lineHeight: "20px" }}>
                    <span style={{ display: 'inline-block', width: 50 }}>Start:</span>{isMP && <br />}{p ? <> <CalendarOutlined /> {moment(new Date(p?.start_date)).format('DD MMMM YYYY')} &nbsp;&nbsp;<FieldTimeOutlined /> {moment(new Date(p?.start_date)).format('h:mm a')}  </> : "-"} </span>}
                  {p && <span className="my-title" style={{ display: 'block', width: '100%', textAlign: "left", fontSize: "16px", lineHeight: "20px" }}>
                    <span style={{ display: 'inline-block', width: 50 }}>End:</span>{isMP && <br />}{p ? <> <CalendarOutlined />  {moment(new Date(p?.end_date)).format('DD MMMM YYYY')} &nbsp;&nbsp;<FieldTimeOutlined /> {moment(new Date(p?.end_date)).format('h:mm a')}  </> : "-"} </span>}


                  {p && <span className="my-title" style={{ display: 'block', textAlign: "left", fontSize: "14px", lineHeight: "20px", height: 20 }}>Process Duration: {p ? getTimeStr(p.duration) : "0h 00m"}</span>}</div>} description={<div >{

                    filterEventTree?.map((c, index2) => {
                      if (!show[e.id]) {

                        return
                      }
                      // c.name=flowConf[c.flow_id]
                      var te = c


                      var ne = filterEventTree[index2 + 1]
                      if (ne) {

                        c.event_duration = getTimeStr((new Date(ne.event_time).getTime() - new Date(c.event_time).getTime()) / 1000)

                      } else {



                        var filterEventTree2 = eventTree[flowTreeFilter[index1 + 1].id]?.filter((h) => {

                          return flowTreeFilter[index1 + 1].children.some((m) => {
                            return m.id == h.flow_id
                          })

                        })
                        var pne = filterEventTree2?.[0]


                        if (pne) {
                          c.event_duration = getTimeStr((new Date(pne.event_time).getTime() - new Date(c.event_time).getTime()) / 1000)
                        }


                      }




                      var event_duration = null

                      if (c.event_duration) {

                        event_duration = c.event_duration



                      }





                      var greyShowMap = {}

                      var whiteShowMap = {}

                      if (!sss[c.code]) {
                        return <div>{c.code}</div>
                      }

                      sss[c.code].grey.forEach((az) => {

                        greyShowMap[az] = true

                      })

                      sss[c.code].white.forEach((az) => {

                        whiteShowMap[az] = true

                      })

                      var whiteCount = 0

                      for (var cc in whiteShowMap) {
                        whiteCount++
                      }


                      return (

                        (te || access.canAdmin) && <ProCard

                          style={{ marginLeft: 10, marginBottom: 25, width: '100%' }}
                          title={

                            <div className="timestamp-hover" style={{ marginLeft: 22, fontSize: "12px", display: 'inline-block', width: '100%', border: "1px solid #d2d2d2", padding: "5px", borderRadius: '5px', fontWeight: 'normal' }}>

                              <div> &nbsp;{c.name}     {eventLogMap[c.id] && <div style={{ position: "absolute", right: 0, top: 10 }}><HistoryOutlined onClick={(ev) => {


                                ev.stopPropagation();
                                setCurrentAlertruleRow(ar);


                                setCurrentEvent(c)


                                setCurrentEventLogList(eventLogMap[c.id]);







                                var logObjArr = []
                                var newList = [c, ...eventLogMap[c.id]]


                                newList.forEach((aa, index) => {
                                  if (index < newList.length && aa && newList[index + 1]) {
                                    var diff = getDiff(aa, newList[index + 1])

                                    if (diff) {
                                      for (var m in diff) {
                                        if (m != 'created_at' && m != 'updated_at' && m != 'id' && m != 'event_duration') {
                                          var obj = {
                                            TypeOfData: keyNameMap[m],
                                            PreviousValue: newList[index + 1][m],
                                            NewValue: aa[m],
                                            UpdateTime: aa.created_at
                                          }
                                          logObjArr.push(obj)
                                        }

                                      }
                                    }


                                  }

                                })

                                seLogObjArr(logObjArr)














                                setShowLog(true)
                              }} /></div>}</div>
                              <div> <div>
                                &nbsp;<CalendarOutlined /> {moment(te?.event_time).format('DD MMMM YYYY')} &nbsp;&nbsp;&nbsp;&nbsp;<FieldTimeOutlined /> {moment(te?.event_time).format('h:mm a')}
                                <ProDescriptions layout={isMP ? "vertical" : "horizontal"} labelStyle={{ fontSize: '12px', paddingLeft: 2 }} className="my-descriptions-item-white" column={isMP ? 1 : 2} >







                                  {whiteShowMap['terminal_id'] && <ProDescriptions.Item label={<div><Iconfy className="white-icon" icon="ic:round-factory" /> Terminal Name</div>} valueType="text" >
                                    {currentRow.terminal_name}
                                  </ProDescriptions.Item>}

                                  {whiteShowMap['jetty_id'] && <ProDescriptions.Item label={<div><Iconfy className="white-icon" icon="game-icons:mooring-bollard" /> Jetty Name</div>} valueType="text" >
                                    {currentRow.jetty_name}
                                  </ProDescriptions.Item>}

                                  {whiteShowMap['agent'] && <ProDescriptions.Item label={<div><Iconfy className="white-icon" icon="material-symbols:support-agent" /> Agent</div>} valueType="text" >
                                    {currentRow?.agent}
                                  </ProDescriptions.Item>}

                                  {whiteShowMap['product_name'] && <ProDescriptions.Item label={<div><SvgIcon className="white-icon" type="icon-huowu" /> Product Name</div>} valueType="text" >
                                    {te?.product_name}
                                  </ProDescriptions.Item>}
                                  {whiteShowMap['product_quantity_in_bls_60_f'] && <ProDescriptions.Item label={<div><Iconfy className="white-icon" icon="material-symbols:weight" /> Product Quantity (Bls-60-f)</div>} valueType="text">
                                    {te?.product_quantity_in_bls_60_f}
                                  </ProDescriptions.Item>}

                                  {whiteShowMap['order_no'] && <ProDescriptions.Item label={<div><Iconfy className="white-icon" icon="mdi:account-tie-hat" /> Pilotage ID</div>} valueType="text">
                                    {te?.order_no}
                                  </ProDescriptions.Item>}
                                  {whiteShowMap['location_from'] && <ProDescriptions.Item labelStyle={{ paddingLeft: 2 }} label={<div><Iconfy className="white-icon" icon="gis:route-start" /> Location From</div>} valueType="text">
                                    {te?.location_from}
                                  </ProDescriptions.Item>}
                                  {whiteShowMap['location_to'] && <ProDescriptions.Item label={<div><Iconfy className="white-icon" icon="gis:route-start" hFlip={true} /> Location To</div>} valueType="text">
                                    {te?.location_to}
                                  </ProDescriptions.Item>}

                                  {whiteShowMap['delay_reason'] && <ProDescriptions.Item label={<div><Iconfy className="white-icon" icon="game-icons:duration" />Delay Reason</div>} valueType="text">
                                    {te?.delay_reason}
                                  </ProDescriptions.Item>}

                                  {whiteShowMap['delay_duration'] && <ProDescriptions.Item label={<div><Iconfy className="white-icon" icon="game-icons:duration" />Delay Duration</div>} valueType="text">
                                    {te?.delay_duration}
                                  </ProDescriptions.Item>}


                                  {whiteShowMap['work_order_id'] && <ProDescriptions.Item label={<div><Iconfy className="white-icon" icon="carbon:service-id" />Work Order ID</div>} valueType="text" >
                                    {te?.work_order_id}
                                  </ProDescriptions.Item>}

                                  {whiteShowMap['tank_number'] && <ProDescriptions.Item label={<div><SvgIcon className="white-icon" type="icon-noun-storage-tank-1511795" />Tank ID</div>} valueType="text">
                                    {te?.tank_number}
                                  </ProDescriptions.Item>}

                                  {whiteShowMap['work_order_sequence_number'] && <ProDescriptions.Item label={<div><Iconfy className="white-icon" icon="bx:list-ol" />Sequence No</div>} valueType="text">
                                    {te?.work_order_sequence_number}
                                  </ProDescriptions.Item>}
                                </ProDescriptions>
                              </div>


                              </div>

                              <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', backgroundColor: '#fff', borderRadius: 5, left: -70, top: 5, fontWeight: 400 }}> {event_duration}</div>
                              </div>

                            </div>

                          }
                          collapsibleIconRender={({ collapsed: buildInCollapsed }: { collapsed: boolean }) =>
                            <div style={{ display: 'inline-block', position: 'absolute', width: 20, color: "#d5d5d5", marginLeft: -22.5 }}>< AimOutlined style={{ background: "#fff", position: 'absolute', top: 25 }} /></div>
                          }
                          collapsible={true}
                          defaultCollapsed
                          bodyStyle={{ marginTop: 28, marginLeft: 20 }}
                          onCollapse={(collapse) => { }}
                          extra={
                            (!te ? <Access accessible={access.canAdmin} fallback={<div></div>}><Button
                              size="small"
                              onClick={(e) => {
                                addTransactionevent({ transaction_id: currentRow?.id, flow_id: c.id })
                                message.success(<FormattedMessage
                                  id="pages.modifySuccessful"
                                  defaultMessage="Modify is successful"
                                />);
                              }}
                            >
                              Execution Event
                            </Button></Access> : "")
                          }
                        >

                          <ProDescriptions layout={isMP ? "vertical" : "horizontal"} labelStyle={{ fontSize: '12px' }} className="my-descriptions-item" editable={false ? {

                            onSave: async (keypath, newInfo, oriInfo) => {
                              var d = { id: te?.id, ...newInfo }

                              updateTransactionevent(d)
                              message.success(<FormattedMessage
                                id="pages.modifySuccessful"
                                defaultMessage="Modify is successful"
                              />);
                              return true;
                            },
                          } : null}
                            column={isMP ? 1 : 2} >







                            <ProDescriptions.Item label="IMO Number" dataIndex="imo_number" valueType="text" >
                              {currentRow?.imo_number}
                            </ProDescriptions.Item>
                            <ProDescriptions.Item label="Vessel Name" dataIndex="vessel_name" valueType="text">
                              {currentRow?.vessel_name}
                            </ProDescriptions.Item>
                            <ProDescriptions.Item label="Arrival ID" dataIndex="arrival_id" valueType="text">
                              {currentRow?.arrival_id}
                            </ProDescriptions.Item>

                            {greyShowMap['vessel_size_dwt'] && <ProDescriptions.Item label="Vessel Size (dwt)" dataIndex="vessel_size_dwt" valueType="text" >
                              {currentRow?.vessel_size_dwt}
                            </ProDescriptions.Item>}



                            {greyShowMap['arrival_id_status'] && <ProDescriptions.Item label="Arrival Status" dataIndex="arrival_id_status" valueType="text">
                              {te?.arrival_id_status}
                            </ProDescriptions.Item>}
                            {greyShowMap['work_order_status'] && <ProDescriptions.Item label="Work order Status" dataIndex="work_order_status" valueType="text">
                              {te?.work_order_status}
                            </ProDescriptions.Item>}

                            {greyShowMap['work_order_sequence_number_status'] && <ProDescriptions.Item label="Sequence Status" dataIndex="work_order_sequence_number_status" valueType="text">
                              {te?.work_order_sequence_number_status}
                            </ProDescriptions.Item>}


                            {greyShowMap['work_order_operation_type'] && <ProDescriptions.Item label="Operation Type " dataIndex="work_order_operation_type" valueType="text">
                              {te?.work_order_operation_type}
                            </ProDescriptions.Item>}

                            {greyShowMap['work_order_surveyor'] && <ProDescriptions.Item label="Surveyor Name " dataIndex="work_order_surveyor" valueType="text">
                              {te?.work_order_surveyor}
                            </ProDescriptions.Item>}



                            {greyShowMap['product_quantity_in_l_obs'] && <ProDescriptions.Item label="Product Quantity (l-obs)" dataIndex="product_quantity_in_l_obs" valueType="text">
                              {te?.product_quantity_in_l_obs}
                            </ProDescriptions.Item>}
                            {greyShowMap['product_quantity_in_l_15_c'] && <ProDescriptions.Item label="Product Quantity (l-15-c)" dataIndex="product_quantity_in_l_15_c" valueType="text">
                              {te?.product_quantity_in_l_15_c}
                            </ProDescriptions.Item>}
                            {greyShowMap['product_quantity_in_mt'] && <ProDescriptions.Item label="Product Quantity (mt)" dataIndex="product_quantity_in_mt" valueType="text">
                              {te?.product_quantity_in_mt}
                            </ProDescriptions.Item>}
                            {greyShowMap['product_quantity_in_mtv'] && <ProDescriptions.Item label="Product Quantity (mtv)" dataIndex="product_quantity_in_mtv" valueType="text">
                              {te?.product_quantity_in_mtv}
                            </ProDescriptions.Item>}
                            {greyShowMap['product_quantity_in_bls_60_f'] && <ProDescriptions.Item label="Product Quantity (Bls-60-f)" dataIndex="product_quantity_in_bls_60_f" valueType="text">
                              {te?.product_quantity_in_bls_60_f}
                            </ProDescriptions.Item>}




                          </ProDescriptions>
                        </ProCard>

                      )

                    })


                  }</div>} />
              ]


              if (e.id == "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa") {
                if (show["a7332eb0-d3c9-11ed-a0d9-55ccaa27cc37"]) {

                  return arr
                } else {
                  return null
                }

              } else {
                return arr
              }
              //return arr



            })
            }


          </Steps>
        </div>

      </ProCard>








      <div style={{ marginTop: 15, paddingLeft: 0 }} className="re-back">
        <Button
          style={isMP ? { width: '100%' } : null}
          type="default"
          onClick={async () => {
            history.back()
          }}
        >Return To Previous Page</Button>
        {/*<Button
          style={isMP ? { width: '100%', marginTop: 15 } : { marginLeft:10 }}
          type="primary"
          onClick={async () => {
            history.push('/Dashboard')
          }}
        >Return to dashboard</Button>*/ }
      </div>


      <Drawer
        width={isMP ? '100%' : 600}
        open={showDetail}
        onClose={() => {
          setCurrentAlertruleRow(undefined);
          setShowDetail(false);
        }}
        closable={isMP ? true : false}
      >
        {currentAlertruleRow?.id && (
          <ProDescriptions<TransactionListItem>
            column={isMP ? 1 : 1}
            title={"Threhold Summary - " + currentAlertruleRow?.alertrule_id}
            request={async () => ({
              data: currentAlertruleRow || {},
            })}
            params={{
              id: currentAlertruleRow?.id,
            }}
            columns={columnsAlertrule as ProDescriptionsItemProps<TransactionListItem>[]}
          />
        )}
      </Drawer>



      <Drawer
        width={isMP ? '100%' : 600}
        style={{ overflow: 'auto' }}
        open={showLog}
        onClose={() => {

          setShowLog(false);
        }}
        closable={isMP ? true : false}
      >







        {[currentEvent].map((c) => {
          if (!c) {
            return
          }


          var greyShowMap = {}

          var whiteShowMap = {}
          sss[c.code].grey.forEach((az) => {

            greyShowMap[az] = true

          })

          sss[c.code].white.forEach((az) => {





            whiteShowMap[az] = true

          })
          var te = c
          return (<><div className="page_title" style={{ paddingBottom: "20px", }}>{c.name}</div><div style={{ backgroundColor: '#fff', padding: '10px', marginBottom: "10px" }}>

            <div className="page_title" style={{ marginBottom: 10 }}>Current Data Displayed</div>

            <ProDescriptions labelStyle={{ fontSize: '12px' }} size="small" bordered={true} className="my-descriptions-item" column={isMP ? 1 : 1} >

              {whiteShowMap['event_time'] && <ProDescriptions.Item label="Event Time" dataIndex="event_time" valueType="text">
                {moment(te?.event_time).format('YYYY-MM-DD HH:mm:ss')}
              </ProDescriptions.Item>
              }

              {whiteShowMap['terminal_id'] && <ProDescriptions.Item label="Terminal Name" valueType="text" >
                {currentRow.terminal_name}
              </ProDescriptions.Item>}

              {whiteShowMap['jetty_id'] && <ProDescriptions.Item label="Jetty Name" valueType="text" >
                {currentRow.jetty_name}
              </ProDescriptions.Item>}

              {whiteShowMap['agent'] && <ProDescriptions.Item label="Agent" valueType="text" >
                {currentRow?.agent}
              </ProDescriptions.Item>}

              {whiteShowMap['product_name'] && <ProDescriptions.Item label="Product Name" valueType="text" >
                {te?.product_name}
              </ProDescriptions.Item>}
              {whiteShowMap['product_quantity_in_bls_60_f'] && <ProDescriptions.Item label="Product Quantity (Bls-60-f)" valueType="text">
                {te?.product_quantity_in_bls_60_f}
              </ProDescriptions.Item>}

              {whiteShowMap['order_no'] && <ProDescriptions.Item label="Pilotage ID" valueType="text">
                {te?.order_no}
              </ProDescriptions.Item>}
              {whiteShowMap['location_from'] && <ProDescriptions.Item label="Location From" valueType="text">
                {te?.location_from}
              </ProDescriptions.Item>}
              {whiteShowMap['location_to'] && <ProDescriptions.Item label="Location To" valueType="text">
                {te?.location_to}
              </ProDescriptions.Item>}

              {whiteShowMap['delay_reason'] && <ProDescriptions.Item label="Delay Reason" valueType="text">
                {te?.delay_reason}
              </ProDescriptions.Item>}

              {whiteShowMap['delay_duration'] && <ProDescriptions.Item label="Delay Duration" valueType="text">
                {te?.delay_duration}
              </ProDescriptions.Item>}


              {whiteShowMap['work_order_id'] && <ProDescriptions.Item label="Work order ID" valueType="text" >
                {te?.work_order_id}
              </ProDescriptions.Item>}

              {whiteShowMap['tank_number'] && <ProDescriptions.Item label="Tank ID" valueType="text">
                {te?.tank_number}
              </ProDescriptions.Item>}

              {whiteShowMap['work_order_sequence_number'] && <ProDescriptions.Item label="Sequence No" valueType="text">
                {te?.work_order_sequence_number}
              </ProDescriptions.Item>}

              <ProDescriptions.Item label="IMO Number" dataIndex="imo_number" valueType="text" >
                {currentRow?.imo_number}
              </ProDescriptions.Item>
              <ProDescriptions.Item label="Vessel Name" dataIndex="vessel_name" valueType="text">
                {currentRow?.vessel_name}
              </ProDescriptions.Item>
              <ProDescriptions.Item label="Arrival ID" dataIndex="arrival_id" valueType="text">
                {currentRow?.arrival_id}
              </ProDescriptions.Item>

              {greyShowMap['vessel_size_dwt'] && <ProDescriptions.Item label="Vessel Size (dwt)" dataIndex="vessel_size_dwt" valueType="text" >
                {currentRow?.vessel_size_dwt}
              </ProDescriptions.Item>}



              {greyShowMap['arrival_id_status'] && <ProDescriptions.Item label="Arrival Status" dataIndex="arrival_id_status" valueType="text">
                {te?.arrival_id_status}
              </ProDescriptions.Item>}
              {greyShowMap['work_order_status'] && <ProDescriptions.Item label="Work order Status" dataIndex="work_order_status" valueType="text">
                {te?.work_order_status}
              </ProDescriptions.Item>}

              {greyShowMap['work_order_sequence_number_status'] && <ProDescriptions.Item label="Sequence Status" dataIndex="work_order_sequence_number_status" valueType="text">
                {te?.work_order_sequence_number_status}
              </ProDescriptions.Item>}


              {greyShowMap['work_order_operation_type'] && <ProDescriptions.Item label="Operation Type " dataIndex="work_order_operation_type" valueType="text">
                {te?.work_order_operation_type}
              </ProDescriptions.Item>}

              {greyShowMap['work_order_surveyor'] && <ProDescriptions.Item label="Surveyor Name " dataIndex="work_order_surveyor" valueType="text">
                {te?.work_order_surveyor}
              </ProDescriptions.Item>}



              {greyShowMap['product_quantity_in_l_obs'] && <ProDescriptions.Item label="Product Quantity (l-obs)" dataIndex="product_quantity_in_l_obs" valueType="text">
                {te?.product_quantity_in_l_obs}
              </ProDescriptions.Item>}
              {greyShowMap['product_quantity_in_l_15_c'] && <ProDescriptions.Item label="Product Quantity (l-15-c)" dataIndex="product_quantity_in_l_15_c" valueType="text">
                {te?.product_quantity_in_l_15_c}
              </ProDescriptions.Item>}
              {greyShowMap['product_quantity_in_mt'] && <ProDescriptions.Item label="Product Quantity (mt)" dataIndex="product_quantity_in_mt" valueType="text">
                {te?.product_quantity_in_mt}
              </ProDescriptions.Item>}
              {greyShowMap['product_quantity_in_mtv'] && <ProDescriptions.Item label="Product Quantity (mtv)" dataIndex="product_quantity_in_mtv" valueType="text">
                {te?.product_quantity_in_mtv}
              </ProDescriptions.Item>}
              {greyShowMap['product_quantity_in_bls_60_f'] && <ProDescriptions.Item label="Product Quantity (Bls-60-f)" dataIndex="product_quantity_in_bls_60_f" valueType="text">
                {te?.product_quantity_in_bls_60_f}
              </ProDescriptions.Item>}
            </ProDescriptions>


            <div className="page_title" style={{ marginBottom: 10, marginTop: 10 }}>Data Change History</div>

            <div style={{ height: 500 }}>
              <ProTable
                pagination={false}
                search={false}
                options={false}
                dataSource={logObjArr} columns={[
                  {
                    title: "Type Of Data",
                    dataIndex: "TypeOfData"
                  },
                  {
                    title: "Previous Value",
                    dataIndex: "PreviousValue",
                    render: (dom, entity) => {
                      if (entity.TypeOfData == "Event Time") {
                        return moment(dom).format('YYYY-MM-DD HH:mm:ss')
                      } else {
                        return dom
                      }

                    }
                  },
                  {
                    title: "New Value",
                    dataIndex: "NewValue",
                    render: (dom, entity) => {
                      if (entity.TypeOfData == "Event Time") {
                        return moment(dom).format('YYYY-MM-DD HH:mm:ss')
                      } else {
                        return dom
                      }

                    }
                  },
                  {
                    title: "Update Time",
                    dataIndex: "UpdateTime",
                    render: (dom, entity) => {
                      return moment(dom).format('YYYY-MM-DD HH:mm:ss')
                    }
                  },

                ]} />
            </div>



          </div></>)


        })}
      </Drawer>



    </PageContainer>
  </div>)
}
export default Detail;
