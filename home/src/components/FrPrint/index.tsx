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

const FrPrint: React.FC<UpdateFrPrintProps> = (props) => {
  const { initialState } = useModel('@@initialState');
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    
    content: () => (componentRef.current != undefined) ? componentRef.current : null,
    onBeforeGetContent: () => (props.onCancel())
  });
 
  var columns=[]

  

    props.columns.forEach((a) => {
      if (a && a.dataIndex != 'option') {
        columns.push(a)
      }
      
    })
  



  const date = moment().format('YYYY-MM-DD HH:mm:ss').toString();
  return (
    <Modal
      width="100%"
     
      centered
      destroyOnClose
      title={false}
      visible={props.printModalVisible}
      okText="Print"
      onCancel={() => {
        props.onCancel();
      }}
      onOk={() => {
       
        handlePrint();
      }}
      keyboard={true}
    >

      <div className={csstyle.backgroud} style={{ height:'600px' }}>
        {}
          <div style={{ paddingTop: 20, width: '100%', height:'580px', overflow: 'auto' }}>
            
          
            <div ref={componentRef}>
            <ProTable<any>
              
              columns={columns}
              dataSource={props.dataSource}
              rowKey="key"
              pagination={false}
              search={false}
              toolBarRender={false}
              bordered size="small"

              />
              </div>
           
          </div>
       
      </div>

    </Modal >

  );
};

export default FrPrint;
