import { IGenerateResult, generateFromSource as generateTypesFromSource } from "./generate.types";

export interface IGenerateOptions {
    moduleName?: string;
}

export interface IGenerateContext extends IGenerateOptions {

}

export const generateFromSource = (source: string, opts?: IGenerateOptions): IGenerateResult[] => {
    const typeResult = generateTypesFromSource(source);
    const r = [typeResult];
    return r;
};