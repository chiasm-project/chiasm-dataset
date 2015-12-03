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
  metadata_columns_not_array: "The dataset.metadata.columns property is not an array, its type is '%type%'.",
  metadata_columns_not_array_of_objects: [
    "The dataset.metadata.columns property is not an array of column descriptor objects,",
    " it is an array whose elements are of type '%type%'."
  ].join(""),
  metadata_columns_name_missing: "The 'name' property is missing from a column descriptor entry in dataset.metadata.columns.",
  metadata_columns_name_not_string: "The 'name' property of a column descriptor entry in dataset.metadata.columns is not a string.",
  metadata_columns_type_missing: "The 'type' property is missing from the '%column%' column descriptor entry in dataset.metadata.columns.",
  metadata_columns_type_not_valid: "The 'type' property for the '%column%' column descriptor is not a valid value.",
  column_in_data_not_metadata: "The column '%column%' is present in the data, but there is no entry for it in dataset.metadata.columns.",
  column_in_metadata_not_data: "The column '%column%' is present in dataset.metadata.columns, but this column is missing from the row objects in dataset.data.",
  column_type_mismatch: "The column '%column%' is present in the data, but its type does not match that declared in dataset.metadata.columns. The type of the data value '%value%' for column '%column' is '%typeInData%', but is declared to be of type '%typeInMetadata%' in dataset.metadata.columns.",
  column_metadata_missing: "There is no metadata present for the column '%column%'"
};

var validTypes = {
  string: true,
  number: true,
  date: true
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
    var nonObjectType;
    var allRowsAreObjects = dataset.data.every(function (d){
      var type = typeof d;
      if(type === "object"){
        return true;
      } else {
        nonObjectType = type;
        return false;
      }
    });
    if(!allRowsAreObjects){
      return reject(error("data_not_array_of_objects", {
        type: nonObjectType
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

    // Validate that the `metadata.columns` property is an array.
    if(dataset.metadata.columns.constructor !== Array){
      return reject(error("metadata_columns_not_array", {
        type: typeof dataset.metadata.columns
      }));
    }

    // Validate that the `metadata.columns` property is an array of objects.
    var nonObjectType;
    var allColumnsAreObjects = dataset.metadata.columns.every(function (d){
      var type = typeof d;
      if(type === "object"){
        return true;
      } else {
        nonObjectType = type;
        return false;
      }
    });
    if(!allColumnsAreObjects){
      return reject(error("metadata_columns_not_array_of_objects", {
        type: nonObjectType
      }));
    }

    // Validate that the each column descriptor has a "name" field.
    if(!dataset.metadata.columns.every(function (column){
      return column.name;
    })){
      return reject(error("metadata_columns_name_missing"));
    }

    // Validate that the each column descriptor has a "name" field that is a string.
    if(!dataset.metadata.columns.every(function (column){
      return (typeof column.name) === "string";
    })){
      return reject(error("metadata_columns_name_not_string"));
    }

    // Validate that the each column descriptor has a "type" field.
    var columnNameMissingType;
    if(!dataset.metadata.columns.every(function (column){
      if(!column.type){
        columnNameMissingType = column.name;
      }
      return column.type;
    })){
      return reject(error("metadata_columns_type_missing", {
        column: columnNameMissingType
      }));
    }


    // Validate that the each column descriptor has a "type" field that is a valid value.
    var columnNameInvalidType;
    if(!dataset.metadata.columns.every(function (column){
      if(validTypes[column.type]){
        return true;
      } else {
        columnNameInvalidType = column.name;
        return false;
      }
    })){
      return reject(error("metadata_columns_type_not_valid", {
        column: columnNameInvalidType
      }));
    }
    

    //////////////////////
    // dataset.data     //
    //       AND        //
    // dataset.metadata //
    //////////////////////
    
    // Index the columns in the metadata.
    var columnsInMetadata = {};
    dataset.metadata.columns.forEach(function (column){
      //columnsInMetadata[column.name] = true;
      columnsInMetadata[column.name] = column.type;
    });

    //// Index the columns in the data (based on the first row only).
    var columnsInData = {};
    Object.keys(dataset.data[0]).forEach(function (columnName){
      columnsInData[columnName] = true;
    });


    // Validate that all columns present in the data are also present in metadata.
    var columnInDataNotInMetadata;

    // In the same pass over the data, validate that types match.
    var typeMismatchParams;

    var allIsWell = dataset.data.every(function (row){
      return Object.keys(row).every(function (columnInData){
        var typeInMetadata = columnsInMetadata[columnInData];

        // Check that the column is present in metadata.
        if(typeInMetadata){

          // Check that the actual type matches the declared type.
          var value = row[columnInData];
          var typeInData = typeof value;

          // Detect Date types.
          if(typeInData === "object" && value.constructor === Date){
            typeInData = "date";
          }

          if(typeInData !== typeInMetadata){
            typeMismatchParams = {
              column: columnInData,
              value: value,
              typeInData: typeInData,
              typeInMetadata: typeInMetadata
            };
            return false;
          }

          return true;
        } else {
          columnInDataNotInMetadata = columnInData
          return false;
        }
      });
    });
    if(!allIsWell){
      if(columnInDataNotInMetadata){
        return reject(error("column_in_data_not_metadata", {
          column: columnInDataNotInMetadata
        }));
      } else {

        // If we got here, then there was a type mismatch.
        return reject(error("column_type_mismatch", typeMismatchParams));
      }
    }


    // Validate that all columns present in the metadata are also present in the data.
    var columnInMetadataNotInData;
    var allColumnsInMetadataAreInData = dataset.metadata.columns.every(function (column){
      var columnInMetadata = column.name;
      if(columnsInData[columnInMetadata]){
        return true;
      } else {
        columnInMetadataNotInData = columnInMetadata
        return false;
      }
    });
    if(!allColumnsInMetadataAreInData){
      return reject(error("column_in_metadata_not_data", {
        column: columnInMetadataNotInData
      }));
    }

    // If we got here, then all the validation tests passed.
    resolve();
  });
}

function getColumnMetadata(dataset, columnName){

  var matchingColumns = dataset.metadata.columns.filter(function (column){
    return column.name === columnName;
  })

  if(matchingColumns.length === 0){
    throw error("column_metadata_missing", { column: columnName });
  } else {
    return matchingColumns[0];
  }
}

module.exports = {
  errorMessage: errorMessage,
  validate: validate,
  getColumnMetadata: getColumnMetadata
};
