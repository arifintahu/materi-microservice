const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");

const brokerNode3 = new ServiceBroker({
  namespace: "dev",
  nodeID: "node-3",
  transporter: "NATS",
});

var users;
var userID = 1;
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
        return this.broker.call("users.find", {});
      },
    },
    createUser: {
      async handler(ctx) {
        this.broker.call("users.listUsers", {}).then((response) => {
          if (response.slice(-1).pop()) {
            userID = response.slice(-1).pop()["_id"] + 1;
          }

          user = ctx.params;
          user["_id"] = userID;
          this.broker.call("users.create", user);
        });
        return "User created successfully";
      },
    },
    updateUser: {
      async handler(ctx) {
        const user = await this.adapter.findOne({ _id: ctx.params._id });
        if (user) {
          try {
            this.broker.call("users.update", ctx.params);
          } catch (error) {
            return error;
          }
          return "User was updated";
        } else {
          return "User was not found";
        }
      },
    },
    deleteUser: {
      async handler(ctx) {
        if(isNaN(ctx.params.id)){
          return "Param ID invalid";
        }else{
          userID = parseInt(ctx.params.id)
        }
        const user = await this.adapter.findOne({ _id: userID });
        if (user) {
          try {
            await this.adapter.db.remove({ _id: userID });
          } catch (error) {
            return error;
          }
          return "User was deleted";
        } else {
          return "User was not found";
        }
      },
    },
  },

  afterConnected() {},
});

Promise.all([brokerNode3.start()]).then(() => {
  brokerNode3.repl();
});
