export type Lead = {
    name?: string;
    company?: string;
    role?: string;
    phone_or_email?: string;
    need?: string;
    objections?: string;
    score?: number;
    next_step?: string;
};
export declare function book_meeting(payload: {
    name?: string;
    email?: string;
    slotPref?: string;
}): Promise<{
    url: string;
}>;
export declare function send_email({ to, subject, text, html }: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}): Promise<{
    id: string;
}>;
export declare function send_sms(): Promise<void>;
export declare function create_payment_link(): Promise<void>;
export declare function log_lead(lead: Lead): Promise<{
    updatedRange: string;
    rowNumber?: number;
}>;
export declare function lookup_kb({ query }: {
    query: string;
}): Promise<{
    snippets: Array<{
        text: string;
        score: number;
    }>;
}>;
//# sourceMappingURL=tools.d.ts.map