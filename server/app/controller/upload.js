'use strict';

const Controller = require('egg').Controller;
const  fs = require('fs')
const path = require('path')

function makeDir(dirpath) {
    if (!fs.existsSync(dirpath)) {
        var pathtmp;
        dirpath.split("/").forEach(function(dirname) {
            if (pathtmp) {
                pathtmp = path.join(pathtmp, dirname);
            }
            else {
　　　　　　　　　 //如果在linux系统中，第一个dirname的值为空，所以赋值为"/"
                if(dirname){
                    pathtmp = dirname;
                }else{
                    pathtmp = "/"; 
                }
            }
            if (!fs.existsSync(pathtmp)) {
                if (!fs.mkdirSync(pathtmp)) {
                    return false;
                }
            }
        });
    }else{
        deleteFolderFiles(dirpath);
    }
    return true;
}
class UploadController extends Controller {
    async avatar() {
     const { ctx } = this;
   // console.log(ctx.request.body)
     
     const params = ctx.request.body;

        let file = ctx.request.files[0]; // file包含了文件名，文件类型，大小，路径等信息，可以自己打印下看看
        console.log(file)
     // 读取文件
      var file2 = fs.readFileSync(file.filepath) //files[0]表示获取第一个文件，若前端上传多个文件则可以遍历这个数组对象
      console.log('vvvvvvvvvvvvvvvvvvv',file)


        const uploadFloder = './public/dist/upload/avatar';  // 保存上传文件的目录
       
        try {
            fs.accessSync(uploadFloder);
        } catch (error) {
            makeDir(uploadFloder);
        }


     // 将文件存到指定位置
        fs.writeFileSync(path.join('./public', "dist/upload/avatar/"+file.filename), file2)
    // ctx.cleanupRequestFiles()

   //var timestr=''+new Date().getFullYear() + (new Date().getMonth()+1) + new Date().getDate();
    ctx.body = {success:true,data:file.filename}

  }

  
 
}

module.exports = UploadController;
