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
export declare function appendLead(lead: Lead): Promise<{
    updatedRange: string;
    rowNumber: number | undefined;
}>;
//# sourceMappingURL=sheets.d.ts.map