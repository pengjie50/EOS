import RcResizeObserver from 'rc-resize-observer';
import { addCompany, removeCompany, company, updateCompany } from './service';
import { PlusOutlined, SearchOutlined, FormOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { CompanyList, CompanyListItem } from './data.d';
import { fieldSelectData } from '@/services/ant-design-pro/api';
import MPSort from "@/components/MPSort";
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
import { FormattedMessage, useIntl, formatMessage } from '@umijs/max';
import { Button, Drawer, Input, message, Modal, Empty } from 'antd';
import React, { useRef, useState } from 'react';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import { isPC, tree } from "@/utils/utils";
const { confirm } = Modal;
//MP
import { InfiniteScroll, List, NavBar, Space, DotLoading } from 'antd-mobile'
/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: CompanyListItem) => {
  const hide = message.loading(<FormattedMessage
    id="pages.adding"
    defaultMessage="Adding"
  />);
  try {
    await addCompany({ ...fields });
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
const handleUpdate = async (fields: Partial<CompanyListItem> ) => {
  const hide = message.loading(<FormattedMessage
    id="pages.modifying"
    defaultMessage="Modifying"
  />);
  try {
    await updateCompany({ ...fields });
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
const handleRemove = async (selectedRows: CompanyListItem[], callBack: any) => {
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
         removeCompany({
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
  const [currentRow, setCurrentRow] = useState<CompanyListItem>();
  const [selectedRowsState, setSelectedRows] = useState<CompanyListItem[]>([]);
  const [resizeObj, setResizeObj] = useState({ searchSpan: 12, tableScrollHeight: 300 });

  const [MPSorter, setMPSorter] = useState<any>({});
  const [nameData, setNameData] = useState<any>({});
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();
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

  async function getData(page, filter__) {

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
    const append = await company({
      ...{
        "current": page,
        "pageSize": 10

      }, ...filter, sorter
    })

    if (page == 1) {
      setData([]);
    }
    
    setData(val => [...val, ...append.data])
    setHasMore(10 * (page - 1) + append.data.length < append.total)
  }
  async function loadMore(isRetry: boolean) {

    await getData(currentPage, MPfilter)
    setCurrentPage(currentPage + 1)
  }
  //--MP end
  const columns: ProColumns<CompanyListItem>[] = [

    /*{
      title: 'Series No',
      dataIndex: 'company_id',
      width: 130,
      sorter: true
    //  valueType: 'index',
     // align: 'center',
     // render: (dom) => <div style={{ display: 'flex', justifyContent: 'center' }}>{dom}</div>,
    },*/
    {
      title: <FormattedMessage
        id="pages.company.name"
        defaultMessage="Organization name"
      />,
      dataIndex: 'name',
      sorter: true,
      valueEnum: nameData,
      search: {
        transform: (value) => {

          if (value !== null) {
            return {

              name: {
                'field': 'name',
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
        notFoundContent: <Empty description={'Oops! There appears to be no valid records based on your search criteria.'} />,
        showSearch: true,
        allowClear: true,
        onFocus: () => {
          fieldSelectData({ model: "Company", value: '', field: 'name' }).then((res) => {
            setNameData(res.data)
          })
        },
        onSearch: (newValue: string) => {

          fieldSelectData({ model: "Company", value: newValue, field: 'name' }).then((res) => {
            setNameData(res.data)
          })

        }
      }
    },
    
   
    {
      title: <FormattedMessage id="pages.company.xxx" defaultMessage="Organization Type" />,
      dataIndex: 'type',
      sorter: true,
      search: {
        transform: (value) => {

          if (value !== null) {
            return {

              type: {
                'field': 'type',
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
      },
      valueEnum:{
      "Surveyor": "Surveyor",
      "Trader": "Trader",
      "Agent": "Agent",
      "Terminal": "Oil Terminal",
      "Pilot": "Pilot",
      "Super": "Super",


    }
      
    },
    {
      title: <FormattedMessage id="pages.company.description" defaultMessage="Organization Description" />,
      dataIndex: 'description',
      hideInSearch: true,
     
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      width: 80,
      valueType: 'option',
      render: (_, record) => [
        <a
          key="config"
          onClick={() => {
            handleUpdateModalOpen(true);
            setCurrentRow(record);
          }}
        >
          <FormOutlined style={{ fontSize: '20px' }} />
        </a>,

        <a
          title={formatMessage({ id: "pages.delete", defaultMessage: "Delete" })}
          key="config"
          onClick={() => {
            setCurrentRow(record);
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
       
      ],
    },
  ];

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
        title: isMP ? null : < FormattedMessage id="pages.company.title" defaultMessage="Organization" />,
      breadcrumb: {},
      extra: isMP ? null : [<Button
        type="primary"
        key="primary"
        onClick={() => {
          handleModalOpen(true);
        }}
      >
        <PlusOutlined /> <FormattedMessage id="pages.xxx" defaultMessage="Add In New Organisation" />
      </Button>]
    }}>
      {!isMP && (<ProTable<CompanyListItem, API.PageParams>
          pagination={{ size: "default" }}
        actionRef={actionRef}
          rowKey="id"
          bordered
          scroll={{ x: '100%', y: resizeObj.tableScrollHeight }}
        search={{
          labelWidth: 180,
          span: resizeObj.searchSpan,
          searchText: < FormattedMessage id="pages.search" defaultMessage="Search" />
        }}
        className="mytable"
        options={false }
        request={async (params, sorter) => {
          var d = await company({ ...params, sorter })
         // d.data = tree(d.data, "                                    ", 'pid')
          return d
        }}
       
        columns={columns}
       
      />)}

      {isMP && (<>

          <NavBar backArrow={false} left={
            <MPSort columns={columns} onSort={(k) => {
              setMPSorter(k)
              getData(1)
            }} />} right={right} onBack={back}>
          {intl.formatMessage({
            id: 'pages.company.title',
            defaultMessage: 'Organization List',
          })}
        </NavBar>

        <div style={{ padding: '20px', backgroundColor: "#5000B9", display: showMPSearch ? 'block' : 'none' }}>
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
        <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
          <InfiniteScrollContent hasMore={hasMore} />
        </InfiniteScroll>
      </>)}
      
      
      <CreateForm
        onSubmit={async (value) => {
          value.id = currentRow?.id
          const success = await handleAdd(value as CompanyListItem);
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
          <ProDescriptions<CompanyListItem>
            
            column={isMP ? 1 : 2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<CompanyListItem>[]}
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
