import React, { Component, useState } from 'react';
import RcResizeObserver from 'rc-resize-observer';
import { useModel } from '@umijs/max';
import { useAccess, Access } from 'umi';
import { tree, isPC } from "@/utils/utils";
import {
 
  PageContainer,
 
} from '@ant-design/pro-components';
const EOSInstructionManualGuide: React.FC = () => {
 
  const [resizeObj, setResizeObj] = useState({ searchSpan: 12, tableScrollHeight: 300 });
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [isMP, setIsMP] = useState<boolean>(!isPC());
  const access = useAccess();
  var url = ""
  if (access.canAdmin) {
    url = window.location.origin + "/EOSInstructionManualGuide/EOSInstructionManualGuideforSuperuser.htm"
  } else if (currentUser?.company_type == "Terminal") { 

    url = window.location.origin +"/EOSInstructionManualGuide/EOSInstructionManualGuideforTerminal.htm"
  } else {
    url = window.location.origin +"/EOSInstructionManualGuide/EOSInstructionManualGuideforTrader.htm"
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

          var h = 100
         
            setResizeObj({ ...resizeObj, searchSpan: 24, tableScrollHeight: innerHeight - h });

          



        }}
        >

          {isMP && <div>
           
              <iframe frameBorder="0" src={iframeUrl} height={resizeObj.tableScrollHeight + "px"} width="100%"></iframe>
            

          </div>}

          {!isMP && <div style={{ display: 'flex' }}>
            <div style={{ background: "#fff", width: '800px', margin: 'auto', height: resizeObj.tableScrollHeight + "px", overflow: 'hidden' }}>
              <iframe frameBorder="0" style={{ paddingLeft: '50px'}} src={iframeUrl} height={resizeObj.tableScrollHeight + "px"} width="100%"></iframe>
            </div>

          </div>}
          
        </RcResizeObserver>
        </PageContainer>
    );
  
}
export default EOSInstructionManualGuide;
