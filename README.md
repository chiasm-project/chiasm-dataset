# chiasm-dataset
A data structure for representing tabular data.

 * [What Problem Does This Solve?](#what-problem-does-this-solve)
 * [Usage](#usage)
 * [Data Structure Reference](#data-structure-reference)
 * [Related Work](#related-work)
 * [Roadmap](#roadmap)

Intended for use as:

 * the data structure generated by loading data into the browser,
 * the input and output type for data transformations (e.g. filtering and aggregation), and
 * the input type for data visualizations.

This data structure accommodates both relational data tables as well as aggregated multidimensional data.

The purpose of this data structure is to serve as a common data table representation for use in the [Chiasm project](https://github.com/chiasm-project/chiasm). By using this data structure, components for data access, data transformation, and interactive visualization can be interoperable.

# What Problem Does This Solve?
Most of the [D3-based data visualization examples](https://github.com/mbostock/d3/wiki/Gallery) are organized such that the data-specific logic is intertwined with data visualization logic. This is a barrier that makes it more difficult to adapt existing visualization examples to new data, or to create reusable visualization components.

For example, in this [Bar Chart Example](http://bl.ocks.org/mbostock/3885304), the visualization logic is deeply entangled with the mapping from data to visual marks and channels in lines of code like this `` Also, the logic that specifies how each column in a CSV file should be parsed is specified using JavaScript, which must be manually changed with changing the data used for the visualization.

Introducing a well defined data structure for dealing with data tables makes it possible to cleanly separate data-specific logic from generic data visualization logic. Using chiasm-dataset as an intermediate data table representation, the [chiasm-dsv-dataset module](https://github.com/chiasm-project/chiasm-dsv-dataset) moves the logic that specifies how each column in a CSV file should be parsed out of JavaScript and into a configuration file. This organization of the code also enables services that may render arbitrary data tables that can be configured dynamically at runtime.

In addition, it is useful to explicitly represent the types of each column so that they can be checked for compatibility with various "shelves" of visualization components such as `xColumn`, `yColumn`, `colorColumn`, `sizeColumn`, and `shapeColumn`, corresponding to mappings from data columns (also called "variables", "fields", or "attributes") visual marks and channels. This enables user interfaces that are aware of column type restrictions for certain visualization, such as dropdown menus restricted by column type, or drag & drop interfaces that know where a given column can and cannot be dropped.

[![](http://image.slidesharecdn.com/2015-150716143500-lva1-app6892/95/visualization-a-primer-basics-techniques-and-guidelines-19-638.jpg?cb=1437057727)](http://www.slideshare.net/cagatayturkay/visualization-a-primer)
Visual Marks and Channels Diagram from [Munzner: Visualization Analysis and Design](https://www.youtube.com/watch?v=jVC6SQS23ak&feature=youtu.be)

# Usage

Since this project is mainly a specification of an in-memory JavaScript data structure, the library it provides is a program that will validate the data structure according to a [set of constraints](https://github.com/chiasm-project/chiasm-dataset/issues/1). Here's some example code that shows how to validate a dataset.

```javascript
var ChiasmDataset = require("chiasm-dataset");

var dataset = {
  data: [
    { name: "Joe",  age: 29, birthday: new Date(1986, 11, 17) },
    { name: "Jane", age: 31, birthday: new Date(1985, 1, 15)  }
  ],
  metadata: {
    columns: [
      { name: "name", type: "string" },
      { name: "age", type: "number" },
      { name: "birthday", type: "date" }
    ]
  }
};

var promise = ChiasmDataset.validate(dataset);

promise.then(function (){
  console.log("This dataset successfully passed validation!");
}, function (err){
  console.log("This dataset failed validation with the following error: " + err.message);
});
```

Note that `ChiasmDataset.validate` returns a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). See the [tests](tests.js) for an enumeration of all possible validation failure errors.

# Data Structure Reference

Each `dataset` object has two properties, [`data`](#data) and [`metadata`](#metadata).

<a name="data" href="#data">#</a><i>dataset</i>.<b>data</b>

An array of row objects. This contains all rows of the data table. This is the same data structure returned by [d3-dsv](https://github.com/d3/d3-dsv) after parsing strings into primitive types. Each row object has keys corresponding to column names and values for each cell of the data table. The values are represented in memory as the JavaScript primitive types corresponding the the [declared column type](#type).

<a name="metadata" href="#metadata">#</a><i>dataset</i>.<b>metadata</b>

An object that describes the data table. This includes the properties [isCube](#isCube) and [columns](#columns).

<a name="isCube" href="#isCube">#</a><i>dataset.metadata</i>.<b>isCube</b>

A property set to `true` if this dataset contains aggregated multidimensional data where each row represents a cell of a data cube. This value may be omitted or set to `false` if this dataset contains a relational data table where each row represents an individual entity or event.

When set to `true`, each row contains values for dimensions and measures. In this case, each column is interpreted as either as a dimension or measure, depending on the value of the [isDimension](#isDimension) property.

<a name="columns" href="#columns">#</a><i>dataset.metadata</i>.<b>columns</b>

An array of column descriptor objects. Each of these objects must have the properties [name](#name), [label](#label) and [type](#type). The order of these objects may be used in visualizations (e.g. to define the order of axes in parallel coordinates, or the order of columns in an Excel-like table representation).

If [isCube](#isCube) is `true`, then each of these objects may have the properties [isDimension](#isDimension) and [interval](#interval).

<a name="name" href="#name">#</a><i>dataset.metadata.columns[i]</i>.<b>name</b>

The name of the column. This corresponds to the keys in each row object of [dataset.data](#data).

<a name="label" href="#label">#</a><i>dataset.metadata.columns[i]</i>.<b>label</b>

The label of the column. This is a human-readable string that may be used in user interface elements that represent the column such as column selection widgets or axis labels in visualizations.

<a name="type" href="#type">#</a><i>dataset.metadata.columns[i]</i>.<b>type</b>

The type of the column. This is a string, and must be either "number", "string", or "date".

<a name="isDimension" href="#isDimension">#</a><i>dataset.metadata.columns[i]</i>.<b>isDimension</b>

If this property is set to `true`, then this column represents a data cube dimension. This property is only relevant if [isCube](#isCube) is set to `true`.

If the column represents a dimension and is of type "number" or "date", then it is assumed to represent the result of binned aggregation. In this case, the [interval](#interval) property must be defined.

<a name="interval" href="#interval">#</a><i>dataset.metadata.columns[i]</i>.<b>interval</b>

The interval between bins. This property is only relevant if:

 * the dataset is aggregated ([isCube](#isCube) == `true`) and
 * the column is a dimension ([isDimension](#isDimension) is true), and
 * the column [type](#type) is either "number" or "date".

If the column type is "number", then this property is expected to be a number. This is the width of the numeric bins used, for example, in a histogram or heat map. Only fixed-width numeric binning is supported (variable width binning is not supported at this time).

If the column type is "date", then this property is expected to be a string corresponding to one of the interval types defined in [d3-time](https://github.com/d3/d3-time). This includes, for example, "minute", "hour", "day", "week", "month", and "year".

<a name="domain" href="#domain">#</a><i>dataset.metadata.columns[i]</i>.<b>domain</b>

The domain of this column. This corresponds to the notion of domain in D3 scales.

If the column type is "string", then the domain is an array of unique string values that occur in the column. The ordering of these strings will determine, for example, the postion of bars in a bar chart, or the order in which values are mapped to colors using color scales.

If the column type is "number", then the domain is an array containing two numbers, the minimum (`domain[0]`) and the maximum (`domain[1]`). This is how numeric domains are typically represented in D3 numeric scales.

If the column type is "date", then the domain is an array containing two JavaScript `Date` objects, the minimum (`domain[0]`) and the maximum (`domain[1]`). This is how temporal domains are typically represented in D3 time scales.

# Related Work

This library is essentially a data frame for JavaScript, similar in many ways to:

 * [R Data Frames](http://www.r-tutor.com/r-introduction/data-frame)
 * [Pandas Data Frames](http://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.html)

I hope I'm not reinventing the wheel here. If you know of any JavaScript data frame library that solves the same problems as this one, please open a GitHub issue.

# Roadmap

The overall goal of this project is to serve as the core data structure exchanged between Chiasm components for representing tabular data. The following issues comprise the roadmap:

 * [Implement validation function](https://github.com/chiasm-project/chiasm-dataset/issues/1)
 * [Adopt chiasm-dataset in other projects](https://github.com/chiasm-project/chiasm-dataset/issues/2)
 * [Support variable width binning](https://github.com/chiasm-project/chiasm-dataset/issues/3)
