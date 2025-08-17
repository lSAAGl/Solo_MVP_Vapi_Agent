import { google } from 'googleapis';

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

function normalizePrivateKey(raw?: string): string | undefined {
  if (!raw) return undefined;
  // Support keys that come with literal \n in .env files
  return raw.replace(/\\n/g, '\n');
}

export async function appendLead(lead: Lead) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.GOOGLE_PRIVATE_KEY);

  if (!spreadsheetId) throw new Error('GOOGLE_SHEETS_ID missing');
  if (!clientEmail) throw new Error('GOOGLE_SERVICE_ACCOUNT_EMAIL missing');
  if (!privateKey) throw new Error('GOOGLE_PRIVATE_KEY missing');

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Ensure header row exists by reading first row; if empty, we still append — user should add headers manually.
  const timestamp = new Date().toISOString();
  const row = [
    timestamp,
    lead.name ?? '',
    lead.company ?? '',
    lead.role ?? '',
    lead.phone_or_email ?? '',
    lead.need ?? '',
    lead.objections ?? '',
    typeof lead.score === 'number' ? lead.score : '',
    lead.next_step ?? '',
  ];

  const range = 'Leads!A:A'; // append to the "Leads" tab
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  });

  const updatedRange = res.data.updates?.updatedRange || '';
  const updatedRows = res.data.updates?.updatedRows || 0;
  if (!updatedRange || !updatedRows) {
    throw new Error('Append failed (no updatedRange/updatedRows)');
  }
  // Try to parse the row number from the updated range (e.g., "Leads!A5:I5")
  const match = updatedRange.match(/!(?:[A-Z]+)(\d+):/);
  const rowNumber = match ? Number(match[1]) : undefined;

  return { updatedRange, rowNumber };
}
