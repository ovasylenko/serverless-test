var AWS = require('aws-sdk');

AWS.config.loadFromPath('./aws-settings.json');
var s3Bucket = new AWS.S3( {params: {Bucket: 'bandlabinbox'}});

module.exports = {
    getObject : (key,  cb) =>
        s3Bucket.getObject({
                Key: key
            }, 
            function(err,data) {
                if (!!err) {
                    return cb(err);
                }
                return cb(null, data.Body.toString('utf-8'))
            }
        )
    ,
    uploadFile : (key,  body, cb) =>
        s3Bucket.upload(
            {
                Key: key, 
                Body: body
            },
            cb 
        )
}


