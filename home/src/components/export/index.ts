import FileSaver from "file-saver";
import {  message } from 'antd';
const Json2csvParser = require("json2csv").Parser;
import numeral from 'numeral';
import moment from 'moment'
export function exportCSV(data, columns, filename = "Summary of all transactions") {
  filename += (moment(Date.now()).format(' YYYY-MM-DD HH:mm:ss') + '.csv')
  if (data.length == 0) {
    message.error("Please select data first!");
    return false;
  }
  var newData = []
  var r = []
  data.forEach((s) => {
    
    if (s.alertList && s.alertList.length>0) {
     
      s.alertList.forEach((s1, index) => {

        s1['a.created_at'] = s1.created_at
        s1['a.type'] = s1.type
        var ss = { ...s }
        if (index!=0) {
          for (var k in ss) {
           // ss[k] = ""
          }
        }
        
        if (s.transactioneventlogList) {
          if (s.transactioneventlogList[index]) {
            console.log({ ...ss, ...s1 })
            r.push({ ...ss, ...s1, ...s.transactioneventlogList[index] })
          } else {
            console.log({ ...ss, ...s1 })
            r.push({ ...ss, ...s1 })
          }

        } else {

          console.log({ ...ss, ...s1 })
          r.push({ ...ss, ...s1 })
        }

      })
    } else {
      r.push(s)
    }


  })
  data=r

  data = data.forEach((s) => {
    var n = {}
    columns.forEach((c) => {

      if (c && !c.hideInTable && c.dataIndex != "option") {

        var k = c.dataIndex
        var csvK = c.title
        try {
          csvK = c.title.props.defaultMessage
        } catch (e) {

        }



        if (c.valueType == 'date') {
          n[csvK] = s[k] ? moment(s[k]).format('DD MMM YYYY') : ""
        } else if (c.valueType == 'dateTime') {
          n[c.title.props.defaultMessage] = s[k] ? moment(s[k]).format('DD MMM YYYY HH:mm:ss') : ""
        } else if (c.renderText) {
          n[csvK] = "" + c.renderText(s[k], s)
        } else if (c.renderPrint) {
          n[csvK] = "" + c.renderPrint(s[k], s)
        }
        else if (c.render && k != 'id') {
          n[csvK] = c.render(s[k], s)
        } else {
          if (c.valueEnum) {
            if (c.valueEnum[s[k]]) {
              if (typeof c.valueEnum[s[k]] == 'string') {
                n[csvK] = c.valueEnum[s[k]]
              } else {
                n[csvK] = c.valueEnum[s[k]].text.props.defaultMessage
              }

            } else {
              n[csvK] = s[k]
            }

          } else {
            n[csvK] = s[k]
          }
          // n[c.title.props.defaultMessage] = c.valueEnum ? (typeof c.valueEnum[s[k]] == 'string' ? c.valueEnum[s[k]] : c.valueEnum[s[k]].text.props.defaultMessage) : s[k]
        }


      }

    })



    newData.push(n)

  })

  const parser = new Json2csvParser();
  const csvData = parser.parse(newData);

  const blob = new Blob(["\uFEFF" + csvData], {
    type: "text/plain;charset=utf-8;",
  });
  FileSaver.saveAs(blob, filename);
}
