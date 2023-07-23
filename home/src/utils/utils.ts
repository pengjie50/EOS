
/**
 * 递归树
 * @param {*} data 文件名
 * @param {*} pid 父级id
 * @param key
 */
export function tree(data: any, pid = null, key = 'pid',no) {
  const result = [];
  // eslint-disable-next-line no-restricted-syntax
  var k=1
  for (const i in data) {
   
    if (data[i][key] === pid) {
      const temp = data[i];
      if (!no) {
        temp.no = k
        //data[i].no = k
      } else {
        temp.no = no + "_" + k
       // data[i].no += no + "-" + k
      }
     
      k++
      const children = tree(data, data[i].id, key, data[i]['no']);
      if (children.length) {
        temp.children = children;
      }
      result.push(temp);
    }
  }

  return result;
}
export function getChildNode(nodes, item, arr) {
  for (let el of nodes) {
    if (el.pid === item) {
      arr.push(el.id);
      if (el.children) {
        childsNodeDeepWay(el.children, arr);
      }
    } else if (el.children) {
      getChildNode(el.children, item, arr);
    }
  }
  return arr;
}
function childsNodeDeepWay(nodes, arr) {
  if (nodes)
    nodes.forEach((ele) => {
      arr.push(ele.id);
      if (ele.children) {
        childsNodeDeepWay(ele.children, arr);
      }
    });
}


export function getparentlist(code, tree) {
  let arr = [] //要返回的数组
  for (let i = 0; i < tree.length; i++) {
    let item = tree[i]
    arr = []
    arr.push(item.id) //保存当前节点id
    if (code == item.id) { //判断当前id是否是默认id
      return arr //是则退出循环、返回数据
    } else { //否则进入下面判断，判断当前节点是否有子节点数据
      if (item.children && item.children.length > 0) {
        //合并子节点返回的数据
        arr = arr.concat(getparentlist(code, item.children))
        if (arr.includes(code)) { //如果当前数据中已包含默认节点，则退出循环、返回数据
          return arr
        }
      }
    }
  }
}

export function isPC() {
  var userAgentInfo = navigator.userAgent;
  var Agents = ["Android", "iPhone",
    "SymbianOS", "Windows Phone",
    "iPad", "iPod"];
  var flag = true;
  for (var v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false;
      break;
    }
  }
  return flag;
}
