import { apiGet, apiPost, apiPut, apiDelete, ApiError } from "@/lib/api";

function mockFetch(status: number, body: unknown) {
  const res = {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(String(body)),
    statusText: "Error",
  } as Response;
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(res));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("API client", () => {
  it("apiGet makes GET request to correct path", async () => {
    mockFetch(200, { id: "1" });
    const result = await apiGet<{ id: string }>("/api/v1/test");
    expect(fetch).toHaveBeenCalledWith("/api/v1/test", expect.objectContaining({}));
    expect(result).toEqual({ id: "1" });
  });

  it("apiPost makes POST request with JSON body", async () => {
    mockFetch(200, { created: true });
    await apiPost("/api/v1/test", { name: "hello" });
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/test",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ name: "hello" }) })
    );
  });

  it("apiPut makes PUT request with JSON body", async () => {
    mockFetch(200, { updated: true });
    await apiPut("/api/v1/test/1", { name: "updated" });
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/test/1",
      expect.objectContaining({ method: "PUT" })
    );
  });

  it("apiDelete makes DELETE request", async () => {
    mockFetch(204, undefined);
    await apiDelete("/api/v1/test/1");
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/test/1",
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("throws ApiError on non-ok response", async () => {
    mockFetch(404, "Not found");
    await expect(apiGet("/api/v1/missing")).rejects.toThrow(ApiError);
  });

  it("ApiError has correct status code", async () => {
    mockFetch(422, "Unprocessable");
    try {
      await apiGet("/api/v1/bad");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).status).toBe(422);
    }
  });
});
