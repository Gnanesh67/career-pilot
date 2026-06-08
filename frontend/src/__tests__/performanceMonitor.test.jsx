import {
  startMeasure,
  endMeasure,
  getMetrics,
  clearMetrics,
} from "../utils/performanceMonitor";

describe("performanceMonitor", () => {
  beforeEach(() => {
    clearMetrics();
  });

  test("starts measurement successfully", () => {
    expect(startMeasure("render")).toBe(true);
  });

  test("returns false for invalid label", () => {
    expect(startMeasure()).toBe(false);
  });

  test("ends measurement and returns duration", () => {
    startMeasure("load");

    const duration = endMeasure("load");

    expect(duration).not.toBeNull();
  });

  test("stores metrics", () => {
    startMeasure("test");
    endMeasure("test");

    const metrics = getMetrics();

    expect(metrics).toHaveProperty("test");
  });

  test("clears metrics", () => {
    startMeasure("cleanup");
    endMeasure("cleanup");

    clearMetrics();

    expect(Object.keys(getMetrics())).toHaveLength(0);
  });

  test("clears only tracked performance labels", () => {
    startMeasure("scoped");
    endMeasure("scoped");

    const originalPerformance = global.performance;
    const clearMarksSpy = jest.fn();
    const clearMeasuresSpy = jest.fn();

    Object.defineProperty(global, "performance", {
      configurable: true,
      writable: true,
      value: {
        clearMarks: clearMarksSpy,
        clearMeasures: clearMeasuresSpy,
      },
    });

    try {
      clearMetrics();

      expect(clearMarksSpy).toHaveBeenCalledWith("scoped-start");
      expect(clearMarksSpy).toHaveBeenCalledWith("scoped-end");
      expect(clearMeasuresSpy).toHaveBeenCalledWith("scoped");
      expect(clearMarksSpy).not.toHaveBeenCalledWith();
      expect(clearMeasuresSpy).not.toHaveBeenCalledWith();
    } finally {
      Object.defineProperty(global, "performance", {
        configurable: true,
        writable: true,
        value: originalPerformance,
      });
    }
  });
});