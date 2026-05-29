import { render, screen, act, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/lib/theme";

function ThemeDisplay() {
  const { theme, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
      <button onClick={() => setTheme("light")}>Set Light</button>
    </div>
  );
}

describe("ThemeProvider + useTheme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  it("defaults to dark theme", () => {
    render(
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme").textContent).toBe("dark");
  });

  it("reads theme from localStorage on mount", () => {
    localStorage.setItem("theme", "light");
    render(
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>
    );
    // After useEffect runs
    expect(screen.getByTestId("theme").textContent).toBe("light");
  });

  it("toggleTheme switches from dark to light", () => {
    render(
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>
    );
    act(() => {
      fireEvent.click(screen.getByText("Toggle"));
    });
    expect(screen.getByTestId("theme").textContent).toBe("light");
  });

  it("setTheme updates localStorage", () => {
    render(
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>
    );
    act(() => {
      fireEvent.click(screen.getByText("Set Light"));
    });
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("useTheme throws outside ThemeProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ThemeDisplay />)).toThrow();
    spy.mockRestore();
  });
});
