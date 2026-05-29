import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  it("renders with children", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("applies destructive variant class", () => {
    render(<Badge variant="destructive">Error</Badge>);
    expect(screen.getByText("Error").className).toContain("bg-red-500");
  });

  it("applies secondary variant class", () => {
    render(<Badge variant="secondary">Beta</Badge>);
    expect(screen.getByText("Beta").className).toContain("bg-[var(--muted)]");
  });

  it("applies custom className", () => {
    render(<Badge className="extra-class">Tag</Badge>);
    expect(screen.getByText("Tag").className).toContain("extra-class");
  });
});
