import React, { useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Input, Upload, message } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import  {
  ProFormDependency,
  ProFormFieldSet,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProForm
} from '@ant-design/pro-components';
import { useRequest } from 'umi';
import { queryCurrent } from '../service';
import { queryProvince, queryCity } from '../service';

import { updateUser, uploadFile } from '../../../system/user/service';

import styles from './BaseView.less';

const validatorPhone = (rule: any, value: string[], callback: (message?: string) => void) => {
  if (!value[0]) {
    callback('Please input your area code!');
  }
  if (!value[1]) {
    callback('Please input your phone number!');
  }
  callback();
};

// 参考链接：https://www.jianshu.com/p/f356f050b3c9
const handleBeforeUpload = (file) => {
  console.log('smyhvae handleBeforeUpload file:' + JSON.stringify(file));
  console.log('smyhvae handleBeforeUpload file.file:' + JSON.stringify(file.file));
  console.log('smyhvae handleBeforeUpload file type:' + JSON.stringify(file.type));

  //限制图片 格式、size、分辨率
  const isJPG = file.type === 'image/jpeg';
  const isJPEG = file.type === 'image/jpeg';
  const isGIF = file.type === 'image/gif';
  const isPNG = file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 1;
  if (!(isJPG || isJPEG || isPNG)) {
    Modal.error({
      title: '只能上传JPG、JPEG、PNG格式的图片~',
    });
  } else if (!isLt2M) {
    Modal.error({
      title: '图片超过1M限制，不允许上传~',
    });
  }
  return (isJPG || isJPEG || isPNG) && isLt2M;
};
// checkImageWH  返回一个promise  检测通过返回resolve  失败返回reject阻止图片上传
const checkImageWH=(file)=>{
  return new Promise(function (resolve, reject) {
    let filereader = new FileReader();
    filereader.onload = (e) => {
      let src = e.target.result;
      const image = new Image();
      image.onload = function () {
        // 获取图片的宽高
        file.width = this.width;
        file.height = this.height;
        resolve();
      };
      image.onerror = reject;
      image.src = src;
    };
    filereader.readAsDataURL(file);
  });
}
// 头像组件 方便以后独立，增加裁剪之类的功能
const AvatarView = ({ useravatar, userid }: { useravatar: string; userid: string }) => {
  const [fileList, setFileList] = useState([]);
  const getAvatarURL = () => {
    if (useravatar) {
     
      return useravatar
    
    } else {
      const url = 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png';
      return url;
    }
    return '';
  };


  const [avatar, setAvatar] = useState(getAvatarURL());

  const onChange=(info)=> {
    const { status } = info.file;
    setFileList([])
   
    if (status !== 'removed') {
     // setFileList([ info.fileList[info.fileList.length - 1]])
       
      onPreview(info.fileList[info.fileList.length - 1])
    }
  }



  
  const onPreview = async (file: { originFileObj: Blob; }) => {
    let src="" ;
    if (!src) {
      src = await new Promise(resolve => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }


    if (file.originFileObj) {
      const formData = new FormData();
      formData.append('files', file.originFileObj) //文件上传格式
    
      uploadFile(formData).then(res => {
        new Promise((resolve, _) => {
          resolve(res)
        }).then(savedfile => {
         
          updateUser({
            id: userid,
            avatar: savedfile.data,
          }).then(() => {
           
            message.success(<FormattedMessage
              id="pages.modifySuccessful"
              defaultMessage="Modify is successful"
            />);
          })
         
        })
      })

    } 

    setAvatar(src);
   
  };

  return (<>
    <div className={styles.avatar_title}><FormattedMessage
      id="pages.userSet.avatar"
      defaultMessage="Avatar"
    /></div>
    <div className={styles.avatar}>
      <img src={avatar} alt="avatar" />
    </div>
    <Upload showUploadList={false} action=""
      
      fileList={fileList}
      onChange={onChange}
      >
      <div className={styles.button_view}>
        <Button>
          <UploadOutlined />
          <FormattedMessage
            id="pages.userSet.uploadAvatar"
            defaultMessage="Upload avatar"
          />
        </Button>
      </div>
    </Upload>
  </>)
};

const BaseView: React.FC = () => {
  const { data: currentUser, loading } = useRequest(() => {
    return queryCurrent();
  });
  const intl = useIntl();
  
  

  const handleFinish = async (values: { [key: string]: any; } | undefined) => {
    if (values) {
      values.id = currentUser?.id
    }
    
    await updateUser({ ...values });
    message.success(<FormattedMessage
      id="pages.modifySuccessful"
      defaultMessage="Modify is successful"
    />);
   // message.success('更新基本信息成功');
  };
  return (
    <div className={styles.baseView}>
      {loading ? null : (
        <>
          <div className={styles.left}>
            <ProForm
              layout="vertical"
              onFinish={handleFinish}
              submitter={{
                searchConfig: {
                  submitText: <FormattedMessage
                    id="pages.update"
                    defaultMessage="Modify"
                  />,
                },
                render: (_, dom) => dom[1],
              }}
              initialValues={{
                ...currentUser
               
              }}
              hideRequiredMark
            >
             
              <ProFormText
                width="md"
                name="nickname"
                label={<FormattedMessage
                  id="pages.user.nickname"
                  defaultMessage="Nickname"
                />}
                rules={[
                  {
                    required: true,
                    message: <FormattedMessage
                      id="pages.user.rules.nickname"
                      defaultMessage="Please enter a nickname!"
                    />,
                  },
                ]}
              />
              <ProFormTextArea
                name="profile"
                label={<FormattedMessage
                  id="pages.user.profile"
                  defaultMessage="Profile"
                />}
              
              />
              <ProFormText
                width="md"
                name="email"
                label={<FormattedMessage
                  id="pages.user.email"
                  defaultMessage="Email"
                />}

              />
              <ProFormText
                width="md"
                name="phone"
                label={<FormattedMessage
                  id="pages.user.phone"
                  defaultMessage="Phone"
                />}
               
              />
              
            </ProForm>
          </div>
          <div className={styles.right}>
            <AvatarView useravatar={currentUser?.avatar} userid={currentUser?.id } />
          </div>
        </>
      )}
    </div>
  );
};

export default BaseView;
