import { addAlert, removeAlert, alert, updateAlert } from './service';
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { AlertList, AlertListItem } from './data.d';
import { flow } from '../system/flow/service';
import { alertrule } from '../alertrule/service';
import { SvgIcon } from '@/components' // 自定义组件
import { producttype } from '../system/producttype/service';
import { terminal } from '../system/terminal/service';
import { history } from '@umijs/max';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Drawer, Input, message, Modal } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import { tree } from "@/utils/utils";

const { confirm } = Modal;

/**
 *  Delete node
 * @zh-CN 删除节点
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

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<AlertListItem>();
  const [selectedRowsState, setSelectedRows] = useState<AlertListItem[]>([]);
  const [producttypeList, setProducttypeList] = useState<any>({});
  const [terminalList, setTerminalList] = useState<any>({});
  const [flowConf, setFlowConf] = useState<any>({});
  const [flowTree, setFlowTree] = useState<any>([]);
  const [processes, setProcesses] = useState<any>([]);
  const [events, setEvents] = useState<any>([]);
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();
  useEffect(() => {

    flow({ pageSize: 300, current: 1, sorter: { sort: 'ascend' } }).then((res) => {
      var b = { "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa": "Total Duration" }
      var p = { "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa": "Total Duration" }


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

      alertrule({ pageSize: 300, current: 1, type: 1 }).then((res2) => {
        var d = {}



        res2.data.forEach((r) => {

          d[r.flow_id + "_" + r.flow_id_to] = b[r.flow_id] + " - " + b[r.flow_id_to]
        })

        setEvents(d)

      });
    });

    producttype({ pageSize: 3000, current: 1, sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setProducttypeList(b)

    });
   

    terminal({ pageSize: 3000, current: 1, sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setTerminalList(b)

    });



  }, [true]);
  const columns: ProColumns<AlertListItem>[] = [

    {
      title: (
        <FormattedMessage
          id="pages.alertrule.eee"
          defaultMessage="Entire transaction and processes"
        />
      ),
      dataIndex: 'flow_id',
      hideInTable: true,
      hideInDescriptions: true,
      valueEnum: processes,
      fieldProps: {

        width: '300px',
        mode: 'multiple',
        showSearch: true,
        multiple: true

      }
    },
    {
      title: (
        <FormattedMessage
          id="pages.alertrule.eee"
          defaultMessage="Between two events"
        />
      ),
      dataIndex: 'flow_id_to',
      hideInTable: true,
      width: 200,
      hideInDescriptions: true,
      valueEnum: events,
      fieldProps: {
        dropdownMatchSelectWidth: false,
        width: '300px',
        mode: 'multiple',
        showSearch: true,
        multiple: true

      }


    },
    {
      title: (
        <FormattedMessage
          id="pages.alert.transactionId"
          defaultMessage="EOS ID"
        />
      ),
      dataIndex: 'transaction_id',
      hideInSearch:true,
      tip: 'The transaction Id is the unique key',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              history.push(`/transaction/detail?transaction_id=` + dom);
              //setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
   
    {
      title: <FormattedMessage id="pages.alert.NumberProcessThresholdBreach" defaultMessage="Total Number of Process Threshold Breach" />,
      dataIndex: 'product_type',
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              //setCurrentRow(entity);
             // setShowDetail(true);
            }}
          >
            {entity.red.length + entity.amber.length}
          </a>
        );
      },
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.alert.specificProcess" defaultMessage="Number of Amber and Red Alert with related processes
" />,
      dataIndex: 'product_type',
      hideInSearch: true,
      valueType: 'text',
      width:300,
      render: (dom, entity) => {
        return (
          <div>
            <div style={{ marginBottom: '10px' }}><SvgIcon style={{ color: "#DE8205" }} type="icon-yuan" /><span style={{ marginLeft: "10px", display: "inline-block", width: '50px' }}>Amber</span>  <span style={{ display: "inline-block", padding: "3px 8px 3px 8px", border: '1px solid #333' }}>{entity.amber.length}</span>
              <span style={{ marginLeft: "10px", display: "inline-block" }}>
                {
                  entity.amber.map((p) => {
                    return <div>{flowConf[p.flow_id] + (flowConf[p.flow_id_to] ?" -> " +flowConf[p.flow_id_to] :"")}</div>
                  })
                }
              

              </span>
            
            </div>
            <div> <SvgIcon style={{ color: "red" }} type="icon-yuan" /><span style={{ marginLeft: "10px", display: "inline-block", width: '50px' }}>Red</span>   <span style={{ display: "inline-block", padding: "3px 8px 3px 8px", border: '1px solid #333' }}>{entity.red.length}</span>
              <span style={{ marginLeft: "10px", display: "inline-block" }}>
                {
                  entity.red.map((p) => {
                    return <div>{flowConf[p.flow_id] + (flowConf[p.flow_id_to] ? " -> " + flowConf[p.flow_id_to] : "")}</div>
                  })
                }

              </span></div>
          </div>
        );
      },
    },
    {
      title: <FormattedMessage id="pages.alert.productType" defaultMessage="Product Type" />,
      dataIndex: 't.product_type_id',
      hideInSearch: true,
      valueEnum: producttypeList
    },
    {
      title: <FormattedMessage id="pages.transaction.terminalName" defaultMessage="Terminal Name" />,
      dataIndex: 't.terminal_id',
      valueEnum: terminalList
    },
    {
      title: <FormattedMessage id="pages.alertrule.ee" defaultMessage="Total nominated quantity (MT)" />,
      dataIndex: 't.total_nominated_quantity_m',
      hideInSearch: true,
      valueType: "text",
      render: (dom, entity) => {
        if (dom) {


          return (dom + "").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }

      },
    },
    {
      title: <FormattedMessage id="pages.alertrule.ee" defaultMessage="Total nominated quantity (Bal-60-F)" />,
      dataIndex: 't.total_nominated_quantity_b',
      hideInSearch: true,
      valueType: 'text',
      render: (dom, entity) => {
        if (dom) {
          return (dom + "").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }

      },
    },
    {
      title: <FormattedMessage id="pages.alertrule.vesselSizeLimit" defaultMessage="Size Of Vessel (DWT)" />,
      dataIndex: 't.product_of_volume',
      hideInSearch: true,
      valueType: 'text',
      render: (dom, entity) => {
        if (entity['t.product_of_volume'] ) {
          return (dom + "").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }

      },
    },

   
    {
      title: <FormattedMessage id="pages.alert.specificProcess" defaultMessage="Remarks" />,
      dataIndex: 'product_type',
      hideInSearch: true,
      valueType: 'text',
    }/*,
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
       
       
      ],
    },*/
  ];

  return (
    <PageContainer header={{
      title: '',
      breadcrumb: {},
    }}>
      <ProTable<AlertListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.transactions.alert',
          defaultMessage: 'Alerts of all transactions',
        })}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 210,
          searchText: < FormattedMessage id="pages.search" defaultMessage="Search" />
        }}
        toolBarRender={() => [
         
        ]}
        request={async (params, sorter) => {
          var map = new Map()
          var list =await alert({ ...params, sorter })
          console.log(list)
          list.data.forEach((al) => {
            
            var a=map.get(al.transaction_id)
            if (!a) {
              a = al
              a.red = []
              a.amber = []
              
            }

           
            if (al['type'] == 0) {
              a.amber.push({ flow_id: al['a.flow_id'], flow_id_to: al['a.flow_id_to'] })

            } else {
              a.red.push({ flow_id: al['a.flow_id'], flow_id_to: al['a.flow_id_to'] })

            }
            map.set(al.transaction_id, a)

          })
          var arr = []

          console.log(map)
          for(let [k,v] of map) {
            arr.push(v)
          }

          var b = { success: true, total: arr.length, data: arr }

          return b
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="Chosen" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
              &nbsp;&nbsp;
              <span>
                <FormattedMessage
                  id="pages.searchTable.totalServiceCalls"
                  defaultMessage="Total number of service calls"
                />{' '}
                {selectedRowsState.reduce((pre, item) => pre , 0)}{' '}
                <FormattedMessage id="pages.searchTable.tenThousand" defaultMessage="万" />
              </span>
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            <FormattedMessage
              id="pages.searchTable.batchDeletion"
              defaultMessage="Batch deletion"
            />
          </Button>
          
        </FooterToolbar>
      )}
      
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
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <ProDescriptions<AlertListItem>
            column={2}
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
    </PageContainer>
  );
};

export default TableList;
