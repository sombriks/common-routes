// src/components/common-routes.js
//
// that CRUD pattern that always repeat itself.
//
// const router = require("express").Router()
// const { Bookshelf, knex } = require("../components/config")
// const commonRoutes = require("../components/common-routes")
// ...
// commonRoutes.apply(routes, NewModel)
//

const errfn = res => err => {
  err = err.data ? err.data : err.response ? err.response.data : err;
  console.log(require("util").inspect(err, false, 2));
  res.status(500).send(err);
};

const applyList = (router, BsModel, withRelated, searchClause, orderClause) => {
  const listPage = query => {
    let page = query.page || 1;
    delete query.page;
    let pageSize = query.pageSize || 10;
    delete query.pageSize;

    let bsQuery = BsModel.where(qb => {
      if (searchClause) searchClause(qb, query);
      qb.where(query);
    });

    if (orderClause) {
      if (typeof orderClause == "function") bsQuery.orderBy(orderClause(query));
      else bsQuery.orderBy(orderClause);
    }

    return bsQuery.fetchPage({ page, pageSize, withRelated });
  };

  router.get("/list", (req, res) =>
    listPage(req.query)
      .then(ret => res.send(ret))
      .catch(errfn(res))
  );
};

const applyCount = (router, BsModel, searchClause) => {
  const listPage = query => {
    delete query.page;
    delete query.pageSize;

    return BsModel.where(qb => {
      if (searchClause) searchClause(qb, query);
      qb.where(query);
    }).count();
  };

  router.get("/count", (req, res) =>
    listPage(req.query)
      .then(ret => res.send({ count: ret }))
      .catch(errfn(res))
  );
};

const applyFind = (router, BsModel, withRelated) => {
  const idAttribute = BsModel.prototype.idAttribute;

  const find = id => BsModel.query("where", idAttribute, id).fetch({ withRelated });

  router.get("/:id", (req, res) =>
    find(req.params.id)
      .then(ret => res.send(ret))
      .catch(errfn(res))
  );
};

const applyInsert = (router, BsModel) => {
  const insert = data => new BsModel(data).save();

  router.post("/save", (req, res) =>
    insert(req.body)
      .then(ret => res.send(ret))
      .catch(errfn(res))
  );
};

const applyUpdate = (router, BsModel) => {
  const idAttribute = BsModel.prototype.idAttribute;

  const update = data => {
    let up = {};
    up[idAttribute] = data[idAttribute];
    return new BsModel(up).save(data);
  };

  router.put("/save", (req, res) =>
    update(req.body)
      .then(ret => res.send(ret))
      .catch(errfn(res))
  );
};

const applyDel = (router, BsModel) => {
  const idAttribute = BsModel.prototype.idAttribute;

  const del = id => BsModel.query("where", idAttribute, id).destroy();

  router["delete"]("/:id", (req, res) =>
    del(req.params.id)
      .then(ret => res.send(ret))
      .catch(errfn(res))
  );
};

const apply = (router, BsModel, withRelated, searchClause, orderClause) => {
  applyList(router, BsModel, withRelated, searchClause, orderClause);
  applyCount(router, BsModel, searchClause);
  applyFind(router, BsModel, withRelated);
  applyInsert(router, BsModel);
  applyUpdate(router, BsModel);
  applyDel(router, BsModel);
};

module.exports = {
  apply,
  applyList,
  applyCount,
  applyFind,
  applyInsert,
  applyUpdate,
  applyDel,
  errfn
};
