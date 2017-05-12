var express =  require("express");
var path = require('path')
var multer  =  require('multer');
var json2html = require('node-json2html');

//Init Moongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost/challengeData');
var submision = require('./schemas');

//Init Multer
var multerModule = require('./multerModule');
var fileOps = require('./fileOps');

//Global Data
var gt=null;
var gtIdx=null;

//Init express
var app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.get('/leaderBoard',function(req,res){
  fileOps.loadLeaderBoard(res,function(err) {
      if(err) {
        console.log(err)
        return res.end("Error retireveing table;");
      }
      console.log('Ok leaderBoard')});

});

app.get('/',function(req,res){
  res.sendFile(__dirname + "/index.html");
});

app.post('/api/upload',function(req,res){
    multerModule.upload(req,res,function(err) {
        if(err) {
            console.log(err)
            return res.end("Error uploading file");
        }
       
        fileOps.preprocessFileResults('./uploads/'+req.body.inDiskFileName,res,req.body,function(retVal){
            console.log('Retval',retVal)
        });


    });
});

app.listen(3000,function(){
    fileOps.loadGTFile();
    console.log("Working on port 3000");
});