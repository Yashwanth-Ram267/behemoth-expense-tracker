// src/lib/aiCategorize.js

const VENDOR_KEYWORDS = {
  Food: ['swiggy','zomato','dominos','domino','pizza','kfc','mcdonalds','mcdonald','burger','subway','dunkin','starbucks','cafe','restaurant','biryani','hotel','dhaba','haldiram','blinkit','instamart','bigbasket','zepto','dunzo','eat','food','kitchen','bakery','sweet'],
  Transport: ['uber','ola','rapido','namma yatri','yatri','metro','irctc','redbus','bus','train','flight','indigo','spicejet','airindia','air india','petrol','fuel','hp petrol','ioc','shell','parking','fastag','toll'],
  Shopping: ['amazon','flipkart','myntra','ajio','meesho','nykaa','snapdeal','ebay','shopsy','reliance','dmart','bigbazaar','big bazaar','lifestyle','pantaloons','westside','zara','h&m','decathlon','ikea','croma','vijay sales','tata cliq'],
  Entertainment: ['netflix','prime video','hotstar','disney','zee5','sony liv','sonyliv','youtube','spotify','gaana','wynk','bookmyshow','pvr','inox','cinepolis','game','steam','playstation','xbox'],
  Utilities: ['electricity','bescom','tsspdcl','bescom','msedcl','bses','jio','airtel','vi ','vodafone','idea','bsnl','act ','broadband','internet','water','gas','indane','bharat gas','hp gas','lic','insurance','postpaid','prepaid','recharge'],
  Healthcare: ['pharmacy','medplus','apollo','1mg','netmeds','pharmeasy','hospital','clinic','doctor','diagnostic','lab','thyrocare','dr ','health','medical','chemist','medicine'],
  Education: ['udemy','coursera','byju','vedantu','unacademy','course','book','amazon kindle','school','college','tuition','coaching'],
  Travel: ['makemytrip','goibibo','yatra','oyo','treebo','fabhotel','hotel','resort','airbnb','agoda','booking.com','trivago','holiday'],
  Subscription: ['netflix','spotify','prime','hotstar','icloud','google one','dropbox','adobe','microsoft','office 365','linkedin','canva','notion','zoom','slack'],
};

function guessCategory(text) {
  const lower = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(VENDOR_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return cat;
  }
  return 'Other';
}

function guessPaymentMethod(text) {
  const lower = text.toLowerCase();
  if (lower.includes('upi') || lower.includes('gpay') || lower.includes('phonepe') || lower.includes('paytm') || lower.includes('bhim')) return 'UPI';
  if (lower.includes('card') || lower.includes('credit') || lower.includes('debit') || lower.includes('visa') || lower.includes('mastercard')) return 'Card';
  if (lower.includes('netbank') || lower.includes('neft') || lower.includes('rtgs') || lower.includes('imps')) return 'NetBanking';
  if (lower.includes('cash') || lower.includes('atm')) return 'Cash';
  return 'UPI'; // default for India
}

function normalizeDate(dateStr) {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  const parts = dateStr.split(/[\/\-]/);
  if (parts[0].length === 4) return `${parts[0]}-${parts[1]?.padStart(2,'0')}-${parts[2]?.padStart(2,'0')}`;
  // DD/MM/YYYY or DD-MM-YYYY
  const year = parts[2]?.length === 2 ? '20' + parts[2] : parts[2] || new Date().getFullYear();
  return `${year}-${parts[1]?.padStart(2,'0')}-${parts[0]?.padStart(2,'0')}`;
}

function cleanVendorName(raw) {
  return raw
    .replace(/\b(upi|neft|rtgs|imps|ref|no|cr|dr|debit|credit|transfer|payment|paid|to|from|by)\b/gi, '')
    .replace(/\d{6,}/g, '') // remove long numbers
    .replace(/[\/\-_@#*]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ').slice(0, 3).join(' ') // max 3 words
    .trim();
}

// ── CSV Parser ──────────────────────────────────────────────────────────────
export function parseCSVTransactions(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase();
  const cols = header.split(',').map(c => c.replace(/"/g, '').trim());

  // find column indices
  const dateIdx   = cols.findIndex(c => c.includes('date') || c.includes('txn'));
  const descIdx   = cols.findIndex(c => c.includes('narr') || c.includes('desc') || c.includes('particular') || c.includes('detail') || c.includes('remark') || c.includes('ref'));
  const debitIdx  = cols.findIndex(c => c.includes('debit') || c.includes('withdrawal') || c.includes('dr'));
  const creditIdx = cols.findIndex(c => c.includes('credit') || c.includes('deposit') || c.includes('cr'));
  const amtIdx    = cols.findIndex(c => c.includes('amount') && debitIdx === -1);
  const timeIdx   = cols.findIndex(c => c.includes('time'));

  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(c => c.replace(/"/g, '').trim());
    if (row.length < 2) continue;

    // amount: prefer debit column, fallback to amount column
    let amount = 0;
    if (debitIdx >= 0 && row[debitIdx]) {
      amount = parseFloat(row[debitIdx].replace(/[,\s₹]/g, '')) || 0;
    } else if (amtIdx >= 0 && row[amtIdx]) {
      amount = parseFloat(row[amtIdx].replace(/[,\s₹]/g, '')) || 0;
    } else {
      // fallback: find biggest number in row
      const nums = row.map(c => parseFloat(c.replace(/[,\s₹]/g, ''))).filter(n => !isNaN(n) && n > 0);
      amount = nums.length ? Math.max(...nums) : 0;
    }
    if (amount <= 0) continue; // skip credits/zero rows

    const rawDesc = descIdx >= 0 ? row[descIdx] : row.join(' ');
    const vendor  = cleanVendorName(rawDesc) || 'Unknown';
    const dateRaw = dateIdx >= 0 ? row[dateIdx] : '';
    const dateMatch = dateRaw.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(\d{4}[\/\-]\d{2}[\/\-]\d{2})/);
    const date = dateMatch ? normalizeDate(dateMatch[0]) : normalizeDate('');
    const timeRaw = timeIdx >= 0 ? row[timeIdx] : '';
    const timeMatch = (timeRaw || rawDesc).match(/\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?/i);
    const time = timeMatch ? timeMatch[0].slice(0, 5) : null;

    results.push({
      vendor,
      amount,
      date,
      time,
      category: guessCategory(rawDesc + ' ' + vendor),
      paymentMethod: guessPaymentMethod(rawDesc),
      raw: rawDesc,
    });
  }
  return results;
}

// ── Plain text / SMS / screenshot text parser ────────────────────────────────
export function parseRawText(text) {
  const results = [];
  const lines = text.split('\n').filter(Boolean);

  // Pattern: amount then vendor OR vendor then amount
  const txnPattern = /(?:paid|sent|debited|spent|rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:to|at|for|@)?\s*([a-zA-Z][a-zA-Z0-9 &._-]{1,40})/gi;
  const altPattern = /([a-zA-Z][a-zA-Z0-9 &._-]{2,30})\s*(?:rs\.?|inr|₹|-)\s*([\d,]+(?:\.\d{1,2})?)/gi;
  const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(\d{4}[\/\-]\d{2}[\/\-]\d{2})/;
  const timePattern = /\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?/i;

  const fullText = text;
  let match;

  while ((match = txnPattern.exec(fullText)) !== null) {
    const amount = parseFloat(match[1].replace(/,/g, ''));
    const vendor = cleanVendorName(match[2]);
    if (amount > 0 && vendor) {
      const dMatch = fullText.slice(Math.max(0, match.index-50), match.index+100).match(datePattern);
      const tMatch = fullText.slice(Math.max(0, match.index-50), match.index+100).match(timePattern);
      results.push({
        vendor,
        amount,
        date: dMatch ? normalizeDate(dMatch[0]) : new Date().toISOString().split('T')[0],
        time: tMatch ? tMatch[0].slice(0,5) : null,
        category: guessCategory(match[0] + ' ' + vendor),
        paymentMethod: guessPaymentMethod(match[0]),
        raw: match[0],
      });
    }
  }

  if (results.length === 0) {
    while ((match = altPattern.exec(fullText)) !== null) {
      const vendor = cleanVendorName(match[1]);
      const amount = parseFloat(match[2].replace(/,/g, ''));
      if (amount > 0 && vendor && vendor.length > 1) {
        results.push({
          vendor,
          amount,
          date: new Date().toISOString().split('T')[0],
          time: null,
          category: guessCategory(match[0] + ' ' + vendor),
          paymentMethod: guessPaymentMethod(match[0]),
          raw: match[0],
        });
      }
    }
  }

  return results;
}

// ── Main entry point ─────────────────────────────────────────────────────────
export async function categorizeTransaction(text, fileType) {
  try {
    let results = [];

    if (fileType === 'csv') {
      results = parseCSVTransactions(text);
    } else {
      // Try raw text parsing for images/PDFs/SMS text
      results = parseRawText(text);
    }

    if (results.length > 0) return results;
    return null;
  } catch (err) {
    console.error('Parsing failed:', err);
    return null;
  }
}

export function matchVendorRule(vendorName, vendorRules) {
  const lower = vendorName.toLowerCase();
  for (const rule of vendorRules) {
    if (lower.includes(rule.keyword.toLowerCase())) return rule;
  }
  return null;
}
