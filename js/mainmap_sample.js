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
var countyLayer = {
	"color": "#333333",
	"weight": 1,
	"opacity": 0.65
};

var countyLayer = new L.GeoJSON.AJAX("data/California_Counties.geojson", {
	style: countyLayer,
	onEachFeature: onEachFeatureCounty
}).bindLabel('COUNTY_NAME')
.addTo(mymap);


//Highlight a county when clicked

function resetHighlight(e) {
	countyLayer.resetStyle(e.target)
}

function focusCounty(e) {
	var layer = e.target;
	mymap.fitBounds(layer.getBounds());

	layer.setStyle({
			'color': '#b30000',
		'weight': 2,
		'opacity': 1
	});

function onEachFeatureCounty(feature, layer) {
	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
		click: focusCounty
	});
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