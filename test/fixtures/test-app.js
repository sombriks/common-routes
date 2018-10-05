// test/foxtures/test-app.js
// quick and dirty server to test common-routes
const common = require("../../src/common-routes");
const express = require("express")
const parser = require("body-parser");
const knex = require("knex")(require("./knexcfg"));
const Bookshelf = require("bookshelf")(knex);
const app = express();
const router = express.Router()
const Contact = Bookshelf.Model.extend({
	tableName: "contact"
});

common.apply(router, Contact, [], (qb, query) => {}, query => {});

Bookshelf.plugin("bookshelf-page");
app.use(parser.json());
app.get("/status", req => req.res.send("Hello"));

app.use("/contact", router);

let server
module.exports = {
	startup(port) {
		return knex.raw(`
			create table if not exists contact(
				id integer not null primary key autoincrement, 
				name varchar(255) not null
			)
		`).then(_ => {
			server = app.listen(port)
		})
	},
	shutdown() {
		server.close();
	},
	app
};