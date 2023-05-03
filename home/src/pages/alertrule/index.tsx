import { addAlertrule, removeAlertrule, alertrule, updateAlertrule } from './service';
import { PlusOutlined, SearchOutlined, MoreOutlined, FormOutlined, DeleteOutlined, InfoCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps, ProTableProps } from '@ant-design/pro-components';
import { AlertruleList, AlertruleListItem } from './data.d';
import { GridContent } from '@ant-design/pro-layout';
import { flow } from '../system/flow/service';

//MP
import { InfiniteScroll, List, NavBar, Space, DotLoading } from 'antd-mobile'

import { SvgIcon } from '@/components' // 自定义组件
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  ProFormTextArea,
  ProFormTreeSelect,
  ProTable,
 
  ProFormInstance,
  Search
} from '@ant-design/pro-components';

import { FormattedMessage, useIntl, useLocation, formatMessage } from '@umijs/max';
import { Button, Drawer, Input, message, TreeSelect, Modal } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import { useAccess, Access } from 'umi';
import { tree,isPC } from "@/utils/utils";

import { event } from '../../.umi/plugin-locale/localeExports';
const { confirm } = Modal;
/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: AlertruleListItem) => {
  const hide = message.loading(<FormattedMessage
    id="pages.adding"
    defaultMessage="Adding"
  />);
 var d= { ...fields }
  if (d.total_nominated_quantity_unit=='b') {
    d.total_nominated_quantity_from_b = d.total_nominated_quantity_from_m
    d.total_nominated_quantity_to_b = d.total_nominated_quantity_to_m

    delete d.total_nominated_quantity_from_m
    delete d.total_nominated_quantity_to_m
  }
  if (d.from_to) {
    d.size_of_vessel_from = Number(d.from_to.split("-")[0])
    d.size_of_vessel_to = Number(d.from_to.split("-")[1])
  }
 
  
  Number(d.from_to.split("-")[0])

  delete d.total_nominated_quantity_unit
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
 * @zh-CN 更新节点
 *
 * @param fields
 */
const handleUpdate = async (fields: Partial<AlertruleListItem> ) => {
  const hide = message.loading(<FormattedMessage
    id="pages.modifying"
    defaultMessage="Modifying"
  />);
  try {
    await updateAlertrule({ ...fields });
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

const handleRemove = async (selectedRows: AlertruleListItem[],callBack:any) => {
  if (!selectedRows) return true;
  var open=true
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
        removeAlertrule({
          id: selectedRows.map((row) => row.id),
        });
        hide();
        message.success(<FormattedMessage
          id="pages.deletedSuccessfully"
          defaultMessage="Deleted successfully and will refresh soon"
        />);
        open=false
        callBack(true)
       
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
  const [currentRow, setCurrentRow] = useState<AlertruleListItem>();
  const [selectedRowsState, setSelectedRows] = useState<AlertruleListItem[]>([]);
  const [flowConf, setFlowConf] = useState<any>({});
  const [flowTree, setFlowTree] = useState<any>([]);
  const [processes, setProcesses] = useState<any>([]);
  const restFormRef = useRef<ProFormInstance>();

  //--MP start
  const MPSearchFormRef = useRef<ProFormInstance>();

  const [showMPSearch, setShowMPSearch] = useState<boolean>(false);
  const [isMP, setIsMP] = useState<boolean>(!isPC());

  const right = (
    <div style={{ fontSize: 24 }}>
      <Space style={{ '--gap': '16px' }}>
        <SearchOutlined onClick={e => { setShowMPSearch(!showMPSearch) }} />
        <PlusOutlined onClick={() => { handleModalOpen(true) }} />

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
            <span>--- There's no more ---</span>
        )}
      </>
    )
  }
  const back = () => { }
  const [data, setData] = useState<string[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [MPfilter, setMPfilter] = useState<any>({})

  async function getData(page, filter) {
    const append = await alertrule({
      ...{
        "current": page,
        "pageSize": 10,
        "sorter": {
          "type": "ascend"
        }
      }, ...filter
    })


    console.log(append)
    setData(val => [...val, ...append.data])
    setHasMore(10 * (page - 1) + append.data.length < append.total)
  }
  async function loadMore(isRetry: boolean) {
  
    await getData(currentPage , MPfilter)
    setCurrentPage(currentPage + 1)
  }


  var  pathname=useLocation().pathname
  //--MP end
  const [events, setEvents] = useState<any>([]);
  useEffect(() => {
    if (pathname == '/threshold/createAlertRule') {
      if (!createModalOpen) {
        handleModalOpen(true)
      }
    }
   

    flow({ pageSize: 300, current: 1, sorter: { sort: 'ascend' } }).then((res) => {
      var b = { "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa": intl.formatMessage({
            id: 'pages.alertrule.entireTransactions',
            defaultMessage: 'Entire Transactions',
          }) }
      var p = {
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa": intl.formatMessage({
          id: 'pages.alertrule.entireTransactions',
          defaultMessage: 'Entire Transactions',
        }) }


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
        var d = {  }



        res2.data.forEach((r) => {

          d[r.flow_id + "_" + r.flow_id_to] = b[r.flow_id] + " - " + b[r.flow_id_to]
        })

        setEvents(d)

      });
    });
  },[true]);
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();
  const access = useAccess();
 
  const columns: ProColumns<AlertruleListItem>[] = [

    {
      title: <FormattedMessage id="pages.alertrule.type" defaultMessage="Threshold Type" />,
      dataIndex: 'type',
      sorter: true,
      hideInSearch: true,
      defaultSortOrder: 'ascend',
      valueEnum: {
        0: { text: <FormattedMessage id="pages.alertrule.singleProcess" defaultMessage="Single Process" /> },
        1: { text: <FormattedMessage id="pages.alertrule.betweenTwoEvents" defaultMessage="Between Two Events" /> },
        2: { text: <FormattedMessage id="pages.alertrule.entireTransactions" defaultMessage="Entire Transactions" /> },
      }
     
    },

    {
      title: (
        <FormattedMessage
          id="pages.alertrule.entireTransactionAndProcesses"
          defaultMessage="Entire Transaction and Processes"
        />
      ),
      dataIndex: 'flow_id',
      hideInTable: true,
      hideInDescriptions:true,
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
        dropdownMatchSelectWidth:false,
        width: '300px',
          mode: 'multiple',
          showSearch: true,
          multiple: true
        
      }
     
     
    },
    /*{
      title: (
        <FormattedMessage
          id="pages.alertrule.eee"
          defaultMessage="Between two events"
        />
      ),
      dataIndex: 'flow_id_to',
      hideInDescriptions: true,
      hideInTable: true,
      renderFormItem: (_, fieldConfig, form) => {
        if (fieldConfig.type === 'form') {
          return null;
        }
        const status = form.getFieldValue('state');
        if (status !== 'open') {
          return (

            <TreeSelect
              allowClear
              fieldNames={{ label: 'name', value: 'id' }}
              treeData = { flowTree}
            />)
            
        }
        return fieldConfig.defaultRender(_);
      },
    },*/
    {
      title: (
        <FormattedMessage
          id="pages.alertrule.eee"
          defaultMessage="Flow (from)"
        />
      ),
      dataIndex: 'flow_id',
      hideInSearch: true,
      valueEnum: flowConf ,
      tip: '',
      
    },

   
    {
      title: <FormattedMessage id="pages.alertrule.eee" defaultMessage="Flow (to)" />,
      dataIndex: 'flow_id_to',
      hideInSearch: true,
      valueEnum: flowConf
     
    },
    {
      title: <FormattedMessage id="pages.alertrule.vesselSizeLimit" defaultMessage="Vessel Size Limit (DWT)" />,
      dataIndex: 'size_of_vessel_from',
      hideInSearch: true,
      valueType: 'text',
      render: (dom, entity) => {
        if (entity.size_of_vessel_from !=null && entity.size_of_vessel_to) {

          return (entity.size_of_vessel_from + "").replace(/\B(?=(\d{3})+(?!\d))/g, ',') + " - " + (entity.size_of_vessel_to + "").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        } 
        
      },
    },
    {
      title: <FormattedMessage id="pages.alertrule.throughputVolume1" defaultMessage="Total nominated quantity (MT)" />,
      dataIndex: 'total_nominated_quantity_from_m',
      hideInSearch: true,
      valueType: "text",
      render: (dom, entity) => {
        if (entity.total_nominated_quantity_from_m  && entity.total_nominated_quantity_to_m) {

       
          return   (entity.total_nominated_quantity_from_m + "").replace(/\B(?=(\d{3})+(?!\d))/g, ',') + " - " + (entity.total_nominated_quantity_to_m + "").replace(/\B(?=(\d{3})+(?!\d))/g, ',') ;
        }
       
      },
    },
    {
      title: <FormattedMessage id="pages.alertrule.throughputVolume1" defaultMessage="Total nominated quantity (Bal-60-F)" />,
      dataIndex: 'total_nominated_quantity_from_b',
      hideInSearch: true,
      valueType: 'text',
      render: (dom, entity) => {
        if (entity.total_nominated_quantity_from_b && entity.total_nominated_quantity_to_b ) {
          return (entity.total_nominated_quantity_from_b + "").replace(/\B(?=(\d{3})+(?!\d))/g, ',') + " - " + (entity.total_nominated_quantity_to_b + "").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        } 
       
      },
    },
    {
      title: <FormattedMessage id="pages.alertrule.thresholdLimit" defaultMessage="Threshold Limit" />,
      dataIndex: 'amber_hours',
      hideInSearch: true,
      valueType: 'text',
      render: (dom, entity) => {
        return (<div><div > <SvgIcon style={{ color: "#DE8205" }} type="icon-yuan" />{" "+entity.amber_hours + "h " + entity.amber_mins + "m"}</div>
          <div><SvgIcon style={{ color: "red" }} type="icon-yuan" />{" "+entity.red_hours + "h " + entity.red_mins + "m"}</div></div>)
      },
    },
    {
      title: <FormattedMessage id="pages.alertrule.email" defaultMessage="" />,
      dataIndex: 'email',
      hideInSearch: true,
      hideInTable: true,
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.alertrule.sendEmailSelect" defaultMessage="Send email Select" />,
      dataIndex: 'send_email_select',
      hideInSearch: true,
      hideInTable: true,
      render: (dom, entity) => {

        return dom;
      },
    },
    
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [

        <Access accessible={access.canAlertruleMod()} fallback={<div></div>}>
          <a
            title={formatMessage({ id: "pages.update", defaultMessage: "Modify" })}
            key="config"
            onClick={() => {
              handleUpdateModalOpen(true);
             
              try {
                record.send_email_select = record.send_email_select.split(",")
              } catch (e) {

              }
             
              setCurrentRow(record);
            }}
          >
            <FormOutlined style={{ fontSize: '20px' }} /> 
           
          </a>
        </Access>
        ,
        <Access accessible={access.canAlertruleMod()} fallback={<div></div>}>
          <a
            title={formatMessage({ id: "pages.delete", defaultMessage: "Delete" })}
            key="config"
            onClick={() => {
              setCurrentRow(record);
              handleRemove([record], (success) => {
                if (success) {
                  handleUpdateModalOpen(false);
                  setCurrentRow(undefined);
                  if (actionRef.current) {
                    actionRef.current.reload();
                  }
                }
              });
              

            }}
          >
            <DeleteOutlined  style={{ fontSize: '20px', color: 'red' }} />

          </a>
        </Access>
        ,
          <Access accessible={access.canAlertruleMod()} fallback={<div></div>}>
            <a
              title={formatMessage({ id: "pages.details", defaultMessage: "Details" })  }
            key="config"
            onClick={() => {
              setCurrentRow(record);
              setShowDetail(true);
            
            }}
          >
              <InfoCircleOutlined style={{ fontSize:'20px'} } /> 
           
          </a>
        </Access>



       ,
       
      ],
    },
  ];
  
  return  (
    <PageContainer header={{
      title: '',
      breadcrumb: {},
    }}>
      {!isMP && (<ProTable<AlertruleListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.alertrule.title',
          defaultMessage: 'Threshold Limit List',
        })}
        actionRef={actionRef}
        rowKey="id"
        scroll={{ y: 300 }}
        bordered size="small"
        search={{
          labelWidth: 210,
          searchText: < FormattedMessage id="pages.search" defaultMessage="Search" />
        }}
        toolBarRender={() => [<Access accessible={access.canAlertruleAdd()} fallback={<div></div>}>
          <Button

            type="primary"
            key="primary"
            onClick={() => {
              handleModalOpen(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
          </Button>
        </Access>]

        }
        request={(params, sorter) => alertrule({ ...params, sorter })}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />)}

      {isMP && (<>
       
        <NavBar backArrow={false} right={right} onBack={back}>
          {intl.formatMessage({
            id: 'pages.alertrule.title',
            defaultMessage: 'Threshold Limits - Summry',
          })}
        </NavBar>

        <div style={{ padding: '20px', backgroundColor: "#5187c4", display: showMPSearch ? 'block' : 'none' }}>
          <Search columns={columns.filter(a => !a.hasOwnProperty('hideInSearch'))} action={actionRef} loading={false}

            onFormSearchSubmit={onFormSearchSubmit}

            dateFormatter={'string'}
            formRef={MPSearchFormRef}
            type={'form'}
            cardBordered={true}
            form={{}}

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
        <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
          <InfiniteScrollContent hasMore={hasMore} />
        </InfiniteScroll>
      </>)}
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

          <Access accessible={access.canAlertruleDel()} fallback={<div></div>}>
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
          </Access>
          
          
        </FooterToolbar>
      )}
      
      <CreateForm
        onSubmit={async (value) => {
          value.id = currentRow?.id
          const success = await handleAdd(value as AlertruleListItem);
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
        width={isMP ? '100%':600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={isMP?true:false}
      >
        {currentRow?.id && (
          <ProDescriptions<AlertruleListItem>
            column={isMP ? 1 : 2}
            title={currentRow?.process_name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.id,
            }}
            columns={columns as ProDescriptionsItemProps<AlertruleListItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  )
};

export default TableList;
