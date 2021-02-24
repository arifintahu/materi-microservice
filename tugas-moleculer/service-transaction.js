const { ServiceBroker } = require('moleculer');
const DbService = require('moleculer-db');

const nodeUser = new ServiceBroker({
    namespace: 'dev',
    nodeID: 'node-user',
    transporter: 'NATS'
});
