/*
 * Serve JSON to our AngularJS client
 */
var express     = require('express');
var https       = require('https');
var q           = require('q');
var api         = express.Router();
var db          = require('../config/db').connection;

//Let the user enter brand, size and colour
//Get the values from the database table, and call the merchandise api.

// API endpoint for /api/apparel
api.get('/api/apparel/:styleCode?', function(req, res) {
	// Insert Apparel API code here

  var style = req.param('styleCode');
  var myQuery = "SELECT DISTINCT * from apparel WHERE style_code = '" + style + "'" ;
  db.query(myQuery, function(err, rows, fields) {
		if (err) throw err;
		res.json(rows);
	});

});

// API endpoint for /api/quote
api.post('/api/quote', function(req, res) {
  console.log("in the function");
  console.log(req.body);
  var myfr = getApparelPrice(req.body.style_code, req.body.color_code, req.body.size_code).then(function(result){
    console.log(result);
    res.send(result);
  });
});

// Function for making an Inventory API call
var getApparelPrice = function getPrice(style_code, color_code, size_code) {
	var apparelPriceDeferred = q.defer();
	// Format the Inventory API endpoint as explained in the documentation
  var url = "https://www.alphashirt.com/cgi-bin/online/xml/inv-request.w?sr="+style_code+"&cc="+color_code+"&sc="+size_code+"&pr=y&zp=10002&userName=triggered1111&password=triggered2222";
  console.log(url);
	https.get(url, function(res) {
		res.on('data', function (data) {
			// Parse response XML data here
      var parsed_data = data.toString();
      console.log("The parsed data is >>>>>>>>>>>");
      console.log(parsed_data);
      var price_index = parsed_data.indexOf("price") + 8;
      console.log(price_index);
      var last_price_index = parsed_data.indexOf('"', price_index);
      console.log(last_price_index);
      var price = parsed_data.substring(price_index, last_price_index);
      apparelPriceDeferred.resolve(price);
      //Creates multiple requests without this line.
      res.destroy();
		});
	}).on('error', function(error) {
		// Handle EDI call errors here
    apparelPriceDeferred.reject('Cannot find item');

	});

	return apparelPriceDeferred.promise;
}

module.exports = api;
