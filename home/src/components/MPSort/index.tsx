import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Button, Popover } from 'antd';

import {  SwapOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
export interface MPSortProps {
  columns: Array;
  onSort: (values: Object) => Promise<void>;
 
}

const MPSort: React.FC<MPSortProps> = (props) => {
  const [MpSortDataIndex, setMpSortDataIndex] = useState('');
  const { columns, onSort } = props

  return (
    <div> <Popover placement="bottom" title={""} content={<div>{columns.filter(a => (a.hasOwnProperty('sorter') && a['sorter'])).map((a) => {

      return (<div><Button type={MpSortDataIndex == a.dataIndex + "ascend" ? "primary" : "default"} onClick={() => {
        if (MpSortDataIndex == a.dataIndex + "ascend") {
          onSort({})
          //setMPSorter({})
          setMpSortDataIndex("")

        } else {
          onSort({ [a.dataIndex]: 'ascend' })
         
          //setMPSorter({ [a.dataIndex]: 'ascend' })
          setMpSortDataIndex(a.dataIndex + "ascend")
        }


        //getData(1)


      }} icon={<SortAscendingOutlined />} />
        <Button type={MpSortDataIndex == a.dataIndex + "descend" ? "primary" : "default"} style={{ margin: 5 }} onClick={() => {

          if (MpSortDataIndex == a.dataIndex + "descend") {
            onSort({})
            setMpSortDataIndex("")

          } else {
            onSort({ [a.dataIndex]: 'descend' })
            setMpSortDataIndex(a.dataIndex + "descend")

          }

         // getData(1)

        }} icon={<SortDescendingOutlined />} />
        <span>{a.title}</span>
      </div>)

    })}</div>} trigger = "click" >

      <SwapOutlined rotate={90} />

          </Popover >
            </div >
  );
};

export default MPSort;
