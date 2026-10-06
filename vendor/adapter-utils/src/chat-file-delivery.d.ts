export interface PaperclipChatFilePreparationDelivery {
    readonly provider: "slack" | "github" | "discord" | "microsoft-teams" | "telegram" | "imessage-photon" | null;
    readonly mode: "provider_attachment" | "paperclip_task_only" | "unknown";
    readonly preparationState: "prepared";
    readonly providerDeliveryConfirmed: false;
    readonly guidance: string;
}
/** Describe the transport contract, never a delivery receipt or new authority. */
export declare function paperclipChatFilePreparationDelivery(authenticatedProvider: unknown): PaperclipChatFilePreparationDelivery;
//# sourceMappingURL=chat-file-delivery.d.ts.map