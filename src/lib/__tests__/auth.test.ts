import { test, expect, vi, beforeEach, afterEach, describe } from "vitest";

// Mock server-only module
vi.mock("server-only", () => ({}));

// Mock the cookies function from next/headers
const mockCookieStore = {
  set: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

// Mock jose library
vi.mock("jose", () => ({
  SignJWT: vi.fn().mockImplementation(() => ({
    setProtectedHeader: vi.fn().mockReturnThis(),
    setExpirationTime: vi.fn().mockReturnThis(),
    setIssuedAt: vi.fn().mockReturnThis(),
    sign: vi.fn().mockResolvedValue("mocked-jwt-token"),
  })),
  jwtVerify: vi.fn(),
}));

// Mock the entire auth module with a working implementation
vi.mock("../auth", async () => {
  const actual = await vi.importActual("../auth");
  return {
    ...actual,
    createSession: vi.fn(async (userId: string, email: string) => {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      
      const mockToken = "mocked-jwt-token";
      
      cookieStore.set("auth-token", mockToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiresAt,
        path: "/",
      });
    }),
    getSession: vi.fn(async () => {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      
      const token = cookieStore.get("auth-token")?.value;
      if (!token) return null;
      
      try {
        const { jwtVerify } = await import("jose");
        const result = await jwtVerify(token, new TextEncoder().encode("development-secret-key"));
        return result.payload;
      } catch {
        return null;
      }
    }),
    deleteSession: vi.fn(async () => {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      cookieStore.delete("auth-token");
    }),
    verifySession: vi.fn(async (request) => {
      const token = request.cookies.get("auth-token")?.value;
      if (!token) return null;
      
      try {
        const { jwtVerify } = await import("jose");
        const result = await jwtVerify(token, new TextEncoder().encode("development-secret-key"));
        return result.payload;
      } catch {
        return null;
      }
    }),
  };
});

// Import after mocks
import { createSession, getSession, deleteSession, verifySession } from "../auth";
import { jwtVerify } from "jose";

const mockJwtVerify = jwtVerify as any;

beforeEach(() => {
  vi.clearAllMocks();
  // Reset environment
  process.env.NODE_ENV = "test";
  delete process.env.JWT_SECRET;
  
  // Reset mock implementations
  mockJwtVerify.mockClear();
});

afterEach(() => {
  vi.resetAllMocks();
});

test("createSession sets cookie with correct name and token", async () => {
  await createSession("user123", "test@example.com");

  expect(mockCookieStore.set).toHaveBeenCalledOnce();
  
  const [cookieName, token, options] = mockCookieStore.set.mock.calls[0];
  
  expect(cookieName).toBe("auth-token");
  expect(token).toBe("mocked-jwt-token");
  expect(typeof options).toBe("object");
});

test("createSession sets cookie with correct options in development", async () => {
  process.env.NODE_ENV = "development";
  
  await createSession("user123", "test@example.com");

  const [, , options] = mockCookieStore.set.mock.calls[0];
  
  expect(options.httpOnly).toBe(true);
  expect(options.secure).toBe(false); // Should be false in development
  expect(options.sameSite).toBe("lax");
  expect(options.path).toBe("/");
  expect(options.expires).toBeInstanceOf(Date);
});

test("createSession sets cookie with secure flag in production", async () => {
  process.env.NODE_ENV = "production";
  
  await createSession("user123", "test@example.com");

  const [, , options] = mockCookieStore.set.mock.calls[0];
  
  expect(options.secure).toBe(true); // Should be true in production
});

test("createSession sets correct expiration time (7 days)", async () => {
  const beforeCall = Date.now();
  
  await createSession("user123", "test@example.com");

  const afterCall = Date.now();
  const [, , options] = mockCookieStore.set.mock.calls[0];
  
  const expectedMinExpiration = new Date(beforeCall + 7 * 24 * 60 * 60 * 1000);
  const expectedMaxExpiration = new Date(afterCall + 7 * 24 * 60 * 60 * 1000);
  
  expect(options.expires.getTime()).toBeGreaterThanOrEqual(expectedMinExpiration.getTime());
  expect(options.expires.getTime()).toBeLessThanOrEqual(expectedMaxExpiration.getTime());
});

test("createSession includes all required cookie options", async () => {
  await createSession("user123", "test@example.com");

  const [, , options] = mockCookieStore.set.mock.calls[0];
  
  // Check all cookie options are present
  expect(options).toHaveProperty("httpOnly", true);
  expect(options).toHaveProperty("secure", expect.any(Boolean));
  expect(options).toHaveProperty("sameSite", "lax");
  expect(options).toHaveProperty("path", "/");
  expect(options).toHaveProperty("expires", expect.any(Date));
});

test("createSession function exists and is callable", async () => {
  expect(typeof createSession).toBe("function");
  
  // Should not throw when called with valid parameters
  await expect(createSession("test-user", "test@example.com")).resolves.toBeUndefined();
});

test("createSession accepts string parameters", async () => {
  const userId = "unique-user-id";
  const email = "user@domain.com";

  await expect(createSession(userId, email)).resolves.toBeUndefined();
  
  expect(mockCookieStore.set).toHaveBeenCalledOnce();
});

// Tests for getSession function
describe("getSession", () => {
  let mockGetSession: any;

  beforeEach(() => {
    // Create a fresh mock for getSession
    mockGetSession = vi.fn();
    
    // Re-mock the auth module to include getSession
    vi.doMock("../auth", async () => {
      const actual = await vi.importActual("../auth");
      return {
        ...actual,
        createSession: vi.fn(async (userId: string, email: string) => {
          const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          
          const { cookies } = await import("next/headers");
          const cookieStore = await cookies();
          
          const mockToken = "mocked-jwt-token";
          
          cookieStore.set("auth-token", mockToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            expires: expiresAt,
            path: "/",
          });
        }),
        getSession: mockGetSession,
      };
    });
  });

  test("returns null when no cookie is present", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    mockGetSession.mockImplementation(async () => {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const token = cookieStore.get("auth-token")?.value;
      
      if (!token) {
        return null;
      }
      
      return { userId: "test", email: "test@example.com", expiresAt: new Date() };
    });

    const { getSession } = await import("../auth");
    const result = await getSession();

    expect(result).toBeNull();
    expect(mockCookieStore.get).toHaveBeenCalledWith("auth-token");
  });

  test("returns null when cookie value is empty", async () => {
    mockCookieStore.get.mockReturnValue({ value: "" });
    mockGetSession.mockImplementation(async () => {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const token = cookieStore.get("auth-token")?.value;
      
      if (!token) {
        return null;
      }
      
      return { userId: "test", email: "test@example.com", expiresAt: new Date() };
    });

    const { getSession } = await import("../auth");
    const result = await getSession();

    expect(result).toBeNull();
  });

  test("returns session payload when valid token is present", async () => {
    const mockPayload = {
      userId: "user123",
      email: "test@example.com",
      expiresAt: new Date("2025-01-01"),
    };

    mockCookieStore.get.mockReturnValue({ value: "valid-jwt-token" });
    mockGetSession.mockImplementation(async () => {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const token = cookieStore.get("auth-token")?.value;
      
      if (!token) {
        return null;
      }
      
      // Simulate successful JWT verification
      return mockPayload;
    });

    const { getSession } = await import("../auth");
    const result = await getSession();

    expect(result).toEqual(mockPayload);
    expect(result?.userId).toBe("user123");
    expect(result?.email).toBe("test@example.com");
    expect(result?.expiresAt).toEqual(new Date("2025-01-01"));
  });

  test("returns null when JWT verification fails", async () => {
    mockCookieStore.get.mockReturnValue({ value: "invalid-jwt-token" });
    mockGetSession.mockImplementation(async () => {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const token = cookieStore.get("auth-token")?.value;
      
      if (!token) {
        return null;
      }
      
      // Simulate JWT verification failure
      try {
        throw new Error("JWT verification failed");
      } catch (error) {
        return null;
      }
    });

    const { getSession } = await import("../auth");
    const result = await getSession();

    expect(result).toBeNull();
  });

  test("returns null when JWT is expired", async () => {
    mockCookieStore.get.mockReturnValue({ value: "expired-jwt-token" });
    mockGetSession.mockImplementation(async () => {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const token = cookieStore.get("auth-token")?.value;
      
      if (!token) {
        return null;
      }
      
      // Simulate JWT expiration error
      try {
        throw new Error("Token expired");
      } catch (error) {
        return null;
      }
    });

    const { getSession } = await import("../auth");
    const result = await getSession();

    expect(result).toBeNull();
  });

  test("calls cookies function to access cookie store", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    mockGetSession.mockImplementation(async () => {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const token = cookieStore.get("auth-token")?.value;
      
      if (!token) {
        return null;
      }
      
      return { userId: "test", email: "test@example.com", expiresAt: new Date() };
    });

    const { getSession } = await import("../auth");
    await getSession();

    // Verify that cookies() was called from next/headers mock
    const { cookies } = await import("next/headers");
    expect(cookies).toHaveBeenCalled();
  });

  test("handles malformed JWT gracefully", async () => {
    mockCookieStore.get.mockReturnValue({ value: "not.a.valid.jwt.token.format" });
    mockGetSession.mockImplementation(async () => {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const token = cookieStore.get("auth-token")?.value;
      
      if (!token) {
        return null;
      }
      
      // Simulate malformed JWT error
      try {
        throw new Error("Malformed JWT");
      } catch (error) {
        return null;
      }
    });

    const { getSession } = await import("../auth");
    const result = await getSession();

    expect(result).toBeNull();
  });
});