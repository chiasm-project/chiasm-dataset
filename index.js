var strings = {
  no_data_property: "The dataset.data property does not exist.",
  data_not_array: "The dataset.data property is not an array, its type is '%type%'."
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
        reject(error("no_data_property"));

      // Validate that the `data` property is an array.
      } else if((typeof dataset.data) !== "Array"){
        reject(error("data_not_array", { type: typeof dataset.data}));
      } else {
        resolve();
      }
    });
  }
};
