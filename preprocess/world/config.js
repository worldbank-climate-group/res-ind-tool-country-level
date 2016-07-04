/**
 * Configuration for resilience tool map preprocessing.
 */
config = {
    "inputs": {
        // model input data
        "data": "world/df_world.csv",

    },
    // model outputs
    "outputs": ['risk', 'resilience', 'risk_to_assets'],
    "layers": {
        // shapefile layers to convert to topojson
        "model_features": {
            // layer name in topojson
            "layer_name": "model_features",
            // input shapefile name - relative to index.js
            "shape_file": "world/shp/WB_CountryPolys.shp",
            // fields to preserve from input shapefile to output topojson
            "filter_fields": "name,id",
            // rename input fields in output topojson
            "rename_fields": "",
            // join field on input data
            "data_join_field": "id",
            // join field on shpapefile
            "shp_join_field": "id",
        },
        "coastlines": {
            // layer name in topojson
            "layer_name": "coastlines",
            // input shapefile name - relative to index.js
            "shape_file": "world/shp/WB_Coastlines.shp"
        },
        "international_boundaries": {
            // layer name in topojson
            "layer_name": "international_boundaries",
            // input shapefile name - relative to index.js
            "shape_file": "world/shp/WB_IntlBdies.shp",
            // filter fields
            "filter_fields": "_Id,_LayerName,Style",
        },
        "disputed_areas": {
            // layer name in topojson
            "layer_name": "disputed_areas",
            // input shapefile name - relative to index.js
            "shape_file": "world/shp/WB_DispAreas.shp",
            // filter fields
            "filter_fields": "ISO_Codes,Names,Regions,Rules,_LayerName,F_Id",
        },
        "disputed_boundaries": {
            // layer name in topojson
            "layer_name": "disputed_boundaries",
            // input shapefile name - relative to index.js
            "shape_file": "world/shp/WB_DispBdies.shp",
            // filter fields
            "filter_fields": "_Id,_LayerName,Style",
        },
    },
    "map": {
        // ploygon simplification tolerance
        "simplify_poly": "20%",
        // line simplification tolerance
        "simplify_line": "20%",
        // svg/topojson width and height
        "width": 500,
        "height": 350,
        "margin": 15,
        "projection": 'd3.geo.robinson()'
    },
    "svg": {
        // svg styles
        "styles": {
            "nodata": {
                "fill": "#CCC"
            },
            "coastlines": {
                "fill": "none",
                "stroke": "#666",
                "stroke-width": ".2px",
                "stroke-linejoin": "miter"
            },
            "international_boundaries": {
                "fill": "none",
                "stroke": "#666",
                "stroke-width": ".2px",
                "stroke-linejoin": "miter"
            },
            "disputed_boundaries": {
                "fill": "none"
            },
            "disputed_areas":{
                "fill": "#E0E0E0"
            },
            "dotted_line": {
                "fill": "none",
                "stroke": "#666",
                "stroke-width": ".2px",
                "stroke-dasharray": ".8, .8",
                "stroke-linejoin": "miter"
            },
            "dashed_line": {
                "fill": "none",
                "stroke": "#666",
                "stroke-width": ".2px",
                "stroke-dasharray": ".1, .8",
            },
            "tightly_dashed_line": {
                "fill": "none",
                "stroke": "#666",
                "stroke-width": ".2px",
                "stroke-dasharray": "1.5, .5",
                "stroke-linejoin": "miter"
            }
        }
    },
    // the topojson output filename
    "topojson_out": "map_data.topojson"
}

module.exports = config;
