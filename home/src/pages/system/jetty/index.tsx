import RcResizeObserver from 'rc-resize-observer';

import { addJetty, removeJetty, jetty, updateJetty } from './service';
import { PlusOutlined, SearchOutlined, FormOutlined, DeleteOutlined, ExclamationCircleOutlined, SwapOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { JettyList, JettyListItem } from './data.d';
import * as XLSX from 'xlsx';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  Search,
  ProFormInstance,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, formatMessage, useModel } from '@umijs/max';
import { Button, Drawer, Input, message, Upload, Tooltip, Modal, Empty, ConfigProvider, FloatButton, Popover } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import { useAccess, Access } from 'umi';
import { terminal } from '../../system/terminal/service';
import { isPC } from "@/utils/utils";
import { organization } from '../../system/company/service';
const { confirm } = Modal;
//MP
import { InfiniteScroll, List, NavBar, Space, DotLoading } from 'antd-mobile'
/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: JettyListItem) => {
  const hide = message.loading(<FormattedMessage
    id="pages.adding"
    defaultMessage="Adding"
  />);
  try {
    await addJetty({ ...fields });
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
const handleUpdate = async (fields: Partial<JettyListItem> ) => {
  const hide = message.loading(<FormattedMessage
    id="pages.modifying"
    defaultMessage="Modifying"
  />);
  try {
    await updateJetty({ ...fields });
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

/**
 *  Delete node
 * @zh-CN 删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: JettyListItem[], callBack: any) => {
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
        removeJetty({
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
  const [currentRow, setCurrentRow] = useState<JettyListItem>();
  const [selectedRowsState, setSelectedRows] = useState<JettyListItem[]>([]);
  const [organizationList, setOrganizationList] = useState<any>({});

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();
  const access = useAccess();
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [resizeObj, setResizeObj] = useState({ searchSpan: 12, tableScrollHeight: 300 });
  //--MP start
  const MPSearchFormRef = useRef<ProFormInstance>();

  const [showMPSearch, setShowMPSearch] = useState<boolean>(false);

  const [MPSorter, setMPSorter] = useState<any>({});


  
  const [isMP, setIsMP] = useState<boolean>(!isPC());

  const right = (
    <div style={{ fontSize: 24 }}>
      <Space style={{ '--gap': '16px' }}>
        {currentUser?.role_type != 'Terminal' && <SearchOutlined onClick={e => { setShowMPSearch(!showMPSearch) }} />}
        <Access accessible={access.canJettyAdd()} fallback={<div></div>}>
          <PlusOutlined onClick={() => { handleModalOpen(true) }} />
          </Access>
      </Space>
    </div>
  )

  const onFormSearchSubmit = (a) => {


    setData([]);
    delete a._timestamp;
    setMPfilter(a)
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
  const [MPfilter, setMPfilter] = useState<any>({})

  async function getData(page) {

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
   


        const append = await jetty({
          ...{
            "current": page,
            "pageSize": 10

          }, ...filter, sorter: sorter
        })

        if (page == 1) {
          setData([]);
        }
        console.log(append)
        setData(val => [...val, ...append.data])
        setHasMore(10 * (page - 1) + append.data.length < append.total)
        
    
    
  }
  async function loadMore(isRetry: boolean) {

    await getData(currentPage)
    setCurrentPage(currentPage + 1)
  }
  //--MP end
  const formRef = useRef<ProFormInstance>();
  useEffect(() => {

   
    organization({ type:'Terminal',sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setOrganizationList(b)

    });





  }, [true]);
  const uploadprops = {
    // 这里我们只接受excel2007以后版本的文件，accept就是指定文件选择框的文件类型
    accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    name: 'file',
    headers: {
      authorization: 'authorization-text',
    },
    showUploadList: false,
    // 把excel的处理放在beforeUpload事件，否则要把文件上传到通过action指定的地址去后台处理
    // 这里我们没有指定action地址，因为没有传到后台
    beforeUpload:  (file, fileList) => {
      let terminal_id = formRef.current?.getFieldValue('terminal_id')
      if (!terminal_id) {
        message.error(<FormattedMessage
          id="pages.jetty.p"
          defaultMessage="Please select terminal first!"
        />);
        return
      }

      const rABS = true;
      const f = fileList[0];
      const reader = new FileReader();
      reader.onload = async (e )=> {
        let dataResult = e.target.result;
        if (!rABS) dataResult = new Uint8Array(dataResult);
        const workbook = XLSX.read(dataResult, {
          type: rABS ? 'binary' : 'array',
        });
        // 假设我们的数据在第一个标签
        const firstWorksheet = workbook.Sheets[workbook.SheetNames[0]];
        // XLSX自带了一个工具把导入的数据转成json
        let jsonArr = XLSX.utils.sheet_to_json(firstWorksheet, { header: 1 });
        // 通过自定义的方法处理Json,得到Excel原始数据传给后端，后端统一处理
        jsonArr.shift()
        jsonArr=jsonArr.map(a => {
          let b = {}
          b.name = a[0]
          b.depth_alongside = a[1]+""
          b.depth_approaches = a[2] + ""
          b.max_loa = a[3] + ""
          b.min_loa = a[4] + ""
          b.max_displacement = a[5] + ""
          b.mla_envelop_at_mhws_3m = a[6] + ""
          b.terminal_id = formRef.current?.getFieldValue('terminal_id')
          return b
        })
        var s = await handleAdd({ batch_data: jsonArr })
        if (s) {
          if (actionRef.current) {
            actionRef.current.reload();

          }
        }
        
       
      };
      if (rABS) reader.readAsBinaryString(f);
      else reader.readAsArrayBuffer(f);
      return false;
    },
  };

  const getOrganizationName = () => {
    if (currentUser?.role_type == "Super") {
      return 'Terminal'
    }
    if (currentUser?.role_type == "Trader") {
      return 'Terminal'
    }
    if (currentUser?.role_type == "Terminal") {
      return 'Customer'
    }
  }
  const columns: ProColumns<JettyListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.jetty.xxx"
          defaultMessage="Jetty No."
        />
      ),
      sorter: true,
      hideInSearch: true,
      defaultSortOrder: 'ascend',
      dataIndex: 'name',
     
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },

    {
      title: getOrganizationName(),
      dataIndex: 'terminal_id',
      sorter: true,
      hideInTable: currentUser?.role_type == 'Terminal' ? true : false,
      hideInSearch: currentUser?.role_type == 'Terminal' ? true : false,
    
      valueEnum: organizationList,
      render: (dom, entity) => {
        if (currentUser?.role_type == 'Super') {
          return organizationList[entity.terminal_id] 
        } else if (currentUser?.role_type == 'Trader') {
          return organizationList[entity.terminal_id]
        } else if (currentUser?.role_type == 'Terminal') {
          return organizationList[entity.terminal_id]
        } else {
          return "-"
        }
      },
      fieldProps: {
        notFoundContent: <Empty />,
      },
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
      title: <FormattedMessage id="pages.jetty.depthAlongside" defaultMessage="Depth Alongside (M)" />,
      dataIndex: 'depth_alongside',
      valueType: 'text',
      sorter: true,
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.jetty.depthApproaches" defaultMessage="Depth Approaches (M)" />,
      dataIndex: 'depth_approaches',
      valueType: 'text',
      sorter: true,
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.jetty.maxLOA" defaultMessage="Max. LOA (M)" />,
      dataIndex: 'max_loa',
      valueType: 'text',
      sorter: true,
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.jetty.minLOA" defaultMessage="Min. LOA (M)" />,
      dataIndex: 'min_loa',
      valueType: 'text',
      sorter: true,
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.jetty.maxDisplacement" defaultMessage="Max. Displacement (MT)D
" />,
      dataIndex: 'max_displacement',
      width: 200,
      valueType: 'text',
      sorter: true,
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.jetty.mlaEnvelopAtMHWS3m" defaultMessage="MLA Envelop At MHWS 3.0m (Unless Otherwise Specified) (M)
" />,
      width:320,
      dataIndex: 'mla_envelop_at_mhws_3m',
      valueType: 'text',
      sorter: true,
      hideInSearch: true,
    },
    
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      hideInTable: !access.canJettyMod(),
      render: (_, record) => [
        <Access accessible={access.canJettyMod()} fallback={<div></div>}>
        <a
          key="config"
          onClick={() => {
            handleUpdateModalOpen(true);
            setCurrentRow(record);
          }}
        >
          <FormOutlined style={{ fontSize: '20px' }} /> 
          </a>
        </Access>,
        <Access accessible={access.canJettyDel()} fallback={<div></div>}>
          <a
            title={formatMessage({ id: "pages.delete", defaultMessage: "Delete" })}
            key="config"
            onClick={() => {
              setCurrentRow(record);
              handleRemove([record], (success) => {
                if (success) {
                  if (isMP) {
                    setData([]);
                    getData(1)
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
        const { innerWidth, innerHeight } = window;

        if (offset.width > 1280) {
         
          setResizeObj({ ...resizeObj, searchSpan: 8, tableScrollHeight: innerHeight - 420 });
        }
        if (offset.width < 1280 && offset.width > 900) {
         
          setResizeObj({ ...resizeObj, searchSpan: 12, tableScrollHeight: innerHeight - 420 });
        }
        if (offset.width < 900 && offset.width > 700) {
          setResizeObj({ ...resizeObj, searchSpan: 24, tableScrollHeight: innerHeight - 420 });
          
        }

      

      }}
    >
      <PageContainer className="myPage" header={{
        title: isMP ? null : < FormattedMessage id="'pages.jetty.title" defaultMessage={"Jetty - "+  currentUser?.company_name} />,
      breadcrumb: {},
      extra: isMP ? null : [
        <Access accessible={access.canJettyAdd()} fallback={<div></div>}> <Button
          type="primary"
          key="primary"
          onClick={() => {
            handleModalOpen(true);
          }}
        >
          <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
        </Button></Access>/*, <Access accessible={access.canJettyAdd()} fallback={<div></div>}> <Upload {...uploadprops}>
          <Tooltip title="">
            <Button type="primary">
              Batch Add
            </Button>
          </Tooltip>
        </Upload></Access>*/
      ]
    }}>
      {!isMP && (<ConfigProvider renderEmpty={customizeRenderEmpty}><ProTable<JettyListItem, API.PageParams>
        formRef={formRef }
          className="mytable"
          bordered
        actionRef={actionRef}
          rowKey="id"
          scroll={{ x: 1800, y: resizeObj.tableScrollHeight }}
          search={currentUser?.role_type != 'Terminal'?{
          labelWidth: 130,
          span: resizeObj.searchSpan,
            searchText: < FormattedMessage id="pages.search" defaultMessage="Search" />
          } : false}
        options={false }
        request={(params, sorter) => jetty({ ...params, sorter })}
        columns={columns}
        rowSelection={access.canJettyDel() ?{ 
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }:false}
      /></ConfigProvider >)}

        {isMP && (<>

          <NavBar backArrow={false} left={<div> <Popover placement="bottom" title={""} content={<div>{columns.filter(a => (a.hasOwnProperty('sorter') && a['sorter'])).map((a) => {

            return (<div><Button onClick={() => {
              setMPSorter({ [a.dataIndex]: 'ascend' })
            
              
               getData(1)
               
             
            }} icon={<SortAscendingOutlined />} />
              <Button style={{ margin: 5 }} onClick={() => {
                setMPSorter({ [a.dataIndex]: 'descend' })
                
                  getData(1)
                
              }} icon={<SortDescendingOutlined />} />
              <span>{a.title}</span>
            </div>)

          })}</div>} trigger="click">
            <SwapOutlined rotate={90} />
          </Popover></div> } right={right} onBack={back}>
          {intl.formatMessage({
            id: 'pages.jetty.title',
            defaultMessage: 'Jetty - ' + currentUser?.company_name,
          })}
        </NavBar>

        <div style={{ padding: '20px', backgroundColor: "#5187c4", display: showMPSearch ? 'block' : 'none' }}>
            <Search columns={columns.filter(a => !(a.hasOwnProperty('hideInSearch') && a['hideInSearch']))} action={actionRef} loading={false}

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
                className="jetty-descriptions"
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
          <FloatButton.BackTop visibilityHeight={0} />
      </>)}
      {selectedRowsState?.length > 0 && (

        <Access accessible={access.canJettyDel()} fallback={<div></div>}>
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
              await handleRemove(selectedRowsState, (success) => {
                if (success) {
                  setSelectedRows([]);
                  if (isMP) {
                    setData([]);
                    getData(1)
                  }
                  actionRef.current?.reloadAndRest?.();
                }
               
              });
              
            }}
          >
            <FormattedMessage
              id="pages.searchTable.batchDeletion"
              defaultMessage="Batch deletion"
            />
          </Button>
          
          </FooterToolbar>
          </Access>
      )}
      
      <CreateForm
        onSubmit={async (value) => {
          value.id = currentRow?.id
          const success = await handleAdd(value as JettyListItem);
          if (success) {
            handleModalOpen(false);
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
          <ProDescriptions<JettyListItem>
            column={isMP ? 1 : 2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<JettyListItem>[]}
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
      </PageContainer></RcResizeObserver>
  );
};

export default TableList;
