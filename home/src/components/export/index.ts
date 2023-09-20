import FileSaver from "file-saver";
import {  message } from 'antd';
const Json2csvParser = require("json2csv").Parser;
import numeral from 'numeral';
import moment from 'moment'
import {  keyNameMap, getDiff } from '@/components'
export function exportCSV(data, columns, filename = "Summary of all transactions") {
  filename += (moment(Date.now()).format(' YYYY-MM-DD HH:mm:ss') + '.csv')
  if (data.length == 0) {
    message.error("Please select data first!");
    return false;
  }
  var newData = []
  var r = []
  data.forEach((s) => {
    var isNo=false
    if (s.alertList && s.alertList.length > 0) {
      isNo=true
      s.alertList.forEach((s1, index) => {

        s1['a.created_at'] = s1.created_at
        s1['a.type'] = s1.type
        var ss = { ...s }
        if (index != 0) {
          for (var k in ss) {
            // ss[k] = ""
          }
        }
        
         r.push({ ...ss, ...s1 })
        

      })
    }

    if (s.transactioneventlogList && s.transactioneventlogList.length > 0) {

      var c = s







      var logObjArr = []
      var newList = [c, ...s.transactioneventlogList]


      newList.forEach((aa, index) => {
        if (index < newList.length && aa && newList[index + 1]) {
          var diff = getDiff(aa, newList[index + 1])

          if (diff) {
            for (var m in diff) {
              if (m != 'created_at' && m != 'updated_at' && m != 'id' && m != 'event_duration'
                && m != 'threshold_alert' && m != "event_sub_stage" && m != "blockchain_hex_key" && m != 'transactioneventlogList' && m != 'alertList' && m != "eos_id" && m.indexOf("t.") == -1) {
                var obj = {
                  TypeOfData: keyNameMap[m],
                  PreviousValue: newList[index + 1][m],
                  NewValue: aa[m],
                  UpdateTime: aa.created_at
                }
                logObjArr.push(obj)
              }

            }
          }


        }

      })



      isNo = true
      logObjArr.forEach((s1, index) => {

       
        var ss = { ...s }
        
          r.push({ ...ss, ...s1 })
        

      })

    }

    if (!isNo){
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
