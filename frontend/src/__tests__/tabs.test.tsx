import { render, screen, fireEvent } from "@testing-library/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

describe("Tabs", () => {
  function renderTabs() {
    return render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab One</TabsTrigger>
          <TabsTrigger value="tab2">Tab Two</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content One</TabsContent>
        <TabsContent value="tab2">Content Two</TabsContent>
      </Tabs>
    );
  }

  it("shows defaultValue content initially", () => {
    renderTabs();
    expect(screen.getByText("Content One")).toBeInTheDocument();
    expect(screen.queryByText("Content Two")).not.toBeInTheDocument();
  });

  it("switches content when a tab trigger is clicked", () => {
    renderTabs();
    fireEvent.click(screen.getByText("Tab Two"));
    expect(screen.getByText("Content Two")).toBeInTheDocument();
    expect(screen.queryByText("Content One")).not.toBeInTheDocument();
  });

  it("marks active tab trigger with aria-selected=true", () => {
    renderTabs();
    const tab1 = screen.getByRole("tab", { name: "Tab One" });
    const tab2 = screen.getByRole("tab", { name: "Tab Two" });
    expect(tab1).toHaveAttribute("aria-selected", "true");
    expect(tab2).toHaveAttribute("aria-selected", "false");
  });
});
