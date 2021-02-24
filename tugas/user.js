const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");

const brokerUser = new ServiceBroker({
    namespace: "dev",
  nodeID: "user",
  transporter: "NATS"
});

brokerUser.createService({
    name: "users",
    mixins: [DbService],
  
    settings: {
      fields: ["_id", "name", "email", "address"],
        entityValidator: {
            name: { type: "string", min: 2, pattern: /^[a-zA-Z]+$/ },
			email: { type: "email" },
            address: { type: "string" },
        }
     },
  
    actions: {
      listUsers: {
          async handler(ctx) {
              try {
                const response = await this.broker.call("users.find", {});
                const log = await this.broker.call("logger.createLog", {action: "list user"});
                return response;
              } catch (err) {
                  return err;
              }
          }
      },
      createUsers: {
          async handler(ctx) {
            try {
                const response = await this.broker.call("users.create", ctx.params);
                const log = await this.broker.call("logger.createLog", {action: "create user"});
                return response;
              } catch (err) {
                  return err;
              }
          }
      },
      getByIdUser: {
          async handler(ctx) {
            try {
                const response = await this.broker.call("users.get", ctx.params);
                const log = await this.broker.call("logger.createLog", {action: "get by id user"});
                return response;
              } catch (err) {
                  return err;
              }
          }
      },
			getByNameUser: {
          async handler(ctx) {
            try {
                const response = await this.broker.call("users.find", {query: {name: ctx.params.name}});
                const log = await this.broker.call("logger.createLog", {action: "get by name user"});
                return response;
              } catch (err) {
                  return err;
              }
          }
      },
      removeUser: {
        async handler(ctx) {
            try {
                const response = await this.broker.call("users.remove", ctx.params);
                const log = await this.broker.call("logger.createLog", {action: "remove user"});
                return response;
              } catch (err) {
                  return err;
              }
        }
    }
    },
    methods: {
    },
  
    afterConnected() {
        
    }
  });
  
  Promise.all([brokerUser.start()]).then(() => {
    brokerUser.repl();
  });
