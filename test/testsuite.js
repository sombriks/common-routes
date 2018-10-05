// test/suite.js
const chai = require("chai");
const chaiHttp = require("chai-http");

chai.should();
chai.use(chaiHttp);

describe("basic test suite", _ => {

  let testapp = require("./fixtures/test-app");

  let cli;

  let c;

  beforeEach(done => {
    console.log("set up sample server")
    testapp.startup(2999).then(_ => {
      cli = chai.request(testapp.app);
      done();
    })
  });

  afterEach(done => {
    console.log("tear down sample server");
    testapp.shutdown();
    done();
  });

  it("should say hello", done => {
    cli.get("/status").end((err, ret) => {
      ret.should.have.status(200);
      ret.body.should.be.an("object");
      done(err);
    });
  });

  it("should insert one contact", done => {
    cli.post("/contact/save").send({
      name: "joe"
    }).end((err, ret) => {
      ret.should.have.status(200);
      ret.body.should.be.an("object");
      console.log(ret.body);
      c = ret.body;
      done(err);
    });
  });

  it("should list contacts", done => {
    cli.get("/contact/list?page=1&pageSize=10").end((err, ret) => {
      ret.should.have.status(200);
      ret.body.should.be.an("array");
      console.log(ret.body);
      done(err);
    });
  });

  it("should count contacts", done => {
    cli.get("/contact/count").end((err, ret) => {
      ret.should.have.status(200);
      ret.body.should.be.an("object");
      console.log(ret.body);
      done(err);
    });
  });

  it("should find contact by id", done => {
    cli.get(`/contact/${c.id}`).end((err, ret) => {
      ret.should.have.status(200);
      ret.body.should.be.an("object");
      console.log(ret.body);
      done(err);
    });
  });

  it("should update contact", done => {
    cli.put("/contact/save").send({
      name: "joey",
      id: c.id
    }).end((err, ret) => {
      ret.should.have.status(200);
      ret.body.should.be.an("object");
      console.log(ret.body);
      done(err);
    });
  });

  it("should NOT insert contact since ID already exists", done => {
    cli.post("/contact/save").send({
      name: "ross",
      id: c.id
    }).end((err, ret) => {
      ret.should.have.status(500);
      console.log(ret.body);
      done( /*err*/ );
    });
  });

  it("should delete one contact", done => {
    cli.delete(`/contact/${c.id}`).end((err, ret) => {
      ret.should.have.status(200);
      ret.body.should.be.an("object");
      console.log(ret.body);
      done(err);
    });
  });
});