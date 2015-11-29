var expect = require("chai").expect,
    ChiasmDataset = require("./index"),
    strings = ChiasmDataset.strings,
    errorMessage = ChiasmDataset.errorMessage;

function reject(options, done){
  ChiasmDataset.validate(options.dataset)
    .then(function (){}, function (err) {
      //console.log(err.stack);
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

// TODO reject this
//    ChiasmDataset.validate({
//      data: [
//        { name: "Joe" },
//        { name: "Jane" }
//      ],
//    }).then(done);

// TODO reject this
//    ChiasmDataset.validate({
//      data: [
//        { name: "Joe" },
//        { name: "Jane" }
//      ],
//      metadata: {
//        columns: [
//          { name: "foo", type: "string" }
//        ]
//      }
//    }).then(done);
//

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
    }).then(done, console.log);
  });
});
