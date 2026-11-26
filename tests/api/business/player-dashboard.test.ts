import { apiRequest } from "../../helpers/api";

/**
 * The player dashboard header shows a "live" timestamp next to a pulsing dot.
 * Nothing on the page reads request data, so a production build prerenders it
 * and every visit shows the time of the build instead of the time of the visit.
 */

const ISO_TIMESTAMP = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/;

const renderedTimestamp = async () => {
  const { status, data } = await apiRequest<string>("/player-dashboard");
  expect(status).toBe(200);
  const match = String(data).match(ISO_TIMESTAMP);
  expect(match).not.toBeNull();
  return match![0];
};

describe("Player dashboard (Business Logic)", () => {
  it("renders the header timestamp on every request", async () => {
    const first = await renderedTimestamp();
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const second = await renderedTimestamp();

    expect(second).not.toBe(first);
  });
});
