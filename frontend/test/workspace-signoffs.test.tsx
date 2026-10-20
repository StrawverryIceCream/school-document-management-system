// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import WorkspaceSignoffs from "../src/pages/WorkspaceSignoffs";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: {
      id: "mock-staff-col",
      fullName: "COE Dean",
      role: "staff",
      office: "coe",
      department: "COE",
    },
  }),
}));

describe("WorkspaceSignoffs Page", () => {
  it("renders clearance tabs and action headers", () => {
    render(
      <MemoryRouter>
        <WorkspaceSignoffs />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Clearance & Sign-Offs/i)).toBeDefined();
    expect(screen.getByText(/Pending Sign-Offs/i)).toBeDefined();
    expect(screen.getByText(/Deficiencies/i)).toBeDefined();
  });
});
