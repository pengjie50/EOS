/**
 * 这个文件作为组件的目录
 * 目的是统一管理对外输出的组件，方便分类
 */
/**
 * 布局组件
 */
import Footer from './Footer';
import { Question, SelectLang,Alert } from './RightContent';
import { AvatarDropdown, AvatarName } from './RightContent/AvatarDropdown';
import { createFromIconfontCN } from '@ant-design/icons'
import iconurl from '../../public/iconfont/iconfont'
var SvgIcon =createFromIconfontCN({
  // 该地址为iconfont中的项目地址，根据实际进行修改
  scriptUrl: iconurl
});

var keyNameMap = {
  terminal_id: "Terminal Name",
  jetty_id: "Jetty Name",
  agent: "Agent",
  jetty_id: "Jetty Name",
  event_time: "Event Time",
  product_name: "Product Name",
  product_quantity_in_bls_60_f: "Product Quantity (Bls-60-f)",
  order_no: "Pilotage ID",
  location_from: "Location From",
  location_to: "Location To",
  delay_reason: "Delay Reason",
  delay_duration: "Delay Duration",
  work_order_id: "Work Order ID",
  tank_number: "Tank ID",
  work_order_sequence_number: "Sequence No",
  imo_number: "IMO Number",
  vessel_name: "Vessel Name",
  arrival_id: "Arrival ID",
  vessel_size_dwt: "Vessel Size (dwt)",
  arrival_id_status: "Arrival Status",
  work_order_status: "Work order Status",
  work_order_sequence_number_status: "Sequence Status",
  work_order_operation_type: "Operation Type",
  work_order_surveyor: "Surveyor Name",

  product_quantity_in_l_15_c: "Product Quantity (l-15-c)",
  product_quantity_in_mt: "Product Quantity (mt)",
  product_quantity_in_mtv: "Product Quantity (mtv)",
  product_quantity_in_l_obs: "Product Quantity (l-obs)",

}


const getDurationInfo=(transactioneventList, flowMap_)=>{

  var pMap = {}
  var pArr = []
  var isEnd1 = false
  var isEnd2 = false
  var isEnd = false
  transactioneventList.forEach((te) => {

    try {
     
     
      if (flowMap_[te.flow_id]?.code == 4002) {
        isEnd1 = true
      }
      if (flowMap_[te.flow_id]?.code == 4014) {
        isEnd2 = true
      }
    } catch (e) {
      
    }
    

   

    if (!pMap[te.flow_pid]) {
      pArr.push(te.flow_pid)
      pMap[te.flow_pid] = []
    }
    pMap[te.flow_pid].push(te)


  })

  if (isEnd1 && isEnd2) {
   
    isEnd=true
  }

  pArr = pArr.sort((j, k) => {
    return flowMap_[j]?.sort - flowMap_[k]?.sort
  })
  var eArr = pMap[pArr[pArr.length - 1]]


  var sArr = pMap[pArr[0]]


  var ee = eArr[eArr.length - 1]
  var se = sArr[0]
  return { ee, se,isEnd }

}

 const ResizeObserverDo = (offset, setResizeObj, resizeObj) => {
  const { innerWidth, innerHeight } = window;

   var obj = document.getElementsByClassName("runtime-keep-alive-layout")

   var obj0 = document.getElementsByClassName("runtime-keep-alive-tabs-layout")?.[0]

   
   var arr1 = obj0?.getElementsByClassName("ant-tabs-tab-with-remove")
   var index = 0
   var isTab=false
   for (var i = 0; i < arr1.length; i++ ) {
     if (arr1[i].className?.indexOf("ant-tabs-tab-active") > -1) {
      
       index = i
       isTab=true
     }
   }
   
   
  var h, obj2, obj1
   if ( isTab) {
   
   
    obj1 = obj[index]
      
    
  
    var obj2 = obj1?.getElementsByClassName("ant-table-thead")?.[0]
    var h = obj2?.getBoundingClientRect().top + obj2?.offsetHeight + 80
  } else {
     var arr3=document.getElementsByClassName("ant-table-thead")
     var obj2 = arr3[arr3.length-1]
    var h = obj2?.getBoundingClientRect().top + obj2?.offsetHeight + 80
  }

  if (offset.width > 1280) {

    setResizeObj({ ...resizeObj, searchSpan: 8, tableScrollHeight: innerHeight - h });
  }
  if (offset.width < 1280 && offset.width > 900) {

    setResizeObj({ ...resizeObj, searchSpan: 12, tableScrollHeight: innerHeight - h });
  }
   if (offset.width < 900 && offset.width > 700) {
    
    setResizeObj({ ...resizeObj, searchSpan: 24, tableScrollHeight: innerHeight - h });

  }
 };

function getSearchObj(search) {
  var qs = search.length > 0 ? search.substr(1) : '',
    args = {},
    items = qs.length > 0 ? qs.split('&') : [],
    item = null, name = null, value = null, i = 0, len = items.length;

  for (i = 0; i < len; i++) {
    item = items[i].split('=');
    name = decodeURIComponent(item[0]);
    value = decodeURIComponent(item[1]);

    if (name.length) {
      args[name] = value;
    }
  }

  return args;
}


function getDiff(a, b) {
  var diff = (isArray(a) ? [] : {});
  recursiveDiff(a, b, diff);
  return diff;
}

function recursiveDiff(a, b, node) {
  var checked = [];

  for (var prop in a) {
    if (typeof b[prop] == 'undefined') {
      addNode(prop, '[[removed]]', node);
    }
    else if (JSON.stringify(a[prop]) != JSON.stringify(b[prop])) {
      // if value
      if (typeof b[prop] != 'object' || b[prop] == null) {
        addNode(prop, b[prop], node);
      }
      else {
        // if array
        if (isArray(b[prop])) {
          addNode(prop, [], node);
          recursiveDiff(a[prop], b[prop], node[prop]);
        }
        // if object
        else {
          addNode(prop, {}, node);
          recursiveDiff(a[prop], b[prop], node[prop]);
        }
      }
    }
  }
}

function addNode(prop, value, parent) {
  parent[prop] = value;
}

function isArray(obj) {
  return (Object.prototype.toString.call(obj) === '[object Array]');
}

export { Footer, Question, SelectLang, AvatarDropdown, AvatarName, Alert, SvgIcon, ResizeObserverDo, getDurationInfo, keyNameMap, getDiff, getSearchObj };
