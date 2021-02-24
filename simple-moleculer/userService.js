const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");

const brokerNode3 = new ServiceBroker({
    namespace: "dev",
    nodeID: "node-3",
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
                return this.broker.call("users.find", {}).then((res)=>{
                //    await this.brokel.call("logger.createLog",{});
                   console.log("Berhasil Get",res);
                   return res;
                }).catch((err)=>{
                    console.log(err);
                });
            }
        },
        createUsers: {
            async handler(ctx) {
                return this.broker.call("users.create", ctx.params).then((res) => {
                    // await this.brokel.call("logger.createLog", {});
                    console.log("berhasil create",res);
                    return res;
                }).catch((err) => {
                    console.log(err);
                });
            }
        },
        updateUsers: {
            async handler(ctx) {
                return this.broker.call("users.update", ctx.params).then((res) => {
                    // await this.brokel.call("logger.createLog", {});
                    console.log("berhasil Update",res);
                    return res;
                }).catch((err) => {
                    console.log(err);
                });
            }
        }, 
        deleteUsers: {
            async handler(ctx) {
                return this.broker.call("users.remove", ctx.params).then(async (res) => {
                    // await this.brokel.call("logger.createLog", {});
                    console.log("berhasil Delete");
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