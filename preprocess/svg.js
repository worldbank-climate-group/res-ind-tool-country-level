var path = require("path"),
    fs = require('fs-extra'),
    jsdom = require("jsdom"),
    topojson = require('topojson'),
    colorbrewer = require('colorbrewer'),
    sprintf = require('sprintf'),
    colorbrewer = require('colorbrewer'),
    Q = require('q'),
    d3 = require('d3');

var generate = {};


// Collects values for each of the output domains.
_populateOutputDomains = function(model_features) {
    var outputDomains = {
        'resilience': [],
        'risk': [],
        'risk_to_assets': [],
    }
    for (var f in model_features) {
        var feature = model_features[f];
        var res = feature.properties['resilience'];
        var wel = feature.properties['risk'];
        var assets = feature.properties['risk_to_assets'];
        if (res) {
            outputDomains['resilience'].push(res);
        }
        if (wel) {
            outputDomains['risk'].push(wel);
        }
        if (assets) {
            outputDomains['risk_to_assets'].push(assets);
        }
    }
    return outputDomains;
}

/*
 * generates color scales for output domains
 */
_colorScale = function(output, data) {
    var min = Math.floor(d3.min(data));
    var max = Math.ceil(d3.max(data));
    color_ranges = {
        'resilience': colorbrewer.Reds[5].reverse(),
        'risk': colorbrewer.Purples[5].reverse(),
        'risk_to_assets': colorbrewer.Blues[5]
    }

    //create quantile classes with color scale
    var colors = d3.scale.quantile()
        .domain([min, max])
        .range(color_ranges[output]);

    return colors; //return the color scale generator
}

generate.svg = function(file, config) {

    var d = Q.defer();
    // pull out svg configuration values
    var width = config.map.width;
    var height = config.map.height;
    var outputs = config.outputs;
    var svgs = [];

    scripts = [
        "node_modules/d3/d3.min.js",
        "node_modules/d3-geo-projection.min.js"
    ];

    // get the topojson
    var model_data = fs.readFileSync(file);
    mapdata = JSON.parse(model_data);
    model_features = topojson.feature(mapdata, mapdata.objects.model_features).features;

    outputDomains = _populateOutputDomains(model_features);

    jsdom.env("<svg></svg>", scripts, function(errors, window) {
        for (var o in outputs) {
            var output = outputs[o];
            var colorScale = _colorScale(output, outputDomains[output]);
            var d3 = window.d3,
                svg = d3.select("svg");
            svg.attr("width", width)
                .attr("height", height);
            var path = d3.geo.path().projection(null);
            var layerGroup = svg.append("g");
            var modelFeatures = layerGroup.append("g");

            // model features
            modelFeatures.selectAll(".feature")
                .data(model_features)
                .enter().append("path")
                .attr("class", function(d) {
                    var cls = d.properties.iso == null ? 'nodata' : 'data';
                    var iso = d.properties.iso;
                    return sprintf("feature %s %s", cls, iso);
                })
                .style("fill", function(d) {
                    //if output value exists, assign it a color
                    var value = d.properties[output];
                    if (value) {
                        return colorScale(value);
                    } else {
                        return "#ccc";
                    }
                })
                .attr("d", path);

            var node = svg.node();
            if (node instanceof window.d3.selection) {
                node = node.node();
            }
            // set the xmlns attribute on the root node
            node.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            var filename = output + '.svg';
            svgs.push(filename);
            fs.writeFileSync(filename, node.outerHTML);
        }
        d.resolve(svgs);
    });
    return d.promise;
}

module.exports = generate;