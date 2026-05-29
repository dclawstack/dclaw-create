import { render, screen, fireEvent } from "@testing-library/react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

describe("Dialog", () => {
  it("does not render content when closed", () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Secret Content</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    expect(screen.queryByText("Secret Content")).not.toBeInTheDocument();
  });

  it("renders content when trigger is clicked", () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    fireEvent.click(screen.getByText("Open"));
    expect(screen.getByText("Dialog Title")).toBeInTheDocument();
  });

  it("closes when backdrop is clicked", () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Content</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    fireEvent.click(screen.getByText("Open"));
    expect(screen.getByText("Content")).toBeInTheDocument();
    // Click the backdrop (the fixed inset-0 div)
    const backdrop = document.querySelector(".fixed.inset-0.z-50");
    if (backdrop) fireEvent.click(backdrop);
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });
});
