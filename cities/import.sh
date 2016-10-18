rm -f cities1000.zip cities1000.txt cities.json
wget http://download.geonames.org/export/dump/cities1000.zip
unzip cities1000.zip
node geonames.js cities1000.txt
mongoimport -d xian -c cities cities.json --jsonArray
