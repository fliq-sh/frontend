import { describe, it, expect } from "vitest";
import {
  dailyBurnFromUsage,
  lowBalanceState,
  runwayLabel,
  LOW_RUNWAY_DAYS,
  CRITICAL_RUNWAY_DAYS,
} from "./lowBalance";
import type { UsageSummary } from "./api";

function usage(over: Partial<UsageSummary>): UsageSummary {
  return {
    buckets: [],
    total_job_executions: 0,
    total_buffer_executions: 0,
    balance: 0,
    plan: "paid",
    since_days: 7,
    ...over,
  };
}

describe("dailyBurnFromUsage", () => {
  it("is zero for missing usage", () => {
    expect(dailyBurnFromUsage(null)).toBe(0);
    expect(dailyBurnFromUsage(undefined)).toBe(0);
  });

  it("averages job + buffer executions over the window", () => {
    // 700 total over 7 days = 100/day
    expect(
      dailyBurnFromUsage(usage({ total_job_executions: 600, total_buffer_executions: 100, since_days: 7 })),
    ).toBe(100);
  });

  it("never divides by zero when the window is zero/absent", () => {
    expect(dailyBurnFromUsage(usage({ total_job_executions: 50, since_days: 0 }))).toBe(50);
  });

  it("is zero when nothing was executed", () => {
    expect(dailyBurnFromUsage(usage({ total_job_executions: 0, total_buffer_executions: 0 }))).toBe(0);
  });
});

describe("lowBalanceState", () => {
  it("is critical at or below zero balance regardless of burn", () => {
    expect(lowBalanceState(0, 0).severity).toBe("critical");
    expect(lowBalanceState(-5, 0).severity).toBe("critical");
    expect(lowBalanceState(0, 1000).severity).toBe("critical");
  });

  it("is ok with a positive balance and no recent burn", () => {
    const s = lowBalanceState(10, 0);
    expect(s.severity).toBe("ok");
    expect(s.runwayDays).toBeNull();
  });

  it("is critical when runway is under one day", () => {
    // 50 credits, burning 100/day → 0.5 days
    const s = lowBalanceState(50, 100);
    expect(s.severity).toBe("critical");
    expect(s.runwayDays).toBeCloseTo(0.5);
  });

  it("is low when runway is between the critical and low thresholds", () => {
    // 200 credits, burning 100/day → 2 days (>=1, <3)
    const s = lowBalanceState(200, 100);
    expect(s.severity).toBe("low");
    expect(s.runwayDays).toBeCloseTo(2);
  });

  it("is ok with comfortable runway", () => {
    // 1000 credits, 100/day → 10 days
    expect(lowBalanceState(1000, 100).severity).toBe("ok");
  });

  it("treats the thresholds as exclusive lower bounds", () => {
    // exactly at the low threshold (3 days) is ok, not low
    expect(lowBalanceState(LOW_RUNWAY_DAYS * 100, 100).severity).toBe("ok");
    // exactly at the critical threshold (1 day) is low, not critical
    expect(lowBalanceState(CRITICAL_RUNWAY_DAYS * 100, 100).severity).toBe("low");
  });

  it("handles a null/undefined balance as zero (critical)", () => {
    expect(lowBalanceState(null, 0).severity).toBe("critical");
    expect(lowBalanceState(undefined, 50).severity).toBe("critical");
  });
});

describe("runwayLabel", () => {
  it("is empty for an unknown (null) runway", () => {
    expect(runwayLabel(null)).toBe("");
  });

  it("renders hours under a day", () => {
    expect(runwayLabel(0.5)).toBe("~12 hours left");
    expect(runwayLabel(1 / 24)).toBe("~1 hour left");
  });

  it("renders rounded days at or above a day", () => {
    expect(runwayLabel(2)).toBe("~2 days left");
    expect(runwayLabel(1)).toBe("~1 day left");
    expect(runwayLabel(2.6)).toBe("~3 days left");
  });

  it("renders zero runway plainly", () => {
    expect(runwayLabel(0)).toBe("0 left");
  });
});
