import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Card body</Card>);
    expect(screen.getByText("Card body")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Card className="custom-class">Content</Card>);
    expect(screen.getByText("Content").className).toContain("custom-class");
  });

  it("renders CardHeader with title and description", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>My Title</CardTitle>
          <CardDescription>My Description</CardDescription>
        </CardHeader>
      </Card>
    );
    expect(screen.getByText("My Title")).toBeInTheDocument();
    expect(screen.getByText("My Description")).toBeInTheDocument();
  });

  it("renders CardContent", () => {
    render(<Card><CardContent>Content text</CardContent></Card>);
    expect(screen.getByText("Content text")).toBeInTheDocument();
  });

  it("renders CardFooter", () => {
    render(<Card><CardFooter>Footer content</CardFooter></Card>);
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });
});
