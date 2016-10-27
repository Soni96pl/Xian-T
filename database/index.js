var os = require('os');
var util = require('util')
var http = require('http');
var assert = require('assert');
var _ = require('underscore');

var Yaml = require('yamljs');
var AdmZip = require('adm-zip');

var MongoClient = require('mongodb').MongoClient,
    Code = require('mongodb').Code;

cfg = Yaml.load(os.homedir() + "/xian/config.yml");
var url = "mongodb://" + cfg['mongodb']['host'] + ":" + cfg['mongodb']['port'] + "/" + cfg['mongodb']['database'];


MongoClient.connect(url, function(err, db) {
  assert.equal(err, null);
  console.log("Opened database");

  var CountDownDatabase = {
     count: 0,
     check: function() {
         this.count--;
         if (this.count == 0) db.close();
         console.log("Closed database");
     }
  };

  CountDownDatabase.count++;
  console.log("Inserting counters");
  db.collection("counters").insertOne(
    {
      _id: "userid",
      seq: Number(0)
    },
    function(err, result) {
      assert.equal(null, err);
      console.log("Inserted counters");
      CountDownDatabase.check()
    }
  );

  CountDownDatabase.count++;
  console.log("Saving functions");
  db.collection("system.js").save(
    {
      _id: "getNextSequence",
      value: new Code(
        function getNextSequence(name) {
          var ret = db.counters.findAndModify(
            {
              query: { _id: name },
              update: { $inc: { seq: 1 } },
              new: true
            }
          );

          return ret.seq;
        }.toString()
      )
    },
    function(err, result) {
      assert.equal(null, err);
      console.log("Saved functions");
      CountDownDatabase.check()
    }
  );

  CountDownDatabase.count++;
  retrieveCities(function(cities) {
    console.log("Inserting cities");
    db.collection("cities").insertMany(cities, function(err, result) {
      assert.equal(null, err);
      console.log("Inserted cities");
      CountDownDatabase.check()
    });
  })
});

function retrieveCities(callback) {
  console.log("Retrieving cities");
  http.get("http://download.geonames.org/export/dump/cities1000.zip", function(response) {
    var data = [];
    response.on('data', function(chunk) {
      data.push(chunk);
    }).on('end', function () {
      console.log("Uncompressing cities");
      var buffer = Buffer.concat(data);
      var zip = new AdmZip(buffer);
      var zipEntry = zip.getEntry("cities1000.txt").getDataAsync(function(zipData) {
        console.log("Processing cities");
        cities = zipData.toString('utf-8').split("\n");
        cities.pop()
        processedCities = _.map(cities, function(city) {
          var data = city.split('\t');
          var names = data[3].split(',');
          return {
            _id: Number(data[0]),
            name: data[1],
            country: data[8],
            population: Number(data[14]),
            alternate_names: _.map(names, function(name) {
              return name.toLowerCase();
            }),
            coordinates: [Number(data[4]), Number(data[5])],
            story: {
              content: '',
              existing: true,
              updated: new Date(0)
            }
          }
        });
        callback(processedCities);
      });
    })
  });
}
