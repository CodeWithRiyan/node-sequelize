const Sequelize = require('sequelize');

const sequelize = new Sequelize('learn-node-mysql', 'riyanisme', 'riyan1128',{
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;