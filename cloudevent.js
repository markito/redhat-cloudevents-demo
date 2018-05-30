/**
 * @author William Markito Oliveira
 * @param {Cloud Event} request 
 */
function process(request) {
    const Twitter = require('twitter');  
    var openwhisk = require('openwhisk');

      //TODO: use function params
      var client = new Twitter({
        consumer_key: '<REPLACE>',
        consumer_secret: '<REPLACE>',
        access_token_key: '<REPLACE>',
        access_token_secret: '<REPLACE>'
    });
      
    // type convertion for content- 
    if (request.__ow_headers["content-type"] == "application/cloudevents+json") {
       request = JSON.parse(Buffer.from(request.__ow_body, 'base64').toString('ascii'))
    }
   
    // TODO: add more checks/validation
    if ( (!request) || (request.cloudEventsVersion != "0.1") ) {
        return {
            statusCode: 418, // teapot or any 40X code for an invalid request.
            headers: { 'Content-Type': 'application/json' },
            body: {message: "Invalid request, better have some tea.",
            request: request
            }
        };   
    } else {
        var message = 'This is a cloud event processed by Apache OpenWhisk running in OpenShift! Event ID: ' + request.eventID; //request.eventTime + " ## " + request.eventID
        var imageURL;

        if (request.eventType == "Microsoft.Storage.BlobCreated") {
            imageURL = request.data.url;
        } else { 
            imageURL = "https://s3.amazonaws.com/"+  request.data.bucket.name + "/" + request.data.object.key;
        }

        var ow = openwhisk();
     
        var request = require('request').defaults({ encoding: null });
        request.get(imageURL, function (err, res, body) {
            client.post('media/upload', {media: body}, function(error, media, response) {
                if (!error) {
                    var status = {
                        status: message,
                        media_ids: media.media_id_string // Pass the media id string
                    }
                    client.post('statuses/update', status, function(error, tweet, response) {
                        if (!error) {
                        console.log(tweet);
                        }
                    });
                }
            });
        });

        // return image url
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: { 'data': imageURL }
        };

    }
};

module.exports.main = process
