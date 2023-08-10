import RcResizeObserver from 'rc-resize-observer';
import { ResizeObserverDo } from '@/components'
import { addJetty, removeJetty, jetty, updateJetty } from './service';
import { PlusOutlined, SearchOutlined, FormOutlined, DeleteOutlined, ExclamationCircleOutlined, SwapOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { JettyList, JettyListItem } from './data.d';
import MPSort from "@/components/MPSort";
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
import { Button, Drawer, Input, message, Upload, Tooltip, Modal, Empty, ConfigProvider, FloatButton, Popover, Pagination } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import { useAccess, Access } from 'umi';

import { isPC } from "@/utils/utils";
import { organization } from '../../system/company/service';
const { confirm } = Modal;
//MP
import { InfiniteScroll, List, NavBar, Space, DotLoading } from 'antd-mobile'
/**
 * @en-US Add node
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
 *
 * @param fields
 */
const handleUpdate = async (fields: Partial<JettyListItem>) => {
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
   *  */
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  /**
   * @en-US The pop-up window of the distribution update window
   * */
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<JettyListItem>();
  const [selectedRowsState, setSelectedRows] = useState<JettyListItem[]>([]);
  const [organizationList, setOrganizationList] = useState<any>({});

  /**
   * @en-US International configuration
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
        {!access.jetty_list_tab() && <SearchOutlined onClick={e => { setShowMPSearch(!showMPSearch) }} />}
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
  const [MPPagination, setMPPagination] = useState<any>({})
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
        "pageSize": 3

      }, ...filter, sorter: sorter
    })

    setMPPagination({ total: append.total })
    setData(append.data)



  }
  async function loadMore(isRetry: boolean) {

    await getData(currentPage)
    setCurrentPage(currentPage + 1)
  }
  //--MP end
  const formRef = useRef<ProFormInstance>();
  useEffect(() => {


    organization({ type: 'Terminal', sorter: { name: 'ascend' } }).then((res) => {
      var b = {}
      res.data.forEach((r) => {
        b[r.id] = r.name
      })
      setOrganizationList(b)

    });


    if (isMP) {
      getData(1)
    }


  }, [true]);
  const uploadprops = {
   
    accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    name: 'file',
    headers: {
      authorization: 'authorization-text',
    },
    showUploadList: false,
  
    beforeUpload: (file, fileList) => {
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
      reader.onload = async (e) => {
        let dataResult = e.target.result;
        if (!rABS) dataResult = new Uint8Array(dataResult);
        const workbook = XLSX.read(dataResult, {
          type: rABS ? 'binary' : 'array',
        });
       
        const firstWorksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        let jsonArr = XLSX.utils.sheet_to_json(firstWorksheet, { header: 1 });
       
        jsonArr.shift()
        jsonArr = jsonArr.map(a => {
          let b = {}
          b.name = a[0]
          b.depth_alongside = a[1] + ""
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
      title: "Terminal",
      dataIndex: 'terminal_id',
      sorter: true,
      hideInTable: access.jetty_list_tab() ? true : false,
      hideInSearch: access.jetty_list_tab() ? true : false,

      valueEnum: organizationList,
      render: (dom, entity) => {

        return organizationList[entity.terminal_id]


      },
      fieldProps: {
        multiple: true,
        mode: 'multiple',
        maxTagCount: 0,
        maxTagPlaceholder: (omittedValues) => {
          return omittedValues.length + " Selected"
        },
        notFoundContent: <Empty />,
      },
      search: {
        transform: (value) => {
          if (value) {
            return {
              'terminal_id': {
                'field': 'terminal_id',
                'op': 'in',
                'data': value
              }
            }
          }

        }
      }
    },
    {
      title: <FormattedMessage id="pages.jetty.xxx" defaultMessage="Depth Alongside (M)" />,
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
      width: 320,
      dataIndex: 'mla_envelop_at_mhws_3m',
      valueType: 'text',
      sorter: true,
      hideInSearch: true,
    },

    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      hideInTable: !access.canJettyMod() && !access.canJettyDel(),
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


        ResizeObserverDo(offset, setResizeObj, resizeObj)



      }}
    >
      <PageContainer className="myPage" header={{
        title: isMP ? null : < FormattedMessage id="'pages.jetty.xxx" defaultMessage={"Jetty"} />,
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
          formRef={formRef}
          className="mytable"
          bordered
          actionRef={actionRef}
          rowKey="id"
          pagination={{ size: "default" }}
          scroll={{ y: resizeObj.tableScrollHeight }}
          search={!access.jetty_list_tab() ? {
            labelWidth: 130,
            span: resizeObj.searchSpan,
            searchText: < FormattedMessage id="pages.search" defaultMessage="Search" />
          } : false}
          options={false}
          request={(params, sorter) => jetty({ ...params, sorter })}
          columns={columns}
          rowSelection={access.canJettyDel() ? {
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
              id: 'pages.jetty.title',
              defaultMessage: 'Jetty',
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
        
      </PageContainer></RcResizeObserver>
  );
};

export default TableList;
