// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import WorkspaceQueue from "../src/pages/WorkspaceQueue";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "mock-staff-1", fullName: "OUR Staff", role: "staff", office: "registrar", department: "OUR" },
  }),
}));

describe("WorkspaceQueue Page", () => {
  it("renders status filter tabs", () => {
    render(
      <MemoryRouter>
        <WorkspaceQueue />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Pending Evaluation/i)).toBeDefined();
    expect(screen.getByText(/In Processing/i)).toBeDefined();
    expect(screen.getByText(/Action Required/i)).toBeDefined();
    expect(screen.getByText(/Ready/i)).toBeDefined();
  });
});
