const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const HTTPServer = require("moleculer-web");

const brokerNode1 = new ServiceBroker({
  namespace: "dev",
  nodeID: "user-gateway",
  transporter: "NATS",
});

brokerNode1.createService({
  name: "gateway",
  mixins: [HTTPServer],

  settings: {
    port: process.env.PORT || 3000,
    ip: "0.0.0.0",
    use: [],
    routes: [
      {
        path: "/",
        aliases: {
          "GET list": "users.listUsers",
          "POST add": "users.createUsers",
          "PUT edit": "users.editUsers",
          "DELETE del/:id": "users.deleteUsers",
        },
      },
    ],
  },
});

const brokerNode2 = new ServiceBroker({
  namespace: "dev",
  nodeID: "user",
  transporter: "NATS",
});

brokerNode2.createService({
  name: "users",
  mixins: [DbService],

  settings: {
    fields: ["_id", "name", "email", "address"],
    entityValidator: {
      name: "string",
      email: "string",
      address: "string",
    },
  },

  actions: {
    listUsers: {
      async handler(ctx) {
        this.broker.call("logs.add", "get users list");
        return this.broker.call("users.find", {});
      },
    },
    userInfo: {
      async handler(ctx) {
        this.broker.call("logs.add", "get users info");
        await this.broker.call("users.get", { id: ctx.params });
        return true
      },
    },
    createUsers: {
      async handler(ctx) {
        this.broker.call("logs.add", "add new user");
        return this.broker.call("users.create", ctx.params);
      },
    },
    editUsers: {
      async handler(ctx) {
        this.broker.call("logs.add", "edit user data");
        return this.broker.call("users.update", ctx.params);
      },
    },
    deleteUsers: {
      async handler(ctx) {
        this.broker.call("logs.add", "delete user");
        return this.broker.call("users.remove", { id: ctx.params.id });
      },
    },
  },

  afterConnected() {},
});

Promise.all([brokerNode1.start()], [brokerNode2.start()]).then(() => {
  brokerNode1.repl();
  brokerNode2.repl();
});
