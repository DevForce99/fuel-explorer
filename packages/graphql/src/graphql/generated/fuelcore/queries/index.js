const fs = require('fs');
const path = require('path');

module.exports.balance = fs.readFileSync(
  path.join(__dirname, 'balance.graphql'),
  'utf8',
);
module.exports.balances = fs.readFileSync(
  path.join(__dirname, 'balances.graphql'),
  'utf8',
);
module.exports.block = fs.readFileSync(
  path.join(__dirname, 'block.graphql'),
  'utf8',
);
module.exports.blocks = fs.readFileSync(
  path.join(__dirname, 'blocks.graphql'),
  'utf8',
);
module.exports.chain = fs.readFileSync(
  path.join(__dirname, 'chain.graphql'),
  'utf8',
);
module.exports.coin = fs.readFileSync(
  path.join(__dirname, 'coin.graphql'),
  'utf8',
);
module.exports.coins = fs.readFileSync(
  path.join(__dirname, 'coins.graphql'),
  'utf8',
);
module.exports.coinsToSpend = fs.readFileSync(
  path.join(__dirname, 'coinsToSpend.graphql'),
  'utf8',
);
module.exports.contract = fs.readFileSync(
  path.join(__dirname, 'contract.graphql'),
  'utf8',
);
module.exports.contractBalance = fs.readFileSync(
  path.join(__dirname, 'contractBalance.graphql'),
  'utf8',
);
module.exports.contractBalances = fs.readFileSync(
  path.join(__dirname, 'contractBalances.graphql'),
  'utf8',
);
module.exports.estimateGasPrice = fs.readFileSync(
  path.join(__dirname, 'estimateGasPrice.graphql'),
  'utf8',
);
module.exports.estimatePredicates = fs.readFileSync(
  path.join(__dirname, 'estimatePredicates.graphql'),
  'utf8',
);
module.exports.health = fs.readFileSync(
  path.join(__dirname, 'health.graphql'),
  'utf8',
);
module.exports.latestGasPrice = fs.readFileSync(
  path.join(__dirname, 'latestGasPrice.graphql'),
  'utf8',
);
module.exports.memory = fs.readFileSync(
  path.join(__dirname, 'memory.graphql'),
  'utf8',
);
module.exports.message = fs.readFileSync(
  path.join(__dirname, 'message.graphql'),
  'utf8',
);
module.exports.messageProof = fs.readFileSync(
  path.join(__dirname, 'messageProof.graphql'),
  'utf8',
);
module.exports.messageStatus = fs.readFileSync(
  path.join(__dirname, 'messageStatus.graphql'),
  'utf8',
);
module.exports.messages = fs.readFileSync(
  path.join(__dirname, 'messages.graphql'),
  'utf8',
);
module.exports.nodeInfo = fs.readFileSync(
  path.join(__dirname, 'nodeInfo.graphql'),
  'utf8',
);
module.exports.register = fs.readFileSync(
  path.join(__dirname, 'register.graphql'),
  'utf8',
);
module.exports.relayedTransactionStatus = fs.readFileSync(
  path.join(__dirname, 'relayedTransactionStatus.graphql'),
  'utf8',
);
module.exports.transaction = fs.readFileSync(
  path.join(__dirname, 'transaction.graphql'),
  'utf8',
);
module.exports.transactions = fs.readFileSync(
  path.join(__dirname, 'transactions.graphql'),
  'utf8',
);
module.exports.transactionsByOwner = fs.readFileSync(
  path.join(__dirname, 'transactionsByOwner.graphql'),
  'utf8',
);
module.exports.transactionsByBlockId = fs.readFileSync(
  path.join(__dirname, 'transactionsByBlockId.graphql'),
  'utf8',
);
module.exports.tps = fs.readFileSync(
  path.join(__dirname, 'tps.graphql'),
  'utf8',
);
module.exports.getBlocksDashboard = fs.readFileSync(
  path.join(__dirname, 'getBlocksDashboard.graphql'),
  'utf8',
);
module.exports.newBlockStatistics = fs.readFileSync(
  path.join(__dirname, 'newBlockStatistics.graphql'),
  'utf8',
);
module.exports.blockRewardStatistics = fs.readFileSync(
  path.join(__dirname, 'blockRewardStatistics.graphql'),
  'utf8',
);
