var strings = {
  no_data_property: "The dataset.data property does not exist."
};

function error(id){
  return Error(strings[id]);
}

module.exports = {
  strings: strings,
  validate: function (dataset){
    return new Promise(function (resolve, reject){

      // Validate that the `data` property exists.
      if(!dataset.data){
        reject(error("no_data_property"));
      }
    });
  }
};
