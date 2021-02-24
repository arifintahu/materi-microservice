const { ServiceBroker } = require("moleculer");
const HTTPServer = require("moleculer-web");

const brokerNode1 = new ServiceBroker({
  namespace: "dev",
  nodeID: "node-1",
  transporter: "NATS"
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
        path: "/api",
        aliases: {
          "GET products": "products.listProducts",
          "GET users": "users.listUsers",
          "POST users": "users.createUsers",

          "GET users2"(req, res){
            this.broker.call("users.listUsers", {})
            .then((response) => {
              res.end(JSON.stringify(response));
            });
          }
        }
      }
    ]
  },

  actions: {
    home: {
        async handler() {
            return "My Home";
        }
    },
    welcome: {
        params: {
            name: "string"
        },
        async handler(ctx) {
            return `Welcome, ${ctx.params.name}`;
        }
    }
  }
});


const brokerNode2 = new ServiceBroker({
  namespace: "dev",
  nodeID: "node-2",
  transporter: "NATS"
});

brokerNode2.createService({
  name: "products",

  actions: {
    listProducts: {
      async handler(ctx) {
        return this.getProducts();
      }
    }
  },
  methods: {
    getProducts: () => {
      return new Promise((resolve) => {
        resolve([
          { name: "Apples", price: 5 },
          { name: "Oranges", price: 3 },
          { name: "Bananas", price: 2 }
        ]);
      });
    }
  }
});

// Start both brokers
Promise.all([brokerNode1.start(), brokerNode2.start()]).then(() => {
  brokerNode1.repl();
});