import React, { Component, useState } from 'react';
import RcResizeObserver from 'rc-resize-observer';
import { useModel } from '@umijs/max';
import { useAccess, Access } from 'umi';
import {
 
  PageContainer,
 
} from '@ant-design/pro-components';
const EOSInstructionManualGuide: React.FC = () => {
 
  const [resizeObj, setResizeObj] = useState({ searchSpan: 12, tableScrollHeight: 300 });
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const access = useAccess();
  var url = ""
  if (access.canAdmin) {
    url = "https://eosuat.southeastasia.cloudapp.azure.com/EOSInstructionManualGuide/EOSInstructionManualGuideforSuperuser.htm"
  } else if (access.dashboard_tab() || access.alertrule_list_tab() || access.transactions_list_tab() || access.jetty_list_tab() || access.alert_list_tab()) {

    url = "https://eosuat.southeastasia.cloudapp.azure.com/EOSInstructionManualGuide/EOSInstructionManualGuideforTerminal.htm"
  } else {
    url = "https://eosuat.southeastasia.cloudapp.azure.com/EOSInstructionManualGuide/EOSInstructionManualGuideforTrader.htm"
  }

  


  const [iframeUrl, setIframeUrl] = useState(url);

    
    return (
      <PageContainer className="myPage transactions-page" header={{
        title: false
      }}>
      <RcResizeObserver
        key="resize-observer"
        onResize={(offset) => {
          const { innerWidth, innerHeight } = window;

          var h = 150
         
            setResizeObj({ ...resizeObj, searchSpan: 24, tableScrollHeight: innerHeight - h });

          



        }}
      >
      <div>

          <iframe frameBorder="0" src={iframeUrl} height={resizeObj.tableScrollHeight +"px"} width="100%"></iframe>
        </div>
        </RcResizeObserver>
        </PageContainer>
    );
  
}
export default EOSInstructionManualGuide;
