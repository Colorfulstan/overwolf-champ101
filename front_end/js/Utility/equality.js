// taken from angular 1.x source but removed isScope calls
// https://github.com/angular/angular.js/blob/6c59e770084912d2345e7f83f983092a2d305ae3/src/Angular.js#L670
import {isArray, isDate, isRegExp, isWindow, isFunction, isDefined} from "Utility/typechecks";
/**
 * @ngdoc function
 * @name angular.equals
 * @module ng
 * @kind function
 *
 * @description
 * Determines if two objects or two values are equivalent. Supports value types, regular
 * expressions, arrays and objects.
 *
 * Two objects or values are considered equivalent if at least one of the following is true:
 *
 * * Both objects or values pass `===` comparison.
 * * Both objects or values are of the same type and all of their properties are equal by
 *   comparing them with `angular.equals`.
 * * Both values are NaN. (In JavaScript, NaN == NaN => false. But we consider two NaN as equal)
 * * Both values represent the same regular expression (In JavaScript,
 *   /abc/ == /abc/ => false. But we consider two regular expressions as equal when their textual
 *   representation matches).
 *
 * During a property comparison, properties of `function` type and properties with names
 * that begin with `$` are ignored.
 *
 * Scope and DOMWindow objects are being compared only by identify (`===`).
 *
 * @param {*} o1 Object or value to compare.
 * @param {*} o2 Object or value to compare.
 * @returns {boolean} True if arguments are equal.
 *
 * @example
 <example module="equalsExample" name="equalsExample">
 <file name="index.html">
 <div ng-controller="ExampleController">
 <form novalidate>
 <h3>User 1</h3>
 Name: <input type="text" ng-model="user1.name">
 Age: <input type="number" ng-model="user1.age">
 <h3>User 2</h3>
 Name: <input type="text" ng-model="user2.name">
 Age: <input type="number" ng-model="user2.age">
 <div>
 <br/>
 <input type="button" value="Compare" ng-click="compare()">
 </div>
 User 1: <pre>{{user1 | json}}</pre>
 User 2: <pre>{{user2 | json}}</pre>
 Equal: <pre>{{result}}</pre>
 </form>
 </div>
 </file>
 <file name="script.js">
 angular.module('equalsExample', []).controller('ExampleController', ['$scope', function($scope) {
          $scope.user1 = {};
          $scope.user2 = {};
          $scope.compare = function() {
            $scope.result = angular.equals($scope.user1, $scope.user2);
          };
        }]);
 </file>
 </example>
 */
export function equals(o1, o2) {
    if (o1 === o2) return true;
    if (o1 === null || o2 === null) return false;
    // eslint-disable-next-line no-self-compare
    if (o1 !== o1 && o2 !== o2) return true; // NaN === NaN
    var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
    if (t1 === t2 && t1 === 'object') {
        if (isArray(o1)) {
            if (!isArray(o2)) return false;
            if ((length = o1.length) === o2.length) {
                for (key = 0; key < length; key++) {
                    if (!equals(o1[key], o2[key])) return false;
                }
                return true;
            }
        } else if (isDate(o1)) {
            if (!isDate(o2)) return false;
            return equals(o1.getTime(), o2.getTime());
        } else if (isRegExp(o1)) {
            if (!isRegExp(o2)) return false;
            return o1.toString() === o2.toString();
        } else {
            if (isWindow(o1) || isWindow(o2) ||
                isArray(o2) || isDate(o2) || isRegExp(o2)) return false;
            keySet = createMap();
            for (key in o1) {
                if (key.charAt(0) === '$' || isFunction(o1[key])) continue;
                if (!equals(o1[key], o2[key])) return false;
                keySet[key] = true;
            }
            for (key in o2) {
                if (!(key in keySet) &&
                    key.charAt(0) !== '$' &&
                    isDefined(o2[key]) &&
                    !isFunction(o2[key])) return false;
            }
            return true;
        }
    }
    return false;
}

/**
 * Creates a new object without a prototype. This object is useful for lookup without having to
 * guard against prototypically inherited properties via hasOwnProperty.
 *
 * Related micro-benchmarks:
 * - http://jsperf.com/object-create2
 * - http://jsperf.com/proto-map-lookup/2
 * - http://jsperf.com/for-in-vs-object-keys2
 *
 * @returns {Object}
 */
function createMap() {
    return Object.create(null);
}