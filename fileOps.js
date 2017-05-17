var fs = require('fs');
var PRHelper= require("./PRHelper.js");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var submision = require('./schemas');
//TODO expose
var LabelOffset=0

 var transformEvaluation = {
  tag: 'tr',
  children: [{
    "tag": "td",
    "html": "${class}"
  }, {
    "tag": "td",
    "html": "${precision}"
  }, {
    "tag": "td",
    "html": "${recall}"
  }, {
    "tag": "td",
    "html": "${fmeasure}"
  }]
};

 var transformLeaderBoard = {
  tag: 'tr',
  children: [{
    "tag": "td",
    "html": "${submitedBy}"
  }, {
    "tag": "td",
    "html": "${avgF1}"
  }, {
    "tag": "td",
    "html": "${avgPrecision}"
  }, {
    "tag": "td",
    "html": "${avgRecall}"
  }]
};

var generateDetailedOutput=function(preds,submitedByName){
  var uniqueLabels = gt.unique();
  confusionMatrix=PRHelper.createConfusionMatrix(uniqueLabels.length,uniqueLabels.length);
  confusionMatrix=PRHelper.fillConfusionMatrix(gt,preds,confusionMatrix);
 

  var report=[]
  var globalPrecision=0.0
  var globalRecall=0.0  

  for (var gtIdx =1; gtIdx<=uniqueLabels.length; gtIdx++) { 
    var submisionPrecision=PRHelper.calculateClassPrecision(confusionMatrix,gtIdx);
    globalPrecision=globalPrecision+parseFloat(submisionPrecision);
    var submisionRecall=PRHelper.calculateClassRecall(confusionMatrix,gtIdx);
    globalRecall=globalRecall+parseFloat(submisionRecall);
    var submisionFmeasure=PRHelper.calculateFmeasure(submisionPrecision,submisionRecall);
    
  
    reportElement={
      class:gtIdx,
      precision:submisionPrecision,
      recall:submisionRecall,
      fmeasure:submisionFmeasure
    }
    report.push(reportElement)
  }

  globalPrecision=globalPrecision/25.0;
  globalRecall=globalRecall/25.0;
  var globalFmeasure=PRHelper.calculateFmeasure(globalPrecision,globalRecall);
  reportElement={
    class:'AVG.',
    precision:globalPrecision.toFixed(2),
    recall:globalRecall.toFixed(2),
    fmeasure:globalFmeasure
  }
  report.push(reportElement)

  console.log(report)
  console.log('submitedByName ',submitedByName)

  var sampleSumbmision = new submision({
    submitedBy: submitedByName,
    avgPrecision:globalPrecision.toFixed(2),
    avgRecall:globalRecall.toFixed(2),
    avgF1:globalFmeasure
  });

  sampleSumbmision.save(function(err) {
    if (err) throw err;
    console.log('Submision saved successfully!');
  });

  var htmlReport = json2html.transform(report,transformEvaluation);
  htmlReport="<table id=\"hor-minimalist-a\"><tr><th>Class</th><th >Precision</th><th>Recall</th><th>Fmeasure</th></tr>"+htmlReport+"</table>"
  return htmlReport;
};

module.exports = {
  
  loadGTFile:function(){
    gt=[]
    gtIdx=[]
    var contentsGT = fs.readFileSync('./gtFile.txt').toString();
    lines=contentsGT.split("\n");
    for (var lineIdx =0; lineIdx<lines.length-1; lineIdx++) {
      aLine=lines[lineIdx];
      gtElements=aLine.split(","); 
      gtIdx.push(parseInt(gtElements[0]))
      gt.push(parseInt(gtElements[1])+LabelOffset)
    }
  },

  preprocessFileResults:function(filePath,res,reqBody,callback){
    fs.readFile( filePath, 'utf8', function(err, contents) {
      lines=contents.split("\n"); 
      preds=[]

      for (var lineIdx =0; lineIdx<lines.length; lineIdx++) {
        aLine=lines[lineIdx];
        if (!aLine) {//Skip enpty lines
          continue;
        }

        predictionElements=aLine.split(","); 
        imageIdx= parseInt(predictionElements[0])
        prediction= parseInt(predictionElements[1])+LabelOffset
        indexOnGTIndex = gtIdx.indexOf(imageIdx);
        if(indexOnGTIndex==-1){//Ignore predictions over elelents of other sets
          console.log('Ignore ',imageIdx)
          continue
        }

        preds[indexOnGTIndex]=prediction
      }
      console.log('XX reqBody',reqBody)
      htmlReport=generateDetailedOutput(preds,reqBody.uploader)

      res.writeHead(200, {'Content-Type': 'text/html'});
      fullHTML="<head><link rel=\"stylesheet\" type=\"text/css\" href=\"../../css/style.css\" /></head><body>"+htmlReport+"</body>"
      res.end(fullHTML)
      callback('Ok')
        
    });
  },


  loadLeaderBoard:function(res,callback){
    res.writeHead(200, {'Content-Type': 'text/html'});

    submision.find({}).sort({avgF1: 'desc'}).exec(function(err, docs) { 
      console.log('found submisions ',docs)

      var rowsLeaderTable = json2html.transform(docs,transformLeaderBoard);
      leaderTable="<table id=\"hor-minimalist-a\"><tr><th>Submited By </th><th>Precision</th><th >Recall</th><th >Fmeasure</th></tr>"+rowsLeaderTable+"</table>"
      res.end(leaderTable)
      callback('Ok')
    });

/*
    submision.find({}, function(err, submisions) {
      console.log('found submisions ',submisions)

      var rowsLeaderTable = json2html.transform(submisions,transformLeaderBoard);
      leaderTable="<table id=\"hor-minimalist-a\"><tr><th>Submited By </th><th>Precision</th><th >Recall</th><th >Fmeasure</th></tr>"+rowsLeaderTable+"</table>"
      res.end(leaderTable)
      callback('Ok')
    });*/

    
  }
  

};

