// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import AppSidebar from "../src/components/sidebar/AppSidebar";
import { SidebarProvider } from "../src/components/ui/sidebar";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "mock-staff-1", fullName: "OUR Clerk", role: "staff", email: "staff@tup.edu.ph" },
  }),
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe("AppSidebar Navigation", () => {
  it("renders workspace queues for staff users", () => {
    render(
      <MemoryRouter>
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText(/Review Queue/i)).toBeDefined();
    expect(screen.getByText(/Clearance Sign-Offs/i)).toBeDefined();
    expect(screen.getByText(/Payments/i)).toBeDefined();
  });
});
