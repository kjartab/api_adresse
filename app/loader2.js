

var inputFile='../data/Adressedata_14_Sogn_og_Fjordane_UTM33_CSV/P13_14_SOGN\ OG\ FJORDANE_Adresse.csv';
var fs = require('fs')
    , util = require('util')
    , stream = require('stream')
    , es = require('event-stream');



var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'error'
});

var k = k || {};


(function(ns) {

    ns.adresseLoad = function(inputFile, callback) {

        var lineNr = 0;
        var bulkRows = [];
        var deliminator = ";";



        function getAction(id, type, index, action) {

            var esAction = {};
            esAction[action] = {
                '_id': id,
                '_type': type,
                '_index': index
            }

            return esAction;
        }

        function addBulkData(document, idField, action, callback) {
            

            var id = null;
            if (document.hasOwnProperty(idField)) {
                id = document[idField];
            }
            var type = "adresse";
            var index = 'adressetest';  

            bulkRows.push(getAction(null, type, index, 'index'));
            bulkRows.push(document);

            if (bulkRows.length >= 2000) {
                console.log("bulk rows", bulkRows.length)
                    bulkLoad(bulkRows, callback);

                } else {
                    callback();
                }

            }


            function resetBulkRows(callback) {
                bulkRows = [];
                callback();
            }

            function bulkLoad(bulkRows, callback) {

                client.bulk({
                    body: bulkRows
                }, function(err, resp) {
                    resetBulkRows(callback);
                });

            }

            function process(data, callback) {
                addBulkData(data, "adresseid", 'index', callback);
            }
                
            var header;

            function mapData(line, header, deliminator) {
                var data = {};
                var row = line.split(deliminator);
                for (var i=0; i<header.length; i++) {
                    data[header[i]] = row[i];
                }
                return data;
            }

            function getHeader(line, deliminator) {

                var header = line.split(deliminator);
                for (var i=0; i<header.length; i++) {
                    header[i] = header[i].toLowerCase();
                }
                return header;
            } 

            var s = fs.createReadStream(inputFile)
                .pipe(es.split())
                .pipe(es.mapSync(function(line){

                    // pause the readstream
                    s.pause();

                    if (lineNr == 0) {
                        header = getHeader(line, deliminator);
                    }

                    lineNr += 1;

                    process(mapData(line, header, deliminator), function () {
                        
                        s.resume();
                    });

                })
                .on('error', function(e){
                    console.log(e, 'Error while reading file.');
                })
                .on('end', function(){
                    callback();
                    console.log('Read entire file.')
                })
            );  


    }
})(k);


var _getAllFilesFromFolder = function(dir) {

    var filesystem = require("fs");
    var results = [];

    filesystem.readdirSync(dir).forEach(function(file) {
        
        file = dir+'/'+file;
        var stat = filesystem.statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(_getAllFilesFromFolder(file))
        } else {
             if (file.endsWith('.csv')) {
                var load = new k.adresseLoad(inputFile);
                results.push(file);
             }
        }

    });

    return results;

};


var res = _getAllFilesFromFolder("../data");
