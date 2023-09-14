import RcResizeObserver from 'rc-resize-observer';
import { history } from '@umijs/max';
import { ResizeObserverDo } from '@/components'
import { fieldSelectData } from '@/services/ant-design-pro/api';
import { addInterfacedata, removeInterfacedata, interfacedata, updateInterfacedata } from './service';
import { PlusOutlined, SearchOutlined, FormOutlined, DeleteOutlined, ExclamationCircleOutlined, SwapOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { InterfacedataList, InterfacedataListItem } from './data.d';
import * as XLSX from 'xlsx';
import moment from 'moment'
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
import { Button, Drawer, Input, message, Upload, Tooltip, Modal, Empty, ConfigProvider, Pagination, Popover, FloatButton } from 'antd';
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
const handleAdd = async (fields: InterfacedataListItem) => {
  const hide = message.loading(<FormattedMessage
    id="pages.adding"
    defaultMessage="Adding"
  />);
  try {
    await addInterfacedata({ ...fields });
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
const handleUpdate = async (fields: Partial<InterfacedataListItem>) => {
  const hide = message.loading(<FormattedMessage
    id="pages.modifying"
    defaultMessage="Modifying"
  />);
  try {
    await updateInterfacedata({ ...fields });
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
const handleRemove = async (selectedRows: InterfacedataListItem[], callBack: any) => {
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
        removeInterfacedata({
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
  const [currentRow, setCurrentRow] = useState<InterfacedataListItem>();
  const [selectedRowsState, setSelectedRows] = useState<InterfacedataListItem[]>([]);
  const [organizationList, setOrganizationList] = useState<any>({});

  const [imo_numberData, setImo_numberData] = useState<any>({});


  const [eos_idData, setEos_idData] = useState<any>({});
  const [work_order_idData, setWork_order_idData] = useState<any>({});


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
        {currentUser?.role_type != 'Terminal' && <SearchOutlined onClick={e => { setShowMPSearch(!showMPSearch) }} />}
        <Access accessible={access.canInterfacedataAdd()} fallback={<div></div>}>
          {/*<PlusOutlined onClick={() => { handleModalOpen(true) }} />*/}
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



    const append = await interfacedata({
      ...{
        "current": page,
        "pageSize": 3

      }, ...filter, sorter: sorter
    })


    setMPPagination({ total: append.total })
    setData(append.data)



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
          id="pages.interfacedata.p"
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
  const columns: ProColumns<InterfacedataListItem>[] = [

    {
      title: "Type",
      dataIndex: 'type',
      valueType: 'text',
      width: 80,
      sorter: true,
      fieldProps: {
        multiple: true,
        mode: 'multiple',
        maxTagCount: 0,
        maxTagPlaceholder: (omittedValues) => {
          return omittedValues.length + " Selected"
        },
      },
      valueEnum: {
        1: "DE 1",
        2: "DE 2",
        3: "DE 3",
        4: "DE 4",
        5: "DE 5",
      },
      search: {
        transform: (value) => {

          if (value && value.length > 0) {
            return {

              status: {
                'field': 'type',
                'op': 'in',
                'data': value
              }

            }
          }

        }
      },

    },

    {
      title: "IMO Number",
      dataIndex: 'imo_number',
      valueEnum: imo_numberData,
      search: {
        transform: (value) => {

          if (value && value.length > 0) {
            return {

              status: {
                'field': 'imo_number',
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
          fieldSelectData({ model: "Interfacedata", value: '', field: 'imo_number' }).then((res) => {
            setImo_numberData(res.data)
          })
        },
        onSearch: (newValue: string) => {

          fieldSelectData({ model: "Interfacedata", value: newValue, field: 'imo_number' }).then((res) => {
            setImo_numberData(res.data)
          })

        }
      },
      width: 120,
      sorter: true
    },
    {
      title: "Work Order ID",
      dataIndex: 'work_order_id',
      width: 120,
      valueEnum: work_order_idData,
      sorter: true,
      search: {
        transform: (value) => {

          if (value && value.length > 0) {
            return {

              status: {
                'field': 'work_order_id',
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
          fieldSelectData({ model: "Interfacedata", value: '', field: 'work_order_id' }).then((res) => {
            setWork_order_idData(res.data)
          })
        },
        onSearch: (newValue: string) => {

          fieldSelectData({ model: "Interfacedata", value: newValue, field: 'work_order_id' }).then((res) => {
            setWork_order_idData(res.data)
          })

        }
      },
    },

    {
      title: "Json Data String",
      dataIndex: 'json_string',
      valueType: 'text',
      ellipsis: isMP ? false : true,
      sorter: true
    },
    {
      title: "Used Status",
      dataIndex: 'already_used',
      valueType: 'text',
      width: 120,
      sorter: true,
      valueEnum: {
        1: "Already Used",
        0: "Not Used",
        2: "Already Used",
      },
    },
    {
      title: "EOS ID",
      sorter: true,
      width: 100,
      valueEnum: eos_idData,
      defaultSortOrder: 'ascend',
      dataIndex: 'eos_id',
      search: {
        transform: (value) => {

          if (value && value.length > 0) {
            return {

              status: {
                'field': 'eos_id',
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
          fieldSelectData({ model: "Interfacedata", value: '', field: 'eos_id' }).then((res) => {
            setEos_idData(res.data)
          })
        },
        onSearch: (newValue: string) => {

          fieldSelectData({ model: "Interfacedata", value: newValue, field: 'eos_id' }).then((res) => {
            setEos_idData(res.data)
          })

        }
      },
      render: (dom, entity) => {
        if (entity.already_used == 1 || entity.already_used ==2) {
          return (
            <a
              onClick={() => {
                setCurrentRow(entity);
                history.push(`/transaction/detail`, { transaction_id: entity.transaction_id });
              }}
            >
              {"E" + entity.eos_id}
            </a>
          );
        } else {
          return '-'
        }

      },
    },
    {
      title: "Created At",
      sorter: true,
      defaultSortOrder: 'descend',
      hideInSearch: true,
      dataIndex: 'created_at',
      render: (dom, entity) => {

        return moment(new Date(dom)).format('DD MMM YYYY HH:mm:ss')

      },
      width: 200
    },

    {
      title: (
        <FormattedMessage
          id="pages.operlog.xxx"
          defaultMessage="Created At"
        />
      ),


      hideInForm: true,
      hideInTable: true,

      dataIndex: 'created_at',
      valueType: 'dateRange',
      search: {
        transform: (value) => {
          if (value && value.length > 0) {
            value[0] = moment(new Date(value[0])).format('YYYY-MM-DD') + " 00:00:00"
            value[1] = moment(new Date(value[1])).format('YYYY-MM-DD') + " 23:59:59"
            return {
              'oper_time': {
                'field': 'created_at',
                'op': 'between',
                'data': value
              }
            }
          }

        }
      }



    }

/*,
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      width:80,
      valueType: 'option',
      hideInTable: !access.canInterfacedataMod(),
      render: (_, record) => [
        <Access accessible={access.canInterfacedataMod()} fallback={<div></div>}>
        <a
          key="config"
          onClick={() => {
            handleUpdateModalOpen(true);
            setCurrentRow({ ...record, type: record.type + "" });
           
          }}
        >
          <FormOutlined style={{ fontSize: '20px' }} /> 
          </a>
        </Access>,
        <Access accessible={access.canInterfacedataDel()} fallback={<div></div>}>
          <a
            title={formatMessage({ id: "pages.delete", defaultMessage: "Delete" })}
            key="config"
            onClick={() => {
              setCurrentRow({ ...record, type: record.type+""});
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
        title: isMP ? null : < FormattedMessage id="'pages.interfacedata.xxx" defaultMessage={"Interface Data"} />,
        breadcrumb: {},
        extra: isMP ? null : [
          /* <Access accessible={access.canInterfacedataAdd()} fallback={<div></div>}> <Button
             type="primary"
             key="primary"
             onClick={() => {
               handleModalOpen(true);
             }}
           >
             <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
           </Button></Access>, <Access accessible={access.canInterfacedataAdd()} fallback={<div></div>}> <Upload {...uploadprops}>
             <Tooltip title="">
               <Button type="primary">
                 Batch Add
               </Button>
             </Tooltip>
           </Upload></Access>*/
        ]
      }}>
        {!isMP && (<ConfigProvider renderEmpty={customizeRenderEmpty}><ProTable<InterfacedataListItem, API.PageParams>
          formRef={formRef}
          className="mytable"
          bordered
          actionRef={actionRef}
          rowKey="id"
          pagination={{ size: "default" }}
          scroll={{ y: resizeObj.tableScrollHeight }}
          search={currentUser?.role_type != 'Terminal' ? {
            labelWidth: 150,
            span: resizeObj.searchSpan,
            searchText: < FormattedMessage id="pages.search" defaultMessage="Search" />
          } : false}
          options={false}
          request={(params, sorter) => interfacedata({ ...params, sorter })}
          columns={columns}
          rowSelection={access.canInterfacedataDel() ? {
            onChange: (_, selectedRows) => {
              setSelectedRows(selectedRows);
            },
          } : false}
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
          </Popover></div>} right={right} onBack={back}>
            {intl.formatMessage({
              id: 'pages.interfacedata.title',
              defaultMessage: 'Interface Data',
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
                  className="interfacedata-descriptions"
                  bordered={true}
                  size="small"
                  layout="vertical"
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

          <Access accessible={access.canInterfacedataDel()} fallback={<div></div>}>
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
            var data = eval("(" + value.json_string + ")");

            value.imo_number = data.toai_imo_number || null
            value.work_order_id = data.towoi_work_order_id || data.tosi_work_order_id || null

            value.already_used = 0




            const success = await handleAdd(value);
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
            <ProDescriptions<InterfacedataListItem>
              column={isMP ? 1 : 2}
              title={currentRow?.name}
              request={async () => ({
                data: currentRow || {},
              })}
              params={{
                id: currentRow?.name,
              }}
              columns={columns as ProDescriptionsItemProps<InterfacedataListItem>[]}
            />
          )}
        </Drawer>
       
      </PageContainer></RcResizeObserver>
  );
};

export default TableList;
