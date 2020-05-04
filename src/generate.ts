import { buildSchema, GraphQLSchema, GraphQLOutputType, GraphQLScalarType, GraphQLNonNull, GraphQLList, GraphQLField, GraphQLNamedType, GraphQLObjectType, GraphQLEnumType, GraphQLInterfaceType } from "graphql";

interface IGenerateContext {
    root: boolean;
}

const generatePrimitive = (type: GraphQLScalarType, ctx: IGenerateContext): string => {
    if(ctx.root) {
        return "";
    }
    switch(type.name) {
        case "String":
            return "string";
        case "Int":
            return "number";
        case "Float":
            return "number";
        case "Boolean":
            return "boolean";
        case "ID":
            return "string"
    }
};

const generateEnum = (type: GraphQLEnumType, ctx: IGenerateContext): string => {
    if(ctx.root) {
        let text = `enum ${type.name} {\r\n`;
        const values = type.getValues();
        values.forEach((value, idx) => {
            text += `  ${value.name}${idx < values.length -1 ? "," : ""}\r\n`
        });
        text += "}\r\n";
        return text;
    }
    return type.name;
};

const generateNonNullType = (type: GraphQLNonNull<any>, ctx: IGenerateContext): string => {
    return generateType(type.ofType, ctx);
};

const generateArray = (type: GraphQLList<any>, ctx: IGenerateContext): string => {
    return `${generateType(type.ofType, ctx)}[]`;
};

const generateInterfaceProp = (field: GraphQLField<any, any>, ctx: IGenerateContext): string => {
    let text = "";
    text += `  ${field.name}?: `;
    text += generateType(field.type, { ...ctx, root: false });
    text += ";\r\n";
    return text;
};

const generateInterface = (type: GraphQLObjectType | GraphQLInterfaceType, ctx: IGenerateContext): string => {
    if(ctx.root) {
        let text = "";
        text += `export interface ${type.name}`;
        if(type instanceof GraphQLObjectType) {
            const interfaces = type.getInterfaces();
            if(interfaces && interfaces.length > 0) {
                text += ` extends ${interfaces.map(i => i.name).join(", ")}`;
            }
        }
        text += ` {\r\n`;
        const fields = type.getFields();
        for(const fieldKey in fields) {
            const field = fields[fieldKey];
            text += generateInterfaceProp(field, ctx);
        }
        text += `}\r\n`;
        return text;
    }
    return type.name;
};

const generateType = (type: GraphQLNamedType | GraphQLOutputType, ctx: IGenerateContext): string => {
    if(type instanceof GraphQLNonNull) {
        return generateNonNullType(type, ctx);
    }

    if(type instanceof GraphQLList) {
        return generateArray(type, ctx);
    }

    if(type instanceof GraphQLInterfaceType) {
        return generateInterface(type, ctx);
    }

    if(type instanceof GraphQLObjectType) {
        return generateInterface(type, ctx);
    }
    
    if(type instanceof GraphQLScalarType) {
        return generatePrimitive(type, ctx);
    }

    if(type instanceof GraphQLEnumType) {
        return generateEnum(type, ctx);
    }
};

export const generateTypes = (schema: GraphQLSchema): string => {
    let text = "";
    const ctx = {
        root: true
    };
    const typeMap = schema.getTypeMap();
    for(const key in typeMap) {
        const type = typeMap[key];
        if(type.name && type.name.startsWith("__")) {
            continue;
        }
        text += generateType(type, ctx);
    }

    return text;
};

export const generateTypesFromSource = (schema: string): string => {
    return generateTypes(buildSchema(schema, { assumeValidSDL: true }));
};