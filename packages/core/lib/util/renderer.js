"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
  The MIT License
  
  Copyright (c) 2018 EclipseSource Munich
  https://github.com/eclipsesource/jsonforms
  
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/
var get_1 = __importDefault(require("lodash/get"));
var has_1 = __importDefault(require("lodash/has"));
var cloneDeep_1 = __importDefault(require("lodash/cloneDeep"));
var merge_1 = __importDefault(require("lodash/merge"));
var union_1 = __importDefault(require("lodash/union"));
var reducers_1 = require("../reducers");
var uischema_1 = require("../models/uischema");
var util_1 = require("../util");
var actions_1 = require("../actions");
var generators_1 = require("../generators");
exports.isPlainLabel = function (label) {
    return typeof label === 'string';
};
var isRequired = function (schema, schemaPath) {
    var pathSegments = schemaPath.split('/');
    var lastSegment = pathSegments[pathSegments.length - 1];
    var nextHigherSchemaSegments = pathSegments.slice(0, pathSegments.length - 2);
    var nextHigherSchemaPath = nextHigherSchemaSegments.join('/');
    var nextHigherSchema = util_1.Resolve.schema(schema, nextHigherSchemaPath);
    return (nextHigherSchema !== undefined &&
        nextHigherSchema.required !== undefined &&
        nextHigherSchema.required.indexOf(lastSegment) !== -1);
};
/**
 * Adds an asterisk to the given label string based
 * on the required parameter.
 *
 * @param {string} label the label string
 * @param {boolean} required whether the label belongs to a control which is required
 * @returns {string} the label string
 */
exports.computeLabel = function (label, required) {
    return required ? label + '*' : label;
};
/**
 * Create a default value based on the given scheam.
 * @param schema the schema for which to create a default value.
 * @returns {any}
 */
exports.createDefaultValue = function (schema) {
    switch (schema.type) {
        case 'string':
            if (schema.format === 'date-time' ||
                schema.format === 'date' ||
                schema.format === 'time') {
                return new Date();
            }
            return '';
        case 'integer':
        case 'number':
            return 0;
        case 'boolean':
            return false;
        case 'array':
            return [];
        case 'null':
            return null;
        default:
            return {};
    }
};
/**
 * Whether an element's description should be hidden.
 *
 * @param visible whether an element is visible
 * @param description the element's description
 * @param isFocused whether the element is focused
 *
 * @returns {boolean} true, if the description is to be hidden, false otherwise
 */
exports.isDescriptionHidden = function (visible, description, isFocused) {
    return (description === undefined ||
        (description !== undefined && !visible) ||
        !isFocused);
};
/**
 * Map state to control props.
 * @param state the store's state
 * @param ownProps any own props
 * @returns {StatePropsOfControl} state props for a control
 */
exports.mapStateToControlProps = function (state, ownProps) {
    var schema = ownProps.schema, uischema = ownProps.uischema;
    var path = util_1.composeWithUi(uischema, ownProps.path);
    var visible = has_1.default(ownProps, 'visible')
        ? ownProps.visible
        : util_1.isVisible(ownProps, state, ownProps.path);
    var enabled = has_1.default(ownProps, 'enabled')
        ? ownProps.enabled
        : util_1.isEnabled(ownProps, state, ownProps.path);
    var labelDesc = util_1.createLabelDescriptionFrom(uischema, schema);
    var label = labelDesc.show ? labelDesc.text : '';
    var errors = union_1.default(reducers_1.getErrorAt(path)(state).map(function (error) { return error.message; }));
    var controlElement = uischema;
    var id = ownProps.id;
    var required = controlElement.scope !== undefined &&
        isRequired(ownProps.schema, controlElement.scope);
    console.log(ownProps);
    console.log(controlElement);
    console.log(required);
    console.log(uischema);
    if (uischema && uischema.selector) {
        var selectorVal = uischema.selector(controlElement.scope);
        if (selectorVal != null) {
            required = required && selectorVal == uischema_1.FieldPhaseSelector.EDITABLE;
        }
    }
    console.log(required);
    var resolvedSchema = util_1.Resolve.schema(ownProps.schema, controlElement.scope);
    var description = resolvedSchema !== undefined ? resolvedSchema.description : '';
    var defaultConfig = cloneDeep_1.default(reducers_1.getConfig(state));
    var config = merge_1.default(defaultConfig, controlElement.options);
    return {
        data: util_1.Resolve.data(reducers_1.getData(state), path),
        description: description,
        errors: errors,
        label: label,
        visible: visible,
        enabled: enabled,
        id: id,
        path: path,
        parentPath: ownProps.path,
        required: required,
        scopedSchema: resolvedSchema,
        uischema: ownProps.uischema,
        findUISchema: reducers_1.findUISchema(state),
        schema: ownProps.schema,
        config: config,
        fields: state.jsonforms.fields
    };
};
/**
 *
 * Map dispatch to control props.
 *
 * @param dispatch the store's dispatch method
 * @returns {DispatchPropsOfControl} dispatch props for a control
 */
exports.mapDispatchToControlProps = function (dispatch) { return ({
    handleChange: function (path, value) {
        dispatch(actions_1.update(path, function () { return value; }));
    }
}); };
/**
 * Map state to table props
 *
 * @param state the store's state
 * @param ownProps any element's own props
 * @returns {StatePropsOfArrayControl} state props for a table control
 */
exports.mapStateToArrayControlProps = function (state, ownProps) {
    var _a = exports.mapStateToControlProps(state, ownProps), path = _a.path, schema = _a.schema, uischema = _a.uischema, props = __rest(_a, ["path", "schema", "uischema"]);
    var controlElement = uischema;
    var resolvedSchema = util_1.Resolve.schema(schema, controlElement.scope + '/items');
    var childErrors = reducers_1.getSubErrorsAt(path)(state);
    return __assign({}, props, { path: path,
        schema: schema,
        uischema: uischema, scopedSchema: resolvedSchema, childErrors: childErrors });
};
/**
 * Maps state to dispatch properties of an array control.
 *
 * @param dispatch the store's dispatch method
 * @param ownProps own properties
 * @returns {DispatchPropsOfArrayControl} dispatch props of an array control
 */
exports.mapDispatchToArrayControlProps = function (dispatch, ownProps) { return ({
    addItem: function (path) { return function () {
        dispatch(actions_1.update(path, function (array) {
            var schemaPath = ownProps.uischema.scope + '/items';
            var resolvedSchema = util_1.Resolve.schema(ownProps.schema, schemaPath);
            var newValue = exports.createDefaultValue(resolvedSchema);
            if (array === undefined || array === null) {
                return [newValue];
            }
            array.push(newValue);
            return array;
        }));
    }; },
    removeItems: function (path, toDelete) { return function () {
        dispatch(actions_1.update(path, function (array) {
            toDelete.forEach(function (s) { return array.splice(array.indexOf(s), 1); });
            return array;
        }));
    }; }
}); };
/**
 * Map state to layout props.
 * @param state JSONForms state tree
 * @param ownProps any own props
 * @returns {StatePropsOfLayout}
 */
exports.mapStateToLayoutProps = function (state, ownProps) {
    var visible = has_1.default(ownProps, 'visible')
        ? ownProps.visible
        : util_1.isVisible(ownProps, state, ownProps.path);
    return {
        renderers: reducers_1.getRenderers(state),
        visible: visible,
        path: ownProps.path,
        uischema: ownProps.uischema,
        schema: ownProps.schema
    };
};
exports.mapStateToJsonFormsRendererProps = function (state, ownProps) {
    var uischema = ownProps.uischema;
    if (uischema === undefined) {
        if (ownProps.schema) {
            uischema = generators_1.generateDefaultUISchema(ownProps.schema);
        }
        else {
            uischema = reducers_1.getUiSchema(state);
        }
    }
    return {
        renderers: ownProps.renderers || get_1.default(state.jsonforms, 'renderers') || [],
        schema: ownProps.schema || reducers_1.getSchema(state),
        uischema: uischema
    };
};
//# sourceMappingURL=renderer.js.map