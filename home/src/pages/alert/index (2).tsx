import RcResizeObserver from 'rc-resize-observer';

import { addAlert, removeAlert, alert as getAlert, updateAlert } from './service';

import { updateTransaction } from '../transaction/service';

import { Empty } from 'antd';
import { PlusOutlined, SearchOutlined, ExclamationCircleOutlined, FormOutlined } from '@ant-design/icons';
import { ActionType, ProColumns, ProDescriptionsItemProps, ProCard } from '@ant-design/pro-components';
import { AlertList, AlertListItem } from './data.d';
import { flow } from '../system/flow/service';
import { alertrule } from '../alertrule/service';
import { SvgIcon } from '@/components' // 自定义组件
import { producttype } from '../system/producttype/service';
import { terminal } from '../system/terminal/service';
import { history } from '@umijs/max';
import numeral from 'numeral';

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
import { FormattedMessage, useIntl, useLocation, formatMessage } from '@umijs/max';
import { Button, Drawer, Input, message, Modal, ConfigProvider } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import { tree, isPC } from "@/utils/utils";
import { useAccess, Access } from 'umi';



//MP
import { InfiniteScroll, List, NavBar, Space, DotLoading } from 'antd-mobile'
import { before, forEach } from 'lodash';
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

/**
 * @en-US Update node
 * @zh-CN 更新节点
 *
 * @param fields
 */
const handleUpdate = async (fields: Partial<any>) => {
  const hide = message.loading(<FormattedMessage
    id="pages.modifying"
    defaultMessage="Modifying"
  />);
  try {
    
    await updateTransaction({ remarks: fields['t.remarks'], id: fields.id });
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


  const [terminal_id, setTerminal_id] = useState<any>(useLocation()?.state?.terminal_id);
  const [dateArr, setDateArr] = useState<any>(useLocation()?.state?.dateArr);
  const [status, setStatus] = useState<any>(useLocation()?.state?.status);
  const [flow_id, setFlow_id] = useState<any>(useLocation()?.state?.flow_id);
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();
  const access = useAccess();


  const formRef = useRef<ProFormInstance>();
  const [resizeObj, setResizeObj] = useState({ searchSpan: 12, tableScrollHeight: 300 });
  //--MP start
  const MPSearchFormRef = useRef<ProFormInstance>();

  const [showMPSearch, setShowMPSearch] = useState<boolean>(false);
  const [isMP, setIsMP] = useState<boolean>(!isPC());
  
  var showNoRead= useLocation()?.state?.showNoRead


  const right = (
    <div style={{ fontSize: 24 }}>
      <Space style={{ '--gap': '16px' }}>
        <SearchOutlined onClick={e => { setShowMPSearch(!showMPSearch) }} />

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

  async function getData(page, filter) {
    var d = {
      ...{
        "current": page,
        "pageSize": 10

      }, ...filter
    }
    if (showNoRead) {
      d.showNoRead = 1
    }
   
    const append1 = await getAlert(d)

    const append=beforeList(append1)
    console.log(append)
    setData(val => [...val, ...append.data])
    setHasMore(10 * (page - 1) + append.data.length < append.total)
  }
  async function loadMore(isRetry: boolean) {
   
    await getData(currentPage, MPfilter)
    setCurrentPage(currentPage + 1)
  }

  const beforeList = (list) => {
    var map = new Map()
    list.data.forEach((al) => {

      var a = map.get(al.transaction_id)
      if (!a) {
        a = al
        a.red = []
        a.amber = []

      }


      if (al['type'] == 0) {
        a.amber.push({ flow_id: al['flow_id'], flow_id_to: al['flow_id_to'] })

      } else {
        a.red.push({ flow_id: al['flow_id'], flow_id_to: al['flow_id_to'] })

      }
      map.set(al.transaction_id, a)

    })
    var arr = []

    console.log(map)
    for (let [k, v] of map) {
      arr.push(v)
    }

    var b = { success: true, total: arr.length, data: arr }

    return b
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

 

  if (status !== "" && status !== undefined) {

    formRef.current?.setFieldValue('t.status', status + "")
  }

  if (terminal_id) {

    formRef.current?.setFieldValue('t.terminal_id', terminal_id)
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
    formRef.current?.submit();

  }





      });
    });

    producttype({  sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setProducttypeList(b)

    });
   

    terminal({ sorter: { name: 'ascend' } }).then((res) => {
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
          defaultMessage="Entire Transaction And Processes"
        />
      ),
      dataIndex: 'flow_id',
      hideInTable: true,
      hideInDescriptions: true,
      valueEnum: processes,
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
        notFoundContent: <Empty/>,
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
      title: (
        <FormattedMessage
          id="pages.alert.transactionId"
          defaultMessage="EOS ID"
        />
      ),
     
      dataIndex: 't.eos_id',
      hideInSearch:true,
      align: "center",
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              history.push(`/transaction/detail?transaction_id=` + entity.transaction_id);
              //setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
   
    {
      title: <FormattedMessage id="pages.alert.NumberProcessThresholdBreach" defaultMessage="Total Number Of Process Threshold Breach" />,
      dataIndex: 'product_type',
      align: "center",
      width: 250,
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          
            entity.red.length + entity.amber.length
         
        );
      },
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.alert.specificProcess" defaultMessage="Number Of Amber And Red Alert With Related Processes
" />,
      dataIndex: 'product_type',
      hideInSearch: true,
      width: 300,
      valueType: 'text',
      width:300,
      render: (dom, entity) => {
        return (
          <div>
            <ProCard
              headStyle={{ padding: 5 }}
              bodyStyle={{ paddingLeft: 20 }}
              ghost={true}
              title={

                <><SvgIcon  style={{ color: "#DE8205" }} type="icon-yuan" /><span style={{ marginLeft: "10px", display: "inline-block", width: '100px' }}>Amber ( {entity.amber.length} )</span></>
              
            }
              extra={
                ""
                /* <span style={{ display: "inline-block", padding: "3px 8px 3px 8px", border: '1px solid #aaa' }}>{entity.amber.length}</span>*/

             
            }
              
              style={{ maxWidth: 300 }}
              
            >
              <span style={{ marginLeft: "10px", display: entity.amber.length>0?"inline-block":"none" }}>
                {
                  entity.amber.map((p) => {
                    return <div style={{ position: 'relative' }}><i className="dot"></i>{" " + flowConf[p.flow_id] + (flowConf[p.flow_id_to] ? " -> " + flowConf[p.flow_id_to] : "")}</div>
                  })
                }


              </span>
            </ProCard>


            <ProCard
              ghost={true}
              headStyle={{ padding: 5, borderTop: "1px solid #ddd" }}
              title={
                <div>
                  <SvgIcon  style={{ color: "red" }} type="icon-yuan" /><span style={{ marginLeft: "10px", display: "inline-block", width: '100px' }}>Red  ( {entity.red.length} )</span>  
                  </div>
               
              }
              extra={
                ""
                 /*<span style={{ display: "inline-block", padding: "3px 8px 3px 8px", border: '1px solid #aaa' }}>{entity.red.length}</span>*/
              
              }
              bodyStyle={{ paddingLeft:20 }}
              style={{ maxWidth: 300 }}
              
            >
              <span style={{ marginLeft: "10px", display: entity.red.length >0? "inline-block" : "none" }}>
              {
                entity.red.map((p) => {
                  return <div style={{ position: 'relative' }}><i className="dot"></i>{" "+flowConf[p.flow_id] + (flowConf[p.flow_id_to] ? " -> " + flowConf[p.flow_id_to] : "")}</div>
                })
                }
              </span>
            </ProCard>

            </div>
         
        );
      },
    },
    {
      title: <FormattedMessage id="pages.alert.productType" defaultMessage="Product Type" />,
      dataIndex: 't.product_type',
      align: "center",
      hideInSearch: true,
     
    },
    {
      title: <FormattedMessage id="pages.transaction.imoNumber" defaultMessage="IMO Number" />,
      dataIndex: 't.imo_number',
      align: "center",
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.transaction.vesselName" defaultMessage="Vessel Name" />,
      dataIndex: 't.vessel_name',
      align: "center",
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.transaction.terminalName" defaultMessage="Terminal Name" />,
      dataIndex: 't.terminal_id',
      align: "center",
      valueEnum: terminalList,
      fieldProps: {
        notFoundContent: <Empty />,
      },
      search: {
        transform: (value) => {
          if (value) {
            return {
              't.terminal_id': {
                'field': 't.terminal_id',
                'op': 'eq',
                'data': value
              }
            }
          }

        }
      }
    },
    {
      title: <FormattedMessage id="pages.alertrule.ee" defaultMessage="Total Nominated Quantity (MT)" />,
      dataIndex: 't.total_nominated_quantity_m',
      hideInSearch: true,
      width: 200,
      align: "center",
      valueType: "text",
      render: (dom, entity) => {
        if (dom) {


          return numeral(dom).format('0,0')
        }

      },
    },
    {
      title: <FormattedMessage id="pages.alertrule.ee" defaultMessage="Total Nominated Quantity (Bal-60-F)" />,
      dataIndex: 't.total_nominated_quantity_b',
      hideInSearch: true,
      width:200,
      align:"center",
      valueType: 'text',
      render: (dom, entity) => {
        if (dom) {
          return numeral(dom).format('0,0')
        }

      },
    },
    {
      title: <FormattedMessage id="pages.alertrule.vesselSizeLimit" defaultMessage="Size Of Vessel (DWT)" />,
      dataIndex: 't.size_of_vessel',
      hideInSearch: true,
    
      align: "center",
      valueType: 'text',
      render: (dom, entity) => {
        if (entity['t.size_of_vessel'] ) {
          return numeral(dom).format('0,0')
        }

      },
    },
    {
      title: (
        <FormattedMessage
          id="pages.transaction.xxx"
          defaultMessage="Start Date"
        />
      ),
     

      hideInTable: true,
      fieldProps: { placeholder: ['From ', 'To '] },
     
      dataIndex: 't.start_of_transaction',
      valueType: 'dateRange',

      search: {
        transform: (value) => {
          if (value.length > 0) {
            return {
              't.start_of_transaction': {
                'field': 't.start_of_transaction',
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
    //  sorter: true,
     // defaultSortOrder: 'descend',
      valueType: 'date',
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.transaction.status" defaultMessage="Status" />,
      dataIndex: 't.status',
      sorter: true,
      search: {
        transform: (value) => {

          if (value !== null) {
            return {

              't.status': {
                'field': 't.status',
                'op': 'eq',
                'data': Number(value)
              }

            }
          }

        }
      },
    },
    {
      title: <FormattedMessage id="pages.alert.specificProcess" defaultMessage="Remarks" />,
      dataIndex: 't.remarks',
      hideInSearch: true,
      
      valueType: 'textarea',
      render: (dom, record) => {

        return <div><p dangerouslySetInnerHTML={{ __html: dom.replace(/\n/g, '<br />') }} /><Access accessible={access.canAlertruleMod()} fallback={<div></div>}>
          <a
            title={formatMessage({ id: "pages.update", defaultMessage: "Modify" })}
            key="config"
            onClick={() => {
              handleUpdateModalOpen(true);

             

              setCurrentRow(record);
            }}
          >
            <FormOutlined style={{ fontSize: '20px' }} />

          </a>
        </Access></div>;
      },
    
    }/*,
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
       
       
      ],
    },*/
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
      return  <Empty />
    }
    

  }
   
      

     
   
  

  return (
    <RcResizeObserver
      key="resize-observer"
      onResize={(offset) => {
        
        const { innerWidth, innerHeight } = window;
        var h = document.getElementsByClassName("ant-table-thead")?.[0]?.offsetHeight + 300 || 0
        if (offset.width > 1280) {
          setIsMP(false)
          setResizeObj({ ...resizeObj, searchSpan: 8, tableScrollHeight: innerHeight - h });
        }
        if (offset.width < 1280 && offset.width > 900) {
          setIsMP(false)
          setResizeObj({ ...resizeObj, searchSpan: 12, tableScrollHeight: innerHeight - h });
        }
        if (offset.width < 900 && offset.width > 700) {
          setResizeObj({ ...resizeObj, searchSpan: 24, tableScrollHeight: innerHeight - h });
          setIsMP(false)
        }

        if (offset.width < 700) {
          setIsMP(true)
        }

      }}
    >
    <PageContainer header={{
      title: isMP ? null : < FormattedMessage id="pages.transactions.alert" defaultMessage="Alerts of All Transactions" />,
      breadcrumb: {},
      extra: isMP ? null : []
    }}>
      {!isMP && (<ConfigProvider renderEmpty={customizeRenderEmpty}> <ProTable<AlertListItem, API.PageParams>
          scroll={{ x: 1900, y: resizeObj.tableScrollHeight }}
        bordered size="small"
        className="mytable"
        editable={{ type: 'single', editableKeys: ['remarks'] }}
        actionRef={actionRef}
        formRef={formRef}
        rowKey="id"
        search={{
          labelWidth: 210,
          span: resizeObj.searchSpan,
          searchText: < FormattedMessage id="pages.search" defaultMessage="Search" />
        }}
        toolBarRender={() => [
         
        ]}
          request={async (params, sorter) => {

            var d = { ...params, sorter }

            if (showNoRead) {
              d.showNoRead = 1
              console.log("sssssssssssssssssssssss")
            }
         
            var list = await getAlert(d)

        
          return beforeList(list)
        }}
        columns={columns}
       
        options={false}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
        /></ConfigProvider >)}

      {isMP && (<>

        <NavBar backArrow={false} right={right} onBack={back}>
          {intl.formatMessage({
            id: 'pages.alert.title',
            defaultMessage: 'Alerts of all transactions',
          })}
        </NavBar>

        <div style={{ padding: '20px', backgroundColor: "#5187c4", display: showMPSearch ? 'block' : 'none' }}>
          <Search columns={columns.filter(a => !a.hasOwnProperty('hideInSearch'))} action={actionRef} loading={false}

            onFormSearchSubmit={onFormSearchSubmit}

            dateFormatter={'string'}
            formRef={MPSearchFormRef}
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
          value.id = currentRow?.transaction_id
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
        {/*
         <div style={{ marginTop: -45, paddingLeft: 10 }}>
          <Button

            type="primary"
            onClick={async () => {
              history.back()
            }}
          >Return to previous page</Button>
        </div>

        */ }
        
      </PageContainer>
    </RcResizeObserver>
  );
};

export default TableList;
