export interface ParsedPayment {
  gateway: 'bkash' | 'nagad';
  senderWallet: string;
  amount: number;
  txId: string;
}

/**
 * Parses raw incoming SMS strings from mobile wallet headers (bKash, Nagad)
 * and extracts critical transactional variables (Amount, Sender, TxID).
 * 
 * Enforces strict pattern checks to ensure general alerts, cash-outs, 
 * or merchant payouts are safely discarded.
 * 
 * @param senderRaw Incoming SMS sender header (e.g. "bKash", "Nagad", "BKASH", "bkash")
 * @param rawBody The full SMS text message content
 * @returns ParsedPayment | null Transacted details or null if message is invalid or non-payment
 */
export function parseIncomingSMS(senderRaw: string, rawBody: string): ParsedPayment | null {
  if (!senderRaw || !rawBody) return null;

  const sender = senderRaw.toUpperCase().trim();
  const body = rawBody.replace(/\s+/g, ' ').trim(); // Normalize whitespace

  // 1. bKash "Send Money" Received Pattern
  // Example SMS structure:
  // "You have received Tk 500.00 from 01712345678. Fee Tk 0.00. Balance Tk 10500.00. TrxID 8A4B6C8D9E at 24/05/2026 08:00"
  if (sender.includes('BKASH')) {
    // Regex breakdown:
    // - "You have received Tk" : Starts the payment string
    // - "\s+([\d\.,]+)" : Capture amount (allowing commas and decimals)
    // - "\s+from\s+" : Connecting text
    // - "(01\d{9})" : Capture sender's 11-digit mobile wallet number
    // - ".*?" : Non-greedy match for fees and balances
    // - "TrxID\s+([A-Z0-9]+)" : Capture transaction ID (alphanumeric)
    const bkashRegex = /You have received Tk\s+([\d\.,]+)\s+from\s+(01\d{9})\..*?TrxID\s+([A-Z0-9]+)/i;
    const match = body.match(bkashRegex);
    
    if (match) {
      return {
        gateway: 'bkash',
        amount: parseFloat(match[1].replace(/,/g, '')),
        senderWallet: match[2].trim(),
        txId: match[3].trim().toUpperCase(),
      };
    }
  }

  // 2. Nagad "Send Money" Received Pattern
  // Example SMS structure:
  // "You have received Tk 500.00 from 01912345678. Ref: Book. TxnID: 9B8C7D6E at 2026-05-24 08:00:00.0"
  if (sender.includes('NAGAD')) {
    // Regex breakdown:
    // - "You have received Tk" : Starts the payment string
    // - "\s+([\d\.,]+)" : Capture amount
    // - "\s+from\s+" : Connecting text
    // - "(01\d{9})" : Capture sender wallet number
    // - ".*?" : Non-greedy match
    // - "TxnID:\s+([A-Z0-9]+)" : Capture transaction ID
    const nagadRegex = /You have received Tk\s+([\d\.,]+)\s+from\s+(01\d{9})\..*?TxnID:\s+([A-Z0-9]+)/i;
    const match = body.match(nagadRegex);

    if (match) {
      return {
        gateway: 'nagad',
        amount: parseFloat(match[1].replace(/,/g, '')),
        senderWallet: match[2].trim(),
        txId: match[3].trim().toUpperCase(),
      };
    }
  }

  // Ignored Messages: Cash-In, Cash-Out, Merchant Payment, and general spam alerts.
  return null;
}
