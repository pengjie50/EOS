import React, { useRef } from 'react';
import { Modal } from 'antd';
import { useReactToPrint } from "react-to-print";
import csstyle from "./index.less";
import moment from 'moment';
import ProTable from '@ant-design/pro-table';
import { WaterMark } from '@ant-design/pro-layout';
import { useModel } from 'umi';

export type FormValueType = {
  target?: string;
  template?: string;
  type?: string;
  time?: string;
  frequency?: string;
};

export type UpdateFrPrintProps = {
  title?: string;
  subTitle?: string;
  columns: any[];
  dataSource: any[];
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  printModalVisible: boolean;

};
/**
 * ProTable - 高级表格 通用打印模块
 */
const FrPrint: React.FC<UpdateFrPrintProps> = (props) => {
  const { initialState } = useModel('@@initialState');
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => (componentRef.current != undefined) ? componentRef.current : null,
    onBeforeGetContent: () => (props.onCancel())
  });
  //console.log('columns', props.columns);

  const date = moment().format('YYYY-MM-DD HH:mm:ss').toString();
  return (
    <Modal
      width="80%"
      centered
      destroyOnClose
      title={false}
      visible={props.printModalVisible}
      okText="打印"
      onCancel={() => {
        props.onCancel();
      }}
      onOk={() => {
        console.log(props.columns)
        console.log(props.dataSource)
        handlePrint();//打印
      }}
      keyboard={true}
    >

      <div className={csstyle.backgroud} ref={componentRef}>
        <WaterMark content={initialState?.currentUser?.username}>
          <div style={{ padding: 30 }}>
            {/*<div style={{ width: '100%', textAlign: "center", color: '#aaaaaa' }}>西藏大麦 · Dmart</div>
            <h3 style={{ width: '100%', textAlign: "center" }}>{props.title}</h3>
            <h4>{props.subTitle}</h4>*/}
            {/* 普通 Table columns 不支持 valueType 属性
              <Table className={csstyle.table} columns={props.columns} dataSource={props.dataSource} pagination={false} bordered size="small" />
          */}
            <ProTable<any>
              columns={props.columns}
              dataSource={props.dataSource}
              rowKey="key"
              pagination={false}
              search={false}
              toolBarRender={false}
              bordered size="small"

            />
            {/*<div style={{ width: '100%', paddingTop: 30, textAlign: "center", color: '#aaaaaa', fontSize: 10 }}>打印日期:{date}</div>*/}
          </div>
        </WaterMark>
      </div>

    </Modal >

  );
};

export default FrPrint;
