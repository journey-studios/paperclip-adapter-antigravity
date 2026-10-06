export interface AgyAgentProfile {
    id: string;
    label: string;
    description?: string;
}
export declare function parseAgyAgentsOutput(output: string): AgyAgentProfile[];
export declare function listAgyAgents(command?: string): Promise<AgyAgentProfile[]>;
//# sourceMappingURL=agents.d.ts.map