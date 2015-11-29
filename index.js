var strings = {
  no_data_property: "The dataset.data property does not exist.",
  data_not_array: "The dataset.data property is not an array, its type is '%type%'.",
  data_not_array_of_objects: [
    "The dataset.data property is not an array of row objects,",
    " it is an array whose elements are of type '%type%'."
  ].join("")
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

module.exports = {
  strings: strings,
  errorMessage: errorMessage,
  validate: function (dataset){
    return new Promise(function (resolve, reject){

      // Validate that the `data` property exists.
      if(!dataset.data){
        return reject(error("no_data_property"));
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

      // If we got here, then all the validation tests passed.
      resolve();
    });
  }
};
