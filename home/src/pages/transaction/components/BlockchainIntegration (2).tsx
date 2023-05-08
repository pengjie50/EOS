import React, { useRef, useState, useEffect, useCallback } from 'react';
import { PageContainer, ProCard, ProColumns, ProDescriptions, ProFormGroup, ProFormSelect, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { AlertOutlined, SafetyCertificateOutlined, CheckOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { FormattedMessage, useIntl, useLocation, useModel, history } from '@umijs/max';
import { TransactionList, TransactionListItem } from '../data.d';
import { transaction, transactionevent, addTransactionevent } from '../service';
import { Button, Space, Steps, Icon, Select, message, Spin } from 'antd';
import { flow } from '../../system/flow/service';
import { filterOfTimestamps, addFilterOfTimestamps, updateFilterOfTimestamps } from '../../account/filterOfTimestamps/service';
import { getAlertBytransactionId } from '../../alert/service';
import { SvgIcon } from '@/components' // 自定义组件
import { tree, isPC } from "@/utils/utils";
import FilterForm from '../../account/filterOfTimestamps/components/FilterForm';
import { rearg } from 'lodash';
import { terminal } from '../../system/terminal/service';
import { producttype } from '../../system/producttype/service';
import { jetty } from '../../system/jetty/service';
import { alertrule } from '../../alertrule/service';
import { read } from 'xlsx';

var moment = require('moment');
const { Step } = Steps;


const is_do = (transactioneventList: any[], id: any) => {
  return transactioneventList.find((a) => {
    return a.flow_id == id
  })
}
var handleget: () => void
var handlegetFlow: (f: any) => void
const handleAdd = async (fields: any) => {
  const hide = message.loading(<FormattedMessage
    id="pages.adding"
    defaultMessage="Adding"
  />);
  try {
    await addFilterOfTimestamps({ ...fields });
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

const handleUpdate = async (fields: any) => {
  const hide = message.loading(<FormattedMessage
    id="pages.modifying"
    defaultMessage="Modifying"

  />);
  try {
    await updateFilterOfTimestamps({ ...fields });
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
const Detail: React.FC<any> = (props) => {

  const [currentFilter, setCurrentFilter] = useState<any>();
  const [currentRow, setCurrentRow] = useState<TransactionListItem>();
  const [flowTree, setFlowTree] = useState<any>([]);
  const [flowTreeAll, setFlowTreeAll] = useState<any>([]);
  const [flowList, setFlowList] = useState<any>([]);
  const [summaryList, setSummaryList] = useState<any>([]);
  const [transactionAlert, setTransactionAlert] = useState<any>([]);
  const [transactioneventList, setTransactioneventList] = useState<any>([]);
  const [transactioneventMap, setTransactioneventMap] = useState<any>(new Map());
  const [processMap, setProcessMap] = useState<any>(new Map());
  // const [transaction_id, setTransaction_id] = useState<any>("");
  const [filterOfTimestampsList, setFilterOfTimestampsList] = useState<any>([{ value: 'add', label: 'Add new template' }]);
  const [filterOfTimestampsMap, setFilterOfTimestampsMap] = useState<any>(new Map());
  const [terminalList, setTerminalList] = useState<any>({});
  const [jettyList, setJettyList] = useState<any>({});
  const [producttypeList, setProducttypeList] = useState<any>({});

  const [alertruleMap, setAlertruleMap] = useState<any>({});

  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [show, setShow] = useState<any>({});
  var transaction_id = useLocation().search.split("=")[1]
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [isAdd, setIsAdd] = useState<boolean>(false);

  const [totalDuration, setTotalDuration] = useState<any>(0);

  const [flowConf, setFlowConf] = useState<any>({});
  const [isMP, setIsMP] = useState<boolean>(!isPC());
  const columns: ProColumns<TransactionListItem>[] = [
   
    {
      title: <FormattedMessage id="pages.blockchainIntegration.stage" defaultMessage="Stage" />,
      dataIndex: 'start_of_transaction',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.blockchainIntegration.timeStamp" defaultMessage="Time Stamp" />,
      dataIndex: 'end_of_transaction',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.blockchainIntegration.activity" defaultMessage="Activity" />,
      dataIndex: 'arrival_id',
      hideInSearch: true
    },
    {
      title: <FormattedMessage id="pages.blockchainIntegration.validated" defaultMessage="Validated ( with Blockchain)" />,
      dataIndex: 'status',
      render: (dom, entity) => {
        if (dom == 1) {
          return <span>Y</span>
        } else {
          return <span>N</span>
        }
      }
    }
  ];


  useEffect(() => {
    
    return () => {

    };
  },
    []
  );

  var color = {
    'icon-daojishimeidian': '#A13736',
    'icon-matou': '#ED7D31',
    'icon-a-tadiao_huaban1': '#70AD47',
    'icon-zhuanyunche': '#70AD47',
    'icon-matou1': '#595959'
  }

  return (<div
    style={{
      background: '#F5F7FA',
    }}
  >
    <PageContainer

      header={{
        title: "Transactions Timestamp Validation"

      }}

    >
     
      {!isMP && (<ProTable<any>
        columns={columns}
        dataSource={currentRow ? [currentRow] : []}
        rowKey="key"
        pagination={false}
        search={false}
        toolBarRender={false}
        bordered size="small"

      />)}

      {isMP && (<> <ProDescriptions<any>
        bordered={true}
        size="small"
        layout="horizontal"
        column={1}
        title={currentRow?.process_name}
        request={async () => ({
          data: currentRow || {},
        })}
        params={{
          id: currentRow?.id,
        }}
        columns={columns as ProDescriptionsItemProps<any>[]}
      /></>)

      }

    </PageContainer>
  </div>)
}
export default Detail;
