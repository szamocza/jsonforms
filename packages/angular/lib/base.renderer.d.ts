import { JsonSchema, OwnPropsOfRenderer, UISchemaElement } from 'jsonforms/packages/core';
export declare class JsonFormsBaseRenderer<T extends UISchemaElement> {
    uischema: T;
    schema: JsonSchema;
    path: string;
    protected getOwnProps(): OwnPropsOfRenderer;
}
