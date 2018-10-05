# common-routes

[![NPM](https://nodei.co/npm/common-routes.png?compact=true)](https://npmjs.org/package/common-routes)

[![GitHub issues](https://img.shields.io/github/issues/sombriks/common-routes.svg)](https://github.com/sombriks/common-routes/issues)
[![Build Status](https://travis-ci.org/sombriks/common-routes.svg?branch=master)](https://travis-ci.org/sombriks/common-routes)

Simple express/knex/bookshelf util for common routes that emerge on every rest api.

**See [docs](docs/OVERVIEW.md) for more details.**

## Install

```bash
# you'll need express, knex and bookshelf too
npm install common-routes --save
```

## Dependencies

- Express (with body-parser/json middleware)
- Bookshelf (and the bookshelf-page plugin)
- Knex
- the sql driver for your database

## Usage

```javascript
// src/routes/area.js
const commonRoutes = require("common-routes");
const { knex, Bookshelf } = require("../config");
const router = require("express").Router();

const Area = Bookshelf.Model.extend({
  idAttribute: "idarea",
  tableName: "area",
  state() {
    return this.belongsTo(require("./state").State, "idstate");
  }
});

const withRelated = ["state"];

commonRoutes.apply(
  router,
  Area,
  withRelated,
  (qb, query) => {
    if (query.textoBusca) {
      let s = query.textoBusca;
      qb.where("descricao", "ilike", `%${s}%`);
    }
    delete query.textoBusca;
  },
  "-dtcreationarea"
);

module.exports = {
  router,
  Area
};
```

Then require this router on your main app:

```javascript
// src/main.js
const express = require("express");
const { json } = require("body-parser");
const app = express();

app.use(json());

app.use("/area", require("./routes/area").router);

// ...
```

Once you pass this router to your express app, the following routes will be available:

| route       | verb   | purpose                                                                       |
| ----------- | ------ | ----------------------------------------------------------------------------- |
| /area/list  | GET    | Lists all areas. Can pass page and pageSize as query parameters.              |
| /area/count | GET    | Counts all areas.                                                             |
| /area/:id   | GET    | Gets one area by id. the real name of the key column the model already knows. |
| /area/save  | POST   | Inserts a new entity.                                                         |
| /area/save  | PUT    | Updates an entity. It must have a valid ID                                    |
| /area/:id   | DELETE | Detetes one entity. with the given id                                         |

**See [docs](docs/OVERVIEW.md) for more details.**
