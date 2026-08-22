export const HTML_MEDIA_TYPE = 'text/html';
export const MARKDOWN_MEDIA_TYPE = 'text/markdown';

const PRODUCES = [HTML_MEDIA_TYPE, MARKDOWN_MEDIA_TYPE] as const;

interface AcceptEntry {
  position: number;
  quality: number;
  specificity: number;
  type: string;
}

export type NegotiatedMediaType = typeof PRODUCES[number] | null;

export const PAGE_MARKDOWN = {
  '/': `# Undertale Soul Quiz

> An independent, unofficial browser-based fan quiz that compares Determination, Bravery, Justice, Kindness, Patience, Integrity, and Perseverance.

Take 66 original scored statements plus two unscored final checks. The highest exact percentage becomes the Primary Soul, the second-highest becomes the Secondary Virtue, and all seven percentages remain visible.

The interactive quiz requires a browser with JavaScript. Answers, progress, scoring, and generated share images stay in the browser; the site has no account system, application server, or database.

## Seven soul virtues

- **Determination:** Resolve, agency, and continuing through difficulty.
- **Bravery:** Acting through fear and meeting uncertainty directly.
- **Justice:** Fairness, accountability, and choosing what feels right.
- **Kindness:** Care expressed through support and attention to others.
- **Patience:** Pausing, observing, and waiting for the right moment.
- **Integrity:** Consistency between values, choices, and conduct.
- **Perseverance:** Sustained effort through setbacks and repetition.

## Scoring and results

Each response can influence several of the seven dimensions. Scores are normalized, curved, and ranked using exact values before display rounding. Results include a Primary Soul, Secondary Virtue, the full seven-score spread, a Shadow interpretation, a directed Pairing interpretation, and a shareable result image.

The method is consistent but not scientifically validated. Use the result for entertainment and personal reflection, not diagnosis or important decisions.

## Start the quiz

- [Open the interactive Undertale Soul Quiz](https://undertalesoulquiz.com/)

## Site map

- [Credits and source boundaries](https://undertalesoulquiz.com/credits)
- [Privacy and browser-local data](https://undertalesoulquiz.com/privacy)
- [Terms and entertainment disclaimer](https://undertalesoulquiz.com/terms)
- [Contact](https://undertalesoulquiz.com/contact)
- [Agent instructions](https://undertalesoulquiz.com/llms.txt)
- [XML sitemap](https://undertalesoulquiz.com/sitemap.xml)
`,
  '/contact': `# Contact - Undertale Soul Quiz

Contact this independent fan project about feedback, reproducible bugs, accessibility, attribution, ownership, permission, or removal requests.

- Email: [2296744453m@gmail.com](mailto:2296744453m@gmail.com)
- Website: [Undertale Soul Quiz](https://undertalesoulquiz.com/)

Do not send passwords, verification codes, private keys, cookies, or other credentials.
`,
  '/credits': `# Credits - Undertale Soul Quiz

Undertale and its original characters, world, and related intellectual property belong to Toby Fox and their respective rights holders. This website is unofficial and is not affiliated with or endorsed by Toby Fox.

The public reference experience was created by Jaden: [original Undertale soul test](https://undertale.jadenthejaded.uk/). Attribution identifies the reference source; it does not grant permission to copy protected questions, result essays, code, logos, or exclusive artwork.

This site's scoring engine, state machine, persistence layer, interface, share-card renderer, 66 scored questions, two final checks, result summaries, Shadows, Pairings, and special-result text were independently implemented or written for this site.

Rights inquiries: [2296744453m@gmail.com](mailto:2296744453m@gmail.com).
`,
  '/privacy': `# Privacy - Undertale Soul Quiz

Quiz answers, progress, scoring, and share-image generation are processed in the browser. The site has no account system, application server, or database.

Progress is stored in browser LocalStorage so a valid session can survive a refresh. Reset, Start Over, or clearing site storage removes it. Share images are drawn locally with browser Canvas and are not uploaded by this site.

The site does not automatically collect an email address or submit a contact form. If you email [2296744453m@gmail.com](mailto:2296744453m@gmail.com), the sending and receiving email providers handle the message and its metadata.

This version does not include analytics, advertising, tracking cookies, or a Search Console verification tag.
`,
  '/terms': `# Terms - Undertale Soul Quiz

Use this independent fan quiz for entertainment only. Results are fictional and interpretive, not scientific, medical, psychological, legal, employment, or diagnostic advice.

The site is unofficial and is not affiliated with, endorsed by, or sponsored by Toby Fox, Undertale, or the original reference-test creator. Undertale-related names and intellectual property remain with their respective rights holders.

The service may change, interrupt a session, reset incompatible local progress, or become temporarily unavailable. Save any result image you want to keep on your own device.

Rights inquiries: [2296744453m@gmail.com](mailto:2296744453m@gmail.com).
`,
} as const;

export type AgentPagePath = keyof typeof PAGE_MARKDOWN;

export const NOT_FOUND_MARKDOWN = `# 404 - Page not found

That path does not exist on Undertale Soul Quiz.

## Where to look next

- [Home and interactive quiz](https://undertalesoulquiz.com/)
- [Agent instructions and page index](https://undertalesoulquiz.com/llms.txt)
- [XML sitemap](https://undertalesoulquiz.com/sitemap.xml)
`;

export function normalizePagePath(pathname: string): string {
  if (pathname === '/') return pathname;
  return pathname.replace(/\/+$/, '');
}

export function isAgentPagePath(pathname: string): pathname is AgentPagePath {
  return Object.prototype.hasOwnProperty.call(PAGE_MARKDOWN, pathname);
}

export function negotiateMediaType(header: string | null): NegotiatedMediaType {
  if (!header?.trim()) return HTML_MEDIA_TYPE;

  const entries = parseAccept(header);
  if (entries.length === 0) return HTML_MEDIA_TYPE;

  let best: NegotiatedMediaType = null;
  let bestPosition = Number.POSITIVE_INFINITY;
  let bestQuality = -1;

  for (const candidate of PRODUCES) {
    let match: AcceptEntry | null = null;

    for (const entry of entries) {
      if (!matches(entry.type, candidate)) continue;
      if (
        match === null
        || entry.specificity > match.specificity
        || (entry.specificity === match.specificity && entry.position < match.position)
      ) {
        match = entry;
      }
    }

    if (!match || match.quality <= 0) continue;
    if (
      match.quality > bestQuality
      || (match.quality === bestQuality && match.position < bestPosition)
    ) {
      best = candidate;
      bestPosition = match.position;
      bestQuality = match.quality;
    }
  }

  return best;
}

function parseAccept(header: string): AcceptEntry[] {
  return header.split(',').flatMap((raw, position) => {
    const [rawType = '', ...parameters] = raw.trim().split(';');
    const type = rawType.trim().toLowerCase();
    if (!type.includes('/')) return [];

    let quality = 1;
    for (const parameter of parameters) {
      const [rawName = '', rawValue = ''] = parameter.split('=', 2);
      if (rawName.trim().toLowerCase() !== 'q') continue;
      const parsed = Number(rawValue.trim());
      quality = Number.isFinite(parsed) ? Math.max(0, Math.min(1, parsed)) : 0;
    }

    const specificity = type === '*/*' ? 0 : type.endsWith('/*') ? 1 : 2;
    return [{ position, quality, specificity, type }];
  });
}

function matches(range: string, candidate: string): boolean {
  if (range === '*/*') return true;
  if (range.endsWith('/*')) return candidate.startsWith(range.slice(0, -1));
  return range === candidate;
}
