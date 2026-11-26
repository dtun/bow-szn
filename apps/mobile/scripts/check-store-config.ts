import config from "../store.config.json" with { type: "json" };

type Unit = "chars" | "bytes";

type Result = { ok: boolean; label: string };

const LIMITS = [
  { field: "title", max: 30, unit: "chars" },
  { field: "subtitle", max: 30, unit: "chars" },
  { field: "keywords", max: 100, unit: "bytes" },
  { field: "promoText", max: 170, unit: "chars" },
  { field: "description", max: 4000, unit: "chars" },
  { field: "releaseNotes", max: 4000, unit: "chars" },
] as const;

const EMAIL = /[^\s@"]+@[^\s@"]+\.[a-z]{2,}/gi;

const URL_PREFIX = /^[a-z][a-z0-9+.-]*:\/\//i;

function stringsIn(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.flatMap(stringsIn);
  }
  if (value !== null && typeof value === "object") {
    return Object.values(value).flatMap(stringsIn);
  }
  return [];
}

function measure(text: string, unit: Unit): number {
  return unit === "bytes" ? Buffer.byteLength(text, "utf8") : [...text].length;
}

function checkLimits(): Result[] {
  return Object.entries(config.apple.info).flatMap(([locale, info]) =>
    LIMITS.map(({ field, max, unit }) => {
      let value: string | string[] = info[field];
      let text = Array.isArray(value) ? value.join(",") : value;
      let size = measure(text, unit);
      return { ok: size <= max, label: `${locale} ${field} is ${size}/${max} ${unit}` };
    })
  );
}

function checkKeywordSpacing(): Result[] {
  return Object.entries(config.apple.info).map(([locale, info]) => {
    let padded = info.keywords.filter((word) => word !== word.trim() || word.includes(","));
    return {
      ok: padded.length === 0,
      label: `${locale} keywords have no spaces around commas${padded.length === 0 ? "" : `: ${padded.join(" | ")}`}`,
    };
  });
}

function checkNoEmail(source: string, text: string): Result {
  let found = text.match(EMAIL) ?? [];
  return {
    ok: found.length === 0,
    label: `${source} has no email address${found.length === 0 ? "" : `: ${found.join(", ")}`}`,
  };
}

async function checkUrl(url: string): Promise<Result[]> {
  if (!url.startsWith("https://")) {
    return [{ ok: false, label: `${url} is not https` }];
  }
  try {
    let response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(15000) });
    let body = await response.text();
    return [
      { ok: response.status === 200, label: `${url} returns ${response.status}` },
      checkNoEmail(url, body),
    ];
  } catch (error) {
    return [{ ok: false, label: `${url} failed: ${String(error)}` }];
  }
}

async function main(): Promise<void> {
  let strings = stringsIn(config);
  let urls = [...new Set(strings.filter((text) => URL_PREFIX.test(text)))];
  let results = [
    ...checkLimits(),
    ...checkKeywordSpacing(),
    checkNoEmail("store.config.json", strings.join("\n")),
    ...(await Promise.all(urls.map(checkUrl))).flat(),
  ];
  for (let result of results) {
    console.log(`${result.ok ? "ok  " : "FAIL"}  ${result.label}`);
  }
  let failures = results.filter((result) => !result.ok).length;
  console.log(
    failures === 0
      ? `store:check passed ${results.length} checks`
      : `store:check failed ${failures} of ${results.length} checks`
  );
  process.exitCode = failures === 0 ? 0 : 1;
}

await main();
