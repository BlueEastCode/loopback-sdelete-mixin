'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _util = require('util');

var _softDelete = require('./soft-delete');

var _softDelete2 = _interopRequireDefault(_softDelete);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _util.deprecate)(function (app) {
  return app.loopback.modelBuilder.mixins.define('SoftDelete', _softDelete2.default);
});
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbImFwcCIsImxvb3BiYWNrIiwibW9kZWxCdWlsZGVyIiwibWl4aW5zIiwiZGVmaW5lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7QUFDQTs7Ozs7O2tCQUVlLHFCQUNiO0FBQUEsU0FBT0EsSUFBSUMsUUFBSixDQUFhQyxZQUFiLENBQTBCQyxNQUExQixDQUFpQ0MsTUFBakMsQ0FBd0MsWUFBeEMsdUJBQVA7QUFBQSxDQURhLEMiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBkZXByZWNhdGUgfSBmcm9tICd1dGlsJztcbmltcG9ydCBzb2Z0ZGVsZXRlIGZyb20gJy4vc29mdC1kZWxldGUnO1xuXG5leHBvcnQgZGVmYXVsdCBkZXByZWNhdGUoXG4gIGFwcCA9PiBhcHAubG9vcGJhY2subW9kZWxCdWlsZGVyLm1peGlucy5kZWZpbmUoJ1NvZnREZWxldGUnLCBzb2Z0ZGVsZXRlKVxuKTtcbiJdfQ==
