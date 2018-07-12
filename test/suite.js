// test/suite.js
const chai = require("chai");
const chaiHttp = require("chai-http");

describe("basic test suite", _ => {
  it("should say hello", done => {
    console.log("hello");
    done();
  });
});
