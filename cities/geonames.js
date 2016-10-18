var fs = require('fs')
  , _ = require('underscore');

var filename = process.argv[2];
if (!filename) {
  console.log('File not found');
  process.exit(1);
}

var cities = fs.readFileSync(filename).toString().split("\n");
cities.pop(); // empty element
var processedCities = _.map(cities, function(city) {
  var data = city.split('\t');
  var names = data[3].split(',');
  return {
    _id: Number(data[0]),
    name: data[1],
    alternate_names: _.map(names, function(name) {
      return name.toLowerCase();
    }),
    coordinates: [Number(data[4]), Number(data[5])]
  }
});

fs.writeFileSync('cities.json', JSON.stringify(processedCities));
