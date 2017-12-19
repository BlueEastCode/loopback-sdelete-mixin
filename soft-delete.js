'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends6 = require('babel-runtime/helpers/extends');

var _extends7 = _interopRequireDefault(_extends6);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _debug2 = require('./debug');

var _debug3 = _interopRequireDefault(_debug2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug3.default)();

exports.default = function (Model, _ref) {
  var _ref$deletedAt = _ref.deletedAt,
      deletedAt = _ref$deletedAt === undefined ? 'deletedAt' : _ref$deletedAt,
      _ref$_isDeleted = _ref._isDeleted,
      _isDeleted = _ref$_isDeleted === undefined ? '_isDeleted' : _ref$_isDeleted,
      _ref$scrub = _ref.scrub,
      scrub = _ref$scrub === undefined ? false : _ref$scrub;

  debug('SoftDelete mixin for Model %s', Model.modelName);

  debug('options', { deletedAt: deletedAt, _isDeleted: _isDeleted, scrub: scrub });

  var properties = Model.definition.properties;

  var scrubbed = {};
  if (scrub !== false) {
    var propertiesToScrub = scrub;
    if (!Array.isArray(propertiesToScrub)) {
      propertiesToScrub = (0, _keys2.default)(properties).filter(function (prop) {
        return !properties[prop].id && prop !== _isDeleted;
      });
    }
    scrubbed = propertiesToScrub.reduce(function (obj, prop) {
      return (0, _extends7.default)({}, obj, (0, _defineProperty3.default)({}, prop, null));
    }, {});
  }

  Model.defineProperty(deletedAt, { type: Date, required: false, default: null });
  Model.defineProperty(_isDeleted, { type: Boolean, required: true, default: false });

  Model.destroyAll = function softDestroyAll(where, cb) {
    var _extends3;

    return Model.updateAll(where, (0, _extends7.default)({}, scrubbed, (_extends3 = {}, (0, _defineProperty3.default)(_extends3, deletedAt, new Date()), (0, _defineProperty3.default)(_extends3, _isDeleted, true), _extends3))).then(function (result) {
      return typeof cb === 'function' ? cb(null, result) : result;
    }).catch(function (error) {
      return typeof cb === 'function' ? cb(error) : _promise2.default.reject(error);
    });
  };

  Model.remove = Model.destroyAll;
  Model.deleteAll = Model.destroyAll;

  Model.destroyById = function softDestroyById(id, cb) {
    var _extends4;

    return Model.updateAll({ id: id }, (0, _extends7.default)({}, scrubbed, (_extends4 = {}, (0, _defineProperty3.default)(_extends4, deletedAt, new Date()), (0, _defineProperty3.default)(_extends4, _isDeleted, true), _extends4))).then(function (result) {
      return typeof cb === 'function' ? cb(null, result) : result;
    }).catch(function (error) {
      return typeof cb === 'function' ? cb(error) : _promise2.default.reject(error);
    });
  };

  Model.removeById = Model.destroyById;
  Model.deleteById = Model.destroyById;

  Model.prototype.destroy = function softDestroy(options, cb) {
    var _extends5;

    var callback = cb === undefined && typeof options === 'function' ? options : cb;

    return this.updateAttributes((0, _extends7.default)({}, scrubbed, (_extends5 = {}, (0, _defineProperty3.default)(_extends5, deletedAt, new Date()), (0, _defineProperty3.default)(_extends5, _isDeleted, true), _extends5))).then(function (result) {
      return typeof cb === 'function' ? callback(null, result) : result;
    }).catch(function (error) {
      return typeof cb === 'function' ? callback(error) : _promise2.default.reject(error);
    });
  };

  Model.prototype.remove = Model.prototype.destroy;
  Model.prototype.delete = Model.prototype.destroy;

  // Emulate default scope but with more flexibility.
  var queryNonDeleted = {};
  queryNonDeleted[_isDeleted] = false;

  var _findOrCreate = Model.findOrCreate;
  Model.findOrCreate = function findOrCreateDeleted() {
    var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if (!query.deleted) {
      if (!query.where) {
        query.where = queryNonDeleted;
      } else {
        query.where = { and: [query.where, queryNonDeleted] };
      }
    }

    for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      rest[_key - 1] = arguments[_key];
    }

    return _findOrCreate.call.apply(_findOrCreate, [Model, query].concat(rest));
  };

  var _find = Model.find;
  Model.find = function findDeleted() {
    var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if (!query.deleted) {
      if (!query.where) {
        query.where = queryNonDeleted;
      } else {
        query.where = { and: [query.where, queryNonDeleted] };
      }
    }

    for (var _len2 = arguments.length, rest = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      rest[_key2 - 1] = arguments[_key2];
    }

    return _find.call.apply(_find, [Model, query].concat(rest));
  };

  var _count = Model.count;
  Model.count = function countDeleted() {
    var where = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    // Because count only receives a 'where', there's nowhere to ask for the deleted entities.
    var whereNotDeleted = { and: [where, queryNonDeleted] };

    for (var _len3 = arguments.length, rest = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      rest[_key3 - 1] = arguments[_key3];
    }

    return _count.call.apply(_count, [Model, whereNotDeleted].concat(rest));
  };

  var _update = Model.update;
  Model.update = Model.updateAll = function updateDeleted() {
    var where = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    // Because update/updateAll only receives a 'where', there's nowhere to ask for the deleted entities.
    var whereNotDeleted = { and: [where, queryNonDeleted] };

    for (var _len4 = arguments.length, rest = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      rest[_key4 - 1] = arguments[_key4];
    }

    return _update.call.apply(_update, [Model, whereNotDeleted].concat(rest));
  };
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNvZnQtZGVsZXRlLmpzIl0sIm5hbWVzIjpbImRlYnVnIiwiTW9kZWwiLCJkZWxldGVkQXQiLCJfaXNEZWxldGVkIiwic2NydWIiLCJtb2RlbE5hbWUiLCJwcm9wZXJ0aWVzIiwiZGVmaW5pdGlvbiIsInNjcnViYmVkIiwicHJvcGVydGllc1RvU2NydWIiLCJBcnJheSIsImlzQXJyYXkiLCJmaWx0ZXIiLCJwcm9wIiwiaWQiLCJyZWR1Y2UiLCJvYmoiLCJkZWZpbmVQcm9wZXJ0eSIsInR5cGUiLCJEYXRlIiwicmVxdWlyZWQiLCJkZWZhdWx0IiwiQm9vbGVhbiIsImRlc3Ryb3lBbGwiLCJzb2Z0RGVzdHJveUFsbCIsIndoZXJlIiwiY2IiLCJ1cGRhdGVBbGwiLCJ0aGVuIiwicmVzdWx0IiwiY2F0Y2giLCJlcnJvciIsInJlamVjdCIsInJlbW92ZSIsImRlbGV0ZUFsbCIsImRlc3Ryb3lCeUlkIiwic29mdERlc3Ryb3lCeUlkIiwicmVtb3ZlQnlJZCIsImRlbGV0ZUJ5SWQiLCJwcm90b3R5cGUiLCJkZXN0cm95Iiwic29mdERlc3Ryb3kiLCJvcHRpb25zIiwiY2FsbGJhY2siLCJ1bmRlZmluZWQiLCJ1cGRhdGVBdHRyaWJ1dGVzIiwiZGVsZXRlIiwicXVlcnlOb25EZWxldGVkIiwiX2ZpbmRPckNyZWF0ZSIsImZpbmRPckNyZWF0ZSIsImZpbmRPckNyZWF0ZURlbGV0ZWQiLCJxdWVyeSIsImRlbGV0ZWQiLCJhbmQiLCJyZXN0IiwiY2FsbCIsIl9maW5kIiwiZmluZCIsImZpbmREZWxldGVkIiwiX2NvdW50IiwiY291bnQiLCJjb3VudERlbGV0ZWQiLCJ3aGVyZU5vdERlbGV0ZWQiLCJfdXBkYXRlIiwidXBkYXRlIiwidXBkYXRlRGVsZXRlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7Ozs7QUFDQSxJQUFNQSxRQUFRLHNCQUFkOztrQkFFZSxVQUFDQyxLQUFELFFBQWtGO0FBQUEsNEJBQXhFQyxTQUF3RTtBQUFBLE1BQXhF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UCxFQUF4Qjs7QUFGdUQsdUNBQU5PLElBQU07QUFBTkEsVUFBTTtBQUFBOztBQUd2RCxXQUFPSyxPQUFPSixJQUFQLGdCQUFZdEQsS0FBWixFQUFtQjZELGVBQW5CLFNBQXVDUixJQUF2QyxFQUFQO0FBQ0QsR0FKRDs7QUFNQSxNQUFNUyxVQUFVOUQsTUFBTStELE1BQXRCO0FBQ0EvRCxRQUFNK0QsTUFBTixHQUFlL0QsTUFBTTBCLFNBQU4sR0FBa0IsU0FBU3NDLGFBQVQsR0FBNEM7QUFBQSxRQUFyQnhDLEtBQXFCLHVFQUFiLEVBQWE7O0FBQzNFO0FBQ0EsUUFBTXFDLGtCQUFrQixFQUFFVCxLQUFLLENBQUM1QixLQUFELEVBQVFzQixlQUFSLENBQVAsRUFBeEI7O0FBRjJFLHVDQUFOTyxJQUFNO0FBQU5BLFVBQU07QUFBQTs7QUFHM0UsV0FBT1MsUUFBUVIsSUFBUixpQkFBYXRELEtBQWIsRUFBb0I2RCxlQUFwQixTQUF3Q1IsSUFBeEMsRUFBUDtBQUNELEdBSkQ7QUFLRCxDIiwiZmlsZSI6InNvZnQtZGVsZXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IF9kZWJ1ZyBmcm9tICcuL2RlYnVnJztcbmNvbnN0IGRlYnVnID0gX2RlYnVnKCk7XG5cbmV4cG9ydCBkZWZhdWx0IChNb2RlbCwgeyBkZWxldGVkQXQgPSAnZGVsZXRlZEF0JywgX2lzRGVsZXRlZCA9ICdfaXNEZWxldGVkJywgc2NydWIgPSBmYWxzZSB9KSA9PiB7XG4gIGRlYnVnKCdTb2Z0RGVsZXRlIG1peGluIGZvciBNb2RlbCAlcycsIE1vZGVsLm1vZGVsTmFtZSk7XG5cbiAgZGVidWcoJ29wdGlvbnMnLCB7IGRlbGV0ZWRBdCwgX2lzRGVsZXRlZCwgc2NydWIgfSk7XG5cbiAgY29uc3QgcHJvcGVydGllcyA9IE1vZGVsLmRlZmluaXRpb24ucHJvcGVydGllcztcblxuICBsZXQgc2NydWJiZWQgPSB7fTtcbiAgaWYgKHNjcnViICE9PSBmYWxzZSkge1xuICAgIGxldCBwcm9wZXJ0aWVzVG9TY3J1YiA9IHNjcnViO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShwcm9wZXJ0aWVzVG9TY3J1YikpIHtcbiAgICAgIHByb3BlcnRpZXNUb1NjcnViID0gT2JqZWN0LmtleXMocHJvcGVydGllcylcbiAgICAgICAgLmZpbHRlcihwcm9wID0+ICFwcm9wZXJ0aWVzW3Byb3BdLmlkICYmIHByb3AgIT09IF9pc0RlbGV0ZWQpO1xuICAgIH1cbiAgICBzY3J1YmJlZCA9IHByb3BlcnRpZXNUb1NjcnViLnJlZHVjZSgob2JqLCBwcm9wKSA9PiAoeyAuLi5vYmosIFtwcm9wXTogbnVsbCB9KSwge30pO1xuICB9XG5cbiAgTW9kZWwuZGVmaW5lUHJvcGVydHkoZGVsZXRlZEF0LCB7IHR5cGU6IERhdGUsIHJlcXVpcmVkOiBmYWxzZSwgZGVmYXVsdDogbnVsbCB9KTtcbiAgTW9kZWwuZGVmaW5lUHJvcGVydHkoX2lzRGVsZXRlZCwgeyB0eXBlOiBCb29sZWFuLCByZXF1aXJlZDogdHJ1ZSwgZGVmYXVsdDogZmFsc2UgfSk7XG5cbiAgTW9kZWwuZGVzdHJveUFsbCA9IGZ1bmN0aW9uIHNvZnREZXN0cm95QWxsKHdoZXJlLCBjYikge1xuICAgIHJldHVybiBNb2RlbC51cGRhdGVBbGwod2hlcmUsIHsgLi4uc2NydWJiZWQsIFtkZWxldGVkQXRdOiBuZXcgRGF0ZSgpLCBbX2lzRGVsZXRlZF06IHRydWUgfSlcbiAgICAgIC50aGVuKHJlc3VsdCA9PiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSA/IGNiKG51bGwsIHJlc3VsdCkgOiByZXN1bHQpXG4gICAgICAuY2F0Y2goZXJyb3IgPT4gKHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykgPyBjYihlcnJvcikgOiBQcm9taXNlLnJlamVjdChlcnJvcikpO1xuICB9O1xuXG4gIE1vZGVsLnJlbW92ZSA9IE1vZGVsLmRlc3Ryb3lBbGw7XG4gIE1vZGVsLmRlbGV0ZUFsbCA9IE1vZGVsLmRlc3Ryb3lBbGw7XG5cbiAgTW9kZWwuZGVzdHJveUJ5SWQgPSBmdW5jdGlvbiBzb2Z0RGVzdHJveUJ5SWQoaWQsIGNiKSB7XG4gICAgcmV0dXJuIE1vZGVsLnVwZGF0ZUFsbCh7IGlkOiBpZCB9LCB7IC4uLnNjcnViYmVkLCBbZGVsZXRlZEF0XTogbmV3IERhdGUoKSwgW19pc0RlbGV0ZWRdOiB0cnVlIH0pXG4gICAgICAudGhlbihyZXN1bHQgPT4gKHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykgPyBjYihudWxsLCByZXN1bHQpIDogcmVzdWx0KVxuICAgICAgLmNhdGNoKGVycm9yID0+ICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpID8gY2IoZXJyb3IpIDogUHJvbWlzZS5yZWplY3QoZXJyb3IpKTtcbiAgfTtcblxuICBNb2RlbC5yZW1vdmVCeUlkID0gTW9kZWwuZGVzdHJveUJ5SWQ7XG4gIE1vZGVsLmRlbGV0ZUJ5SWQgPSBNb2RlbC5kZXN0cm95QnlJZDtcblxuICBNb2RlbC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uIHNvZnREZXN0cm95KG9wdGlvbnMsIGNiKSB7XG4gICAgY29uc3QgY2FsbGJhY2sgPSAoY2IgPT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykgPyBvcHRpb25zIDogY2I7XG5cbiAgICByZXR1cm4gdGhpcy51cGRhdGVBdHRyaWJ1dGVzKHsgLi4uc2NydWJiZWQsIFtkZWxldGVkQXRdOiBuZXcgRGF0ZSgpLCBbX2lzRGVsZXRlZF06IHRydWUgfSlcbiAgICAgIC50aGVuKHJlc3VsdCA9PiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSA/IGNhbGxiYWNrKG51bGwsIHJlc3VsdCkgOiByZXN1bHQpXG4gICAgICAuY2F0Y2goZXJyb3IgPT4gKHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykgPyBjYWxsYmFjayhlcnJvcikgOiBQcm9taXNlLnJlamVjdChlcnJvcikpO1xuICB9O1xuXG4gIE1vZGVsLnByb3RvdHlwZS5yZW1vdmUgPSBNb2RlbC5wcm90b3R5cGUuZGVzdHJveTtcbiAgTW9kZWwucHJvdG90eXBlLmRlbGV0ZSA9IE1vZGVsLnByb3RvdHlwZS5kZXN0cm95O1xuXG4gIC8vIEVtdWxhdGUgZGVmYXVsdCBzY29wZSBidXQgd2l0aCBtb3JlIGZsZXhpYmlsaXR5LlxuICBjb25zdCBxdWVyeU5vbkRlbGV0ZWQgPSB7fTtcbiAgcXVlcnlOb25EZWxldGVkW19pc0RlbGV0ZWRdID0gZmFsc2U7XG5cbiAgY29uc3QgX2ZpbmRPckNyZWF0ZSA9IE1vZGVsLmZpbmRPckNyZWF0ZTtcbiAgTW9kZWwuZmluZE9yQ3JlYXRlID0gZnVuY3Rpb24gZmluZE9yQ3JlYXRlRGVsZXRlZChxdWVyeSA9IHt9LCAuLi5yZXN0KSB7XG4gICAgaWYgKCFxdWVyeS5kZWxldGVkKSB7XG4gICAgICBpZiAoIXF1ZXJ5LndoZXJlKSB7XG4gICAgICAgIHF1ZXJ5LndoZXJlID0gcXVlcnlOb25EZWxldGVkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcXVlcnkud2hlcmUgPSB7IGFuZDogW3F1ZXJ5LndoZXJlLCBxdWVyeU5vbkRlbGV0ZWRdIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIF9maW5kT3JDcmVhdGUuY2FsbChNb2RlbCwgcXVlcnksIC4uLnJlc3QpO1xuICB9O1xuXG4gIGNvbnN0IF9maW5kID0gTW9kZWwuZmluZDtcbiAgTW9kZWwuZmluZCA9IGZ1bmN0aW9uIGZpbmREZWxldGVkKHF1ZXJ5ID0ge30sIC4uLnJlc3QpIHtcbiAgICBpZiAoIXF1ZXJ5LmRlbGV0ZWQpIHtcbiAgICAgIGlmICghcXVlcnkud2hlcmUpIHtcbiAgICAgICAgcXVlcnkud2hlcmUgPSBxdWVyeU5vbkRlbGV0ZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBxdWVyeS53aGVyZSA9IHsgYW5kOiBbcXVlcnkud2hlcmUsIHF1ZXJ5Tm9uRGVsZXRlZF0gfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gX2ZpbmQuY2FsbChNb2RlbCwgcXVlcnksIC4uLnJlc3QpO1xuICB9O1xuXG4gIGNvbnN0IF9jb3VudCA9IE1vZGVsLmNvdW50O1xuICBNb2RlbC5jb3VudCA9IGZ1bmN0aW9uIGNvdW50RGVsZXRlZCh3aGVyZSA9IHt9LCAuLi5yZXN0KSB7XG4gICAgLy8gQmVjYXVzZSBjb3VudCBvbmx5IHJlY2VpdmVzIGEgJ3doZXJlJywgdGhlcmUncyBub3doZXJlIHRvIGFzayBmb3IgdGhlIGRlbGV0ZWQgZW50aXRpZXMuXG4gICAgY29uc3Qgd2hlcmVOb3REZWxldGVkID0geyBhbmQ6IFt3aGVyZSwgcXVlcnlOb25EZWxldGVkXSB9O1xuICAgIHJldHVybiBfY291bnQuY2FsbChNb2RlbCwgd2hlcmVOb3REZWxldGVkLCAuLi5yZXN0KTtcbiAgfTtcblxuICBjb25zdCBfdXBkYXRlID0gTW9kZWwudXBkYXRlO1xuICBNb2RlbC51cGRhdGUgPSBNb2RlbC51cGRhdGVBbGwgPSBmdW5jdGlvbiB1cGRhdGVEZWxldGVkKHdoZXJlID0ge30sIC4uLnJlc3QpIHtcbiAgICAvLyBCZWNhdXNlIHVwZGF0ZS91cGRhdGVBbGwgb25seSByZWNlaXZlcyBhICd3aGVyZScsIHRoZXJlJ3Mgbm93aGVyZSB0byBhc2sgZm9yIHRoZSBkZWxldGVkIGVudGl0aWVzLlxuICAgIGNvbnN0IHdoZXJlTm90RGVsZXRlZCA9IHsgYW5kOiBbd2hlcmUsIHF1ZXJ5Tm9uRGVsZXRlZF0gfTtcbiAgICByZXR1cm4gX3VwZGF0ZS5jYWxsKE1vZGVsLCB3aGVyZU5vdERlbGV0ZWQsIC4uLnJlc3QpO1xuICB9O1xufTtcbiJdfQ==
