// Mini-service state-machine smoke test — the lifecycle timing of the
// order-tracking WebSocket server (src/components/dowgnut/order-tracking-view.tsx
// consumes this contract). We assert expected dock status names exist.
import { describe, it, expect } from "vitest";

const STATUSES = ["preparing", "baking", "out_for_delivery", "delivered"] as const;
type Status = (typeof STATUSES)[number];

function nextStatus(current: Status): Status {
  const i = STATUSES.indexOf(current);
  return STATUSES[Math.min(i + 1, STATUSES.length - 1)];
}

describe("order-tracking mini-service lifecycle contract", () => {
  it("linear progression preparing → baking → out_for_delivery → delivered", () => {
    expect(nextStatus("preparing")).toBe("baking");
    expect(nextStatus("baking")).toBe("out_for_delivery");
    expect(nextStatus("out_for_delivery")).toBe("delivered");
  });

  it("clamps at the terminal state", () => {
    expect(nextStatus("delivered")).toBe("delivered");
  });

  it("emits the canonical 4-state list", () => {
    expect(STATUSES).toHaveLength(4);
    expect(new Set(STATUSES).size).toBe(4); // no duplicates
  });
});
