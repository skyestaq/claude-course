import { test, expect, vi, beforeEach, afterEach, describe } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock the action functions
vi.mock("@/actions", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

// Mock anon work tracker
vi.mock("@/lib/anon-work-tracker", () => ({
  getAnonWorkData: vi.fn(),
  clearAnonWork: vi.fn(),
}));

// Mock project actions
vi.mock("@/actions/get-projects", () => ({
  getProjects: vi.fn(),
}));
vi.mock("@/actions/create-project", () => ({
  createProject: vi.fn(),
}));

import { useAuth } from "../use-auth";
import { signIn as signInAction, signUp as signUpAction } from "@/actions";
import { getAnonWorkData, clearAnonWork } from "@/lib/anon-work-tracker";
import { getProjects } from "@/actions/get-projects";
import { createProject } from "@/actions/create-project";

const mockSignInAction = vi.mocked(signInAction);
const mockSignUpAction = vi.mocked(signUpAction);
const mockGetAnonWorkData = vi.mocked(getAnonWorkData);
const mockClearAnonWork = vi.mocked(clearAnonWork);
const mockGetProjects = vi.mocked(getProjects);
const mockCreateProject = vi.mocked(createProject);

beforeEach(() => {
  vi.clearAllMocks();
  mockPush.mockClear();
  mockSignInAction.mockClear();
  mockSignUpAction.mockClear();
  mockGetAnonWorkData.mockClear();
  mockClearAnonWork.mockClear();
  mockGetProjects.mockClear();
  mockCreateProject.mockClear();
});

afterEach(() => {
  vi.resetAllMocks();
});

describe("useAuth hook", () => {
  test("returns expected interface", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current).toHaveProperty("signIn");
    expect(result.current).toHaveProperty("signUp");
    expect(result.current).toHaveProperty("isLoading");
    expect(typeof result.current.signIn).toBe("function");
    expect(typeof result.current.signUp).toBe("function");
    expect(typeof result.current.isLoading).toBe("boolean");
  });

  test("initial loading state is false", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(false);
  });

  describe("signIn function", () => {
    test("sets loading state during sign in", async () => {
      mockSignInAction.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: false }), 100)));
      
      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.signIn("test@example.com", "password");
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("calls signInAction with correct parameters", async () => {
      mockSignInAction.mockResolvedValue({ success: false });
      
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      expect(mockSignInAction).toHaveBeenCalledWith("test@example.com", "password");
    });

    test("returns result from signInAction", async () => {
      const mockResult = { success: false, error: "Invalid credentials" };
      mockSignInAction.mockResolvedValue(mockResult);
      
      const { result } = renderHook(() => useAuth());

      const signInResult = await act(async () => {
        return await result.current.signIn("test@example.com", "password");
      });

      expect(signInResult).toEqual(mockResult);
    });

    test("calls handlePostSignIn when sign in is successful", async () => {
      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([]);
      mockCreateProject.mockResolvedValue({ 
        id: "new-project-id", 
        name: "Test Project", 
        userId: "test-user", 
        messages: "[]", 
        data: "{}", 
        createdAt: new Date(), 
        updatedAt: new Date() 
      });
      
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      expect(mockGetAnonWorkData).toHaveBeenCalled();
      expect(mockGetProjects).toHaveBeenCalled();
      expect(mockCreateProject).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/new-project-id");
    });

    test("does not call handlePostSignIn when sign in fails", async () => {
      mockSignInAction.mockResolvedValue({ success: false });
      
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      expect(mockGetAnonWorkData).not.toHaveBeenCalled();
      expect(mockGetProjects).not.toHaveBeenCalled();
      expect(mockCreateProject).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    test("resets loading state even if action throws error", async () => {
      mockSignInAction.mockRejectedValue(new Error("Network error"));
      
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signIn("test@example.com", "password");
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("signUp function", () => {
    test("sets loading state during sign up", async () => {
      mockSignUpAction.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: false }), 100)));
      
      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.signUp("test@example.com", "password");
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("calls signUpAction with correct parameters", async () => {
      mockSignUpAction.mockResolvedValue({ success: false });
      
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("test@example.com", "password");
      });

      expect(mockSignUpAction).toHaveBeenCalledWith("test@example.com", "password");
    });

    test("returns result from signUpAction", async () => {
      const mockResult = { success: false, error: "Email already exists" };
      mockSignUpAction.mockResolvedValue(mockResult);
      
      const { result } = renderHook(() => useAuth());

      const signUpResult = await act(async () => {
        return await result.current.signUp("test@example.com", "password");
      });

      expect(signUpResult).toEqual(mockResult);
    });

    test("calls handlePostSignIn when sign up is successful", async () => {
      mockSignUpAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([]);
      mockCreateProject.mockResolvedValue({ 
        id: "new-project-id", 
        name: "Test Project", 
        userId: "test-user", 
        messages: "[]", 
        data: "{}", 
        createdAt: new Date(), 
        updatedAt: new Date() 
      });
      
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("test@example.com", "password");
      });

      expect(mockGetAnonWorkData).toHaveBeenCalled();
      expect(mockGetProjects).toHaveBeenCalled();
      expect(mockCreateProject).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/new-project-id");
    });

    test("does not call handlePostSignIn when sign up fails", async () => {
      mockSignUpAction.mockResolvedValue({ success: false });
      
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("test@example.com", "password");
      });

      expect(mockGetAnonWorkData).not.toHaveBeenCalled();
      expect(mockGetProjects).not.toHaveBeenCalled();
      expect(mockCreateProject).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    test("resets loading state even if action throws error", async () => {
      mockSignUpAction.mockRejectedValue(new Error("Network error"));
      
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signUp("test@example.com", "password");
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("handlePostSignIn scenarios", () => {
    beforeEach(() => {
      mockSignInAction.mockResolvedValue({ success: true });
    });

    test("creates project from anonymous work when present", async () => {
      const mockAnonWork = {
        messages: [{ role: "user", content: "Hello" }],
        fileSystemData: { files: {} },
      };
      mockGetAnonWorkData.mockReturnValue(mockAnonWork);
      mockCreateProject.mockResolvedValue({ 
        id: "anon-project-id", 
        name: "Test Project", 
        userId: "test-user", 
        messages: "[]", 
        data: "{}", 
        createdAt: new Date(), 
        updatedAt: new Date() 
      });
      
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      expect(mockCreateProject).toHaveBeenCalledWith({
        name: expect.stringContaining("Design from"),
        messages: mockAnonWork.messages,
        data: mockAnonWork.fileSystemData,
      });
      expect(mockClearAnonWork).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/anon-project-id");
    });

    test("ignores anonymous work when messages array is empty", async () => {
      const mockAnonWork = {
        messages: [],
        fileSystemData: { files: {} },
      };
      mockGetAnonWorkData.mockReturnValue(mockAnonWork);
      mockGetProjects.mockResolvedValue([{ 
        id: "existing-project", 
        name: "Test Project", 
        createdAt: new Date(), 
        updatedAt: new Date()
      }]);
      
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      expect(mockCreateProject).not.toHaveBeenCalled();
      expect(mockClearAnonWork).not.toHaveBeenCalled();
      expect(mockGetProjects).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/existing-project");
    });

    test("navigates to most recent project when no anonymous work", async () => {
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([
        { 
          id: "project-1", 
          name: "Project 1", 
          createdAt: new Date("2023-01-01"), 
          updatedAt: new Date()
        },
        { 
          id: "project-2", 
          name: "Project 2", 
          createdAt: new Date("2023-01-02"), 
          updatedAt: new Date()
        },
      ]);
      
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      expect(mockGetProjects).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/project-1");
    });

    test("creates new project when no existing projects", async () => {
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([]);
      mockCreateProject.mockResolvedValue({ 
        id: "new-project-id", 
        name: "Test Project", 
        userId: "test-user", 
        messages: "[]", 
        data: "{}", 
        createdAt: new Date(), 
        updatedAt: new Date() 
      });
      
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      expect(mockGetProjects).toHaveBeenCalled();
      expect(mockCreateProject).toHaveBeenCalledWith({
        name: expect.stringMatching(/^New Design #\d+$/),
        messages: [],
        data: {},
      });
      expect(mockPush).toHaveBeenCalledWith("/new-project-id");
    });

    test("generates random project name within expected range", async () => {
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([]);
      mockCreateProject.mockResolvedValue({ 
        id: "new-project-id", 
        name: "Test Project", 
        userId: "test-user", 
        messages: "[]", 
        data: "{}", 
        createdAt: new Date(), 
        updatedAt: new Date() 
      });
      
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      const createProjectCall = mockCreateProject.mock.calls[0][0];
      const nameMatch = createProjectCall.name.match(/^New Design #(\d+)$/);
      expect(nameMatch).toBeTruthy();
      
      const randomNumber = parseInt(nameMatch![1]);
      expect(randomNumber).toBeGreaterThanOrEqual(0);
      expect(randomNumber).toBeLessThan(100000);
    });

    test("generates timestamp-based project name for anonymous work", async () => {
      const mockAnonWork = {
        messages: [{ role: "user", content: "Test" }],
        fileSystemData: {},
      };
      mockGetAnonWorkData.mockReturnValue(mockAnonWork);
      mockCreateProject.mockResolvedValue({ 
        id: "anon-project-id", 
        name: "Test Project", 
        userId: "test-user", 
        messages: "[]", 
        data: "{}", 
        createdAt: new Date(), 
        updatedAt: new Date() 
      });
      
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });
      const createProjectCall = mockCreateProject.mock.calls[0][0];
      
      expect(createProjectCall.name).toMatch(/^Design from \d{1,2}:\d{2}:\d{2}/);
      
      const timeMatch = createProjectCall.name.match(/Design from (\d{1,2}:\d{2}:\d{2})/);
      expect(timeMatch).toBeTruthy();
    });
  });

  describe("loading state management", () => {
    test("loading state is correctly managed during operations", async () => {
      mockSignInAction.mockResolvedValue({ success: false });
      
      const { result } = renderHook(() => useAuth());

      // Initially not loading
      expect(result.current.isLoading).toBe(false);

      // Start and complete sign in
      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      // Should not be loading after completion
      expect(result.current.isLoading).toBe(false);
    });

    test("loading state is properly reset after successful sign in", async () => {
      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([{ 
        id: "project-1", 
        name: "Test Project", 
        createdAt: new Date(), 
        updatedAt: new Date()
      }]);
      
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("loading state is properly reset after successful sign up", async () => {
      mockSignUpAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([{ 
        id: "project-1", 
        name: "Test Project", 
        createdAt: new Date(), 
        updatedAt: new Date()
      }]);
      
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("test@example.com", "password");
      });

      expect(result.current.isLoading).toBe(false);
    });
  });
});