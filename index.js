var strings = {
  data_missing: "The dataset.data property does not exist.",
  data_not_array: "The dataset.data property is not an array, its type is '%type%'.",
  data_not_array_of_objects: [
    "The dataset.data property is not an array of row objects,",
    " it is an array whose elements are of type '%type%'."
  ].join(""),
  metadata_missing: "The dataset.metadata property is missing.",
  metadata_not_object: "The dataset.metadata property is not an object, its type is '%type%'.",
  metadata_missing_columns: "The dataset.metadata.columns property is missing.",
  metadata_columns_in_data_not_metadata: "The column '%column%' is present in the data, but there is no entry for it in dataset.metadata.columns.",

  // TODO test
  metadata_columns_in_metadata_not_data: "The column '%column%' is present in dataset.metadata.columns, but this column is missing from the row objects in dataset.data.",
};

function error(id, params){
  return Error(errorMessage(id, params));
}

function errorMessage(id, params){
  return template(strings[id], params);
}

// Simple templating from http://stackoverflow.com/questions/377961/efficient-javascript-string-replacement
function template(str, params){
  return str.replace(/%(\w*)%/g, function(m, key){
    return params[key];
  });
}

function validate(dataset){
  return new Promise(function (resolve, reject){

    //////////////////
    // dataset.data //
    //////////////////

    // Validate that the `data` property exists.
    if(!dataset.data){
      return reject(error("data_missing"));
    }

    // Validate that the `data` property is an array.
    if(dataset.data.constructor !== Array){
      return reject(error("data_not_array", {
        type: typeof dataset.data
      }));
    }

    // Validate that the `data` property is an array of objects.
    // Checks the first element only.
    if(dataset.data.length > 0 && (typeof dataset.data[0]) !== "object"){
      return reject(error("data_not_array_of_objects", {
        type: typeof dataset.data[0]
      }));
    }


    //////////////////////
    // dataset.metadata //
    //////////////////////

    // Validate that the `metadata` property exists.
    if(!dataset.metadata){
      return reject(error("metadata_missing"));
    }

    // Validate that the `metadata` property is an object.
    if(typeof dataset.metadata !== "object"){
      return reject(error("metadata_not_object", {
        type: typeof dataset.metadata
      }));
    }

    // Validate that the `metadata.columns` property exists.
    if(!dataset.metadata.columns){
      return reject(error("metadata_missing_columns"));
    }

    //////////////////////
    // dataset.data     //
    //       AND        //
    // dataset.metadata //
    //////////////////////
    
    var columnsInMetadata = {};
    dataset.metadata.columns.forEach(function (column){
      columnsInMetadata[column.name] = true;
      //columnsInMetadata[column.name] = column.type;
    });

    // Validate that all columns present in the data are also present in metadata.
    var columnInDataNotInMetadata;
    var columnsInDataAreInMetadata = dataset.data.every(function (row){
      return Object.keys(row).every(function (columnInData){
        if(columnsInMetadata[columnInData]){
          return true;
        } else {
          columnInDataNotInMetadata = columnInData
          return false;
        }
      });
    });
    if(!columnsInDataAreInMetadata){
      return reject(error("metadata_columns_in_data_not_metadata", {
        column: columnInDataNotInMetadata
      }));
    }

    // If we got here, then all the validation tests passed.
    resolve();
  });
}

module.exports = {
  strings: strings,
  errorMessage: errorMessage,
  validate: validate
};
