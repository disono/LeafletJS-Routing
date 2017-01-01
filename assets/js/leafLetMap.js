var WBLeafMap = (function () {
    var _markers = [];
    var _mapBoxToken = '';

    return {
        map: null,

        lat: 14.5995,
        lng: 120.9842,
        zoom: 14,

        /**
         * Initialize map
         *
         * @param id
         * @returns
         */
        init: function (id) {
            if (!document.getElementById(id)) {
                return;
            }

            // reset markers
            _markers = [];

            // leaf map
            this.map = L.map(id).setView([this.lat, this.lng], this.zoom);

            // use map box for tiles
            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + _mapBoxToken, {
                maxZoom: this.zoom,
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery © <a href="http://mapbox.com">Mapbox</a>',
                id: 'mapbox.streets'
            }).addTo(this.map);

            return this.map;
        },

        /**
         * Search
         *
         * @param id
         */
        search: function (id) {
            var input = document.getElementById(id);
            if (!input) {
                return;
            }

            var searchBox = new google.maps.places.SearchBox(input);

            searchBox.addListener('places_changed', function () {
                var places = searchBox.getPlaces();

                if (places.length == 0) {
                    return;
                }

                var group = L.featureGroup();

                places.forEach(function (place) {
                    group.addLayer(WBLeafMap.addMarker(place.geometry.location.lat(), place.geometry.location.lng(), {
                        popup: {
                            content: place.formatted_address
                        },
                        icon: 'http://icons.iconarchive.com/icons/icons-land/vista-map-markers/64/Map-Marker-Marker-Inside-Chartreuse-icon.png'
                    }, function (e) {
                        console.log(this.getLatLng());
                    }));
                });

                group.addTo(WBLeafMap.map);
                WBLeafMap.map.fitBounds(group.getBounds());
            });
        },

        /**
         * Direction routing
         *
         * @param wayPointsList
         * @param callback
         */
        route: function (wayPointsList, callback) {
            var routingControl = L.Routing.control({
                waypoints: wayPointsList,
                plan: L.Routing.plan(wayPointsList, {
                    createMarker: function (i, wp) {
                        var marker = L.marker(wp.latLng, {
                            draggable: false
                        });

                        marker.on('click', function (e) {
                            console.log(this.getLatLng());
                        });

                        return marker;
                    }
                }),
                draggableWaypoints: false,
                addWaypoints: false
            }).addTo(this.map);

            // instruction hide
            jQ('.leaflet-routing-container').remove();

            // list of routes found
            routingControl.on('routesfound', function (e) {
                // e.routes[0].summary.totalDistance;
                // e.routes[0].summary.totalTime;
                // e.routes[0].instructions

                callback(e);
            });
        },

        /**
         * Add marker
         *
         * @param lat
         * @param lng
         * @param data
         * @param clickCallback
         * event on click: this.getLatLng()
         */
        addMarker: function (lat, lng, data, clickCallback) {
            var options = {};
            if (data) {
                // icon marker
                if (data.icon) {
                    options.icon = new L.icon({
                        iconUrl: data.icon,
                        iconSize: [64, 64]
                    });
                }
            }

            // marker with options
            var marker = L.marker([lat, lng], options).addTo(this.map);

            if (data) {
                // popup marker
                if (data.popup) {
                    marker.bindPopup(data.popup.content);
                }
            }

            // on marker click
            if (clickCallback) {
                // event
                // this.getLatLng()
                marker.on('click', clickCallback);
            }

            _markers.push(marker);

            this.centerMap(null, null);
            return marker;
        },

        /**
         * On map click
         * event: e.latlng
         *
         * @param callback
         */
        onClick: function (callback) {
            this.map.on('click', callback);
        },

        /**
         * Delete markers
         */
        deleteMarker: function () {
            for (var i = 0; i < _markers.length; i++) {
                this.map.removeLayer(_markers[i]);
            }

            _markers = [];
        },

        /**
         * Center map
         *
         * @param lat
         * @param lng
         */
        centerMap: function (lat, lng) {
            var listLatLng = [];

            for (var i = 0; i < _markers.length; i++) {
                listLatLng.push([_markers[i]._latlng.lat, _markers[i]._latlng.lng]);
            }

            var bounds = new L.LatLngBounds(listLatLng);
            this.map.fitBounds(bounds);
        }
    }
}());