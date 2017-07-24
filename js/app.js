var map;
// for foursquare api
var client_Id;
var client_Secret_Id;
// Create a new blank array for all the listing markers.
var markers = [];

// Normally we'd have these in a database instead.
var locations = [
	{
		title: 'Park Ave Penthouse',
		location:
		{
			lat: 40.7713024,
			lng: -73.9632393
		}
	},
	{
		title: 'Chelsea Loft',
		location:
		{
			lat: 40.7444883,
			lng: -73.9949465
		}
	},
	{
		title: 'Union Square Open Floor Plan',
		location:
		{
			lat: 40.7347062,
			lng: -73.9895759
		}
	},
	{
		title: 'East Village Hip Studio',
		location:
		{
			lat: 40.7281777,
			lng: -73.984377
		}
	},
	{
		title: 'TriBeCa Artsy Bachelor Pad',
		location:
		{
			lat: 40.7195264,
			lng: -74.0089934
		}
	},
	{
		title: 'Chinatown Homey Space',
		location:
		{
			lat: 40.7180628,
			lng: -73.9961237
		}
	}
];
/*
https://api.foursquare.com/v2/venues/search?client_id=23303ZCQGET1RT2P1UJ21C0UFRZ3TJRRCCH3ZMMJCU15LF2X&client_secret=Z3QAP3LXOYWEJUY0CQTARC4INFLH5G0UU0HWYFWSJ5LSJYIN&v=20130815&ll=40.7281777,-73.984377&query=East Village Hip Studio
*/
// handle format of phone number
// I take this code from this website 
// "http://snipplr.com/view/65672/10-digit-string-to-phone-format/"

function formatOfPhoneNumber (phone_Number)
{
	var regexObj = /^(?:\+?1[-. ]?)?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (regexObj.test(phone_Number))
    {
        var parts = phone_Number.match(regexObj);
        var phone = "";
        if (parts[1]) { phone += "+1 (" + parts[1] + ") "; }
        phone += parts[2] + "-" + parts[3];
        return phone;
    }
    else
    {
        //invalid phone number
        return phone_Number;
    }
}
// create new location on map
var create_Location = function (loc)
{
	var self = this;
	this.name = loc.title;
	this.lat = loc.location.lat;
	this.long = loc.location.lng;
	this.street = "unknown street";
	this.city = "unknown city";
	this.phoneNumber = "unknown phone number";

	this.visible = ko.observable(true);

	// use the url of the place from foursquare website
	var urlOfFourSquare = 'https://api.foursquare.com/v2/venues/search?ll=';
	urlOfFourSquare += this.lat + ',' + this.long ;
	urlOfFourSquare += '&client_id=' + client_Id ;
	urlOfFourSquare += '&client_secret=' + client_Secret_Id ;
	urlOfFourSquare += '&v=20160118' + '&query=' + this.name;
	// using ajax function for handle error
	$.getJSON(urlOfFourSquare).done(function(data)
	{
		var infoAboutPlace = data.response.venues[0];
		if(infoAboutPlace)
		{
			self.street = infoAboutPlace.location.formattedAddress[0];
			if (typeof infoAboutPlace.location.formattedAddress[0] !== 'undefined')
			{
				self.street = infoAboutPlace.location.formattedAddress[0];
			}
			self.city = infoAboutPlace.location.formattedAddress[1];
			if (typeof self.city === 'undefined')
			{
				self.city = "unknown city";
			}
			
			self.phoneNumber = infoAboutPlace.contact.phone;
			if(typeof self.phoneNumber === 'undefined')
			{
				self.phoneNumber = "unknown phone number" ;
			}
			else if (self.phoneNumber !== "unknown phone number")
			{
				self.phoneNumber = formatOfPhoneNumber(self.phoneNumber);
			}
		}
		// create new marker on map
		self.marker = new google.maps.Marker({
				position: new google.maps.LatLng(loc.location.lat, loc.location.lng),
				map: map,
				title: loc.title
				//animation: google.maps.Animation.DROP
		});

		// function for showing marker or not
		self.showTheMarker = ko.computed(function() {
			if(self.visible() === true)
			{
				self.marker.setMap(map);
			}
			else
			{
				self.marker.setMap(null);
			}
			return true;
		}, self);

		// adding infowindow to location
		self.contentOfInfoWindow = '<div class="info-window-content"><div class="title"><b>';
		self.contentOfInfoWindow += loc.title + '</b></div>' ;
		self.contentOfInfoWindow += '<div class="content">' + self.street + '</div>' ;
		self.contentOfInfoWindow += '<div class="content">' + self.city + '</div>' ;
		self.contentOfInfoWindow += '<div class="content">' + self.phoneNumber + '</div></div>' ;
		
		//create new infoWindow
		self.infoWindow = new google.maps.InfoWindow({content: self.contentOfInfoWindow});
		
		// adding listener to the marker
		self.marker.addListener('click', function() {

			self.contentOfInfoWindow = '<div class="info-window-content"><div class="title"><b>';
			self.contentOfInfoWindow += loc.title + '</b></div>' ;
			self.contentOfInfoWindow += '<div class="content">' + self.street + '</div>' ;
			self.contentOfInfoWindow += '<div class="content">' + self.city + '</div>' ;
			self.contentOfInfoWindow += '<div class="content"><a href="tel:' ; 
			self.contentOfInfoWindow += self.phoneNumber +'">' + self.phoneNumber +"</a></div></div>";

			self.infoWindow.setContent(self.contentOfInfoWindow);

			self.infoWindow.open(map, this);

			self.marker.setAnimation(google.maps.Animation.BOUNCE);

			setTimeout(function() {
	      		self.marker.setAnimation(null);
	     	}, 1000);
		});
	}).fail(function(){
		alert("error occured in loading foursquare Api. try again.");
	});
	self.activemarker = function()
	{
		google.maps.event.trigger(self.marker, 'click');
	};
};

var ViewModel = function()
{
	var self = this;
	this.filterLocation = ko.observable("");
	this.list_locations = ko.observableArray([]);

	// get client_id and client_secret_id from foursquare website
	client_Id="23303ZCQGET1RT2P1UJ21C0UFRZ3TJRRCCH3ZMMJCU15LF2X";
	client_Secret_Id="Z3QAP3LXOYWEJUY0CQTARC4INFLH5G0UU0HWYFWSJ5LSJYIN";

	for (var i = 0; i < locations.length; i++)
	{
		self.list_locations.push(new create_Location(locations[i]));
	}
	this.checkToFilter = function ()
	{
		var ff = self.filterLocation().toLowerCase();
		for (var i = 0; i < self.list_locations().length; i++)
		{
			var pp = self.list_locations()[i].name.toLowerCase();
			if(pp.search(ff) >= 0)
			{
				self.list_locations()[i].visible(true);
			}
			else
			{
				self.list_locations()[i].visible(false);
			}
		}
	};

	this.mapElement = document.getElementById('map');
	this.mapElement.style.height = window.innerHeight - 50;
};

function initMapForViewModel()
{
	// constructor creates a 
	// new map 
	map = new google.maps.Map(document.getElementById('map'),{
        center: {lat: 40.7413549, lng: -73.99802439999996},
        zoom: 13
    });
    // make the map responsive
	google.maps.event.addDomListener(window, "resize", function() {
   		var center = map.getCenter();
   		google.maps.event.trigger(map, "resize");
   		map.setCenter(center); 
	});

	ko.applyBindings(new ViewModel());
}

// hundle error function
function Handle_error() {
	alert("Google Maps has failed to load. Please check your internet connection and try again.");
}

function active(ob)
{
	alert(ob);
}
