var expect = require("chai").expect,
    ChiasmDataset = require("./index"),
    strings = ChiasmDataset.strings,
    errorMessage = ChiasmDataset.errorMessage;

function reject(options, done){
  ChiasmDataset.validate(options.dataset)
    .then(function (){}, function (err) {
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

// TODO reject this
//    ChiasmDataset.validate({
//      data: [
//      ]
//    }).then(done);

// TODO reject this
//    ChiasmDataset.validate({
//      data: [
//        { name: "Joe" },
//        { name: "Jane" }
//      ],
//      metadata: {
//      }
//    }).then(done);

// TODO reject this
//    ChiasmDataset.validate({
//      data: [
//        { name: "Joe" },
//        { name: "Jane" }
//      ],
//      metadata: {
//        columns: [
//        ]
//      }
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
// TODO reject this
//    ChiasmDataset.validate({
//      data: [
//      ],
//      metadata: {
//        columns: [
//          { name: "foo", type: "string" }
//        ]
//      }
//    }).then(done);

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
