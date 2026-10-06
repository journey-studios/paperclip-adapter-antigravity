export interface SandboxCallbackBridgeBody {
    body: string;
    /** Omitted by older queue peers, whose bodies are UTF-8 text. */
    bodyEncoding?: "utf8" | "base64";
}
/** JSON can escape each input byte as six characters. Metadata is bounded too. */
export declare function sandboxBridgeEnvelopeLimit(maxBodyBytes: number): number;
export declare function encodeSandboxBridgeBody(body: string | Buffer, maxBodyBytes: number): SandboxCallbackBridgeBody;
/** Self-contained so the same decoder can be embedded in the remote gateway. */
export declare function decodeSandboxBridgeBody(envelope: SandboxCallbackBridgeBody, maxBodyBytes: number): Buffer;
export declare function sandboxBridgeBodyCodecSource(): string;
//# sourceMappingURL=sandbox-callback-bridge-body.d.ts.map