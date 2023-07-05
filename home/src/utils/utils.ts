
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
        temp.no = no + "-" + k
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
