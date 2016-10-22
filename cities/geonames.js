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
    country: data[8],
    population: Number(data[14]),
    alternate_names: _.map(names, function(name) {
      return name.toLowerCase();
    }),
    coordinates: [Number(data[4]), Number(data[5])],
    story: {
      content: '',
      existing: true,
      updated: {'$date': '1970-01-01 00:00:00.000Z'}
    }
  }
});

fs.writeFileSync('cities.json', JSON.stringify(processedCities));
