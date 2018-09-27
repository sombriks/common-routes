# Overview

The main common-routes purpose is to save a few lines of code when developing
a rest api. It expects to find a router, a model and a few other tweaks, but
it's pretty much this.

## Dependencies

This library needs express and body-parser:

```javascript
// src/main.js
const express = require("express");
const { json } = require("body-parser");
const app = express();

app.use(json());

// call the car router. You can see car.js further
app.use("/car", require("./routes/car").router);

module.exports = { app };
```

It also needs knex and bookshelf. The bookshelf-page plugin must be active:

```javascript
// src/config.js
const cfg = require("../knexfile");
const knex = require("knex")(cfg[process.env.NODE_ENV || "development"]);
const Bookshelf = require("bookshelf")(knex);
Bookshelf.plugin("bookshelf-page");

module.exports = { knex, Bookshelf };
```

## API

It exports a few functions:

- apply(router, BsModel, withRelated, searchClause, orderClause)
- applyList(router, BsModel, withRelated, searchClause, orderClause)
- applyCount(router, BsModel, searchClause)
- applyFind(router, BsModel, withRelated)
- applyInsert(router, BsModel)
- applyUpdate(router, BsModel)
- applyDel(router, BsModel)
- errfn(res)

### searchClause(queryBuilder, queryParameters)

The searchClause is special since it aims to help on filter results:

| Argument        | Meaning                                          |
| --------------- | ------------------------------------------------ |
| queryBuilder    | knex queryBuilder from Bookshelf's Model.where() |
| queryParameters | req.query from expressjs                         |

Example:

```javascript
const searchClause = (qb, query) => {
  // textoBusca is a custom parameter which does not exists on the database
  if (query.textoBusca) {
    qb.where("resumoconvite", "ilike", `%${query.textoBusca}%`)
      // doing a subquery in order to filter by related entities
      .orWhereIn(
        "idconvite",
        knex("convidado")
          .select("idconvite")
          .where("nomeconvidado", "ilike", `%${query.textoBusca}%`)
      );
  }
  delete query.textoBusca;
};
```

### orderClause(queryParameters)

The orderClause might be a simple string or a function which returns the column
to be used in order to sort the resulting list.

Since bookshelf understands "-dtcriacao" and "dtcriacao" as valid
order by options (as long as dtcriacao is a valid column name into the table),
you can return the column name with or without the minus to change from
ascending to descending.

| Argument        | Meaning                  |
| --------------- | ------------------------ |
| queryParameters | req.query from expressjs |

Example:

```javascript
const orderClause = query => {
  // choose between ascending or descending
  let direction = "-";
  if (query.asc) {
    direction = "";
  }
  delete query.asc;

  // informing the sorting column
  let attr = "dtcriacao";
  if (query.orderby) {
    attr = orderby;
  }
  delete orderby;

  // return the orderby parameter
  return direction + attr;
};
```

Then you pass it to your apply function:

If you don't need to dynamically chance the orderby option, the following
example

## apply(router, BsModel, withRelated, searchClause, orderClause)

This function receives 5 arguments and applies every core operation on Model
and router. Applies list, count, find, insert, update and delete in a single
function call.

| Argument     | Meaning                                                   |
| ------------ | --------------------------------------------------------- |
| router       | The express router instance                               |
| BsModel      | Bookshelf Model                                           |
| withRelated  | The withRelated clause to be used with fetchPage or count |
| searchClause | Function to perform fine query.                           |
| orderClause  | Feed the Bookshelf's orderBy clause before fetch a page   |

### Example

```javascript
// src/routes/car.js
const { BookShelf } = require("../config");
const router = require("express").Router();
const { apply } = require("common-routes");

const Car = Bookshelf.Model.extend({
  tableName: "car",
  idAttribute: "car_id",
  pilot() {
    return this.belongsTo(require("./pilot"), "pilot_id");
  }
});

const withRelated = ["pilot"];

const searchClause = (qb, query) => {
  if (query.max_year) {
    qb.where("year", "<=", query.max_year);
  }
  delete query.max_year; // max_year isn't a column at all.
};

apply(router, Car, withRelated, searchclause, "car_model");

module.exports = { Car, router };
```

The exported router has the following paths 'installed':

| route  | verb   |
| ------ | ------ |
| /list  | GET    |
| /count | GET    |
| /:id   | GET    |
| /save  | POST   |
| /save  | PUT    |
| /:id   | DELETE |

## applyList(router, BsModel, withRelated, searchClause, orderClause)

Installs only the list verb.

Retuns the first page by default.

If not present on query parameters, page and pageSize will have 1 and 10 as
default values.

The express router will accept the following paths out of the box:

| route                    | verb |
| ------------------------ | ---- |
| /list                    | GET  |
| /list?page=3&pageSize=15 | GET  |

## applyCount(router, BsModel, searchClause)

Installs only the count verb.

Must provide the same searchclause used to list otherwise may result an
incorrect count.

| route                | verb |
| -------------------- | ---- |
| /count               | GET  |
| /count?max_year=1984 | GET  |

The returning payload is a JSON object with an attribute called _count_:

```json
{ "count": 13 }
```

## applyFind(router, BsModel, withRelated)

Installs the find (as in 'findOne') verb.

Does not uses any query parameter.

## applyInsert(router, BsModel)

Installs the insert verb.

The insert verb demands the json() body-parser middleware in order to work properly.

Does not uses any query parameter.

## applyUpdate(router, BsModel) and applyDel(router, BsModel)

Installs the update verb.

The update verb demands the json() body-parser middleware in order to work properly.

Does not uses any query parameter.

## applyDel(router, BsModel)

Installs the delete verb.

Does not uses any query parameter.

## errfn(res)

Helper to catch erros and send them as internal server error (500) to the client.
