

var inputFile='../data/Adressedata_14_Sogn_og_Fjordane_UTM33_CSV/P13_14_SOGN\ OG\ FJORDANE_Adresse.csv';
var fs = require('fs')
    , util = require('util')
    , stream = require('stream')
    , es = require('event-stream');

var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

var lineNr = 0;

function process(callback) {
    // setTimeout(function() {
    //     callback();
    // },500);
    
    var doc = {"test" : "test"}
    // callback();
    client.index({
      index: 'myindex',
      type: 'mytype',
      id: '1',
      body: doc
    }, function (error, response) {
        callback();
    });
}

function processLine(data, callback) {

    var doc = {"test" : "test"}
    callback();
    // client.index({
    //   index: 'myindex',
    //   type: 'mytype',
    //   id: '1',
    //   body: doc
    // }, function (error, response) {
    //     callback();
    // });


}

var s = fs.createReadStream(inputFile)
    .pipe(es.split())
    .pipe(es.mapSync(function(line){

        // pause the readstream
        s.pause();

        lineNr += 1;
        console.log(line);

        // process line here and call s.resume() when rdy
        // function below was for logging memory usage
        // logMemoryUsage(lineNr);
        process(function () {
            s.resume();
        });
        // resume the readstream, possibly from a callback
        // s.resume();
    })
    .on('error', function(){
        console.log('Error while reading file.');
    })
    .on('end', function(){
        console.log('Read entire file.')
    })
);