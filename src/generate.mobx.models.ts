import { IGenerateResult, IGenerateOptions as ITypeGenerateOptions, generateTypesFromSource, IGenerators } from "./generate.types";
import { GraphQLObjectType, GraphQLSchema, buildSchema } from "graphql";

export interface IGenerateModelTypeOptions {
    typesModuleName?: string;
}

export const generateModelInterface = (type: GraphQLObjectType): IGenerateResult => {
    return null;
};

export const generateModelImpl = (type: GraphQLObjectType): IGenerateResult => {
    return null;
};

export const generateModelTypes = (schema: GraphQLSchema, opts?: IGenerateModelTypeOptions): IGenerateResult[] => {
    const r = [];
    const typeMap = schema.getTypeMap();
    for(const key in typeMap) {
        const type = typeMap[key];
        if(type.name && type.name.startsWith("__")) {
            continue;
        }
        if(type instanceof GraphQLObjectType) {

        }
    }
    return [];
};

export const generateModelTypesFromSource = (source: string, opts?: IGenerateModelTypeOptions): IGenerateResult[] => {
    return generateModelTypes(buildSchema(source, { assumeValidSDL: true }), opts);
};