import RcResizeObserver from 'rc-resize-observer';
import { addUser, removeUser, user, updateUser } from './service';
import { PlusOutlined, SearchOutlined, FormOutlined, DeleteOutlined, LogoutOutlined,CloseCircleOutlined,ExclamationCircleOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { UserList, UserListItem } from './data.d';
import MPSort from "@/components/MPSort";
import { outLogin } from '@/services/ant-design-pro/api';
import { fieldSelectData } from '@/services/ant-design-pro/api';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  ProFormTextArea,
  Search,
  ProFormInstance,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, formatMessage } from '@umijs/max';
import { Button, Drawer, Input, message, Modal, Empty, Pagination, FloatButton, ConfigProvider } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import { isPC } from "@/utils/utils";
const { confirm } = Modal;
//MP
import { InfiniteScroll, List, NavBar, Space, DotLoading } from 'antd-mobile'
import { role } from '../../system/role/service';
import { company } from '../../system/company/service';
/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: UserListItem) => {
  const hide = message.loading(<FormattedMessage
    id="pages.adding"
    defaultMessage="Adding"
  />);
  try {
    await addUser({ ...fields });
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
const handleUpdate = async (fields: Partial<UserListItem> ) => {
  const hide = message.loading(<FormattedMessage
    id="pages.modifying"
    defaultMessage="Modifying"
  />);
  try {
    await updateUser({ ...fields });
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
const handleRemove = async (selectedRows: UserListItem[], callBack: any) => {
  if (!selectedRows) return true;
  var open = true
  confirm({
    title: 'Delete Account?',
    closable:true,
    open: open,
    icon: <ExclamationCircleOutlined />,
    content: <div style={{ marginLeft:-16 }}><div>You are about to delete this user account! This action cannot be undone and all the data related to this user account will be deleted from the system.

      </div>

      <div style={{ marginTop: 10, marginBottom:10 }}>Deleting this user account will do the following:</div>

      <div style={{ color: '#999' }} ><CloseCircleOutlined style={{ color:'red' }} /> Log user out on all devices</div>
      <div style={{ color: '#999' }} ><CloseCircleOutlined style={{ color: 'red' }} /> Delete all of user’s account information</div>

      <div style={{ fontWeight: 500, marginTop: 10}}>Confirm if you would like to proceed</div>
    </div>,
    okText:"Proceed",
    onOk() {


      const hide = message.loading(<FormattedMessage
        id="pages.deleting"
        defaultMessage="Deleting"
      />);
      try {
        removeUser({
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
  const [MPSorter, setMPSorter] = useState<any>({});
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<UserListItem>();
  const [selectedRowsState, setSelectedRows] = useState<UserListItem[]>([]);
  const [roleList, setRoleList] = useState<any>({});
  const [companyList, setCompanyList] = useState<any>({});
  const [usernameData, setUsernameData] = useState<any>({});
  const [resizeObj, setResizeObj] = useState({ searchSpan: 12, tableScrollHeight: 300 });
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();
  //--MP start
  const MPSearchFormRef = useRef<ProFormInstance>();

  const [showMPSearch, setShowMPSearch] = useState<boolean>(false);
  const [isMP, setIsMP] = useState<boolean>(!isPC());



  useEffect(() => {

    role({  sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setRoleList(b)

    });

    company({  sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setCompanyList(b)

    });
    if (isMP) {
      getData(1)
    }
  },[true])

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
  const [MPPagination, setMPPagination] = useState<any>({})
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
    const append = await user({
      ...{
        "current": page,
        "pageSize": 3

      }, ...filter, sorter
    })

    setMPPagination({ total: append.total })
    setData(append.data)
  }
 
  //--MP end
  const columns: ProColumns<UserListItem>[] = [

    {
      title: <FormattedMessage id="pages.user.username" defaultMessage="Username" />,
      dataIndex: 'username',
      sorter: true,
      search: {
        transform: (value) => {
          if (value && value.length > 0) {
            return {
              'username': {
                'field': 'username',
                'op': 'in',
                'data': value
              }
            }
          }

        }
      },

      valueEnum: usernameData,
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
          fieldSelectData({ model: "User", value: '', field: 'username' }).then((res) => {
            setUsernameData(res.data)
          })
        },
        onSearch: (newValue: string) => {

          fieldSelectData({ model: "User", value: newValue, field: 'username' }).then((res) => {
            setUsernameData(res.data)
          })

        }
      }
    },

   
   /* {
      title: <FormattedMessage id="pages.user.nickname" defaultMessage="Nickname" />,
      dataIndex: 'nickname',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.user.email" defaultMessage="Email" />,
      dataIndex: 'email',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.user.phone" defaultMessage="Phone" />,
      dataIndex: 'phone',
      valueType: 'text',
    },*/
    {
      title: <FormattedMessage id="pages.user.xxx" defaultMessage="Organization" />,
      dataIndex: 'company_id',
      valueEnum: companyList,
      sorter: true,
      fieldProps: {
        multiple: true,
        showSearch: true,
        allowClear: true,
        mode: 'multiple',
        maxTagCount: 0,
        maxTagPlaceholder: (omittedValues) => {
          return omittedValues.length + " Selected"
        },
      },
      search: {
        transform: (value) => {
          if (value) {
            return {
              'company_id': {
                'field': 'company_id',
                'op': 'in',
                'data': value
              }
            }
          }

        }
      }
    },
    {
      title: <FormattedMessage id="pages.user.role" defaultMessage="Role" />,
      dataIndex: 'role_id',
      valueEnum: roleList,
      sorter: true,
      fieldProps: {
        multiple: true,
        showSearch: true,
        allowClear: true,
        mode: 'multiple',
        maxTagCount: 0,
        maxTagPlaceholder: (omittedValues) => {
          return omittedValues.length + " Selected"
        },
      },
      search: {
        transform: (value) => {
          if (value) {
            return {
              'role_id': {
                'field': 'role_id',
                'op': 'in',
                'data': value
              }
            }
          }

        }
      }
    },
    {
      title: <FormattedMessage id="pages.user.xxx" defaultMessage="Account Status" />,
      dataIndex: 'status',
      fieldProps: {
        multiple: true,
       
        allowClear: true,
        mode: 'multiple',
        maxTagCount: 0,
        maxTagPlaceholder: (omittedValues) => {
          return omittedValues.length + " Selected"
        },
      },
      search: {
        transform: (value) => {
          
          if (value !== null) {
            return {

              status: {
                'field': 'status',
                'op': 'in',
                'data':value
              }

            }
          }

        }
      },
      valueEnum: {
        0: { text: <FormattedMessage id="pages.user.normal" defaultMessage="Active" />, status: 'Success' },
        1: { text: <FormattedMessage id="pages.user.disable" defaultMessage="Disable" />, status: 'Error' },
      },
    },
    {
      title: <FormattedMessage id="pages.user.onlineStatus" defaultMessage="Online Status" />,
      dataIndex: 'online_status',
      search: {
        transform: (value) => {
          alert(value)
          if (value !== null) {
            return {

              online_status: {
                'field': 'online_status',
                'op': 'eq',
                'data': Number(value)
              }

            }
          }

        }
      },
      hideInSearch:true,
      valueEnum: {
        0: { text: <FormattedMessage id="pages.user.online" defaultMessage="Online" />, status: 'Success' },
        1: { text: <FormattedMessage id="pages.user.offline" defaultMessage="Offline" />, status: 'Error' },
      },
    },
    {
      title: (
        <FormattedMessage
          id="pages.createdAt"
          defaultMessage="Created at" 
        />
      ),
      sorter: true,
      dataIndex: 'created_at',
      valueType: 'dateTime',
      hideInSearch: true

    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Option" />,
      dataIndex: 'option',
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

        </a>,

        
        record.online_status ==0 ?  <a
          key="force_logout"
          title={"Force logout" }
          onClick={() => {
            outLogin({ user_id: currentRow?.id })
            message.success("Force logout success");
          }}
        >

          <LogoutOutlined />
          
        </a>:null
      ],
    },
  ];
  const formRef = useRef<ProFormInstance>();
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
      title: isMP ? null : < FormattedMessage id="pages.user.title" defaultMessage="User" />,
      breadcrumb: {},
      extra: isMP ? null : [
        <Button
          type="primary"
          key="primary"
          onClick={() => {
            handleModalOpen(true);
          }}
        >
          <PlusOutlined /> <FormattedMessage id="pages.xxx" defaultMessage="Create New User" />
        </Button>,
      ]
    }}>
        {!isMP && (<ConfigProvider renderEmpty={customizeRenderEmpty}><ProTable<UserListItem, API.PageParams>
       
        actionRef={actionRef}
          rowKey="id"
          formRef={formRef}
          scroll={{ x: 1800, y: resizeObj.tableScrollHeight }}
        search={{
          labelWidth: 130,
          span: resizeObj.searchSpan,
          searchText: < FormattedMessage id="pages.search" defaultMessage="Search" />
        }}
        className="mytable"
        options={false }
        request={(params, sorter) => user({ ...params, sorter })}
        columns={columns}
       bordered
        /></ConfigProvider>)}

      {isMP && (<>

          <NavBar backArrow={false} left={
            <MPSort columns={columns} onSort={(k) => {
              setMPSorter(k)
              getData(1)
            }} />} right={right} onBack={back}>
          {intl.formatMessage({
            id: 'pages.user.title',
            defaultMessage: 'User',
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
            {MPPagination.total > 0 ? <div style={{ textAlign: 'center', padding: "20px 10px 90px 10px" }}>
            <Pagination

              onChange={(page, pageSize) => {

                getData(page)
              }}
              total={MPPagination.total}
              simple
              showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
              defaultPageSize={3}
              defaultCurrent={1}
            />
            </div> : customizeRenderEmpty()}
          <FloatButton.BackTop visibilityHeight={0} />
      </>)}
     
      
      <CreateForm
        onSubmit={async (value) => {
          value.id = currentRow?.id
          const success = await handleAdd(value as UserListItem);
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
        {currentRow?.username && (
          <ProDescriptions<UserListItem>
            
            column={isMP ? 1 : 2}
            title={currentRow?.username}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.username,
            }}
            columns={columns as ProDescriptionsItemProps<UserListItem>[]}
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
