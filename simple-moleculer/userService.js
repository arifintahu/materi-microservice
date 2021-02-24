const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");

const brokerNode3 = new ServiceBroker({
    namespace: "dev",
    nodeID: "node-users",
    transporter: "NATS"
});

brokerNode3.createService({
    name: "users",
    mixins: [DbService],

    settings: {
        fields: ["_id", "name", "email","address"],
        entityValidator: {
            name: "string",
            email: "string",
            address: "string"
        }
    },

    actions: {
        listUsers: {
            async handler(ctx) {
                return this.broker.call("users.find", {}).then( async (res)=>{
                    await this.broker.call("loggers.createLog", { action: "Get user", date: new Date()});
                   console.log("Berhasil Get",res);
                   return res;
                }).catch((err)=>{
                    console.log(err);
                });
            }
        },
        createUsers: {
            async handler(ctx) {
                return this.broker.call("users.create", ctx.params).then(async (res) => {
                    await this.broker.call("loggers.createLog", { action: "Create User", date: new Date()});
                    console.log("berhasil create",res);
                    return res;
                }).catch((err) => {
                    console.log(err);
                });
            }
        },
        updateUsers: {
            async handler(ctx) {
                return this.broker.call("users.update", ctx.params).then(async (res) => {
                    await this.broker.call("loggers.createLog", { action: "Update User", date: new Date()});
                    console.log("berhasil Update",res);
                    return res;
                }).catch((err) => {
                    console.log(err);
                    return err;
                });
            }
        },
        deleteUsers: {
            async handler(ctx) {
                return this.broker.call("users.remove", ctx.params).then(async (res) => {
                    await this.broker.call("loggers.createLog", { action: "Delete User", date: new Date() });
                    console.log("berhasil Delete");
                    return res;
                }).catch((err) => {
                    return (err);
                });
            }
        }, 
        getUser: {
            async handler(ctx) {
                return this.broker.call("users.get", ctx.params).then(async (res) => {
                    await this.broker.call("loggers.createLog", { action: "Get 1 User", date: new Date()});
                    console.log("berhasil Get");
                    return res;
                }).catch((err) => {
                    return (err);
                });
            }
        }

    },

    afterConnected() {

    }
});

Promise.all([brokerNode3.start()]).then(() => {
    brokerNode3.repl();
});