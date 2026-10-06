/** Standalone source is staged unchanged on local, SSH, and sandbox runtimes. No secrets in files. */
export declare function githubLauncherSource(): string;
/** Override inherited credentials even when adapters merge the host environment later. */
export declare function githubBrokerEnvironment(input: Record<string, unknown>, broker: {
    url: string;
    token: string;
}): Record<string, string>;
//# sourceMappingURL=github-launcher.d.ts.map