// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import WorkspacePayments from "../src/pages/WorkspacePayments";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: {
      id: "mock-cashier-1",
      fullName: "CO Cashier",
      role: "staff",
      office: "cashier",
      department: "CO",
    },
  }),
}));

describe("WorkspacePayments Page", () => {
  it("renders payment tabs and verification table headers", () => {
    render(
      <MemoryRouter>
        <WorkspacePayments />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Payments & Assessment/i)).toBeDefined();
    expect(screen.getByText(/Pending Review/i)).toBeDefined();
    expect(screen.getByText(/Verified/i)).toBeDefined();
  });
});
