import { Spec } from 'vega';

// https://vega.github.io/editor/#/examples/vega/bar-chart
export const spec: Spec = {
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "height": 500,
  "padding": 5,

  "config": {
    "axisBand": {
      "bandPosition": 1,
      "tickExtra": true,
      "tickOffset": 0
    }
  },

  "signals": [
    { "name": "fields",
      "value": ["petalWidth", "petalLength", "sepalWidth", "sepalLength"] },
    { "name": "plotWidth", "value": 60 },
    { "name": "width", "update": "(plotWidth + 10) * length(fields)"},
    { "name": "bandwidth", "value": 0,
      "bind": {"input": "range", "min": 0, "max": 0.5, "step": 0.005} },
    { "name": "steps", "value": 100,
      "bind": {"input": "range", "min": 10, "max": 500, "step": 1} }
  ],

  "data": [
    {
      "name": "iris",
      "url": "data/iris.json",
      "transform": [
        {
          "type": "fold",
          "fields": {"signal": "fields"},
          "as": ["organ", "value"]
        }
      ]
    }
  ],

  "scales": [
    {
      "name": "layout",
      "type": "band",
      "range": "width",
      "domain": {"data": "iris", "field": "organ"}
    },
    {
      "name": "yscale",
      "type": "linear",
      "range": "height", "round": true,
      "domain": {"data": "iris", "field": "value"},
      "zero": true, "nice": true
    },
    {
      "name": "color",
      "type": "ordinal",
      "range": "category"
    }
  ],

  "axes": [
    {"orient": "bottom", "scale": "layout", "zindex": 1},
    {"orient": "left", "scale": "yscale", "tickCount": 5, "zindex": 1}
  ],

  "marks": [
    {
      "type": "group",
      "from": {
        "facet": {
          "data": "iris",
          "name": "organs",
          "groupby": "organ"
        }
      },

      "encode": {
        "enter": {
          "xc": {"scale": "layout", "field": "organ", "band": 0.5},
          "width": {"signal": "plotWidth"},
          "height": {"signal": "height"}
        }
      },

      "data": [
        {
          "name": "density",
          "transform": [
            {
              "type": "density",
              "steps": {"signal": "steps"},
              "distribution": {
                "function": "kde",
                "from": "organs",
                "field": "value",
                "bandwidth": {"signal": "bandwidth"}
              }
            },
            {
              "type": "stack",
              "groupby": ["value"],
              "field": "density",
              "offset": "center",
              "as": ["x0", "x1"]
            }
          ]
        },
        {
          "name": "summary",
          "source": "organs",
          "transform": [
            {
              "type": "aggregate",
              "fields": ["value", "value", "value"],
              "ops": ["q1", "median", "q3"],
              "as": ["q1", "median", "q3"]
            }
          ]
        }
      ],

      "scales": [
        {
          "name": "xscale",
          "type": "linear",
          "range": [0, {"signal": "plotWidth"}],
          "domain": {"data": "density", "field": "density"}
        }
      ],

      "marks": [
        {
          "type": "area",
          "from": {"data": "density"},
          "encode": {
            "enter": {
              "orient": {"value": "horizontal"},
              "fill": {"scale": "color", "field": {"parent": "organ"}}
            },
            "update": {
              "y": {"scale": "yscale", "field": "value"},
              "x": {"scale": "xscale", "field": "x0"},
              "x2": {"scale": "xscale", "field": "x1"}
            }
          }
        },
        {
          "type": "rect",
          "from": {"data": "summary"},
          "encode": {
            "enter": {
              "fill": {"value": "black"},
              "width": {"value": 2}
            },
            "update": {
              "xc": {"signal": "plotWidth / 2"},
              "y": {"scale": "yscale", "field": "q1"},
              "y2": {"scale": "yscale", "field": "q3"}
            }
          }
        },
        {
          "type": "rect",
          "from": {"data": "summary"},
          "encode": {
            "enter": {
              "fill": {"value": "black"},
              "height": {"value": 2},
              "width": {"value": 8}
            },
            "update": {
              "xc": {"signal": "plotWidth / 2"},
              "y": {"scale": "yscale", "field": "median", "round": true}
            }
          }
        }
      ]
    }
  ]
};
