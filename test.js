var expect = require("chai").expect,
    ChiasmDataset = require("./index"),
    strings = ChiasmDataset.strings;

describe("chiasm-dataset", function () {
  it("should validate that the `data` property exists.", function(done) {
    ChiasmDataset.validate({}).then(function (){}, function (err) {
      expect(err).to.exist;
      expect(err.message).to.equal(strings.no_data_property);
      done();
    });
  });
});
