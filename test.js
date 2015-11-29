var expect = require("chai").expect,
    ChiasmDataset = require("./index"),
    strings = ChiasmDataset.strings,
    errorMessage = ChiasmDataset.errorMessage;

function reject(options, done, printErr){
  ChiasmDataset.validate(options.dataset)
    .then(function (){}, function (err) {

      if(printErr){
        console.log(err.message);
        console.log(err.stack);
      }

      expect(err.message)
        .to
        .equal(errorMessage(options.errorId, options.errorParams));
      done();
    });
}

describe("chiasm-dataset", function () {

  it("`data` property exists.", function(done) {
    ChiasmDataset.validate({}).then(function (){}, function (err) {

      // Here's how you can see a stack trace for debugging.
      //console.log(err.stack);

      expect(err).to.exist;
      expect(err.message).to.equal(strings.data_missing);
      done();
    });
  });

  it("`data` property is an array of objects (reject string).", function(done) {
    ChiasmDataset.validate({
      data: "foo"
    }).then(function (){}, function (err) {
      expect(err).to.exist;
      expect(err.message).to.equal(errorMessage("data_not_array", {
        type: "string"
      }));
      done();
    });
  });

  it("`data` property is an array of objects (reject string) using reject function.", function(done) {
    reject({
      dataset: { data: "foo" },
      errorId: "data_not_array",
      errorParams: { "type": "string" }
    }, done);
  });

  it("`data` property is an array of objects (reject number).", function(done) {
    reject({
      dataset: { data: 5 },
      errorId: "data_not_array",
      errorParams: { "type": "number" }
    }, done);
  });

  it("`data` property is an array of objects (reject string array).", function(done) {
    reject({
      dataset: { data: ["foo", "bar"] },
      errorId: "data_not_array_of_objects",
      errorParams: { type: "string" }
    }, done);
  });

  it("`data` property is an array of objects (reject number array).", function(done) {
    reject({
      dataset: { data: [1, 2, 3] },
      errorId: "data_not_array_of_objects",
      errorParams: { type: "number" }
    }, done);
  });

  it("`data` property is an array of objects (inspect all elements).", function(done) {
    reject({
      dataset: { data: [{ x: 5 }, { x: 6 }, 3] },
      errorId: "data_not_array_of_objects",
      errorParams: { type: "number" }
    }, done);
  });
  
  it("`metadata` property exists.", function(done) {
    reject({
      dataset: { data: [
        { name: "Joe" },
        { name: "Jane" }
      ] },
      errorId: "metadata_missing"
    }, done);
  });

  it("`metadata` property is an object (reject string).", function(done) {
    reject({
      dataset: {
        data: [
          { name: "Joe" },
          { name: "Jane" }
        ],
        metadata: "yo mama"
      },
      errorId: "metadata_not_object",
      errorParams: { type: "string" }
    }, done);
  });

  it("`metadata` property is an object (reject number).", function(done) {
    reject({
      dataset: {
        data: [
          { name: "Joe" },
          { name: "Jane" }
        ],
        metadata: 5000
      },
      errorId: "metadata_not_object",
      errorParams: { type: "number" }
    }, done);
  });

  it("`metadata.columns` property exists.", function(done) {
    reject({
      dataset: {
        data: [
          { name: "Joe" },
          { name: "Jane" }
        ],
        metadata: {}
      },
      errorId: "metadata_missing_columns"
    }, done);
  });

  it("`metadata.columns` must be an array (reject string).", function(done) {
    reject({
      dataset: {
        data: [
          { name: "Joe" },
          { name: "Jane" }
        ],
        metadata: {
          columns: "foo"
        }
      },
      errorId: "metadata_columns_not_array",
      errorParams: {
        type: "string"
      }
    }, done);
  });

  it("`metadata.columns` must be an array (reject number).", function(done) {
    reject({
      dataset: {
        data: [
          { name: "Joe" },
          { name: "Jane" }
        ],
        metadata: {
          columns: 5
        }
      },
      errorId: "metadata_columns_not_array",
      errorParams: {
        type: "number"
      }
    }, done);
  });

  it("`metadata.columns` must be an array of objects (reject number).", function(done) {
    reject({
      dataset: {
        data: [
          { name: "Joe" },
          { name: "Jane" }
        ],
        metadata: {
          columns: [5]
        }
      },
      errorId: "metadata_columns_not_array_of_objects",
      errorParams: {
        type: "number"
      }
    }, done);
  });

  it("`metadata.columns` must be an array of objects (reject string).", function(done) {
    reject({
      dataset: {
        data: [
          { name: "Joe" },
          { name: "Jane" }
        ],
        metadata: {
          columns: ["foo"]
        }
      },
      errorId: "metadata_columns_not_array_of_objects",
      errorParams: {
        type: "string"
      }
    }, done);
  });

  it("`metadata.columns` must be an array of objects (inspect all entries).", function(done) {
    reject({
      dataset: {
        data: [
          { name: "Joe" },
          { name: "Jane" }
        ],
        metadata: {
          columns: [{}, {}, 5]
        }
      },
      errorId: "metadata_columns_not_array_of_objects",
      errorParams: {
        type: "number"
      }
    }, done);
  });

  it("`metadata.columns` entries must have a 'name' property.", function(done) {
    reject({
      dataset: {
        data: [{},{}],
        metadata: {
          columns: [{}]
        }
      },
      errorId: "metadata_columns_name_missing"
    }, done); 
  });
  it("`metadata.columns` entries must have a 'name' property that is a string (reject number).", function(done) {
    reject({
      dataset: {
        data: [{},{}],
        metadata: {
          columns: [{ name: 22 }]
        }
      },
      errorId: "metadata_columns_name_not_string"
    }, done); 
  });
  it("`metadata.columns` entries must have a 'name' property that is a string (reject object).", function(done) {
    reject({
      dataset: {
        data: [{},{}],
        metadata: {
          columns: [{ name: { total: "crap" } }]
        }
      },
      errorId: "metadata_columns_name_not_string"
    }, done); 
  });

  it("`metadata.columns` entries must have a 'type' property.", function(done) {
    reject({
      dataset: {
        data: [{ x: 5 },{ x: 10}],
        metadata: {
          columns: [{
            name: "x"
          }]
        }
      },
      errorId: "metadata_columns_type_missing",
      errorParams: {
        column: "x"
      }
    }, done); 
  });

 //TODO
 //each column descriptor object has a "type" field
 //each column descriptor object has a "type" field whose value is "number", "string", or "date"

  it("All columns present in the data are also present in the metadata.", function(done) {
    reject({
      dataset: {
        data: [
          { name: "Joe" },
          { name: "Jane" }
        ],
        metadata: {
          columns: []
        }
      },
      errorId: "column_in_data_not_metadata",
      errorParams: { column: "name" }
    }, done);
  });

  it("All columns present in the metadata are also present in the data.", function(done) {
    reject({
      dataset: {
        data: [
          { name: "Joe" },
          { name: "Jane" }
        ],
        metadata: {
          columns: [
            { name: "name", type: "string" },
            { name: "foo", type: "string" }
          ]
        }
      },
      errorId: "column_in_metadata_not_data",
      errorParams: { column: "foo" }
    }, done);
  });

//  it("Types in data must match types in metadata (reject string in data != number in metadata).", function(done) {
//    reject({
//      dataset: {
//        data: [
//          { name: "Joe" },
//          { name: "Jane" }
//        ],
//        metadata: {
//          columns: [
//            { name: "name", type: "number" }
//          ]
//        }
//      }
//      errorId: "column_type_mismatch",
//      errorParams: {
//        column: "name",
//        value: "Joe",
//        typeInData: "string",
//        typeInMetadata: "number"
//      }
//    }, done);
//  });

//  it("Types in data must match types in metadata (reject number in data != string in metadata).", function(done) {
//    reject({
//      dataset: {
//        data: [
//          { name: 5 },
//          { name: 6 }
//        ],
//        metadata: {
//          columns: [
//            { name: "name", type: "string" }
//          ]
//        }
//      }
//      errorId: "column_type_mismatch",
//      errorParams: {
//        column: "name",
//        value: 5,
//        typeInData: "number",
//        typeInMetadata: "string"
//      }
//    }, done);
//  });

  it("should pass validation for a valid dataset.", function(done) {
    ChiasmDataset.validate({
      data: [
        { name: "Joe" },
        { name: "Jane" }
      ],
      metadata: {
        columns: [
          { name: "name", type: "string" }
        ]
      }
    }).then(done);
  });
});
