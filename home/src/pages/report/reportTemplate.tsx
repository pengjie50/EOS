
import {
  ProCard,
  ProFormCheckbox,
  PageContainer,
  ProFormDateRangePicker,
  ProFormText,
  ProColumns,
  ProList,
  ProForm,
  ProFormTextArea,
  ProFormSelect,
  Search,
  ProFormInstance,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, useModel, formatMessage, history } from '@umijs/max';
import RcResizeObserver from 'rc-resize-observer';
import { Button, Drawer, Input, message, Modal } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import { flow } from '../system/flow/service';
import { alertrule } from '../alertrule/service';
import { terminal } from '../system/terminal/service';
import numeral from 'numeral';
import moment from 'moment'
import { jetty } from '../system/jetty/service';
import { isPC } from "@/utils/utils";
const { confirm } = Modal;
//MP
import { InfiniteScroll, List, NavBar, Space, DotLoading } from 'antd-mobile'
/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */




const TableList: React.FC = () => {
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const [processes, setProcesses] = useState<any>([]);
  const [events, setEvents] = useState<any>([]);
  const [terminalList, setTerminalList] = useState<any>({});
  const [jettyList, setJettyList] = useState<any>({});
  const [flowConf, setFlowConf] = useState<any>({});
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [isMP, setIsMP] = useState<boolean>(!isPC());

  const [allcolumns, setAllcolumns] = useState<any>([]);
  const [selectcolumns, setSelectcolumns] = useState<any>([]);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();
  const [responsive, setResponsive] = useState(false);
  useEffect(() => {
  
    jetty({ pageSize: 3000, current: 1, sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setJettyList(b)

    });

   
    terminal({ pageSize: 3000, current: 1, sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setTerminalList(b)



      




    });

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


    //  var treeData = tree(res.data, "                                    ", 'pid')
     // setFlowTree(treeData)

      alertrule({
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


    setAllcolumns(columns)
  }, [true]);
  

  const columns: ProColumns<any>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.transaction.transactionID"
          defaultMessage="EOS ID"
        />
      ),
      dataIndex: 'eos_id',
      hideInSearch: true,
      sorter: true,
      defaultSortOrder: 'descend',
      render: (dom, entity) => {
        return (
          <a

            onClick={() => {
             
              history.push(`/transaction/detail?transaction_id=` + entity.id);
              // setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },

    {
      title: (
        <FormattedMessage
          id="pages.transaction.timeFrame"
          defaultMessage="Timeframe"
        />
      ),
      sorter: true,

      hideInTable: true,
      fieldProps: { placeholder: ['Date (From) ', 'Date (To) '] },
      defaultSortOrder: 'descend',
      dataIndex: 'start_of_transaction',
      valueType: 'dateRange',

      search: {
        transform: (value) => {
          if (value.length > 0) {
            return {
              'start_of_transaction': {
                'field': 'start_of_transaction',
                'op': 'gt',
                'data': value[0]
              },
              'end_of_transaction': {
                'field': 'end_of_transaction',
                'op': 'lt',
                'data': value[1]
              },
            }
          }

        }
      }



    },


    {
      title: <FormattedMessage id="pages.transaction.startOfTransaction" defaultMessage="Start Of Transaction" />,
      dataIndex: 'start_of_transaction',
      sorter: true,
      defaultSortOrder: 'descend',
      valueType: 'date',
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.transaction.endOfTransaction" defaultMessage="End Of Transaction" />,
      dataIndex: 'end_of_transaction',
      valueType: 'date',
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.transaction.status" defaultMessage="Status" />,
      dataIndex: 'status',
      search: {
        transform: (value) => {

          if (value !== null) {
            return {

              status: {
                'field': 'status',
                'op': 'eq',
                'data': Number(value)
              }

            }
          }

        }
      },
      valueEnum: {
        0: {
          text: <FormattedMessage id="pages.transaction.active" defaultMessage="Open" />
        },
        1: { text: <FormattedMessage id="pages.transaction.closed" defaultMessage="Closed" /> },
        2: { text: <FormattedMessage id="pages.transaction.cancelled" defaultMessage="Cancelled" /> }
      },
    },
    {
      title: <FormattedMessage id="pages.transaction.arrivalID" defaultMessage="Arrival ID" />,
      dataIndex: 'arrival_id',
      hideInSearch: true
    },

    {

      title: <FormattedMessage id="pages.transaction.currentProcess" defaultMessage="Current Process" />,
      dataIndex: 'flow_id',
      valueEnum: flowConf,
      hideInSearch: true,
    },


    {
      title: <FormattedMessage id="pages.transaction.imoNumber" defaultMessage="IMO Number" />,
      dataIndex: 'imo_number',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.transaction.vesselName" defaultMessage="Vessel Name" />,
      dataIndex: 'vessel_name',
      valueType: 'text',
    },

    {
      title: <FormattedMessage id="pages.transaction.terminalName" defaultMessage="Terminal Name" />,
      dataIndex: 'terminal_id',
      valueEnum: terminalList,
      search: {
        transform: (value) => {
          if (value) {
            return {
              'terminal_id': {
                'field': 'terminal_id',
                'op': 'eq',
                'data': value
              }
            }
          }

        }
      }
    },
    {
      title: <FormattedMessage id="pages.transaction.jettyName" defaultMessage="Jetty Name" />,
      dataIndex: 'jetty_id',
      valueEnum: jettyList,
      search: {
        transform: (value) => {
          if (value) {
            return {
              'jetty_id': {
                'field': 'jetty_id',
                'op': 'eq',
                'data': value
              }
            }
          }

        }
      }
    },


    {
      title: <FormattedMessage id="pages.transaction.productType" defaultMessage="Product Type" />,
      dataIndex: 'product_name',
      // valueEnum: producttypeList,
    },
    {
      title: <FormattedMessage id="pages.alertrule.totalNominatedQuantityM" defaultMessage="Total Nominated Quantity (MT)" />,
      dataIndex: 'product_quantity_in_mt',

      hideInSearch: true,
      valueType: "text",
      render: (dom, entity) => {
        if (dom) {


          return numeral(dom).format('0,0')
        }

      },
    },
    {
      title: <FormattedMessage id="pages.alertrule.totalNominatedQuantityB" defaultMessage="Total Nominated Quantity (Bal-60-F)" />,
      dataIndex: 'product_quantity_in_bls_60_f',
      hideInSearch: true,

      valueType: 'text',

      render: (dom, entity) => {
        if (dom) {
          return numeral(dom).format('0,0')
        }

      },
    },

    {
      title: <FormattedMessage id="pages.transaction.totalDuration" defaultMessage="Entire Duration (Till Date)" />,
      dataIndex: 'total_duration',
      hideInSearch: true,
      render: (dom, entity) => {
        if (dom > 0 && entity.status == 1) {
          return parseInt((dom / 3600) + "") + "h " + parseInt((dom % 3600) / 60) + "m"
        } else {
          return '-'
        }


      },
      valueType: 'text',
    },
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
      valueEnum: processes,
      fieldProps: {

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
      valueEnum: events,
      fieldProps: {
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


    }
  ];


  
  return (
    <PageContainer header={{
      title: 'Report Template',
      breadcrumb: {},
    }}>
      <ProCard title="Saved Report Template" colSpan={24} headerBordered>
        <ProForm.Group >
          <ProFormSelect label="Name of Report:" width={250} />
        </ProForm.Group>
       
      </ProCard>

      <ProCard title="Create New Report Template" colSpan={24} headerBordered>

        <ProForm.Group>
          <ProFormText label="Threshold Breached:" width={250} />
        </ProForm.Group>
      
      </ProCard>


      <ProCard title="Output Filter" colSpan={24} headerBordered>

        <ProForm.Group label="Time Period:">
        <ProFormCheckbox.Group
          name="checkbox"
          layout="horizontal"
          label="Time Period:"
          options={['Last 1 Year', 'Last 6 months', 'Last 3 months', 'Last month', 'Last week', 'Specific Date Range:']}
        />
        < ProFormDateRangePicker name="dateRange" label="" />
        </ProForm.Group>
        <ProForm.Group label="Description:">
          <ProFormText
            name="imo_number"
            label="IMO Number"
           
          />
          <ProFormSelect
            
            width="xs"
            name="jetty_id"
            label="Jetty"
            valueEnum={jettyList }

          />
          <ProFormText
            name="vessel_name"
            label="Vessel Name"

          />

          <ProFormText
            name="product_name"
            label="Product Type"

          />
          <ProFormSelect
            valueEnum={
              {
                0: {
                  text: <FormattedMessage id="pages.transaction.active" defaultMessage="Open" />
                },
                1: { text: <FormattedMessage id="pages.transaction.closed" defaultMessage="Closed" /> },
                2: { text: <FormattedMessage id="pages.transaction.cancelled" defaultMessage="Cancelled" /> }
              }}
            width="xs"
            name="status"
            label="Status"

          />
          <ProFormSelect
            valueEnum={terminalList}
           
            width="xs"
            name="terminal_id"
            label="Terminal"

          />
        </ProForm.Group>
        <ProForm.Group label="Threshold Breached:">
          <ProFormSelect
            
            name="flow_id"
            width="lg"
            label={intl.formatMessage({
              id: 'pages.alertrule.entireTransactionAndProcesses',
              defaultMessage: 'Entire Transaction And Processes',
            })}
            valueEnum={processes}
            fieldProps={{
              labelInValue: true,
              mode: 'multiple',
            }}

          />

          <ProFormSelect
            name="flow_id"
            width="lg"
            label={intl.formatMessage({
              id: 'pages.alertrule.betweenTwoEvents',
              defaultMessage: 'Between Two Events',
            })}
            valueEnum={events}
            fieldProps={{
              labelInValue: true,
              mode: 'multiple',
            }}

          />

        </ProForm.Group>

      </ProCard>

      <RcResizeObserver
        key="resize-observer"
        onResize={(offset) => {
          setResponsive(offset.width < 596);
        }}
      >
        <ProCard
          title="Report Fields"
          extra=""
          split={responsive ? 'horizontal' : 'vertical'}
          bordered
          headerBordered
        >
          <ProCard title="Available Fields" colSpan="50%">
            <div style={{ height: 360, overflow: 'auto' }}>

              <ProList<any>

                onItem={(record, index) => {
                  console.log(record)
                } }
                toolbar={{
                 
                  search: {
                    onSearch: (value: string) => {
                      setAllcolumns(columns.filter((a) => {
                        console.log(a)
                        return a.title.props.defaultMessage.indexOf(value)>-1
                      }))
                    },
                  }
                 
                }}
                onRow={(record: any) => {
                  return {
                    onMouseEnter: () => {
                      console.log(record);
                    },
                    onClick: () => {
                      console.log(record);
                    },
                  };
                }}
                rowKey="name"
                headerTitle=""
              
                dataSource={allcolumns}
                showActions="hover"
                showExtra="hover"
                metas={{
                  title: {
                    dataIndex: 'title',
                  }
                 
                 
                }}
              />

            </div>
          </ProCard>
          <ProCard title="Selected Fields">
           
          </ProCard>
        </ProCard>
      </RcResizeObserver>
      );

      

    </PageContainer>
  );
};

export default TableList;
