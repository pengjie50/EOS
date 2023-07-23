import React, { useRef } from 'react';
import { Modal } from 'antd';
import { useReactToPrint } from "react-to-print";
import csstyle from "./index.less";
import moment from 'moment';
import ProTable from '@ant-design/pro-table';
import { WaterMark } from '@ant-design/pro-layout';
import { useModel } from 'umi';
import PrintProvider, { Print, NoPrint } from 'react-easy-print';
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
      if (a.dataIndex != 'option') {
        columns.push(a)
      }
      
    })
  



  const date = moment().format('YYYY-MM-DD HH:mm:ss').toString();
  return (
    <Modal
      width={2000 }
     
      centered
      destroyOnClose
      title={false}
      visible={props.printModalVisible}
      okText="Print"
      onCancel={() => {
        props.onCancel();
      }}
      onOk={() => {
        window.print();
        //handlePrint();
      }}
      keyboard={true}
    >





      <div className={csstyle.backgroud} style={{ height:'600px' }}>
        <PrintProvider>
          <Print single name="foo">
          <div style={{ paddingTop: 20, width: '100%' }}>
            
          
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
          </Print>
        </PrintProvider>
      </div>

    </Modal >

  );
};

export default FrPrint;
