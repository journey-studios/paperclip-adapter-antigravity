export declare function parseAgyModelsOutput(output: string): {
    id: string;
    label: string;
}[];
export declare function listAgyModels(command?: string): Promise<{
    id: string;
    label: string;
}[]>;
export declare function inferModelProvider(model: string): string;
//# sourceMappingURL=models.d.ts.map