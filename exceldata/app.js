var xls_json = require('xls-to-json');
var fs = require('fs');

//定义excel表格的目录
var dataDir=__dirname+"/excelData/";
//客户端工程的json配置文件路径，完整路径
var publicDir="/Users/linyou/Documents/current/cocosjs/src/config/";
//服务端工程的json配置文件路径，完整路径
var serverPublicDir="/Users/linyou/Documents/current/lordofpomelo/game-server/config/data/";
var files = fs.readdirSync(dataDir);
for(var key in files)
{
    var file=files[key];

    //判断是否为xls文件
    var searchIndex=file.lastIndexOf(".xls");
    if(searchIndex>0 && file.length-4===searchIndex)
    {
        var fileName=file.substring(0,searchIndex);
        var outputName=publicDir+fileName+".js";
        var serverOutputName=serverPublicDir+fileName+".json";
        var inputName=dataDir+file;

        xls_json({
            input: inputName,
            dataName:fileName,
            output:outputName,
            soutput:serverOutputName
        }, function(err, result) {
            if(err) {
              console.error(err);
            } else {
              console.log(result);
            }
        });
    }
}
