'use strict';

/** @type Egg.EggPlugin */
exports.sequelize = {
    enable: true,
    package: 'egg-sequelize'
}
exports.validate = {
    enable: true,
    package: 'egg-validate',
}
exports.jwt = {
    enable: true,
    package: 'egg-jwt',
}
exports.nunjucks = {
    enable: true,
    package: 'egg-view-nunjucks',
};
