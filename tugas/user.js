const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");

const ERR_USER_NOT_FOUND = "USER not found";
const ERR_INVALID_ID_PARAM = "Param ID invalid";
const FAIL_DELETE_USER = "FAILED to delete user";
const FAIL_UPDATE_USER = "FAILED to update user";
const FAIL_CREATE_USER = "FAILED to create user";
const FAIL_GET_USER = "FAILED to get user";

const brokerNode3 = new ServiceBroker({
  namespace: "dev",
  nodeID: "node-2",
  transporter: "NATS",
});

var users;
var userID;
var user = {};

brokerNode3.createService({
  name: "users",
  mixins: [DbService],

  settings: {
    fields: ["_id", "name", "email", "address"],
    entityValidator: {
      name: "string",
    },
  },

  actions: {
    listUsers: {
      async handler(ctx) {
        switch (true) {
          case typeof ctx.params.query.type !== "undefined":
            if (ctx.params.query.type == "last") {
              return this.getLast(ctx.params.query);
            } else if (ctx.params.query.type == "list") {
              return this.getList(ctx.params.query);
            }
          case typeof ctx.params.query.id !== "undefined":
            return this.getById(ctx.params.query);
          default:
            return this.getAll();
        }
      },
    },
    createUser: {
      async handler(ctx) {
        return this.add(ctx.params.body);
      },
    },
    updateUser: {
      async handler(ctx) {
        return this.update(ctx.params.body);
      },
    },
    deleteUser: {
      async handler(ctx) {
        return this.delete(ctx.params.query);
      },
    },
  },

  methods: {
    getAll: async function () {
      try {
        users = await this.broker.call("users.find", {});
        return { status: true, data: users };
      } catch (error) {
        return { status: false, msg: FAIL_GET_USER, err: error };
      }
    },
    getList: async function (dataArg) {
      try {
        // TODO: Pagination still development
        // users = await this.broker.call("users.list", {});
        users = await this.broker.call("users.list", { page: 2, pageSize: 10 });
        return { status: true, data: users };
      } catch (error) {
        return { status: false, msg: FAIL_GET_USER, err: error };
      }
    },
    getLast: async function (dataArg) {
      try {
        users = await this.broker.call("users.find", {});

        switch (true) {
          case dataArg.get == "id":
            userID = users.slice(-1)[0] ? users.slice(-1)[0]["_id"] + 1 : 1;
            return { status: true, data: userID };
          default:
            if (users.slice(-1)[0]) {
              user = users.slice(-1)[0];
            } else {
              return {
                status: false,
                msg: FAIL_GET_USER,
                err: ERR_USER_NOT_FOUND,
              };
            }
            return { status: true, data: user };
        }
      } catch (error) {
        return { status: false, msg: FAIL_GET_USER, err: error };
      }
    },
    getById: async function (dataArg) {
      if (isNaN(dataArg.id)) {
        return {
          status: false,
          msg: FAIL_GET_USER,
          err: ERR_INVALID_ID_PARAM,
        };
      } else {
        userID = parseInt(dataArg.id);
      }
      try {
        user = await this.adapter.findOne({ _id: userID });
        if (user) {
          return { status: true, data: user };
        } else {
          return {
            status: false,
            msg: FAIL_GET_USER,
            err: ERR_USER_NOT_FOUND,
          };
        }
      } catch (error) {
        return { status: false, msg: FAIL_GET_USER, err: error };
      }
    },
    add: async function (dataArg) {
      user = dataArg;
      userID = await this.getLast({ get: "id" });
      if (userID.status) {
        try {
          user["_id"] = userID.data;
          this.broker.call("users.create", user);
          await this.broker.call("log.createLogs", {
            action: "success create user",
            date: new Date(),
          });
          return { status: true, msg: "User created successfully" };
        } catch (error) {
          await this.broker.call("log.createLogs", {
            action: "error create user",
            date: new Date(),
          });
          return { status: false, msg: FAIL_CREATE_USER, err: error };
        }
      } else {
        return {
          status: false,
          msg: FAIL_CREATE_USER,
          err: userID.err,
        };
      }
    },
    update: async function (dataArg) {
      user = await this.adapter.findOne({ _id: dataArg.id });
      if (user) {
        try {
          await this.broker.call("users.update", dataArg);
          await this.broker.call("log.createLogs", {
            action: "success update user",
            date: new Date(),
          });
          return { status: true, msg: "User was updated" };
        } catch (error) {
          await this.broker.call("log.createLogs", {
            action: "error update user",
            date: new Date(),
          });
          return { status: false, msg: FAIL_UPDATE_USER, err: error };
        }
      } else {
        return {
          status: false,
          msg: FAIL_UPDATE_USER,
          err: ERR_USER_NOT_FOUND,
        };
      }
    },
    delete: async function (dataArg) {
      user = await this.getById({ id: dataArg.id });
      if (user.status) {
        try {
          await this.adapter.db.remove({ _id: userID });
          await this.broker.call("log.createLogs", {
            action: "success delete user",
            date: new Date(),
          });
          return { status: true, msg: "User was deleted" };
        } catch (error) {
          await this.broker.call("log.createLogs", {
            action: "error delete user",
            date: new Date(),
          });
          return { status: false, msg: FAIL_DELETE_USER, err: error };
        }
      } else {
        return {
          status: false,
          msg: FAIL_DELETE_USER,
          err: user.err,
        };
      }
    },
  },

  afterConnected() {},
});

Promise.all([brokerNode3.start()]).then(() => {
  brokerNode3.repl();
});
