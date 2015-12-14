var expect = require("chai").expect,
    ChiasmDataset = require("../index"),
    errorMessage = ChiasmDataset.errorMessage;

describe("utilities: getColumnMetadata", function () {
  var dataset = {
    data: [
      { name: "China", population: 1376048943 },
      { name: "India", population: 1311050527 }
    ],
    metadata: {
      isCube: true,
      columns: [
        { name: "name", type: "string", isDimension: true},
        { name: "population", type: "number" }
      ]
    }
  };

  it("should get metadata", function() {
    var columnMetadata = ChiasmDataset.getColumnMetadata(dataset, "population");
    expect(columnMetadata.name).to.equal("population");
    expect(columnMetadata.type).to.equal("number");
  });

  it("should throw exception if column missing", function() {
    expect(function (){
      ChiasmDataset.getColumnMetadata(dataset, "foo");
    }).to.throw(Error, errorMessage("column_metadata_missing", { column: "foo" }));
  });
});
