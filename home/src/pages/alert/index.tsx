import RcResizeObserver from 'rc-resize-observer';

import { addAlert, removeAlert, alert as getAlert, updateAlert } from './service';
import { fieldSelectData } from '@/services/ant-design-pro/api';
import { updateTransaction } from '../transaction/service';
import { getInitialState } from '../../app';
import { Empty } from 'antd';
import { PlusOutlined, SearchOutlined, ExclamationCircleOutlined, FormOutlined, DeleteOutlined, PrinterOutlined, EllipsisOutlined, FileExcelOutlined, SwapOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import { ActionType, ProColumns, ProDescriptionsItemProps, ProCard } from '@ant-design/pro-components';
import { AlertList, AlertListItem } from './data.d';
import { flow } from '../system/flow/service';
import { alertrule } from '../alertrule/service';
import { SvgIcon, ResizeObserverDo } from '@/components'
import FrPrint from "../../components/FrPrint";
import { exportCSV } from "../../components/export";
import FileSaver from "file-saver";
import { organization } from '../system/company/service';
import { history } from '@umijs/max';
import numeral from 'numeral';
import moment from 'moment'
import { jetty } from '../system/jetty/service';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  ProFormTextArea,
  ProFormInstance,
  Search,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, useLocation, formatMessage, useModel } from '@umijs/max';
import { Button, Drawer, Input, message, Modal, ConfigProvider, FloatButton, Popover, Pagination } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import { tree, isPC } from "@/utils/utils";
import { useAccess, Access } from 'umi';

import MPSort from "@/components/MPSort";

//MP
import { InfiniteScroll, List, NavBar, Space, DotLoading } from 'antd-mobile'
import { before, forEach } from 'lodash';
const { confirm } = Modal;

/**
 *  Delete node
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: AlertListItem[]) => {



  const hide = message.loading(<FormattedMessage
    id="pages.deleting"
    defaultMessage="Deleting"
  />);
  if (!selectedRows) return true;

  confirm({
    title: 'Delete record?',
    icon: <ExclamationCircleOutlined />,
    content: 'The deleted record cannot be restored. Please confirm!',
    onOk() {
      try {
        removeAlert({
          id: selectedRows.map((row) => row.id),
        });
        hide();
        message.success(<FormattedMessage
          id="pages.deletedSuccessfully"
          defaultMessage="Deleted successfully and will refresh soon"
        />);
        return true;
      } catch (error) {
        hide();
        message.error(<FormattedMessage
          id="pages.deleteFailed"
          defaultMessage="Delete failed, please try again"
        />);
        return false;
      }
    },
    onCancel() { },
  });


};

/**
 * @en-US Update node
 *
 * @param fields
 */
const handleUpdate = async (fields: Partial<any>) => {
  const hide = message.loading(<FormattedMessage
    id="pages.modifying"
    defaultMessage="Modifying"
  />);
  try {

    await updateAlert({ remarks: fields['remarks'], id: fields.id });
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




const TableList: React.FC = () => {
  /**
   * @en-US Pop-up window of new window
   *  */
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  /**
   * @en-US The pop-up window of the distribution update window
   * */
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<AlertListItem>();
  const [selectedRowsState, setSelectedRows] = useState<AlertListItem[]>([]);

  const [work_order_idData, setWork_order_idData] = useState<any>({});
  const [paramsText, setParamsText] = useState<string>('');
  const [organizationList, setOrganizationList] = useState<any>([]);
  const [organizationMap, setOrganizationMap] = useState<any>({});
  const [flowConf, setFlowConf] = useState<any>({});
  const [flowTree, setFlowTree] = useState<any>([]);
  const [processes, setProcesses] = useState<any>([]);
  const [events, setEvents] = useState<any>([]);
  const [jetty_nameData, setJetty_nameData] = useState<any>({});
  const [isMP, setIsMP] = useState<boolean>(!isPC());
  const [organization_id, setTerminal_id] = useState<any>(useLocation()?.state?.organization_id);
  const [dateArr, setDateArr] = useState<any>(useLocation()?.state?.dateArr);
  const [status, setStatus] = useState<any>(useLocation()?.state?.status);
  const [showNoRead, setShowNoRead] = useState<any>(useLocation()?.state?.showNoRead);
  const [statusData, setStatusData] = useState<any>({});

  const [flow_id, setFlow_id] = useState<any>(useLocation()?.state?.flow_id);


  const [alert_id, setAlert_id] = useState<any>(useLocation()?.state?.alert_id);
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};

  const [MPPagination, setMPPagination] = useState<any>({})


  const [work_order_sequence_numberData, setWork_order_sequence_numberData] = useState<any>({})

  const [alert_idData, setAlert_idData] = useState<any>({})
  const [processesData, setProcessesData] = useState<any>({});
  const [product_nameData, setProduct_nameData] = useState<any>({})

  const [eventsData, setEventsData] = useState<any>({});

  const [tab, setTab] = useState(useLocation()?.state?.tab || 'Self');


  /**
   * @en-US International configuration
   * */
  const intl = useIntl();
  const access = useAccess();
  const [printModalVisible, handlePrintModalVisible] = useState<boolean>(false);
  const [moreOpen, setMoreOpen] = useState<boolean>(false);
  const formRef = useRef<ProFormInstance>();
  const [resizeObj, setResizeObj] = useState({ searchSpan: 12, tableScrollHeight: 300 });
  //--MP start
  //const MPSearchFormRef = useRef<ProFormInstance>();

  const [showMPSearch, setShowMPSearch] = useState<boolean>(false);




  const getOrganizationName = () => {
    if (access.canAdmin) {
      return 'Organization'
    }
    if (!(access.alert_list_tab() || access.canAdmin)) {
      return 'Customer'
    }
    if (access.alert_list_tab()) {
      return 'Customer'
    }
  }
  const right = (
    <div style={{ fontSize: 24 }}>
      <Space style={{ '--gap': '16px' }}>
        <SearchOutlined onClick={e => { setShowMPSearch(!showMPSearch) }} />
        <Popover onOpenChange={(v) => { setMoreOpen(v) }} open={moreOpen} placement="bottom" title={""} content={<div><Button type="primary" style={{ width: "100%" }} key="print"
          onClick={() => {
            setMoreOpen(false)
            handlePrintModalVisible(true)
          }}
        ><PrinterOutlined /> <FormattedMessage id="pages.Print" defaultMessage="Print" />
        </Button>, <Button style={{ width: "100%" }} type="primary" key="out"
          onClick={() => exportCSV(data, columns)}
        ><FileExcelOutlined /> <FormattedMessage id="pages.CSV" defaultMessage="CSV" />
          </Button>

        </div>} trigger="click">
          <EllipsisOutlined />


        </Popover>
      </Space>
    </div>
  )

  const onFormSearchSubmit = (a) => {


    setData([]);


    setShowMPSearch(!showMPSearch)
    setCurrentPage(1)

    getData(1)
  }
  const InfiniteScrollContent = ({ hasMore }: { hasMore?: boolean }) => {
    return (
      <>
        {hasMore ? (
          <>
            <span>Loading</span>
            <DotLoading />
          </>
        ) : (
          <span>{data.length} items in total</span>
        )}
      </>
    )
  }
  const back = () => { }
  const [data, setData] = useState<string[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [MPSorter, setMPSorter] = useState<any>({});

  async function getData(page, pageSize) {

    var sorter = {}
    await setMPSorter((sorter_) => {
      sorter = sorter_
      return sorter_
    })


    var tab1 = ''
    await setTab((tab_) => {
      tab1 = tab_
      return tab_
    })

    var f = {}
    for (var k in formRef.current?.getFieldsValue()) {
      if (formRef.current?.getFieldsValue()[k] != undefined) {
        f[k] = formRef.current?.getFieldsValue()[k]
      }

    }
    var d = {
      ...{
        "current": page,
        "pageSize": pageSize || 3

      }, ...f, sorter
    }
    if (showNoRead) {
      d.showNoRead = showNoRead
    }


    d.tab = {
      'field': 'tab',
      'op': 'eq',
      'data': tab1
    }

    const append = await getAlert(d)


    if (showNoRead) {

      var a = await getInitialState()
      setInitialState(a)
    }
    setMPPagination({ total: append.total })
    setData(append.data)



  }





  useEffect(() => {



    flow({ sorter: { sort: 'ascend' } }).then((res) => {
      var b = { "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa": "Entire Duration" }
      var p = { "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa": "Entire Duration" }


      res.data.forEach((r) => {
        if (r.type == 0) {

          p[r.id] = r.name
        }
        b[r.id] = r.name
      })
      setFlowConf(b)
      setProcesses(p)


      var treeData = tree(res.data, "                                    ", 'pid')
      setFlowTree(treeData)

      alertrule({
        tab: {
          'field': 'tab',
          'op': 'eq',
          'data': tab
        },
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



        if (status && status.length > 0) {


          formRef.current?.setFieldValue('t.status', status)
        }
        if (alert_id) {

          formRef.current?.setFieldValue('alert_id', alert_id)
        }
        if (organization_id) {

          formRef.current?.setFieldValue('organization_id', organization_id)
        }
        if (dateArr && dateArr[0] && dateArr[1]) {
          formRef.current?.setFieldValue('t.start_of_transaction', dateArr)
        }

        if (flow_id) {
          if (flow_id != 'b2e') {
            formRef.current?.setFieldValue('flow_id', [flow_id])
          } else {
            var arr = []
            for (var i in d) {
              arr.push(i)
            }

            formRef.current?.setFieldValue('flow_id_to', arr)
          }








        }

        setTimeout(() => {

          formRef.current?.submit();
        }, 200)



      });
    });




    organization({ sorter: { name: 'ascend' } }).then((res) => {
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










    });



  }, [tab]);


  const [imo_numberData, setImo_numberData] = useState<any>({});
  const columns: ProColumns<AlertListItem>[] = [

    {
      title: (
        <FormattedMessage
          id="pages.alertrule.eee"
          defaultMessage="Entire Transaction And Processes"
        />
      ),
      dataIndex: 'flow_id',
      hideInTable: true,
      hideInDescriptions: true,
      valueEnum: processesData,



      fieldProps: {
        notFoundContent: <Empty />,
        dropdownMatchSelectWidth: isMP ? true : false,
        width: '300px',
        mode: 'multiple',
        maxTagCount: 0,
        maxTagPlaceholder: (omittedValues) => {
          return omittedValues.length + " Selected"
        },
        onFocus: () => {
          fieldSelectData({ model: "Alert", value: '', field: 'flow_id', Op: true, where: { tab: { "eq": tab } } }).then((res) => {

            for (var i in res.data) {
              res.data[i] = processes[i]
            }


            setProcessesData(res.data)
          })
        },
        onSearch: (newValue: string) => {

          fieldSelectData({ model: 'Alert', value: newValue, field: 'flow_id', Op: true, where: { tab: { "eq": tab } } }).then((res) => {
            for (var i in res.data) {
              res.data[i] = processes[i]
            }
            setProcessesData(res.data)
          })

        },
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
          id="pages.alertrule.eee"
          defaultMessage="Between Two Events"
        />
      ),
      dataIndex: 'flow_id_to',
      hideInTable: true,
      width: 200,
      hideInDescriptions: true,
      valueEnum: eventsData,
      fieldProps: {
        notFoundContent: <Empty />,
        dropdownMatchSelectWidth: isMP ? true : false,
        width: '300px',
        mode: 'multiple',
        maxTagCount: 0,
        maxTagPlaceholder: (omittedValues) => {
          return omittedValues.length + " Selected"
        },
        onFocus: () => {
          fieldSelectData({ model: "Alert", value: '', field: 'flow_id_to', Op: true, where: { tab: { "eq": tab } } }).then((res) => {

            for (var i in res.data) {
              res.data[i] = events[i]
            }


            setEventsData(res.data)
          })
        },
        onSearch: (newValue: string) => {

          fieldSelectData({ model: 'Alert', value: newValue, field: 'flow_id_to', Op: true, where: { tab: { "eq": tab } } }).then((res) => {
            for (var i in res.data) {
              res.data[i] = events[i]
            }
            setEventsData(res.data)
          })

        },
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
      title: <FormattedMessage id="pages.role.xxx" defaultMessage="Alert ID" />,
      dataIndex: 'alert_id',
      valueEnum: alert_idData,
      width: 130,
      sorter: true,
      defaultSortOrder: 'descend',
      search: {
        transform: (value) => {
          if (value && value.length > 0) {
            return {
              'name': {
                'field': 'alert_id',
                'op': 'in',
                'data': value
              }
            }
          }

        }
      },
      fieldProps: {
        multiple: true,
        mode: 'multiple',
        maxTagCount: 0,
        maxTagPlaceholder: (omittedValues) => {
          return omittedValues.length + " Selected"
        },
        notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
        showSearch: true,
        allowClear: true,
        onFocus: () => {
          fieldSelectData({ model: "Alert", value: '', field: 'alert_id', Op: true, where: { tab: { "eq": tab } } }).then((res) => {
            setAlert_idData(res.data)
          })
        },
        onSearch: (newValue: string) => {

          fieldSelectData({ model: 'Alert', value: newValue, field: 'alert_id', Op: true, where: { tab: { "eq": tab } } }).then((res) => {
            setAlert_idData(res.data)
          })

        }
      },
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              history.push(`/transaction/detail`, { transaction_id: entity.transaction_id });

              
            }}
          >
            {"A" + entity.alert_id}
          </a>
        );

      }
    },



    {
      title: <FormattedMessage id="pages.alertrule.xxx" defaultMessage="Threshold Triggered Time" />,
      dataIndex: 'created_at',
      width: 200,
      hideInSearch: true,

      sorter: true,
      valueType: 'dateTime',
    },
    {
      title: <FormattedMessage id="pages.alertrule.type" defaultMessage="Threshold Type" />,
      dataIndex: 'alertrule_type',
      sorter: true,
      hideInSearch: true,

      renderPrint: (dom, entity) => {
        if (dom == 0) {
          return "Single Process"
        } else if (dom == 1) {
          return "Between Two Events"
        } else if (dom == 2) {
          return "Entire Transaction"
        }

      },
      valueEnum: {
        0: { text: <FormattedMessage id="pages.alertrule.singleProcess" defaultMessage="Single Process" /> },
        1: { text: <FormattedMessage id="pages.alertrule.betweenTwoEvents" defaultMessage="Between Two Events" /> },
        2: { text: <FormattedMessage id="pages.alertrule.entireTransaction" defaultMessage="Entire Transaction" /> },
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
      width: 300,
      hideInSearch: true,
      valueEnum: flowConf,
      render: (dom, entity) => {
        if (entity.alertrule_type == 0) {
          return flowConf[entity.flow_id]
        } else if (entity.alertrule_type == 1) {
          return flowConf[entity.flow_id] + " -> " + flowConf[entity.flow_id_to]
        } else {
          return '-'
        }

      }

    },
    {
      title: <FormattedMessage id="pages.alertrule.xxx" defaultMessage="Alert Raised" />,
      dataIndex: 'type',
      hideInSearch: true,
      valueType: 'text',
      renderPrint: (dom, entity) => {
        if (dom == 0) {
          return "Amber"
        } else if (dom == 1) {
          return "Red"
        }

      },
      render: (dom, entity) => {

        return (<div><div style={{ display: dom == 0 ? "block" : "none" }}> <SvgIcon style={{ color: "#DE7E39" }} type="icon-yuan" /> Amber</div>
          <div style={{ display: dom == 1 ? "block" : "none" }}><SvgIcon style={{ color: "red" }} type="icon-yuan" /> Red</div></div>)
      },
    },
    {
      title: <FormattedMessage id="pages.alertrule.thresholdLimit" defaultMessage="Threshold Limit" />,
      dataIndex: 'ar.amber_hours',
      hideInSearch: true,
      valueType: 'text',
      renderPrint: (dom, entity) => {
        entity.amber_hours = entity['ar.amber_hours']
        entity.amber_mins = entity['ar.amber_mins']
        entity.red_hours = entity['ar.red_hours']
        entity.red_mins = entity['ar.red_mins']
        return (entity.amber_hours || entity.amber_mins ? ("Amber: " + (entity.amber_hours ? entity.amber_hours : '0') + "h " + (entity.amber_mins ? entity.amber_mins : '0') + "m") : "") +
          (entity.red_hours || entity.red_mins ? (" Red: " + (entity.red_hours ? entity.red_hours : '0') + "h " + (entity.red_mins ? entity.red_mins : '0') + "m") : "")

      },
      render: (dom, entity) => {
        entity.amber_hours = entity['ar.amber_hours']
        entity.amber_mins = entity['ar.amber_mins']
        entity.red_hours = entity['ar.red_hours']
        entity.red_mins = entity['ar.red_mins']
        return (<div><div style={{ display: entity.amber_hours || entity.amber_mins ? "block" : "none" }}> <SvgIcon style={{ color: "#DE7E39" }} type="icon-yuan" />{" " + (entity.amber_hours ? entity.amber_hours : '0') + "h " + (entity.amber_mins ? entity.amber_mins : '0') + "m"}</div>
          <div style={{ display: entity.red_hours || entity.red_mins ? "block" : "none" }}><SvgIcon style={{ color: "red" }} type="icon-yuan" />{" " + (entity.red_hours ? entity.red_hours : '0') + "h " + (entity.red_mins ? entity.red_mins : '0') + "m"}</div></div>)
      },
    },
    {
      title: "Total/Current Duration (in seconds)",
      dataIndex: 'total_duration',
      hideInDescriptions: true,
      hideInTable: true,
      fieldProps: {
        placeholder: ['From', 'To']
      },
      valueType: "digitRange",
      width: 200,
      sorter: true,
      render: (dom, entity) => {


        return parseInt((entity.total_duration / 3600) + "") + "h " + parseInt((entity.total_duration % 3600) / 60) + "m"





      },
      search: {
        transform: (value) => {
          if (value && value.length > 0) {
            var a = value[0] || 0
            var b = value[1] || 1000000000
            return {
              'total_duration': {
                'field': 'total_duration',
                'op': 'between',
                'data': [a, b]
              }


            }
          }

        }
      }
    },
    {
      title: "Total/Current Duration",
      dataIndex: 'total_duration',
      hideInSearch: true,
      render: (dom, entity) => {


        return parseInt((entity.total_duration / 3600) + "") + "h " + parseInt((entity.total_duration % 3600) / 60) + "m"





      }

    },
    {
      title: <FormattedMessage id="pages.alertrule.vesselSizeLimit" defaultMessage="Vessel Size Limit (DWT)" />,
      dataIndex: 'ar.vessel_size_dwt_from',
      onFilter: true,

      hideInSearch: true,
      valueType: 'text',

      render: (dom, entity) => {
        if (entity['ar.vessel_size_dwt_from'] != null && entity['ar.vessel_size_dwt_to']) {

          var valueEnum = {
            "0-25000": "GP",
            "25000-45000": "MR",
            "45000-80000": "LR1",
            "80000-120000": "AFRA",
            "120000-160000": "LR2",
            "160000-320000": "VLCC",
            "320000-1000000000": "ULCC",
          }

          return valueEnum[entity['ar.vessel_size_dwt_from'] + "-" + entity['ar.vessel_size_dwt_to']];
        } else {
          return '-'
        }

      },
    },

    {
      title: <FormattedMessage id="pages.alertrule.ee" defaultMessage="Total Nominated Quantity (Bls-60-F)" />,
      dataIndex: 't.product_quantity_in_bls_60_f',
      hideInSearch: true,
      width: 200,
      align: "center",
      valueType: 'text',
      render: (dom, entity) => {
        if (dom) {
          return numeral(dom).format('0,0')
        }

      },
    },



    {
      title: <FormattedMessage id="pages.transaction.imoNumber" defaultMessage="IMO Number" />,
      dataIndex: 't.imo_number',
      align: "center",
      sorter: true,
      valueEnum: imo_numberData,
      search: {
        transform: (value) => {
          if (value && value.length > 0) {
            return {
              't.imo_number': {
                'field': 't.imo_number',
                'op': 'in',
                'data': value
              }
            }
          }

        }
      },
      fieldProps: {
        notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
        showSearch: true,
        multiple: true,

        mode: "multiple",
        maxTagCount: 0,
        maxTagPlaceholder: (omittedValues) => {
          return omittedValues.length + " Selected"
        },
        allowClear: true,
        onFocus: () => {
          fieldSelectData({ model: "Alert", value: '', field: 't.imo_number', Op: true, where: { tab: { "eq": tab } } }).then((res) => {
            setImo_numberData(res.data)
          })
        },
        onSearch: (newValue: string) => {

          fieldSelectData({ model: "Alert", value: newValue, field: 't.imo_number', Op: true, where: { tab: { "eq": tab } } }).then((res) => {
            setImo_numberData(res.data)
          })

        }
      }
    },
    {
      title: <FormattedMessage id="pages.transaction.xxx" defaultMessage="Work Order ID" />,
      dataIndex: 'work_order_id',
      align: "center",
      sorter: true,
      valueEnum: work_order_idData,
      search: {
        transform: (value) => {
          if (value && value.length > 0) {
            return {
              'work_order_id': {
                'field': 'work_order_id',
                'op': 'in',
                'data': value
              }
            }
          }

        }
      },
      fieldProps: {
        notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
        showSearch: true,
        multiple: true,
        mode: "multiple",
        maxTagCount: 0,
        maxTagPlaceholder: (omittedValues) => {
          return omittedValues.length + " Selected"
        },
        allowClear: true,
        onFocus: () => {
          fieldSelectData({ model: "Alert", value: '', field: 'work_order_id', Op: true, where: { tab: { "eq": tab } } }).then((res) => {
            setWork_order_idData(res.data)
          })
        },
        onSearch: (newValue: string) => {

          fieldSelectData({ model: "Alert", value: newValue, field: 'work_order_id', Op: true, where: { tab: { "eq": tab } } }).then((res) => {
            setWork_order_idData(res.data)
          })

        }
      }
    },
    {
      title: <FormattedMessage id="pages.alert.xxx" defaultMessage="Sequence No" />,
      dataIndex: 'work_order_sequence_number',
      align: "center",
      sorter: true,
      valueEnum: work_order_sequence_numberData,
      search: {
        transform: (value) => {
          if (value && value.length > 0) {
            return {
              'work_order_sequence_number': {
                'field': 'work_order_sequence_number',
                'op': 'in',
                'data': value
              }
            }
          }

        }
      },
      fieldProps: {
        notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
        showSearch: true,
        multiple: true,
        mode: "multiple",
        maxTagCount: 0,
        maxTagPlaceholder: (omittedValues) => {
          return omittedValues.length + " Selected"
        },
        allowClear: true,
        onFocus: () => {
          fieldSelectData({ model: "Alert", value: '', field: 'work_order_sequence_number', Op: true, where: { tab: { "eq": tab } } }).then((res) => {
            setWork_order_sequence_numberData(res.data)
          })
        },
        onSearch: (newValue: string) => {

          fieldSelectData({ model: "Alert", value: newValue, field: 'work_order_sequence_number', Op: true, where: { tab: { "eq": tab } } }).then((res) => {
            setWork_order_sequence_numberData(res.data)
          })

        }
      }

    },
    {
      title: <FormattedMessage id="pages.alert.productType" defaultMessage="Product Type" />,
      dataIndex: 't.product_name',
      align: "center",
      valueEnum: product_nameData,
      search: {
        transform: (value) => {
          if (value && value.length > 0) {
            return {
              't.product_name': {
                'field': 't.product_name',
                'op': 'in',
                'data': value
              }
            }
          }

        }
      },
      fieldProps: {
        notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
        showSearch: true,
        multiple: true,
        mode: "multiple",
        maxTagCount: 0,
        maxTagPlaceholder: (omittedValues) => {
          return omittedValues.length + " Selected"
        },
        allowClear: true,
        onFocus: () => {
          fieldSelectData({ model: "Alert", value: '', field: 't.product_name', Op: true, where: { tab: { "eq": tab } } }).then((res) => {
            setProduct_nameData(res.data)
          })
        },
        onSearch: (newValue: string) => {

          fieldSelectData({ model: "Alert", value: newValue, field: 't.product_name', Op: true, where: { tab: { "eq": tab } } }).then((res) => {
            setProduct_nameData(res.data)
          })

        }
      }

    },


    {
      title: "Trader",
      dataIndex: 't.trader_name',
      width: 200,
      hideInSearch: true,
      sorter: true,


      render: (dom, entity) => {

        return entity['t.trader_name']
      }
    },
    {
      title: "Terminal",
      dataIndex: 't.terminal_name',
      width: 200,
      hideInSearch: true,
      sorter: true,


      render: (dom, entity) => {

        return entity['t.terminal_name']
      },
    },



    {
      title: getOrganizationName(),
      dataIndex: 'organization_id',
      hideInTable: true,

      hideInDescriptions: true,
      valueEnum: organizationMap,
      render: (dom, entity) => {

        if (access.alert_list_tab() && tab == "Self") {
          return organizationMap[entity['t.trader_id']]?.name || "-"
        }

        return organizationMap[entity.company_id]?.name || "-"

      },
      fieldProps: {
        options: organizationList,
        multiple: true,
        mode: "multiple",
        maxTagCount: 0,
        maxTagPlaceholder: (omittedValues) => {
          return omittedValues.length + " Selected"
        },
        notFoundContent: <Empty />,
      },
      search: {
        transform: (value) => {
          if (value && value.length > 0) {
            return {
              'organization_id': {
                'field': 'organization_id',
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
          id="pages.transaction.xxx"
          defaultMessage="Threshold Triggered Time"
        />
      ),

      hideInDescriptions: true,
      hideInTable: true,
      fieldProps: { style: { width: '100%' }, placeholder: ['From ', 'To '] },

      dataIndex: 'created_at',
      valueType: 'dateRange',

      search: {
        transform: (value) => {
          if (value.length > 0) {
            value[0] = moment(new Date(value[0])).format('YYYY-MM-DD') + " 00:00:00"
            value[1] = moment(new Date(value[1])).format('YYYY-MM-DD') + " 23:59:59"
            return {
              'created_at': {
                'field': 'created_at',
                'op': 'between',
                'data': value
              }

            }
          }

        }
      }



    },
    {
      title: <FormattedMessage id="pages.transaction.startOfTransaction" defaultMessage="Start Of Transaction" />,
      dataIndex: 't.start_of_transaction',

      valueType: 'date',
      hideInTable: true,
      hideInDescriptions: true,
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.transaction.status" defaultMessage="Status" />,
      dataIndex: 't.status',
      hideInTable: true,
      hideInDescriptions: true,
      fieldProps: {
        notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
        showSearch: true,
        multiple: true,
        mode: "multiple",
        maxTagCount: 0,
        maxTagPlaceholder: (omittedValues) => {
          return omittedValues.length + " Selected"
        },
        allowClear: true,
        onFocus: () => {
          fieldSelectData({ model: "Alert", value: '', field: 't.status' }).then((res) => {
            setStatusData(res.data)
          })
        },
        onSearch: (newValue: string) => {

          fieldSelectData({ model: "Alert", value: newValue, field: 't.status' }).then((res) => {
            setStatusData(res.data)
          })

        }
      },

      valueEnum: statusData,
      search: {
        transform: (value) => {

          if (value && value.length > 0) {
            return {

              't.status': {
                'field': 't.status',
                'op': 'in',
                'data': value
              }

            }
          }

        }
      },
    },
    {
      title: <FormattedMessage id="pages.transaction.jettyName" defaultMessage="Jetty Name" />,
      dataIndex: 't.jetty_name',
      sorter: true,
      valueEnum: jetty_nameData,
      fieldProps: {
        multiple: true,
        mode: "multiple",
        maxTagCount: 0,
        maxTagPlaceholder: (omittedValues) => {
          return omittedValues.length + " Selected"
        },
        onFocus: () => {
          fieldSelectData({ model: "Alert", value: '', field: 't.jetty_name', Op: true, where: { tab: { "eq": tab } } }).then((res) => {
            setJetty_nameData(res.data)
          })
        },
        onSearch: (newValue: string) => {

          fieldSelectData({ model: "Alert", value: newValue, field: 't.jetty_name', Op: true, where: { tab: { "eq": tab } } }).then((res) => {
            setJetty_nameData(res.data)
          })

        },
        notFoundContent: <Empty />,
      },
      render: (dom, entity) => {

        return entity.jetty_name


      },
      search: {
        transform: (value) => {
          if (value) {
            return {
              't.jetty_name': {
                'field': 't.jetty_name',
                'op': 'in',
                'data': value
              }
            }
          }

        }
      }
    },
    {
      title: <FormattedMessage id="pages.alert.specificProcess" defaultMessage="Remarks" />,
      dataIndex: 'remarks',
      hideInSearch: true,
      renderPrint: (dom, entity) => {

        return dom ? dom : "-"


      },
      valueType: 'textarea',
      render: (dom, record) => {

        return <div style={{ position: 'relative', width: '100%' }}><p dangerouslySetInnerHTML={{ __html: dom?.replace(/\n/g, '<br />') }} />



          {tab == "Self" && <div>
            <Access accessible={access.canAlertMod()} fallback={<div></div>}>
              <a
                title={formatMessage({ id: "pages.update", defaultMessage: "Modify" })}
                key="config"
                onClick={() => {
                  setCurrentRow(record);
                  handleUpdateModalOpen(true);




                }}
              >
                <FormOutlined style={{ fontSize: '20px' }} />

              </a>

            </Access>
          </div>}
        </div>;
      },

    },

  ];


  const customizeRenderEmpty = () => {
    var o = formRef.current?.getFieldsValue()
    var isSearch = false
    for (var a in o) {
      if (o[a]) {
        isSearch = true
      }

    }
    if (isSearch) {
      return <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />
    } else {
      return <Empty />
    }


  }







  return (
    <RcResizeObserver
      key="resize-observer"
      onResize={(offset) => {

        ResizeObserverDo(offset, setResizeObj, resizeObj)




      }}
    >

      <PageContainer className="myPage" header={{
        title: isMP ? null : < FormattedMessage id="pages.transactions.xxx" defaultMessage="Threshold Triggered Alerts" />,
        breadcrumb: {},
        extra: isMP ? null : [<Button type="primary" key="print"
          onClick={() => {
            if (selectedRowsState.length == 0) {
              message.error(<FormattedMessage
                id="pages.selectDataFirst"
                defaultMessage="Please select data first!"
              />);
              return false;
            }
            handlePrintModalVisible(true)
          }}
        ><PrinterOutlined /> <FormattedMessage id="pages.Print" defaultMessage="Print" />
        </Button>, <Button type="primary" key="out"
          onClick={() => exportCSV(selectedRowsState, columns)}
        ><FileExcelOutlined /> <FormattedMessage id="pages.CSV" defaultMessage="CSV" />
        </Button>]
      }}>

        {access.alert_list_tab() && <ProCard
          className="my-tab"
          headStyle={{ height: 14, lineHeight: '14px', fontSize: 12 }}
          tabs={{
            type: 'card',

            activeKey: tab,
            items: [
              {
                label: <div title={"Alerts related to " + currentUser?.company_name + " Threshold settings"} > {currentUser?.company_name}</div>,
                key: 'Self',
                children: null,
              },
              {
                label: <div title="This threshold alert is reflective of Others’s threshold alerts">Others</div>,
                key: 'Others',
                children: null,
              }
            ],
            onChange: (key) => {

              setTab(key);
              if (isMP) {


                getData(1)


              } else {

                actionRef.current?.reload();


              }
            },
          }}
        />}
        {!isMP && (<ConfigProvider renderEmpty={customizeRenderEmpty}> <ProTable<AlertListItem, API.PageParams>
          scroll={{ x: 2500, y: resizeObj.tableScrollHeight }}
          bordered size="small"

          className="mytable"
          editable={{ type: 'single', editableKeys: ['remarks'] }}
          actionRef={actionRef}
          formRef={formRef}
          rowKey="id"
          search={{
            layout: "vertical",
            labelWidth: 210,
            span: resizeObj.searchSpan,
            searchText: < FormattedMessage id="pages.search" defaultMessage="Search" />
          }}
          toolBarRender={() => [

          ]}
          request={async (params, sorter) => {

            var d = { ...params, sorter }
            if (showNoRead) {
              d.showNoRead = showNoRead
            }

            d.tab = {
              'field': 'tab',
              'op': 'eq',
              'data': tab
            }
            var list = await getAlert(d)
            if (showNoRead) {

              var a = await getInitialState()
              setInitialState(a)
            }

            return list
          }}
          columns={columns}


          pagination={{ size: "default", showSizeChanger: true, pageSizeOptions: [10, 20, 50, 100, 500] }}
          options={false}
          rowSelection={{
            onSelectAll: (selected, selectedRows, changeRows) => {

            },
            onChange: (_, selectedRows) => {
              setSelectedRows(selectedRows);
            },
          }}
        /></ConfigProvider >)}

        {isMP && (<>

          <NavBar backArrow={false} left={
            <MPSort columns={columns} onSort={(k) => {
              setMPSorter(k)
              getData(1)
            }} />} right={right} onBack={back}>
            {intl.formatMessage({
              id: 'pages.alert.xx',
              defaultMessage: 'Threshold Triggered Alerts',
            })}
          </NavBar>

          <div style={{ padding: '20px', backgroundColor: "#5000B9", display: showMPSearch ? 'block' : 'none' }}>
            <Search columns={columns.filter(a => !(a.hasOwnProperty('hideInSearch') && a['hideInSearch']))} action={actionRef} loading={false}

              onFormSearchSubmit={onFormSearchSubmit}

              dateFormatter={'string'}
              formRef={formRef}
              type={'form'}
              cardBordered={true}
              form={{
                submitter: {
                  searchConfig: {

                    submitText: < FormattedMessage id="pages.search" defaultMessage="Search" />,
                  }

                }
              }}

              search={{}}
              manualRequest={true}
            />
          </div>
          <List>
            {data.map((item, index) => (
              <List.Item key={index}>

                <ProDescriptions<any>
                  bordered={true}
                  size="small"
                  className="jetty-descriptions"
                  layout="horizontal"
                  column={1}
                  title={""}
                  request={async () => ({
                    data: item || {},
                  })}
                  params={{
                    id: item?.id,
                  }}
                  columns={columns as ProDescriptionsItemProps<any>[]}
                />

              </List.Item>
            ))}
          </List>

          {MPPagination.total ? <div style={{ textAlign: 'center', padding: "20px 10px 90px 10px" }}>
            <Pagination

              onChange={(page, pageSize) => {

                getData(page, pageSize)
              }}
              total={MPPagination.total}

              showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
              defaultPageSize={3}
              showSizeChanger={true}
              pageSizeOptions={[3, 20, 50, 100, 500]}
              defaultCurrent={1}
            />
          </div> : customizeRenderEmpty()}
          <FloatButton.BackTop visibilityHeight={0} />

        </>)}



        <CreateForm
          onSubmit={async (value) => {
            value.id = currentRow?.id
            const success = await handleAdd(value as AlertListItem);
            if (success) {
              handleModalOpen(false);
              setCurrentRow(undefined);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          onCancel={() => {
            handleModalOpen(false);
            if (!showDetail) {
              setCurrentRow(undefined);
            }
          }}
          createModalOpen={createModalOpen}
          values={currentRow || {}}
        />
        <UpdateForm
          onSubmit={async (value) => {
            value.id = currentRow?.id
            const success = await handleUpdate(value);
            if (success) {
              handleUpdateModalOpen(false);
              setCurrentRow(undefined);
              if (isMP) {
                setData([]);
                getData(1)
              }
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          onCancel={() => {
            handleUpdateModalOpen(false);
            if (!showDetail) {
              setCurrentRow(undefined);
            }
          }}
          updateModalOpen={updateModalOpen}
          values={currentRow || {}}
        />

        <Drawer
          width={isMP ? '100%' : 600}
          open={showDetail}
          onClose={() => {
            setCurrentRow(undefined);
            setShowDetail(false);
          }}
          closable={isMP ? true : false}
        >
          {currentRow?.name && (
            <ProDescriptions<AlertListItem>
              column={isMP ? 1 : 2}
              title={currentRow?.name}
              request={async () => ({
                data: currentRow || {},
              })}
              params={{
                id: currentRow?.name,
              }}
              columns={columns as ProDescriptionsItemProps<AlertListItem>[]}
            />
          )}
        </Drawer>

        {/* Calling the printing module */}
        <FrPrint
          title={""}
          subTitle={paramsText}
          columns={columns}
          dataSource={[...(isMP ? data : selectedRowsState)/*, sumRow*/]}
          onCancel={() => {
            handlePrintModalVisible(false);
          }}
          printModalVisible={printModalVisible}
        />
      </PageContainer>
    </RcResizeObserver>
  );
};

export default TableList;
