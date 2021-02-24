const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");

const brokerNodeTransaction = new ServiceBroker({
  namespace: "dev",
  nodeID: "node-transaction",
  transporter: "NATS"
});

brokerNodeTransaction.createService({
    name: "transaction",
    mixins: [DbService],
  
    settings: {
      fields: ["_id", "to", "from", "value"],
        entityValidator: {//menambahkan validator yang sesuai dengan type data
                  to: "string",
                  from: "string",
                  value: "number",
              }
     },
  
    actions: {
        listTransaction: {
            async handler(ctx) {//jangan lupa ditambahkan return untuk menampilkannya pada respond
                return this.broker.call("transaction.find", {}).then((res) => {
                    this.broker.call("loggers.createLog", { action: "Show  Transaction", date: new Date() })
                    return res;
                });
            }
        },
        createTransaction: {
            async handler(ctx) {//jangan lupa ditambahkan return untuk menampilkannya pada respond
                ctx.params.value = parseInt(ctx.params.value);
                let to = await this.broker.call("users.getUser", { id: ctx.params.to });//pengecekan id user ada atau tidak
                let from = await this.broker.call("users.getUser", { id: ctx.params.from });//pengecekan id user ada atau tidak
                if (to.code == 404 || from.code == 404) {
                    await this.broker.call("loggers.createLog", { action: "Gagal Tambah Transaksi", date: new Date() });
                    throw new Error("Gk ditemukan");
                }
                return this.broker.call("transaction.create", ctx.params).then(async (res) => {
                    await this.broker.call("loggers.createLog", { action: "Add Transaction", date: new Date()})
                    return res;
                }).catch((err) => {
                    return (err);
                });
            }
        },
        deleteTransaction: {
            async handler(ctx) {//jangan lupa ditambahkan return untuk menampilkannya pada respond
                return this.broker.call("transaction.remove", ctx.params).then(async (res) => {
                    await this.broker.call("transaction.getTrans", { id: ctx.params.id });// pengecekan apakah id ada atau tidak
                    await this.broker.call("loggers.createLog", { action: "deleteTransaction", date: new Date() })
                    return res;
                });
            }
        },
        getTrans: {// untuk get satu transaksi untuk pengecekan pada delete
            async handler(ctx) {
                return this.broker.call("transaction.get", ctx.params).then(async (res) => {
                    await this.broker.call("loggers.createLog", { action: "Get 1 trans", date: new Date() });
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
  
  Promise.all([brokerNodeTransaction.start()]).then(() => {
    brokerNodeTransaction.repl();
  });