var Twitter = require('twitter');
var AWS = require('aws-sdk');

AWS.config.loadFromPath('./config.json')

var kinesis = new AWS.Kinesis();

var client = new Twitter({
    consumer_key: "spTJLV9jQt1lKV0LJcSaadhg8",
    consumer_secret: "eNfmjyKFk8nBkMmvGNmCSTZKwQaoxZjO48xImnOZWoO1Px3UG9",
    access_token_key: "3232884401-z25CboQ9EzTlYvuCYtAq8nYq7zmliY5UyO6l2He",
    access_token_secret: "FXHe5H6mPIJL4zrFUSxzaJ9rEu71sGDLgJzJuo23PcMjk"
});

var stream = client.stream('statuses/filter',{track: 'cat', language: 'en'}); // client.stream(path, params, callback);
/*
stream.on('data', function(event) {
    console.log(event);
});
 */


var stream = client.stream('statuses/filter', { track: 'Trump' });
stream.on('data', function (event) {
    if (event.text) {
        var record = JSON.stringify({
            id: event.id,
            timestamp: event['created_at'],
            //tweet: event.text.replace(/["':|}{]/g,'')
            tweet: Buffer.from(event.text).toString('base64')
        }) + "|";
        var params = {Data: record, StreamName:'MaryamTweetStream', PartitionKey:'key'};
        kinesis.putRecord(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log('sending:' + event.text);           // successful response
          });
    };  
});


stream.on('error', function(error) {
    throw error;
});
