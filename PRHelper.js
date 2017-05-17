 //Unique functions
Array.prototype.contains = function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === v) return true;
    }
    return false;
};

Array.prototype.unique = function() {
    var arr = [];
    for(var i = 0; i < this.length; i++) {
        if(!arr.contains(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr;
};

//Export this
module.exports = {
   
    //Confusion matrixes functions
    createConfusionMatrix:function(classAmount){
        var confusionMatrix = [];
        for(var i=0; i<=classAmount; i++) {
            confusionMatrix[i] = [];
            for(var j=0; j<=classAmount; j++) {
                confusionMatrix[i][j] = 0;
            }
        }
        return confusionMatrix;
    },

       
    fillConfusionMatrix:function(gt,pred,confusionMatrix){
        numUnique= gt.unique().length;

        for(var i=0; i<gt.length; i++) {
            
            if(typeof pred[i] === "undefined") {
                pred[i]=0
            }
            if(pred[i]>numUnique){
                pred[i]=0
            }
          
            confusionMatrix[gt[i]][pred[i]]=confusionMatrix[gt[i]][pred[i]]+1
           
        }
        return confusionMatrix
    },


    //See https://stats.stackexchange.com/questions/51296/how-do-you-calculate-precision-and-recall-for-multiclass-classification-using-co
    calculateClassPrecision:function(confusionMatrix,i){
        sumMji=0;
        for(var j=0; j<confusionMatrix.length; j++) {
            sumMji=sumMji+confusionMatrix[j][i];//FP are on cols
        }
        retVal= confusionMatrix[i][i]/sumMji;
        if(isNaN(retVal)){
            retVal=0.0
        }

        return retVal.toFixed(3)
    },

    //See https://stats.stackexchange.com/questions/51296/how-do-you-calculate-precision-and-recall-for-multiclass-classification-using-co
    calculateClassRecall:function(confusionMatrix,i){
        sumMji=0
        for(var j=0; j<confusionMatrix[i].length; j++) {
            sumMji=sumMji+confusionMatrix[i][j];
        }

        retVal= confusionMatrix[i][i]/sumMji;
        if(isNaN(retVal)){
            retVal=0.0
        }

        return retVal.toFixed(3)
    },
    calculateFmeasure:function(precision,recall){
        precision=parseFloat(precision);
        recall=parseFloat(recall);
        retVal= (2*((precision*recall)/(precision+recall))).toFixed(3);
        if(isNaN(retVal)){
            retVal=0.0
        }
        return retVal
    },
    getClassificationresutls:function(confusionMatrix){
    	var perClassPrecision = [];
    	var perClassRecall = [];
    	var perClassFMeasure = [];

    	for(var i=0; i<confusionMatrix.length; i++) {
    		perClassPrecision[i]=calculateClassPrecision(confusionMatrix,i);
    		perClassRecall[i]=calculateClassRecall(confusionMatrix,i);
    		perClassFMeasure[i]=2*((perClassPrecision[i]*perClassRecall[i])/(perClassPrecision[i]+perClassRecall[i]))
    	}
    	evalResults={}
    	evalResults.perClassPrecision=perClassPrecision;
    	evalResults.perClassRecall=perClassRecall;
    	evalResults.perClassFMeasure=perClassFMeasure;
    	return evalResults;
    }
};
