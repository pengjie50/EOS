'use strict';

const Controller = require('egg').Controller;
const fs = require('fs')
const path = require('path')

function makeDir(dirpath) {
    if (!fs.existsSync(dirpath)) {
        var pathtmp;
        dirpath.split("/").forEach(function (dirname) {
            if (pathtmp) {
                pathtmp = path.join(pathtmp, dirname);
            }
            else {
                //If in a Linux system, the value of the first dirname is empty, so the value assigned is"/"
                if (dirname) {
                    pathtmp = dirname;
                } else {
                    pathtmp = "/";
                }
            }
            if (!fs.existsSync(pathtmp)) {
                if (!fs.mkdirSync(pathtmp)) {
                    return false;
                }
            }
        });
    } else {
        deleteFolderFiles(dirpath);
    }
    return true;
}
class UploadController extends Controller {
    async avatar() {
        const { ctx } = this;
       

        const params = ctx.request.body;

        let file = ctx.request.files[0]; // File contains information such as file name, file type, size, path, etc. You can print it yourself and take a look
        console.log(file)
        // read file
        var file2 = fs.readFileSync(file.filepath) //Files [0] represents obtaining the first file. If the front-end uploads multiple files, it can traverse this array object
       


        const uploadFloder = './public/dist/upload/avatar';  // Directory to save uploaded files

        try {
            fs.accessSync(uploadFloder);
        } catch (error) {
            makeDir(uploadFloder);
        }


        // Save the file to the specified location
        fs.writeFileSync(path.join('./public', "dist/upload/avatar/" + file.filename), file2)
        // ctx.cleanupRequestFiles()

       
        ctx.body = { success: true, data: file.filename }

    }



}

module.exports = UploadController;
