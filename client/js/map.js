var $ = require('jquery'),
    sprintf = require('sprintf'),
    Q = require('q'),
    d3 = require('d3'),
    plots = require('./plots'),
    inputs = require('./inputs'),
    topojson = require('topojson');
require('d3-geo-projection')(d3);

var map = {};

map.config = {}

map.draw = function(config, json) {

    // clear the map before redrawing
    $('#map').empty();
    $('#map').append('<div id="data"></div>');

    // update the map config
    map.config = config;
    var d = Q.defer();
    // var width = dim[0];
    // var height = dim[1];
    var width = 500;
    var height = 500;
    svg = d3.select("#map")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    var layerGroup = svg.append("g");
    var modelFeatures = layerGroup.append("g");

    var zoom = d3.behavior.zoom()
        .scaleExtent([1, 10])
        .on("zoom", zoomed);

    svg.call(zoom).call(zoom.event);

    function zoomed() {
        var t = d3.event.translate,
            s = d3.event.scale,
            h = height;
        w = width;
        t[0] = Math.min(w / 2 * (s - 1) + (w / 2 * s), Math.max(w / 2 * (1 - s) - (w / 2 * s), t[0]));
        t[1] = Math.min(h / 3 * (s - 1) + (h / 3 * s), Math.max(h / 3 * (1 - s) - (h / 3 * s), t[1]));
        layerGroup.attr("transform", "translate(" + t + ") scale(" + s + ")");
    }

    // pull out geojson layers
    var model_features = topojson.feature(json, json.objects.model_features).features;
    
    var path = d3.geo.path().projection(null);

    // countries
    modelFeatures.selectAll(".feature")
        .data(model_features)
        .enter()
        .append("path")
        .attr("class", function(d) {
            // check resilience by default
            var cls = d.properties.resilience == null ? 'nodata' : 'data';
            var iso = d.properties.iso;
            return sprintf("feature %s %s", cls, iso);
        })
        .attr("d", path)
        .on('mouseout', function(d) {
            $('#data').empty();
        })
        .on('mouseover', function(d) {
            var name = d.properties.NAME_1;
            if (name) {
                var chl_field = d.properties[map.config.chloropleth_field];
                var iso = d.properties.iso;
                $('#data').empty();
                $('#data').append('<span><strong>' + name + ' (' + iso + '). </strong></span>');
                $('#data').append('<span><strong>' + map.config.chloropleth_title + ': </strong>' + chl_field + '</span>');
            }
        })
        .on('mousedown', function(d) {
            // don't select countries if we don't have iso code
            if (!d.properties.iso) {
                return;
            }
            // clear selection before re-selecting
            modelFeatures.selectAll('.feature')
                .classed('featureselect', false);

            // select the feature
            var iso = d.properties.iso;
            modelFeatures.selectAll('.' + iso)
                .classed('featureselect', true);

            // notify event listeners
            $.event.trigger({
                type: 'featureselect',
                feature: d
            });
        });

    // get input domains
    d.resolve(model_features);

    return d.promise;
}

// set selected feature
map.featureselect = function(feature) {
    // clear selection before re-selecting
    svg.selectAll('.feature')
        .classed('featureselect', false);

    // select the feature
    var name = feature.properties.NAME_1;
    var iso = feature.properties.iso;
    svg.selectAll('.' + iso)
        .classed('featureselect', true);

    var chl_field = feature.properties[map.config.chloropleth_field];
    $('#data').empty();
    $('#data').append('<span><strong>' + name + ' (' + iso + '). </strong></span>');
    $('#data').append('<span><strong>' + map.config.chloropleth_title + ': </strong>' + chl_field + '</span>');
}

// handle output map switch events
map.mapselect = function(feature) {
    var name = feature.properties.NAME_1;
    var iso = feature.properties.iso;
    var chl_field = feature.properties[map.config.chloropleth_field];
    $('#data').empty();
    $('#data').append('<span><strong>' + name + ' (' + iso + '). </strong></span>');
    $('#data').append('<span><strong>' + map.config.chloropleth_title + ': </strong>' + chl_field + '</span>');
}

module.exports = map;