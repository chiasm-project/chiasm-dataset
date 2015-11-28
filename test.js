var expect = require("chai").expect,
    ChiasmDataset = require("./index"),
    strings = ChiasmDataset.strings,
    errorMessage = ChiasmDataset.errorMessage;

describe("chiasm-dataset", function () {

  it("should validate that the `data` property exists.", function(done) {
    ChiasmDataset.validate({}).then(function (){}, function (err) {
      expect(err).to.exist;
      expect(err.message).to.equal(strings.no_data_property);
      done();
    });
  });

  it("should validate that the `data` property is an array of objects (reject string).", function(done) {
    ChiasmDataset.validate({
      data: "foo"
    }).then(function (){}, function (err) {
      expect(err).to.exist;
      expect(err.message).to.equal(errorMessage("data_not_array", { type: "string" }));
      done();
    });
  });

  it("should validate that the `data` property is an array of objects (reject number).", function(done) {
    ChiasmDataset.validate({
      data: 5
    }).then(function (){}, function (err) {
      expect(err).to.exist;
      expect(err.message).to.equal(errorMessage("data_not_array", { type: "number" }));
      done();
    });
  });

});
