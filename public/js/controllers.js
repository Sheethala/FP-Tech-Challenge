'use strict';

/* Controller */
angular.module('myApp.controllers', []).
	controller('AppCtrl', function ($scope, $http) {
		// Insert controller code here
		$scope.test = "Hello";
		$scope.finalPrice = 0;
		$scope.itemPrice = 0
		console.log("calling the controller here");

		$scope.splitStrings = function(Arr){
				return Arr.split(';');
		}

		$scope.getSizeColorCode = function(Arr, style){
			var length = Arr.length;
			for(var i = 0; i<length; i++){
				if(Arr[i].indexOf(style) != -1){
					//We know that the colour exists
					var colors = Arr[i].split(':');
					return colors[0];
				}
			}
		}

		$scope.getQuote = function(){
			var apparel_data;
			var url = '/api/apparel/' + $scope.style_code;
			var color_data;
			var size_data;
			var color;
			var size;
			var quote_object;
			var weight;
			console.log($scope.style_code);
			$http.get(url).then(function(apparel, status) {
				apparel_data = apparel.data;
				if(apparel_data.length === 0){
					swal("Oops", "Please check your values and try again", "error");
				}
				console.log(apparel.data);
				color_data = $scope.splitStrings(apparel_data[0].color_codes);
				color = $scope.getSizeColorCode(color_data, $scope.style_color);
				size_data = $scope.splitStrings(apparel_data[0].size_codes);
				size = $scope.getSizeColorCode(size_data, $scope.style_size);
				weight = apparel_data[0].weight;
				quote_object = {style_code: $scope.style_code, color_code: color, size_code: size };
				$scope.sendData(quote_object, weight);
				console.log(status);
			});
			console.log("THE QUOTE OBJECT IS")
			console.log(quote_object);
		}

		$scope.calculatePrice = function(price, weight, quantity){
				var final_price;
				console.log(price, weight, quantity);
				if(weight <= 0.4){
					if(quantity < 48){
						final_price = (price * quantity) + quantity;
					}
					else{
						final_price = (price * quantity) + (0.75 * quantity);
					}
				}
				else{
					if(quantity < 48){
						final_price = (price * quantity) + (0.5 * quantity);
					}
					else{
						final_price = (price * quantity) + (0.25 * quantity);
					}
				}

				//Create a salesman markup
				final_price = 1.07 * final_price;
				if(final_price <= 800){
					final_price = 1.5 * final_price;
				}
				else{
					final_price = 1.45 * final_price;
				}
				$scope.finalPrice = final_price;
				$scope.itemPrice = final_price/quantity;
				console.log(final_price);
		}

		$scope.sendData = function(obj, weight){
			console.log("INSIDE THE SENDDATA FN");
			$http.post('/api/quote', obj).then(function(price, status){
				console.log("THE PRICE IS");
				console.log(price.data);
				console.log(typeof(price.data));
				$scope.calculatePrice(Number(price.data), weight, Number($scope.quantity));
			});
		}

	});
