'use strict';

var http = require('http');
var fs = require('fs');
var awsHelper = require('./aws');

var urlTemplate = (id) => `http://jsonplaceholder.typicode.com/comments/${id}`
var S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
var getGuid = () => (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase()


module.exports = {
    getComment: (event, context, callback) => {
        //console.log(urlTemplate(event.pathParameters.id)) ;
        http.get(urlTemplate(event.pathParameters.id), function(res) {

            res.on("data", function(data) {

                var filename = getGuid() + '.json';
                fs.writeFile("/tmp/" + filename, data.toString(), function(err) {
                    if (err) {
                        return console.log(err);
                    }

                    awsHelper.uploadFile(`comments/${filename}`, data.toString(), function() {
                        console.log("The file was saved!");


                        var response = {
                            statusCode: 200,
                            contentType: "application/json",
                            body: data.toString()
                        };
                        callback(null, response);
                    });
                });
            });


        }).on('error', function(e) {
            console.log("Got error: " + e.message);
            context.done(null, 'FAILURE');
        });
    },


    commentParser: (event, context, callback) => {
        awsHelper.getObject(event.Records[0].s3.object.key, function(err, data) {
            var response = {
                statusCode: 200,
                contentType: "application/json",
                body: data
            };
            console.log('s3_event', JSON.stringify(data));
            callback(null, response);
        })



    }
}