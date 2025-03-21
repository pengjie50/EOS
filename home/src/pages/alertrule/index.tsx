
import RcResizeObserver from 'rc-resize-observer';
import { addAlertrule, removeAlertrule, alertrule, updateAlertrule } from './service';
import { PlusOutlined, SearchOutlined, MoreOutlined, FormOutlined, DeleteOutlined, FileExcelOutlined, InfoCircleOutlined, ExclamationCircleOutlined, PrinterOutlined, EllipsisOutlined, SwapOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps, ProTableProps } from '@ant-design/pro-components';
import { AlertruleList, AlertruleListItem } from './data.d';
import { GridContent } from '@ant-design/pro-layout';
import { flow } from '../system/flow/service';
import { organization } from '../system/company/service';
import MPSort from "@/components/MPSort";
import { fieldSelectData } from '@/services/ant-design-pro/api';
import FrPrint from "../../components/FrPrint";
import moment from 'moment'

//MP
import { InfiniteScroll, List, NavBar, Space, DotLoading } from 'antd-mobile'

import { SvgIcon, ResizeObserverDo } from '@/components' 
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  ProFormDigitRange,
  ProFormTextArea,
  ProFormGroup,
  ProCard,
  ProFormTreeSelect,
  ProTable,

  ProFormInstance,
  Search
} from '@ant-design/pro-components';
import { exportCSV } from "../../components/export";
import FileSaver from "file-saver";
import { FormattedMessage, useIntl, useLocation, formatMessage, useModel } from '@umijs/max';
import { Button, Drawer, Input, message, TreeSelect, Modal, Space as SpaceA, Empty, ConfigProvider, FloatButton, Popover, Pagination } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import { useAccess, Access } from 'umi';
import { tree, isPC } from "@/utils/utils";
import numeral from 'numeral';
import { event } from '../../.umi/plugin-locale/localeExports';
const { confirm } = Modal;
/**
 * @en-US Add node
 * @param fields
 */
const handleAdd = async (fields: any) => {

  var d = { ...fields }

  if ((d.hasOwnProperty('typeArr') && d.typeArr.length > 0)) {



  } else {
    message.error(<FormattedMessage
      id="pages.aaa"
      defaultMessage="Please define threshold duration!"
    />);
    return
  }



  const hide = message.loading(<FormattedMessage
    id="pages.adding"
    defaultMessage="Adding"
  />);


  if (d.from_to) {
    d.vessel_size_dwt_from = Number(d.from_to.split("-")[0])
    d.vessel_size_dwt_to = Number(d.from_to.split("-")[1])
  }




  delete d.from_to
  try {


    await addAlertrule(d);
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

/**
 * @en-US Update node
 *
 * @param fields
 */
const handleUpdate = async (fields: Partial<AlertruleListItem>) => {



  var d = { amber_hours: null, amber_mins: null, red_hours: null, red_mins: null, ...fields }



  if (d.from_to) {

    d.vessel_size_dwt_from = Number(d.from_to.split("-")[0])
    d.vessel_size_dwt_to = Number(d.from_to.split("-")[1])
  } else {
    d.vessel_size_dwt_from = null
    d.vessel_size_dwt_to = null
  }
  if (!d.product_quantity_from) {

    d.product_quantity_from = null
    d.product_quantity_to = null


  }

  var is = false







  if (d.hasOwnProperty("amber_hours") || d.hasOwnProperty("amber_mins") || d.hasOwnProperty("red_hours") || d.hasOwnProperty("red_mins")) {

    is = true
  }







  if (!is) {
    message.error(<FormattedMessage
      id="pages.aaa"
      defaultMessage="Please enter compulsory threshold alert field for either Amber or Red!"
    />);
    return
  }



  const hide = message.loading(<FormattedMessage
    id="pages.modifying"
    defaultMessage="Modifying"
  />);
  try {
    await updateAlertrule(d);
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

const handleRemove = async (selectedRows: AlertruleListItem[], callBack: any) => {
  if (!selectedRows) return true;
  var open = true
  confirm({
    title: 'Delete threshold? ',
    open: open,
    icon: <ExclamationCircleOutlined />,
    content: 'Please note that the deleted threshold cannot be restored!',
    onOk() {


      const hide = message.loading(<FormattedMessage
        id="pages.deleting"
        defaultMessage="Deleting"
      />);
      try {
        removeAlertrule({
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
  const [currentRow, setCurrentRow] = useState<AlertruleListItem>();
  const [selectedRowsState, setSelectedRows] = useState<AlertruleListItem[]>([]);
  const [flowConf, setFlowConf] = useState<any>({});
  const [flowTree, setFlowTree] = useState<any>([]);
  const [processes, setProcesses] = useState<any>([]);
  const restFormRef = useRef<ProFormInstance>();
  const [resizeObj, setResizeObj] = useState({ searchSpan: 12, tableScrollHeight: 300, width: 0 });
  //--MP start
  const MPSearchFormRef = useRef<ProFormInstance>();
  const [printModalVisible, handlePrintModalVisible] = useState<boolean>(false);
  const [showMPSearch, setShowMPSearch] = useState<boolean>(false);
  const [isMP, setIsMP] = useState<boolean>(!isPC());
  const [paramsText, setParamsText] = useState<string>('');
  const [organizationList, setOrganizationList] = useState<any>([]);
  const [organizationMap, setOrganizationMap] = useState<any>({});

  const access = useAccess();
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [tab, setTab] = useState('Self');
  const [MPSorter, setMPSorter] = useState<any>({});
  const [moreOpen, setMoreOpen] = useState<boolean>(false);
  const [MpSortDataIndex, setMpSortDataIndex] = useState<string>('');
  const [MPPagination, setMPPagination] = useState<any>({})
  const [user_idData, setUser_idData] = useState<any>({});

  const [alertrule_idData, setAlertrule_idData] = useState<any>({});





  const [company_idData, setCompany_idData] = useState<any>({});
  const right = (
    <div style={{ fontSize: 24 }}>
      <Space style={{ '--gap': '16px' }}>
        <SearchOutlined onClick={e => { setShowMPSearch(!showMPSearch) }} />
        <Access accessible={access.canAlertruleAdd()} fallback={<div></div>}>
          {tab == 'Self' && <PlusOutlined onClick={() => { handleModalOpen(true) }} />}
        </Access>

        <Popover onOpenChange={(v) => { setMoreOpen(v) }} open={moreOpen} placement="bottom" title={""} content={<div><Button type="primary" style={{ marginRight: 10 }} key="print"
          onClick={() => {
            setMoreOpen(false)
            handlePrintModalVisible(true)
          }}
        ><PrinterOutlined /> <FormattedMessage id="pages.Print" defaultMessage="Print" />
        </Button>,<Button style={{ width: "100%", marginTop: 20 }} type="primary" key="out"
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
    delete a._timestamp;
    setMPfilter(a)
    setShowMPSearch(!showMPSearch)
    setCurrentPage(1)

    getData(1, a)
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
  const [MPfilter, setMPfilter] = useState<any>({})

  async function getData(page, filter__, pageSize) {
    var tab1 = ''
    await setTab((tab_) => {
      tab1 = tab_
      return tab_
    })
    var sorter = {}
    await setMPSorter((sorter_) => {
      sorter = sorter_
      return sorter_
    })
    var filter = {}
    await setMPfilter((filter_) => {
      filter = filter_
      return filter_
    })
    const append = await alertrule({
      ...{
        "current": page,
        "pageSize": pageSize || 3,
        "sorter": {
          "type": "ascend"
        }
      }, ...filter, tab: {
        'field': 'tab',
        'op': 'eq',
        'data': tab1
      }, sorter
    })

    setMPPagination({ total: append.total })
    setData(append.data)
  }





  var pathname = useLocation().pathname
  //--MP end
  const [events, setEvents] = useState<any>([]);
  useEffect(() => {
    if (pathname == '/threshold/createAlertRule') {
      if (!createModalOpen) {
        handleModalOpen(true)
      }
    }
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
          if (tab == "Others") {
            if (r.id != currentUser?.company_id) {
              b.push({ label: r.name, value: r.id })
            }

          } else {
            b.push({ label: r.name, value: r.id })
          }
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

    flow({ sorter: { sort: 'ascend' } }).then((res) => {
      var b = {
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa": intl.formatMessage({
          id: 'pages.alertrule.entireTransaction',
          defaultMessage: 'Entire Transaction',
        })
      }
      var p = {
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa": intl.formatMessage({
          id: 'pages.alertrule.entireTransaction',
          defaultMessage: 'Entire Transaction',
        })
      }


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

      });
    });


    if (isMP) {
      getData(1)
    }
  }, [tab]);
  /**
   * @en-US International configuration
   * */
  const intl = useIntl();

  const formRef = useRef<ProFormInstance>();
  const columns: ProColumns<AlertruleListItem>[] = [

    {
      title: <FormattedMessage id="pages.role.xxx" defaultMessage="Threshold ID" />,
      dataIndex: 'alertrule_id',
      valueEnum: alertrule_idData,
      width: 130,
      sorter: true,
      defaultSortOrder: 'descend',
      search: {
        transform: (value) => {
          if (value && value.length > 0) {
            return {
              'name': {
                'field': 'alertrule_id',
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
          fieldSelectData({ model: "Alertrule", value: '', field: 'alertrule_id', Op: true, where: { tab: { "eq": tab } } }).then((res) => {
            setAlertrule_idData(res.data)
          })
        },
        onSearch: (newValue: string) => {

          fieldSelectData({ model: 'Alertrule', value: newValue, field: 'alertrule_id', Op: true, where: { tab: { "eq": tab } } }).then((res) => {
            setAlertrule_idData(res.data)
          })

        }
      },
      render: (dom, entity) => {

        return "T" + entity.alertrule_id
      }
    },


    {
      title: <FormattedMessage id="pages.alertrule.type" defaultMessage="Threshold Type" />,
      dataIndex: 'type',
      sorter: true,
      hideInSearch: true,

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
        maxTagCount: 0,
        maxTagPlaceholder: (omittedValues) => {
          return omittedValues.length + " Selected"
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
        maxTagCount: 0,
        maxTagPlaceholder: (omittedValues) => {
          return omittedValues.length + " Selected"
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
      title: <FormattedMessage id="pages.alertrule.vesselSizeLimit" defaultMessage="Vessel Size Limit (DWT)" />,
      dataIndex: 'from_to',
      hideInTable: true,
      hideInDescriptions: true,
      fieldProps: {
        mode: 'multiple',
        dropdownMatchSelectWidth: isMP ? true : false,
        width: '300px',
        maxTagCount: 0,
        maxTagPlaceholder: (omittedValues) => {
          return omittedValues.length + " Selected"
        },
       

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
          if (value && value.length > 0) {
            var arr1 = []
            var arr2 = []
            value.forEach((a) => {
              arr1.push(a.split('-')[0])
              arr2.push(a.split('-')[1])
            })

            return {
              'vessel_size_dwt_from': {
                'field': 'vessel_size_dwt_from',
                'op': 'in',
                'data': arr1
              },
              'vessel_size_dwt_to': {
                'field': 'vessel_size_dwt_to',
                'op': 'in',
                'data': arr2
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
          defaultMessage="Threshold Process / Events"
        />
      ),
      dataIndex: 'flow_id',
      width:180,
      sorter: true,
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

      },
      search: {
        transform: (value) => {
          if (value && value.length > 0) {

            var a = value[0] || 0
            var b = value[1] || 1000000000

            return {
              'product_quantity_from': {
                'field': 'product_quantity_from',
                'op': 'gte',
                'data': a
              },
              'product_quantity_to': {
                'field': 'product_quantity_to',
                'op': 'lte',
                'data': b
              },
              'uom': {
                'field': 'uom',
                'op': 'eq',
                'data': "mt"
              }
            }
          }

        }
      }
    },

    {
      title: "Total Nominated Quantity (Bls-60-F)",
      dataIndex: 'product_quantity_to',
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

      },
      search: {
        transform: (value) => {
          if (value && value.length > 0) {
            var a = value[0] || 0
            var b = value[1] || 1000000000
            return {
              'product_quantity_from': {
                'field': 'product_quantity_from',
                'op': 'gte',
                'data': a
              },
              'product_quantity_to': {
                'field': 'product_quantity_to',
                'op': 'lte',
                'data': b
              },
              'uom': {
                'field': 'uom',
                'op': 'eq',
                'data': "bls_60_f"
              }

            }
          }

        }
      }
    },

    {
      title: <FormattedMessage id="pages.alertrule.thresholdLimit" defaultMessage="Threshold Limit" />,
      dataIndex: 'amber_hours',
      sorter: true,
      hideInSearch: true,
      valueType: 'text',
      renderPrint: (dom, entity) => {

        return (entity.amber_hours || entity.amber_mins ? ("Amber: " + (entity.amber_hours ? entity.amber_hours : '0') + "h " + (entity.amber_mins ? entity.amber_mins : '0') + "m") : "") +
          (entity.red_hours || entity.red_mins ? (" Red: " + (entity.red_hours ? entity.red_hours : '0') + "h " + (entity.red_mins ? entity.red_mins : '0') + "m") : "")

      },
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
    
    /*{
      title: 'Created By',
      dataIndex: 'company_id',

      valueEnum: company_idData,
      hideInSearch: access.alertrule_list_tab() && tab == "Others",
      fieldProps:
      {
        notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
        showSearch: true,
        mode: 'multiple',
        maxTagCount: 0,
        maxTagPlaceholder: (omittedValues) => {
          return omittedValues.length + " Selected"
        },
        allowClear: true,
        onFocus: () => {
          fieldSelectData({ model: "Alertrule", value: '', field: 'company_id', Op: true, where: { tab: { "eq": tab } } }).then((res) => {
            setCompany_idData(res.data)
          })
        },
        onSearch: (newValue: string) => {

          fieldSelectData({ model: "Alertrule", value: newValue, field: 'company_id', Op: true, where: { tab: { "eq": tab } } }).then((res) => {
            setCompany_idData(res.data)
          })

        }
      },
      search: {
        transform: (value) => {
          if (value && value.length > 0) {
            return {
              'user_id': {
                'field': 'company_id',
                'op': 'in',
                'data': value
              }
            }
          }

        }
      },
      hideInTable: true,
      hideInDescriptions: true,

    },*/
    {
      title: 'Created By',
      dataIndex: 'user_id',
      valueEnum: user_idData,
      hideInSearch: access.alertrule_list_tab() && tab == "Others",
      fieldProps:
      {
        notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
        showSearch: true,
        mode: 'multiple',
        maxTagCount: 0,
        maxTagPlaceholder: (omittedValues) => {
          return omittedValues.length + " Selected"
        },
        allowClear: true,
        onFocus: () => {
          fieldSelectData({ model: "Alertrule", value: '', field: 'user_id', Op: true, where: { tab: { "eq": tab } } }).then((res) => {
            setUser_idData(res.data)
          })
        },
        onSearch: (newValue: string) => {

          fieldSelectData({ model: "Alertrule", value: newValue, field: 'user_id', Op: true, where: { tab: { "eq": tab } } }).then((res) => {
            setUser_idData(res.data)
          })

        }
      },
      search: {
        transform: (value) => {
          if (value && value.length > 0) {
            return {
              'user_id': {
                'field': 'user_id',
                'op': 'in',
                'data': value
              }
            }
          }

        }
      },
      hideInTable: true,
      hideInDescriptions: true,

    },

    {
      title: access.alertrule_list_tab() ? (tab == 'Self' ? 'Created By' : 'Customer') : 'Created By',
      dataIndex: 'username',
      sorter: true,
      hideInSearch: true,
      render: (dom, entity) => {
        if (access.alertrule_list_tab()) {
          return tab == 'Self' ? dom.split('@')[0] : (entity.company_name || "-")
        } else {
          return dom?.split('@')[0] || dom
        }

      },
      valueType: 'text',
    },

    {
      title: "Organization",
      hideInSearch: true,
      sorter: true,
      hideInDescriptions: !access.canAdmin,
     
      dataIndex: 'company_name',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.alertrule.userName" defaultMessage="Date of Threshold Alert Creation" />,
      dataIndex: 'created_at',
      width: 200,
      hideInSearch: true,
      sorter: true,
      render: (dom, entity) => {

        return moment(new Date(dom)).format('DD MMM YYYY HH:mm:ss')

      }
    },

    {
      title: "Date of Threshold Alert Creation",


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
      title: access.alertrule_list_tab() ? "Customer" : "Organization",
      dataIndex: 'organization_id',

      valueEnum: organizationMap,
      hideInSearch: !(access.alertrule_list_tab() || access.canAdmin) || tab == "Self" ? true : false,
      hideInTable: true,
      hideInDescriptions: true,
      fieldProps: {
        options: organizationList,
        multiple: true,
        mode: "multiple",
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
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      hideInTable: tab == "Others" ? true : false,
      render: (_, record) => [

        <Access accessible={access.canAlertruleMod()} fallback={<div></div>}>
          <a
            title={formatMessage({ id: "pages.update", defaultMessage: "Modify" })}
            key="config"
            onClick={() => {
              handleUpdateModalOpen(true);

              try {
                if (record.vessel_size_dwt_from == null && record.vessel_size_dwt_to == null) {
                  record.from_to = null
                } else {
                  record.from_to = record.vessel_size_dwt_from + "-" + record.vessel_size_dwt_to
                }
                record.emailArr = []
                record.typeArr = [1]
                record.email = record.email.split(";")
                record.email.forEach((v, i) => {
                  var a = '' + (new Date()).getTime() + i
                  v = v.split(',')
                  record[a + '_email'] = v[0]
                  v.splice(0, 1)
                  record[a + '_send_type_select'] = v

                  record.emailArr.push(a)

                })

             
              } catch (e) {

              }

              setCurrentRow(record);
            }}
          >
            <FormOutlined style={{ fontSize: '20px' }} />

          </a>
        </Access>
        ,
        <Access accessible={access.canAlertruleDel()} fallback={<div></div>}>
          <a
            title={formatMessage({ id: "pages.delete", defaultMessage: "Delete" })}
            key="config"
            onClick={() => {

              handleRemove([record], (success) => {
                if (success) {
                  if (isMP) {
                    setData([]);
                    getData(1, MPfilter)
                  }
                  actionRef.current?.reloadAndRest?.();
                }
              });


            }}
          >
            <DeleteOutlined style={{ fontSize: '20px', color: 'red' }} />

          </a>
        </Access>
       

      ],
    }


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
        title: isMP ? null : < FormattedMessage id="pages.alertrule.title" defaultMessage="Threshold Limit List" />,
        breadcrumb: {},
        extra: isMP ? null : [<Access accessible={access.canAlertruleAdd()} fallback={<div></div>}>
          {tab == 'Self' && <Button

            type="primary"
            key="primary"
            onClick={() => {
              handleModalOpen(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="Create New" />
          </Button>}
        </Access>, <Button type="primary" key="print"
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


        {access.alertrule_list_tab() && <ProCard

          headStyle={{ height: 14, lineHeight: '14px', fontSize: 12 }}
          className="my-tab"
          tabs={{
            type: 'card',

            activeKey: tab,
            items: [
              {
                label: <div title={"Threshold set by " + currentUser?.company_name}>{currentUser?.company_name}</div>,
                key: 'Self',
                children: null,
              },
              {
                label: <div title="Threshold set by Others">Others</div>,
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
        {!isMP && (<ConfigProvider renderEmpty={customizeRenderEmpty}><ProTable<AlertruleListItem, API.PageParams>

          formRef={formRef}
          className="mytable"
          actionRef={actionRef}
          rowKey="id"
          scroll={{ x: 1800, y: resizeObj.tableScrollHeight }}
          bordered size="small"
          search={{
            layout: "vertical",
            labelWidth: 210,
            span: resizeObj.searchSpan,
            searchText: < FormattedMessage id="pages.search" defaultMessage="Search" />
          }}
          options={false}
          toolBarRender={() => []

          }
          pagination={{ size: "default", showSizeChanger: true, pageSizeOptions: [10, 20, 50, 100, 500] }}
          request={(params, sorter) => alertrule({
            ...params, sorter, tab: {
              'field': 'tab',
              'op': 'eq',
              'data': tab
            }
          })}
          columns={columns}
          rowSelection={access.canAlertruleDel() ? {
            onChange: (_, selectedRows) => {
              setSelectedRows(selectedRows);
            },
          } : false}
        /></ConfigProvider >)}

        {isMP && (<>

          <NavBar backArrow={false} left={
            <MPSort columns={columns} onSort={(k) => {
              setMPSorter(k)
              getData(1)
            }} />} right={right} onBack={back}>
            {intl.formatMessage({
              id: 'pages.alertrule.title',
              defaultMessage: 'Threshold Limit List',
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

                <ProDescriptions<AlertruleListItem>
                  bordered={true}
                  size="small"
                  className="jetty-descriptions"
                  layout="horizontal"
                  column={1}
                  title={item?.process_name}
                  request={async () => ({
                    data: item || {},
                  })}
                  params={{
                    id: item?.id,
                  }}
                  columns={columns as ProDescriptionsItemProps<AlertruleListItem>[]}
                />

              </List.Item>
            ))}
          </List>
          {MPPagination.total ? <div style={{ textAlign: 'center', padding: "20px 10px 90px 10px" }}>
            <Pagination

              onChange={(page, pageSize) => {

                getData(page, MPfilter, pageSize)
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

            const success = await handleAdd(value as AlertruleListItem);
            if (success) {
              handleModalOpen(false);
              setCurrentRow(undefined);
              if (isMP) {
                setData([]);
                getData(1, MPfilter)
              }
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
                getData(1, MPfilter)
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
          values={{ ...currentRow, type: currentRow?.type + "", flow_id: currentRow?.type == 2 ? null : currentRow?.flow_id } || {}}
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
          {currentRow?.id && (
            <ProDescriptions<AlertruleListItem>
              column={isMP ? 1 : 1}
              title={currentRow?.process_name}
              request={async () => {
                var d = { ...currentRow }
                d.email = d.email.split(";").map((a) => {
                  a = a.replace(',a', ',Amber')
                  a = a.replace(',r', ',Red')
                  return a
                })
                d.email = d.email.join(";")
                return { data: d || {} }


              }}
              params={{
                id: currentRow?.id,
              }}
              columns={columns as ProDescriptionsItemProps<AlertruleListItem>[]}
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
  )
};

export default TableList;
