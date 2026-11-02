export type ProjectionScenario = "cautious" | "baseline" | "accelerated";

export type ProjectionInputs = {
  currentReadiness: number;
  currentEvidence: number;
  horizonMonths: 6 | 12 | 18 | 24 | 36;
  monthlyReadinessGain: number;
  evidencePerQuarter: number;
  milestoneReliability: number;
};

export type ProjectionPoint = {
  month: number;
  readiness: number;
  lowerReadiness: number;
  upperReadiness: number;
  evidence: number;
};

export const projectionPresets: Record<
  ProjectionScenario,
  Pick<ProjectionInputs, "monthlyReadinessGain" | "evidencePerQuarter" | "milestoneReliability">
> = {
  cautious: {
    monthlyReadinessGain: 0.6,
    evidencePerQuarter: 1,
    milestoneReliability: 45,
  },
  baseline: {
    monthlyReadinessGain: 1.25,
    evidencePerQuarter: 3,
    milestoneReliability: 65,
  },
  accelerated: {
    monthlyReadinessGain: 2,
    evidencePerQuarter: 5,
    milestoneReliability: 82,
  },
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function calculateProjection(inputs: ProjectionInputs) {
  const points: ProjectionPoint[] = [];
  const uncertaintyPerMonth = 0.32 + (100 - inputs.milestoneReliability) / 260;

  for (let month = 0; month <= inputs.horizonMonths; month += 3) {
    const taper = 1 - (inputs.currentReadiness / 100) * 0.38;
    const projectedGain = month * inputs.monthlyReadinessGain * taper;
    const readiness = clamp(inputs.currentReadiness + projectedGain, 0, 96);
    const uncertainty = month * uncertaintyPerMonth;
    points.push({
      month,
      readiness: Math.round(readiness),
      lowerReadiness: Math.round(clamp(readiness - uncertainty, 0, 96)),
      upperReadiness: Math.round(clamp(readiness + uncertainty, 0, 96)),
      evidence: Math.round(
        inputs.currentEvidence + (month / 3) * inputs.evidencePerQuarter,
      ),
    });
  }

  const final = points.at(-1)!;
  const projectedMilestones = Math.max(
    1,
    Math.round((inputs.horizonMonths / 6) * (inputs.milestoneReliability / 100)),
  );
  const confidence =
    inputs.currentEvidence >= 18 && inputs.milestoneReliability >= 70
      ? "Stronger evidence base"
      : inputs.currentEvidence >= 11 && inputs.milestoneReliability >= 50
        ? "Developing evidence base"
        : "Early evidence base";

  return {
    points,
    final,
    projectedMilestones,
    confidence,
    readinessGain: final.readiness - inputs.currentReadiness,
    evidenceGain: final.evidence - inputs.currentEvidence,
  };
}

export const PROJECTION_MODEL_VERSION = "2026.2";
export const DEFAULT_SIMULATION_COUNT = 10_000;

export type MetricCategory =
  | "revenue"
  | "active_customers"
  | "retention"
  | "gross_margin"
  | "cash_runway"
  | "product_milestone"
  | "readiness"
  | "evidence_coverage"
  | "custom";

export type MetricDirection = "increase" | "decrease";
export type MetricUnit =
  | "php"
  | "count"
  | "percent"
  | "months"
  | "score"
  | "custom";

export type GoalObservation = {
  value: number;
  observedOn: string;
  verified: boolean;
  evidenceLinked: boolean;
};

export type GoalProjectionInput = {
  goalId?: string;
  asOfDate: string;
  dueDate: string;
  baselineValue: number;
  targetValue: number;
  direction: MetricDirection;
  unit: MetricUnit;
  scenario: ProjectionScenario;
  expectedMonthlyChange: number;
  monthlyVolatility: number;
  cadence: "weekly" | "monthly" | "quarterly";
  observations: GoalObservation[];
  simulationCount?: number;
};

export type GoalForecastPoint = {
  month: number;
  date: string;
  p10: number;
  p50: number;
  p90: number;
};

export type GoalProjectionResult = {
  modelVersion: typeof PROJECTION_MODEL_VERSION;
  inputKind: "assumption_based" | "data_backed";
  probability: number;
  confidence: number;
  status: "on_track" | "watch" | "at_risk";
  horizonMonths: number;
  trendPerMonth: number;
  volatilityPerMonth: number;
  expectedTargetDate: string | null;
  forecast: GoalForecastPoint[];
  actuals: Array<{ date: string; value: number; verified: boolean }>;
  sensitivity: Record<ProjectionScenario, number>;
  drivers: string[];
  limitations: string[];
  inputHash: string;
};

const scenarioTrendMultipliers: Record<ProjectionScenario, number> = {
  cautious: 0.65,
  baseline: 1,
  accelerated: 1.35,
};

const MS_PER_DAY = 86_400_000;
const DAYS_PER_MONTH = 30.4375;

function parseUtcDate(value: string) {
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(timestamp)) throw new Error("A projection date is invalid.");
  return timestamp;
}

function toDateString(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function monthsBetween(from: number, to: number) {
  const start = new Date(from);
  const end = new Date(to);
  let months =
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    end.getUTCMonth() -
    start.getUTCMonth();
  const monthBoundary = Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth() + months,
    start.getUTCDate(),
  );
  if (monthBoundary < to) months += 1;
  return Math.max(1, months);
}

function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function percentile(sorted: number[], ratio: number) {
  if (!sorted.length) return 0;
  const position = (sorted.length - 1) * ratio;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

function round(value: number, precision = 2) {
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableSerialize(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function hashInput(value: unknown) {
  const serialized = stableSerialize(value);
  let first = 0x811c9dc5;
  let second = 0x9e3779b9;
  for (let index = 0; index < serialized.length; index += 1) {
    const code = serialized.charCodeAt(index);
    first = Math.imul(first ^ code, 0x01000193);
    second = Math.imul(second ^ code, 0x85ebca6b);
  }
  return `${(first >>> 0).toString(16).padStart(8, "0")}${(second >>> 0)
    .toString(16)
    .padStart(8, "0")}`;
}

function seededRandom(seedText: string) {
  let seed = Number.parseInt(seedText.slice(0, 8), 16) || 1;
  return () => {
    seed += 0x6d2b79f5;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function gaussian(random: () => number) {
  const left = Math.max(random(), Number.EPSILON);
  const right = Math.max(random(), Number.EPSILON);
  return Math.sqrt(-2 * Math.log(left)) * Math.cos(2 * Math.PI * right);
}

function constrainMetric(value: number, unit: MetricUnit) {
  if (unit === "percent" || unit === "score") return clamp(value, 0, 100);
  if (["php", "count", "months"].includes(unit)) return Math.max(0, value);
  return value;
}

function robustMonthlyTrend(observations: GoalObservation[]) {
  const ordered = [...observations].sort(
    (left, right) => parseUtcDate(left.observedOn) - parseUtcDate(right.observedOn),
  );
  const slopes: number[] = [];
  for (let left = 0; left < ordered.length; left += 1) {
    for (let right = left + 1; right < ordered.length; right += 1) {
      const elapsedMonths =
        (parseUtcDate(ordered[right].observedOn) -
          parseUtcDate(ordered[left].observedOn)) /
        MS_PER_DAY /
        DAYS_PER_MONTH;
      if (elapsedMonths > 0)
        slopes.push((ordered[right].value - ordered[left].value) / elapsedMonths);
    }
  }
  return median(slopes);
}

function residualVolatility(observations: GoalObservation[], trend: number) {
  if (observations.length < 3) return 0;
  const ordered = [...observations].sort(
    (left, right) => parseUtcDate(left.observedOn) - parseUtcDate(right.observedOn),
  );
  const firstDate = parseUtcDate(ordered[0].observedOn);
  const residuals = ordered.map((observation) => {
    const elapsed =
      (parseUtcDate(observation.observedOn) - firstDate) / MS_PER_DAY / DAYS_PER_MONTH;
    return observation.value - (ordered[0].value + trend * elapsed);
  });
  const center = median(residuals);
  return median(residuals.map((value) => Math.abs(value - center))) * 1.4826;
}

function confidenceScore(
  observations: GoalObservation[],
  asOfTimestamp: number,
  cadence: GoalProjectionInput["cadence"],
  dataBacked: boolean,
) {
  if (!observations.length) return 0;
  const verified = observations.filter((item) => item.verified);
  const evidenceScore = verified.length
    ? (verified.filter((item) => item.evidenceLinked).length / verified.length) * 30
    : 0;
  const countScore = Math.min(20, (verified.length / 6) * 20);
  const timestamps = verified.map((item) => parseUtcDate(item.observedOn));
  const spanDays = timestamps.length
    ? (Math.max(...timestamps) - Math.min(...timestamps)) / MS_PER_DAY
    : 0;
  const spanScore = Math.min(20, (spanDays / 180) * 20);
  const recencyDays = timestamps.length
    ? Math.max(0, (asOfTimestamp - Math.max(...timestamps)) / MS_PER_DAY)
    : Number.POSITIVE_INFINITY;
  const recencyScore = recencyDays <= 30 ? 15 : recencyDays <= 90 ? 8 : 0;
  const cadenceDays = cadence === "weekly" ? 7 : cadence === "monthly" ? 30 : 91;
  const expected = spanDays ? Math.floor(spanDays / cadenceDays) + 1 : 1;
  const completenessScore = Math.min(15, (verified.length / expected) * 15);
  const score = Math.round(
    evidenceScore + countScore + spanScore + recencyScore + completenessScore,
  );
  return dataBacked ? clamp(score, 0, 100) : Math.min(score, 39);
}

function hasReached(value: number, target: number, direction: MetricDirection) {
  return direction === "increase" ? value >= target : value <= target;
}

type SimulationSummary = {
  probability: number;
  forecast: GoalForecastPoint[];
  expectedTargetDate: string | null;
};

function simulatePaths({
  startValue,
  trend,
  volatility,
  direction,
  unit,
  target,
  horizonMonths,
  asOfTimestamp,
  simulationCount,
  seed,
}: {
  startValue: number;
  trend: number;
  volatility: number;
  direction: MetricDirection;
  unit: MetricUnit;
  target: number;
  horizonMonths: number;
  asOfTimestamp: number;
  simulationCount: number;
  seed: string;
}): SimulationSummary {
  const random = seededRandom(seed);
  const monthlyValues = Array.from({ length: horizonMonths + 1 }, () =>
    [] as number[],
  );
  let successes = 0;
  for (let run = 0; run < simulationCount; run += 1) {
    let value = startValue;
    monthlyValues[0].push(value);
    for (let month = 1; month <= horizonMonths; month += 1) {
      value = constrainMetric(value + trend + gaussian(random) * volatility, unit);
      monthlyValues[month].push(value);
    }
    if (hasReached(value, target, direction)) successes += 1;
  }
  const forecast = monthlyValues.map((values, month) => {
    values.sort((left, right) => left - right);
    return {
      month,
      date: toDateString(asOfTimestamp + month * DAYS_PER_MONTH * MS_PER_DAY),
      p10: round(percentile(values, 0.1)),
      p50: round(percentile(values, 0.5)),
      p90: round(percentile(values, 0.9)),
    };
  });
  const expected = forecast.find((point) =>
    hasReached(point.p50, target, direction),
  );
  return {
    probability: Math.round((successes / simulationCount) * 100),
    forecast,
    expectedTargetDate: expected?.date ?? null,
  };
}

export function calculateGoalProjection(
  input: GoalProjectionInput,
): GoalProjectionResult {
  const numericValues = [
    input.baselineValue,
    input.targetValue,
    input.expectedMonthlyChange,
    input.monthlyVolatility,
    ...input.observations.map((item) => item.value),
  ];
  if (numericValues.some((value) => !Number.isFinite(value)))
    throw new Error("Projection values must be finite numbers.");
  if (input.monthlyVolatility < 0)
    throw new Error("Monthly volatility cannot be negative.");
  if (
    ["php", "count", "months", "percent", "score"].includes(input.unit) &&
    numericValues.some((value, index) => index !== 2 && value < 0)
  )
    throw new Error("This metric cannot contain negative values.");
  const boundedValues = [
    input.baselineValue,
    input.targetValue,
    ...input.observations.map((item) => item.value),
  ];
  if (
    ["percent", "score"].includes(input.unit) &&
    boundedValues.some((value) => value > 100)
  )
    throw new Error("Percentage and score metrics must remain within 0 to 100.");
  if (
    (input.direction === "increase" && input.targetValue <= input.baselineValue) ||
    (input.direction === "decrease" && input.targetValue >= input.baselineValue)
  )
    throw new Error("The goal target must follow the metric direction.");

  const asOfTimestamp = parseUtcDate(input.asOfDate);
  const dueTimestamp = parseUtcDate(input.dueDate);
  if (dueTimestamp <= asOfTimestamp)
    throw new Error("The projection due date must be after the as-of date.");
  const horizonMonths = monthsBetween(asOfTimestamp, dueTimestamp);
  if (horizonMonths > 60)
    throw new Error("Projection horizons cannot exceed 60 months.");

  const ordered = [...input.observations].sort(
    (left, right) => parseUtcDate(left.observedOn) - parseUtcDate(right.observedOn),
  );
  if (ordered.some((item) => parseUtcDate(item.observedOn) > asOfTimestamp))
    throw new Error("Actual observations cannot be dated after the projection as-of date.");
  const verified = ordered.filter((item) => item.verified);
  const uniqueVerifiedDates = new Set(verified.map((item) => item.observedOn));
  if (uniqueVerifiedDates.size !== verified.length)
    throw new Error("Verified observations cannot use duplicate dates.");
  const verifiedSpanDays =
    verified.length > 1
      ? (parseUtcDate(verified.at(-1)!.observedOn) -
          parseUtcDate(verified[0].observedOn)) /
        MS_PER_DAY
      : 0;
  const dataBacked = verified.length >= 3 && verifiedSpanDays >= 60;
  const baseTrend = dataBacked
    ? robustMonthlyTrend(verified)
    : input.expectedMonthlyChange;
  const confidence = confidenceScore(
    ordered,
    asOfTimestamp,
    input.cadence,
    dataBacked,
  );
  const observedVolatility = dataBacked
    ? residualVolatility(verified, baseTrend)
    : 0;
  const uncertaintyMultiplier = 1 + (100 - confidence) / 100;
  const volatility =
    Math.max(input.monthlyVolatility, observedVolatility) * uncertaintyMultiplier;
  const lastObservation = ordered.filter(
    (item) => parseUtcDate(item.observedOn) <= asOfTimestamp,
  ).at(-1);
  const startValue = lastObservation?.value ?? input.baselineValue;
  const simulationCount = Math.round(
    clamp(input.simulationCount ?? DEFAULT_SIMULATION_COUNT, 500, 20_000),
  );
  const normalizedInput = {
    ...input,
    simulationCount,
    observations: ordered,
    modelVersion: PROJECTION_MODEL_VERSION,
  };
  const inputHash = hashInput(normalizedInput);
  const scenarioResults = {} as Record<ProjectionScenario, SimulationSummary>;
  for (const scenario of ["cautious", "baseline", "accelerated"] as const) {
    const directionalTrend =
      baseTrend * scenarioTrendMultipliers[scenario] ||
      input.expectedMonthlyChange * scenarioTrendMultipliers[scenario];
    scenarioResults[scenario] = simulatePaths({
      startValue,
      trend: directionalTrend,
      volatility,
      direction: input.direction,
      unit: input.unit,
      target: input.targetValue,
      horizonMonths,
      asOfTimestamp,
      simulationCount,
      seed: `${inputHash}${scenario}`,
    });
  }
  const selected = scenarioResults[input.scenario];
  const selectedTrend = baseTrend * scenarioTrendMultipliers[input.scenario];
  const limitations = [
    dataBacked
      ? "This likelihood extrapolates verified operating history; it is not a guarantee."
      : "This likelihood is assumption-based until three verified observations span at least 60 days.",
    "Unexpected market, financing, team, and regulatory changes are not predicted.",
    "The result estimates one declared goal, not company survival or investment return.",
  ];
  const drivers = [
    `${round(selectedTrend)} ${input.unit} expected change per month in the selected scenario.`,
    `${verified.length} verified observation${verified.length === 1 ? "" : "s"} across ${Math.round(verifiedSpanDays)} days.`,
    `${confidence}/100 data confidence widens or narrows the forecast range.`,
  ];
  return {
    modelVersion: PROJECTION_MODEL_VERSION,
    inputKind: dataBacked ? "data_backed" : "assumption_based",
    probability: selected.probability,
    confidence,
    status:
      selected.probability >= 70
        ? "on_track"
        : selected.probability >= 40
          ? "watch"
          : "at_risk",
    horizonMonths,
    trendPerMonth: round(selectedTrend),
    volatilityPerMonth: round(volatility),
    expectedTargetDate: selected.expectedTargetDate,
    forecast: selected.forecast,
    actuals: ordered.map((item) => ({
      date: item.observedOn,
      value: item.value,
      verified: item.verified,
    })),
    sensitivity: {
      cautious: scenarioResults.cautious.probability,
      baseline: scenarioResults.baseline.probability,
      accelerated: scenarioResults.accelerated.probability,
    },
    drivers,
    limitations,
    inputHash,
  };
}

export function calculatePortfolioLikelihood(
  goals: Array<{ probability: number; weight: number }>,
) {
  if (!goals.length) return null;
  if (
    goals.some(
      (goal) =>
        !Number.isFinite(goal.probability) ||
        !Number.isFinite(goal.weight) ||
        goal.probability < 0 ||
        goal.probability > 100 ||
        goal.weight <= 0,
    )
  )
    throw new Error("Portfolio goals contain an invalid probability or weight.");
  const totalWeight = goals.reduce((sum, goal) => sum + goal.weight, 0);
  if (Math.abs(totalWeight - 100) > 0.001)
    throw new Error("Active goal weights must total 100.");
  return Math.round(
    goals.reduce((sum, goal) => sum + goal.probability * goal.weight, 0) /
      totalWeight,
  );
}
