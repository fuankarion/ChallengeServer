var multer  =  require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    req.body.inDiskFileName=req.body.uploader + '-' + Date.now();
    callback(null, req.body.inDiskFileName);
  }
});

module.exports = {
  upload : multer({ 
    storage : storage,
    fileFilter: function (req, file, callback) {
      if (!file.originalname.endsWith('.txt')) {
        return callback(new Error('Not a txt file'));
      }
      if (!req.body.uploader) {
        return callback(new Error('No name for uploader'));
      }
      return callback(null, true)
    }
  }).single('fileData')
};