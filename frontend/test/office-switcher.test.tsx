// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import OfficeSwitcher from "../src/components/sidebar/OfficeSwitcher";

describe("OfficeSwitcher Component", () => {
  it("renders locked office badge for standard staff", () => {
    render(<OfficeSwitcher userOfficeCode="OUR" isSectorHead={false} />);
    expect(screen.getByText("Office: OUR")).toBeDefined();
  });

  it("renders sector badge or dropdown for sector heads", () => {
    render(
      <OfficeSwitcher
        userOfficeCode="OVPAA"
        isSectorHead={true}
        childOffices={["OUR", "OSA", "OGS"]}
      />,
    );
    expect(screen.getByText(/Sector: OVPAA/i)).toBeDefined();
  });
});
