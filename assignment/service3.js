const { ServiceBroker } = require('moleculer');
const DbService = require('moleculer-db');

const brokerNode3 = new ServiceBroker({
  namespace: 'dev',
  nodeID: 'node-3',
  transporter: 'NATS'
});

brokerNode3.createService({
  name: 'loggers',
  mixins: [DbService],

  settings: {
    fields: ['_id', 'action', 'date'],
    entityValidator: {
      action: 'string',
      date: 'string',
    }
  },

  actions: {
    addLogger: {
      async handler(ctx) {
        return this.broker.call('loggers.create', ctx.params);
      }
    },
    listLoggers: {
      async handler(ctx) {
        return this.broker.call('loggers.find', {});
      }
    }
  },

  afterConnected() {

  }
});

Promise.all([brokerNode3.start()]).then(() => {
  brokerNode3.repl();
});