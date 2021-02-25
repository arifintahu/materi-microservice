const { ServiceBroker } = require('moleculer');
const DbService = require('moleculer-db');
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const Sequelize = require("sequelize");
const { config } = require('./config');

const brokerNode3 = new ServiceBroker({
  namespace: 'dev',
  nodeID: 'node-3',
  transporter: 'NATS'
});

brokerNode3.createService({
  name: 'loggers',
  mixins: [DbService],

  adapter: new SqlAdapter(
    config.postgres?.database,
    config.postgres?.username,
    config.postgres?.password,
    {
      host: config.postgres?.host,
      dialect: 'postgres'
    }
  ),
  model: {
    name: 'logger',
    define: {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      action: Sequelize.STRING,
      date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    },
    options: {
      timestamps: false
    }
  },
  // settings: {
  //   fields: ['_id', 'action', 'date'],
  //   entityValidator: {
  //     action: 'string',
  //     date: 'string',
  //   }
  // },

  actions: {
    createLog: {
      async handler(ctx) {
        return this.broker.call('loggers.create', ctx.params);
      }
    },
    listLogs: {
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