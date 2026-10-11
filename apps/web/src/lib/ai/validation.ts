const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function collectEvidenceIds(
  value: unknown,
  results = new Set<string>(),
): Set<string> {
  if (typeof value === "string" && uuidPattern.test(value)) results.add(value);
  else if (Array.isArray(value))
    value.forEach((item) => collectEvidenceIds(item, results));
  else if (value && typeof value === "object")
    Object.values(value).forEach((item) => collectEvidenceIds(item, results));
  return results;
}

export function unexpectedEvidenceIds(
  output: unknown,
  allowedEvidenceIds: readonly string[],
) {
  const allowed = new Set(allowedEvidenceIds);
  return [...collectEvidenceIds(output)].filter((id) => !allowed.has(id));
}
