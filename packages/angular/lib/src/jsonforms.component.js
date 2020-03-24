"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var maxBy_1 = __importDefault(require("lodash/maxBy"));
var core_1 = require("@angular/core");
var core_2 = require("jsonforms/packages/core");
var store_1 = require("@angular-redux/store");
require("rxjs/add/operator/map");
var unknown_component_1 = require("./unknown.component");
var base_renderer_1 = require("./base.renderer");
var control_1 = require("./control");
var JsonFormsOutlet = /** @class */ (function (_super) {
    __extends(JsonFormsOutlet, _super);
    function JsonFormsOutlet(viewContainerRef, componentFactoryResolver, ngRedux) {
        var _this = _super.call(this, ngRedux) || this;
        _this.viewContainerRef = viewContainerRef;
        _this.componentFactoryResolver = componentFactoryResolver;
        _this.ngRedux = ngRedux;
        return _this;
    }
    Object.defineProperty(JsonFormsOutlet.prototype, "renderProps", {
        set: function (renderProps) {
            this.path = renderProps.path;
            this.schema = renderProps.schema;
            this.uischema = renderProps.uischema;
            this.update(this.ngRedux.getState());
        },
        enumerable: true,
        configurable: true
    });
    JsonFormsOutlet.prototype.ngOnInit = function () {
        var _this = this;
        this.subscription = this.ngRedux
            .select()
            .subscribe(function (state) { return _this.update(state); });
    };
    JsonFormsOutlet.prototype.update = function (state) {
        var props = core_2.mapStateToJsonFormsRendererProps(state, {
            schema: this.schema,
            uischema: this.uischema,
            path: this.path
        });
        var renderers = props.renderers;
        var schema = this.schema || props.schema;
        var uischema = this.uischema || props.uischema;
        var renderer = maxBy_1.default(renderers, function (r) { return r.tester(uischema, schema); });
        var bestComponent = unknown_component_1.UnknownRenderer;
        if (renderer !== undefined && renderer.tester(uischema, schema) !== -1) {
            bestComponent = renderer.renderer;
        }
        var componentFactory = this.componentFactoryResolver.resolveComponentFactory(bestComponent);
        if (this.currentComponentRef === undefined) {
            this.currentComponentRef = this.viewContainerRef.createComponent(componentFactory);
        }
        else if (this.currentComponentRef.componentType !== componentFactory.componentType) {
            this.viewContainerRef.clear();
            this.currentComponentRef = this.viewContainerRef.createComponent(componentFactory);
        }
        if (this.currentComponentRef.instance instanceof base_renderer_1.JsonFormsBaseRenderer) {
            var instance = this.currentComponentRef
                .instance;
            instance.uischema = uischema;
            instance.schema = schema;
            instance.path = this.path;
            if (instance instanceof control_1.JsonFormsControl) {
                var controlInstance = instance;
                if (controlInstance.id === undefined) {
                    var id = core_2.isControl(props.uischema)
                        ? core_2.createId(props.uischema.scope)
                        : undefined;
                    instance.id = id;
                }
            }
        }
    };
    JsonFormsOutlet.prototype.ngOnDestroy = function () {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    };
    JsonFormsOutlet.decorators = [
        { type: core_1.Directive, args: [{
                    selector: 'jsonforms-outlet'
                },] },
    ];
    /** @nocollapse */
    JsonFormsOutlet.ctorParameters = function () { return [
        { type: core_1.ViewContainerRef, },
        { type: core_1.ComponentFactoryResolver, },
        { type: store_1.NgRedux, },
    ]; };
    JsonFormsOutlet.propDecorators = {
        "renderProps": [{ type: core_1.Input },],
    };
    return JsonFormsOutlet;
}(base_renderer_1.JsonFormsBaseRenderer));
exports.JsonFormsOutlet = JsonFormsOutlet;
//# sourceMappingURL=jsonforms.component.js.map