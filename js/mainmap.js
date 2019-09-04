//Set up a map
var mymap = L.map('mapid', {
	zoomControl: false
}).setView([37.527154, -118.850098], 6);

//Creates a zoom control with a home button
var zoomHome = L.Control.zoomHome();
zoomHome.addTo(mymap);

//Load the Open Street Map tile set
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2RlYXJtb25kIiwiYSI6ImNqbnduMTV4bzBvNnozcW5kY2Y2ZmFwbHEifQ.r9UNyhE9V-9XCCvvuSuOXA', {
	maxZoom: 18,
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
		'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	id: 'mapbox.streets'
}).addTo(mymap);

//Load the earthquake events into the map
var earthquakeMarkerStyle = {
	radius: 4,
	fillColor: "#ff7800",
	color: "#000",
	weight: 1,
	opacity: 1,
	fillOpacity: 0.8
};

var earthquakeLayer = new L.GeoJSON.AJAX("data/earthquakes.geojson", {
	pointToLayer: function (feature, latlng) {
		return L.circleMarker(latlng, earthquakeMarkerStyle);
	}
}).addTo(mymap)
.bindPopup(function (layer) {
	return L.Util.template('<h3>Earthquake Info</h3>Magnitude: {MAG}<br>Location: {LOCATION}<br>Year: {YEAR}</p>', layer.feature.properties);
});

//Load county polygons into the map
var countyLayerStyle = {
	"color": "#333333",
	"weight": 1,
	"opacity": 0.65
};

var countyLayer = new L.GeoJSON.AJAX("data/California_Counties.geojson", {
	style: countyLayerStyle,
	onEachFeature: function (feature, layer) {
		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
			click: focusCounty
		})
	}
}).bindLabel('COUNTY_NAME')
.addTo(mymap);
//Note to Shannon: labels aren't working. Hmmm...

//Gets dropdown menu selection and makes a temporary queried county layer
document.getElementById("county_dropdown").addEventListener("click", function(e) {
    console.log("I will now try to focus my attention on " + e.target.innerHTML);
    loadSelectedCounty(e.target.innerHTML)
})

var countyGroupLayer = L.featureGroup([]);

var selectedCountyStyle = {
	'color': '#b30000',
	'weight': 2,
	'opacity': 1
};

function loadSelectedCounty(countyname) {
	countyGroupLayer.clearLayers();
	var countySelect = new L.GeoJSON.AJAX("data/California_Counties.geojson", {
		filter: function(feature){
			if (feature.properties.COUNTY_NAME === countyname){
				console.log("found " + countyname)
				return true
			} 
		},
		//forEachFeature(feature, layer){
		onEachFeature(feature, layer){
			layer.fire("click");
			focusCountyAlt(layer);
		},		
		style: selectedCountyStyle
	})
	countyGroupLayer.addLayer(countySelect);
	countyGroupLayer.addTo(mymap);
	console.log(countySelect);
	//focusCounty(countySelect);
	//focusCountyAlt(countySelect);
}


//Highlight a county when clicked
function resetHighlight(e) {
	countyLayer.resetStyle(e.target)
	//info.update();
}

function focusCountyOld(e) {
	var layer = e.target;
	mymap.fitBounds(layer.getBounds());

	layer.setStyle({
		'color': '#b30000',
		'weight': 2,
		'opacity': 1
	});
	var ptsWithin = turf.pointsWithinPolygon(earthquakeLayer.toGeoJSON(), layer.toGeoJSON());

	//Set up a table to hold earthquake data
	var table = document.createElement("TABLE");
	table.setAttribute("id", "myTable");
	table.setAttribute("class", "table table-striped table-condensed table-responsive");
	var header = table.createTHead();
	var row = header.insertRow(0);
	var f1 = row.insertCell(0);
	var f2 = row.insertCell(1);
	var f3 = row.insertCell(2);
	f1.innerHTML = "<b>Year</b>";
	f2.innerHTML = "<b>Magnitude</b>";
	f3.innerHTML = "<b>Location</b>";
	for (i = 0; i < ptsWithin.features.length; i++){
		row = table.insertRow(i+1);
		f1 = row.insertCell(0);
		f2 = row.insertCell(1);
		f3 = row.insertCell(2);
		f1.innerHTML = ptsWithin.features[i].properties.YEAR;
		f2.innerHTML = ptsWithin.features[i].properties.MAG;
		f3.innerHTML = ptsWithin.features[i].properties.LOCATION;
	}
	
	if (ptsWithin.features.length > 0) {
		countyText = table;
	} else {
		countyText = '(No earthquake data)';
	}
	var contentResults =document.getElementById('tableDiv');
	contentResults.innerHTML = "";
	contentResults.append(countyText);

	var tableTitle =document.getElementById('table-title');
	tableTitle.innerHTML = e.target.feature.properties.COUNTY_NAME + ' County';
}

function focusCounty(e) {
	console.log(e)
	var mylayer = e.target;
	console.log(mylayer);
	focusCountyAlt(mylayer)
}

function focusCountyAlt(layer) {
	countyGroupLayer.clearLayers();
	mymap.fitBounds(layer.getBounds());

	layer.setStyle({
		'color': '#b30000',
		'weight': 2,
		'opacity': 1
	});
	var ptsWithin = turf.pointsWithinPolygon(earthquakeLayer.toGeoJSON(), layer.toGeoJSON());

	//Set up a table to hold earthquake data
	var table = document.createElement("TABLE");
	table.setAttribute("id", "myTable");
	table.setAttribute("class", "table table-striped table-condensed table-responsive");
	var header = table.createTHead();
	var row = header.insertRow(0);
	var f1 = row.insertCell(0);
	var f2 = row.insertCell(1);
	var f3 = row.insertCell(2);
	f1.innerHTML = "<b>Year</b>";
	f2.innerHTML = "<b>Magnitude</b>";
	f3.innerHTML = "<b>Location</b>";
	for (i = 0; i < ptsWithin.features.length; i++){
		row = table.insertRow(i+1);
		f1 = row.insertCell(0);
		f2 = row.insertCell(1);
		f3 = row.insertCell(2);
		f1.innerHTML = ptsWithin.features[i].properties.YEAR;
		f2.innerHTML = ptsWithin.features[i].properties.MAG;
		f3.innerHTML = ptsWithin.features[i].properties.LOCATION;
	}
	
	if (ptsWithin.features.length > 0) {
		countyText = table;
	} else {
		countyText = '(No earthquake data)';
	}
	var contentResults =document.getElementById('tableDiv');
	contentResults.innerHTML = "";
	contentResults.append(countyText);

	var tableTitle =document.getElementById('table-title');
	//tableTitle.innerHTML = e.target.feature.properties.COUNTY_NAME + ' County';
}

function highlightFeature(e) {
	var layer = e.target;

	layer.setStyle({
		"weight": 2
	});

	if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
		layer.bringToFront();
	}
}
