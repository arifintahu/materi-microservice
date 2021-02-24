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
  nodeID: "node-3",
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
          case typeof ctx.params.type !== "undefined":
            if (ctx.params.type == "last") {
              try {
                users = await this.broker.call("users.listUsers", {});
                userID = users.data.slice(-1).pop()
                  ? users.data.slice(-1).pop()["_id"] + 1
                  : 1;
                return { status: true, data: userID };
              } catch (error) {
                return { status: false, msg: FAIL_GET_USER, err: error };
              }
            } else if (ctx.params.type == "list") {
              try {
                // users = await this.broker.call("users.list", {});
                users = await this.broker.call("users.find", {});
                return { status: true, data: users };
              } catch (error) {
                return { status: false, msg: FAIL_GET_USER, err: error };
              }
            }
          case typeof ctx.params.id !== "undefined":
            if (isNaN(ctx.params.id)) {
              return {
                status: false,
                msg: FAIL_GET_USER,
                err: ERR_INVALID_ID_PARAM,
              };
            } else {
              userID = parseInt(ctx.params.id);
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
          default:
            try {
              users = await this.broker.call("users.find", {});
              return { status: true, data: users };
            } catch (error) {
              return { status: false, msg: FAIL_GET_USER, err: error };
            }
        }
      },
    },
    createUser: {
      async handler(ctx) {
        user = ctx.params;
        userID = await this.broker.call("users.listUsers", {
          type: "last",
        });
        if (userID.status) {
          try {
            user["_id"] = userID.data;
            this.broker.call("users.create", user);
            return { status: true, msg: "User created successfully" };
          } catch (error) {
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
    },
    updateUser: {
      async handler(ctx) {
        user = await this.adapter.findOne({ _id: ctx.params.id });
        if (user) {
          try {
            this.broker.call("users.update", ctx.params);
            return { status: true, msg: "User was updated" };
          } catch (error) {
            return { status: false, msg: FAIL_UPDATE_USER, err: error };
          }
        }else{
          return { status: false, msg: FAIL_UPDATE_USER, err: ERR_USER_NOT_FOUND };
        }
      },
    },
    deleteUser: {
      async handler(ctx) {
        user = await this.broker.call("users.listUsers", {
          id: ctx.params.id,
        });
        if (user.status) {
          try {
            await this.adapter.db.remove({ _id: userID });
            return { status: true, msg: "User was deleted" };
          } catch (error) {
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
  },

  afterConnected() {},
});

Promise.all([brokerNode3.start()]).then(() => {
  brokerNode3.repl();
});
