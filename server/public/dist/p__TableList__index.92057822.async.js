"use strict";(self.webpackChunkant_design_pro=self.webpackChunkant_design_pro||[]).push([[325],{64317:function(ie,$,a){var P=a(1413),K=a(91),V=a(22270),F=a(67294),G=a(66758),c=a(24981),z=a(85893),O=["fieldProps","children","params","proFieldProps","mode","valueEnum","request","showSearch","options"],J=["fieldProps","children","params","proFieldProps","mode","valueEnum","request","options"],T=F.forwardRef(function(n,B){var R=n.fieldProps,E=n.children,I=n.params,t=n.proFieldProps,f=n.mode,w=n.valueEnum,b=n.request,W=n.showSearch,m=n.options,x=(0,K.Z)(n,O),C=(0,F.useContext)(G.Z);return(0,z.jsx)(c.Z,(0,P.Z)((0,P.Z)({valueEnum:(0,V.h)(w),request:b,params:I,valueType:"select",filedConfig:{customLightMode:!0},fieldProps:(0,P.Z)({options:m,mode:f,showSearch:W,getPopupContainer:C.getPopupContainer},R),ref:B,proFieldProps:t},x),{},{children:E}))}),Z=F.forwardRef(function(n,B){var R=n.fieldProps,E=n.children,I=n.params,t=n.proFieldProps,f=n.mode,w=n.valueEnum,b=n.request,W=n.options,m=(0,K.Z)(n,J),x=(0,P.Z)({options:W,mode:f||"multiple",labelInValue:!0,showSearch:!0,showArrow:!1,autoClearSearchValue:!0,optionLabelProp:"label"},R),C=(0,F.useContext)(G.Z);return(0,z.jsx)(c.Z,(0,P.Z)((0,P.Z)({valueEnum:(0,V.h)(w),request:b,params:I,valueType:"select",filedConfig:{customLightMode:!0},fieldProps:(0,P.Z)({getPopupContainer:C.getPopupContainer},x),ref:B,proFieldProps:t},m),{},{children:E}))}),Q=T,X=Z,A=Q;A.SearchSelect=X,A.displayName="ProFormComponent",$.Z=A},12159:function(ie,$,a){a.r($),a.d($,{default:function(){return Ee}});var P=a(70215),K=a.n(P),V=a(27424),F=a.n(V),G=a(17061),c=a.n(G),z=a(42122),O=a.n(z),J=a(17156),T=a.n(J),Z=a(2618),Q=a(51042),X=a(66958),A=a(95372),n=a(2236),B=a(37476),R=a(5966),E=a(90672),I=a(16842),t=a(9927),f=a(2453),w=a(96365),b=a(71577),W=a(85265),m=a(67294),x=a(62113),C=a(64317),S=a(1413),q=a(91),ce=a(22270),_=a(78045),pe=a(90789),ee=a(24981),e=a(85893),me=["fieldProps","options","radioType","layout","proFieldProps","valueEnum"],fe=m.forwardRef(function(l,o){var r=l.fieldProps,i=l.options,g=l.radioType,s=l.layout,y=l.proFieldProps,k=l.valueEnum,U=(0,q.Z)(l,me);return(0,e.jsx)(ee.Z,(0,S.Z)((0,S.Z)({valueType:g==="button"?"radioButton":"radio",ref:o,valueEnum:(0,ce.h)(k,void 0)},U),{},{fieldProps:(0,S.Z)({options:i,layout:s},r),proFieldProps:y,filedConfig:{customLightMode:!0}}))}),he=m.forwardRef(function(l,o){var r=l.fieldProps,i=l.children;return(0,e.jsx)(_.ZP,(0,S.Z)((0,S.Z)({},r),{},{ref:o,children:i}))}),ge=(0,pe.G)(he,{valuePropName:"checked",ignoreWidth:!0}),Y=ge;Y.Group=fe,Y.Button=_.ZP.Button,Y.displayName="ProFormComponent";var ve=Y,Fe=a(66758),Me=["fieldProps","proFieldProps"],ae="dateTime",Pe=m.forwardRef(function(l,o){var r=l.fieldProps,i=l.proFieldProps,g=(0,q.Z)(l,Me),s=(0,m.useContext)(Fe.Z);return(0,e.jsx)(ee.Z,(0,S.Z)({ref:o,fieldProps:(0,S.Z)({getPopupContainer:s.getPopupContainer},r),valueType:ae,proFieldProps:i,filedConfig:{valueType:ae,customLightMode:!0}},g))}),Te=Pe,xe=a(69400),je=function(o){var r=(0,t.useIntl)();return(0,e.jsxs)(x.L,{stepsProps:{size:"small"},stepsFormRender:function(g,s){return(0,e.jsx)(xe.Z,{width:640,bodyStyle:{padding:"32px 40px 48px"},destroyOnClose:!0,title:r.formatMessage({id:"pages.searchTable.updateForm.ruleConfig",defaultMessage:"\u89C4\u5219\u914D\u7F6E"}),open:o.updateModalOpen,footer:s,onCancel:function(){o.onCancel()},children:g})},onFinish:o.onSubmit,children:[(0,e.jsxs)(x.L.StepForm,{initialValues:{name:o.values.name,desc:o.values.desc},title:r.formatMessage({id:"pages.searchTable.updateForm.basicConfig",defaultMessage:"\u57FA\u672C\u4FE1\u606F"}),children:[(0,e.jsx)(R.Z,{name:"name",label:r.formatMessage({id:"pages.searchTable.updateForm.ruleName.nameLabel",defaultMessage:"\u89C4\u5219\u540D\u79F0"}),width:"md",rules:[{required:!0,message:(0,e.jsx)(t.FormattedMessage,{id:"pages.searchTable.updateForm.ruleName.nameRules",defaultMessage:"\u8BF7\u8F93\u5165\u89C4\u5219\u540D\u79F0\uFF01"})}]}),(0,e.jsx)(E.Z,{name:"desc",width:"md",label:r.formatMessage({id:"pages.searchTable.updateForm.ruleDesc.descLabel",defaultMessage:"\u89C4\u5219\u63CF\u8FF0"}),placeholder:r.formatMessage({id:"pages.searchTable.updateForm.ruleDesc.descPlaceholder",defaultMessage:"\u8BF7\u8F93\u5165\u81F3\u5C11\u4E94\u4E2A\u5B57\u7B26"}),rules:[{required:!0,message:(0,e.jsx)(t.FormattedMessage,{id:"pages.searchTable.updateForm.ruleDesc.descRules",defaultMessage:"\u8BF7\u8F93\u5165\u81F3\u5C11\u4E94\u4E2A\u5B57\u7B26\u7684\u89C4\u5219\u63CF\u8FF0\uFF01"}),min:5}]})]}),(0,e.jsxs)(x.L.StepForm,{initialValues:{target:"0",template:"0"},title:r.formatMessage({id:"pages.searchTable.updateForm.ruleProps.title",defaultMessage:"\u914D\u7F6E\u89C4\u5219\u5C5E\u6027"}),children:[(0,e.jsx)(C.Z,{name:"target",width:"md",label:r.formatMessage({id:"pages.searchTable.updateForm.object",defaultMessage:"\u76D1\u63A7\u5BF9\u8C61"}),valueEnum:{0:"\u8868\u4E00",1:"\u8868\u4E8C"}}),(0,e.jsx)(C.Z,{name:"template",width:"md",label:r.formatMessage({id:"pages.searchTable.updateForm.ruleProps.templateLabel",defaultMessage:"\u89C4\u5219\u6A21\u677F"}),valueEnum:{0:"\u89C4\u5219\u6A21\u677F\u4E00",1:"\u89C4\u5219\u6A21\u677F\u4E8C"}}),(0,e.jsx)(ve.Group,{name:"type",label:r.formatMessage({id:"pages.searchTable.updateForm.ruleProps.typeLabel",defaultMessage:"\u89C4\u5219\u7C7B\u578B"}),options:[{value:"0",label:"\u5F3A"},{value:"1",label:"\u5F31"}]})]}),(0,e.jsxs)(x.L.StepForm,{initialValues:{type:"1",frequency:"month"},title:r.formatMessage({id:"pages.searchTable.updateForm.schedulingPeriod.title",defaultMessage:"\u8BBE\u5B9A\u8C03\u5EA6\u5468\u671F"}),children:[(0,e.jsx)(Te,{name:"time",width:"md",label:r.formatMessage({id:"pages.searchTable.updateForm.schedulingPeriod.timeLabel",defaultMessage:"\u5F00\u59CB\u65F6\u95F4"}),rules:[{required:!0,message:(0,e.jsx)(t.FormattedMessage,{id:"pages.searchTable.updateForm.schedulingPeriod.timeRules",defaultMessage:"\u8BF7\u9009\u62E9\u5F00\u59CB\u65F6\u95F4\uFF01"})}]}),(0,e.jsx)(C.Z,{name:"frequency",label:r.formatMessage({id:"pages.searchTable.updateForm.object",defaultMessage:"\u76D1\u63A7\u5BF9\u8C61"}),width:"md",valueEnum:{month:"\u6708",week:"\u5468"}})]})]})},be=je,Ce=["defaultRender"],Se=function(){var l=T()(c()().mark(function o(r){var i;return c()().wrap(function(s){for(;;)switch(s.prev=s.next){case 0:return i=f.ZP.loading("\u6B63\u5728\u6DFB\u52A0"),s.prev=1,s.next=4,(0,Z.HP)(O()({},r));case 4:return i(),f.ZP.success("Added successfully"),s.abrupt("return",!0);case 9:return s.prev=9,s.t0=s.catch(1),i(),f.ZP.error("Adding failed, please try again!"),s.abrupt("return",!1);case 14:case"end":return s.stop()}},o,null,[[1,9]])}));return function(r){return l.apply(this,arguments)}}(),ye=function(){var l=T()(c()().mark(function o(r){var i;return c()().wrap(function(s){for(;;)switch(s.prev=s.next){case 0:return i=f.ZP.loading("Configuring"),s.prev=1,s.next=4,(0,Z.D7)({name:r.name,desc:r.desc,key:r.key});case 4:return i(),f.ZP.success("Configuration is successful"),s.abrupt("return",!0);case 9:return s.prev=9,s.t0=s.catch(1),i(),f.ZP.error("Configuration failed, please try again!"),s.abrupt("return",!1);case 14:case"end":return s.stop()}},o,null,[[1,9]])}));return function(r){return l.apply(this,arguments)}}(),Ze=function(){var l=T()(c()().mark(function o(r){var i;return c()().wrap(function(s){for(;;)switch(s.prev=s.next){case 0:if(i=f.ZP.loading("\u6B63\u5728\u5220\u9664"),r){s.next=3;break}return s.abrupt("return",!0);case 3:return s.prev=3,s.next=6,(0,Z.DV)({key:r.map(function(y){return y.key})});case 6:return i(),f.ZP.success("Deleted successfully and will refresh soon"),s.abrupt("return",!0);case 11:return s.prev=11,s.t0=s.catch(3),i(),f.ZP.error("Delete failed, please try again"),s.abrupt("return",!1);case 16:case"end":return s.stop()}},o,null,[[3,11]])}));return function(r){return l.apply(this,arguments)}}(),Re=function(){var o=(0,m.useState)(!1),r=F()(o,2),i=r[0],g=r[1],s=(0,m.useState)(!1),y=F()(s,2),k=y[0],U=y[1],De=(0,m.useState)(!1),se=F()(De,2),re=se[0],te=se[1],D=(0,m.useRef)(),Le=(0,m.useState)(),ne=F()(Le,2),v=ne[0],N=ne[1],Oe=(0,m.useState)([]),le=F()(Oe,2),L=le[0],oe=le[1],H=(0,t.useIntl)(),ue=[{title:(0,e.jsx)(t.FormattedMessage,{id:"pages.searchTable.updateForm.ruleName.nameLabel",defaultMessage:"Rule name"}),dataIndex:"name",tip:"The rule name is the unique key",render:function(u,d){return(0,e.jsx)("a",{onClick:function(){N(d),te(!0)},children:u})}},{title:(0,e.jsx)(t.FormattedMessage,{id:"pages.searchTable.titleDesc",defaultMessage:"Description"}),dataIndex:"desc",valueType:"textarea"},{title:(0,e.jsx)(t.FormattedMessage,{id:"pages.searchTable.titleCallNo",defaultMessage:"Number of service calls"}),dataIndex:"callNo",sorter:!0,hideInForm:!0,renderText:function(u){return"".concat(u).concat(H.formatMessage({id:"pages.searchTable.tenThousand",defaultMessage:" \u4E07 "}))}},{title:(0,e.jsx)(t.FormattedMessage,{id:"pages.searchTable.titleStatus",defaultMessage:"Status"}),dataIndex:"status",hideInForm:!0,valueEnum:{0:{text:(0,e.jsx)(t.FormattedMessage,{id:"pages.searchTable.nameStatus.default",defaultMessage:"Shut down"}),status:"Default"},1:{text:(0,e.jsx)(t.FormattedMessage,{id:"pages.searchTable.nameStatus.running",defaultMessage:"Running"}),status:"Processing"},2:{text:(0,e.jsx)(t.FormattedMessage,{id:"pages.searchTable.nameStatus.online",defaultMessage:"Online"}),status:"Success"},3:{text:(0,e.jsx)(t.FormattedMessage,{id:"pages.searchTable.nameStatus.abnormal",defaultMessage:"Abnormal"}),status:"Error"}}},{title:(0,e.jsx)(t.FormattedMessage,{id:"pages.searchTable.titleUpdatedAt",defaultMessage:"Last scheduled time"}),sorter:!0,dataIndex:"updatedAt",valueType:"dateTime",renderFormItem:function(u,d,M){var j=d.defaultRender,h=K()(d,Ce),de=M.getFieldValue("status");return"".concat(de)==="0"?!1:"".concat(de)==="3"?(0,e.jsx)(w.Z,O()(O()({},h),{},{placeholder:H.formatMessage({id:"pages.searchTable.exception",defaultMessage:"Please enter the reason for the exception!"})})):j(u)}},{title:(0,e.jsx)(t.FormattedMessage,{id:"pages.searchTable.titleOption",defaultMessage:"Operating"}),dataIndex:"option",valueType:"option",render:function(u,d){return[(0,e.jsx)("a",{onClick:function(){U(!0),N(d)},children:(0,e.jsx)(t.FormattedMessage,{id:"pages.searchTable.config",defaultMessage:"Configuration"})},"config"),(0,e.jsx)("a",{href:"https://procomponents.ant.design/",children:(0,e.jsx)(t.FormattedMessage,{id:"pages.searchTable.subscribeAlert",defaultMessage:"Subscribe to alerts"})},"subscribeAlert")]}}];return(0,e.jsxs)(X._z,{children:[(0,e.jsx)(A.Z,{headerTitle:H.formatMessage({id:"pages.searchTable.title",defaultMessage:"Enquiry form"}),actionRef:D,rowKey:"key",search:{labelWidth:120},toolBarRender:function(){return[(0,e.jsxs)(b.ZP,{type:"primary",onClick:function(){g(!0)},children:[(0,e.jsx)(Q.Z,{})," ",(0,e.jsx)(t.FormattedMessage,{id:"pages.searchTable.new",defaultMessage:"New"})]},"primary")]},request:Z.jR,columns:ue,rowSelection:{onChange:function(u,d){oe(d)}}}),(L==null?void 0:L.length)>0&&(0,e.jsxs)(n.S,{extra:(0,e.jsxs)("div",{children:[(0,e.jsx)(t.FormattedMessage,{id:"pages.searchTable.chosen",defaultMessage:"Chosen"})," ",(0,e.jsx)("a",{style:{fontWeight:600},children:L.length})," ",(0,e.jsx)(t.FormattedMessage,{id:"pages.searchTable.item",defaultMessage:"\u9879"}),"\xA0\xA0",(0,e.jsxs)("span",{children:[(0,e.jsx)(t.FormattedMessage,{id:"pages.searchTable.totalServiceCalls",defaultMessage:"Total number of service calls"})," ",L.reduce(function(p,u){return p+u.callNo},0)," ",(0,e.jsx)(t.FormattedMessage,{id:"pages.searchTable.tenThousand",defaultMessage:"\u4E07"})]})]}),children:[(0,e.jsx)(b.ZP,{onClick:T()(c()().mark(function p(){var u,d;return c()().wrap(function(j){for(;;)switch(j.prev=j.next){case 0:return j.next=2,Ze(L);case 2:oe([]),(u=D.current)===null||u===void 0||(d=u.reloadAndRest)===null||d===void 0||d.call(u);case 4:case"end":return j.stop()}},p)})),children:(0,e.jsx)(t.FormattedMessage,{id:"pages.searchTable.batchDeletion",defaultMessage:"Batch deletion"})}),(0,e.jsx)(b.ZP,{type:"primary",children:(0,e.jsx)(t.FormattedMessage,{id:"pages.searchTable.batchApproval",defaultMessage:"Batch approval"})})]}),(0,e.jsxs)(B.Y,{title:H.formatMessage({id:"pages.searchTable.createForm.newRule",defaultMessage:"New rule"}),width:"400px",open:i,onOpenChange:g,onFinish:function(){var p=T()(c()().mark(function u(d){var M;return c()().wrap(function(h){for(;;)switch(h.prev=h.next){case 0:return h.next=2,Se(d);case 2:M=h.sent,M&&(g(!1),D.current&&D.current.reload());case 4:case"end":return h.stop()}},u)}));return function(u){return p.apply(this,arguments)}}(),children:[(0,e.jsx)(R.Z,{rules:[{required:!0,message:(0,e.jsx)(t.FormattedMessage,{id:"pages.searchTable.ruleName",defaultMessage:"Rule name is required"})}],width:"md",name:"name"}),(0,e.jsx)(E.Z,{width:"md",name:"desc"})]}),(0,e.jsx)(be,{onSubmit:function(){var p=T()(c()().mark(function u(d){var M;return c()().wrap(function(h){for(;;)switch(h.prev=h.next){case 0:return h.next=2,ye(d);case 2:M=h.sent,M&&(U(!1),N(void 0),D.current&&D.current.reload());case 4:case"end":return h.stop()}},u)}));return function(u){return p.apply(this,arguments)}}(),onCancel:function(){U(!1),re||N(void 0)},updateModalOpen:k,values:v||{}}),(0,e.jsx)(W.Z,{width:600,open:re,onClose:function(){N(void 0),te(!1)},closable:!1,children:(v==null?void 0:v.name)&&(0,e.jsx)(I.vY,{column:2,title:v==null?void 0:v.name,request:T()(c()().mark(function p(){return c()().wrap(function(d){for(;;)switch(d.prev=d.next){case 0:return d.abrupt("return",{data:v||{}});case 1:case"end":return d.stop()}},p)})),params:{id:v==null?void 0:v.name},columns:ue})})]})},Ee=Re}}]);
