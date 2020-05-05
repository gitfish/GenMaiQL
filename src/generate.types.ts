import { buildSchema, GraphQLSchema, GraphQLOutputType, GraphQLScalarType, GraphQLNonNull, GraphQLList, GraphQLField, GraphQLNamedType, GraphQLObjectType, GraphQLEnumType, GraphQLInterfaceType } from "graphql";

export enum ScalarStandardName {
    String = "String",
    Int = "Int",
    Float = "Float",
    Boolean = "Boolean",
    ID = "ID"
}

export interface IGenerators {
    scalar?: (type: GraphQLScalarType, ctx: IGenerateContext) => string;
    scalarDef?: (type: GraphQLScalarType, ctx: IGenerateContext) => string;
    enum?: (type: GraphQLEnumType, ctx: IGenerateContext) => string;
    field?: (field: GraphQLField<any, any>, ctx: IGenerateContext) => string;
    interface?: (field: GraphQLInterfaceType, ctx: IGenerateContext) => string;
    object?: (type: GraphQLObjectType, ctx: IGenerateContext) => string;
}

export interface IGenerateOptions  {
    moduleName?: string;
    generators?: IGenerators;
}

export interface IGenerateContext {
    moduleName: string;
    generators: IGenerators;
    state: {
        [key: string]: any;
    }
}

export const DefaultGenerators: IGenerators = {
    scalar(type: GraphQLScalarType) {
        switch(type.name) {
            case ScalarStandardName.String:
                return "string";
            case ScalarStandardName.Int:
                return "number";
            case ScalarStandardName.Float:
                return "number";
            case ScalarStandardName.Boolean:
                return "boolean";
            case ScalarStandardName.ID:
                return "string"
        }
    },
    scalarDef(type: GraphQLScalarType) {
        if(type.name !== ScalarStandardName.String &&
           type.name !== ScalarStandardName.Int &&
           type.name !== ScalarStandardName.Float &&
           type.name !== ScalarStandardName.Boolean &&
           type.name !== ScalarStandardName.ID) {
            return `type ${type.name} = string`;
        }
        return "";
    },
    enum(type: GraphQLEnumType) {
        let text = `enum ${type.name} {\r\n`;
        const values = type.getValues();
        values.forEach((value, idx) => {
            text += `  ${value.name}${idx < values.length -1 ? "," : ""}\r\n`
        });
        text += "}\r\n";
        return text;
    },
    field(field: GraphQLField<any, any>, ctx: IGenerateContext) {
        let text = "";
        let type = field.type;
        const isNonNull = type instanceof GraphQLNonNull;
        const isList = type instanceof GraphQLList;
        if((type instanceof GraphQLNonNull) || (type instanceof GraphQLList)) {
            type = type.ofType;
        }
        const typeName = type instanceof GraphQLScalarType ? ctx.generators.scalar(type, ctx) : (type as GraphQLNamedType).name;
        text += `${field.name}${isNonNull ? "" : "?"}: ${typeName}${isList ? "[]" : ""};\r\n`;
        return text;
    },
    interface(type: GraphQLInterfaceType, ctx: IGenerateContext) {
        let text = "";
        text += `export interface ${type.name}`;
        const interfaces = type.getInterfaces();
        if(interfaces && interfaces.length > 0) {
            text += ` extends ${interfaces.map(i => i.name).join(", ")}`;
        }
        text += ` {\r\n`;
        const fields = type.getFields();
        for(const fieldKey in fields) {
            const field = fields[fieldKey];
            text += `  ${ctx.generators.field(field, ctx)}`;
        }
        text += `}\r\n`;
        return text;
    },
    object(type: GraphQLObjectType, ctx: IGenerateContext) {
        let text = "";
        text += `export interface ${type.name}`;
        const interfaces = type.getInterfaces();
        if(interfaces && interfaces.length > 0) {
            text += ` extends ${interfaces.map(i => i.name).join(", ")}`;
        }
        text += ` {\r\n`;
        const fields = type.getFields();
        for(const fieldKey in fields) {
            const field = fields[fieldKey];
            text += `  ${ctx.generators.field(field, ctx)}`;
        }
        text += `}\r\n`;
        return text;
    }
}

const generateType = (type: GraphQLNamedType | GraphQLOutputType, ctx: IGenerateContext): string => {
    if(type instanceof GraphQLInterfaceType) {
        return ctx.generators.interface(type, ctx);
    }

    if(type instanceof GraphQLObjectType) {
        return ctx.generators.object(type, ctx);
    }
    
    if(type instanceof GraphQLScalarType) {
        return ctx.generators.scalarDef(type, ctx);
    }

    if(type instanceof GraphQLEnumType) {
        return ctx.generators.enum(type, ctx);
    }
};

export interface IGenerateResult {
    moduleName: string;
    content: string;
}

export const DefaultOptions: IGenerateOptions = {
    moduleName: "types",
    generators: DefaultGenerators
};

export const generateTypes = (schema: GraphQLSchema, opts?: IGenerateOptions): IGenerateResult => {
    opts = {
        ...DefaultOptions,
        generators: {
            ...DefaultOptions.generators,
            ...opts?.generators
        }
    }
    let text = "";
    const ctx: IGenerateContext = {
        moduleName: opts.moduleName,
        generators: opts.generators,
        state: {}
    }
    const typeMap = schema.getTypeMap();
    for(const key in typeMap) {
        const type = typeMap[key];
        if(type.name && type.name.startsWith("__")) {
            continue;
        }
        text += generateType(type, ctx);
    }
    return {
        moduleName: ctx.moduleName,
        content: text
    };
};

export const generateTypesFromSource = (source: string, opts?: IGenerateOptions): IGenerateResult => {
    return generateTypes(buildSchema(source, { assumeValidSDL: true }), opts);
};