import { test, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MainContent } from "../main-content";

// Mock all the dependencies
vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: any) => <div data-testid="file-system-provider">{children}</div>,
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: any) => <div data-testid="chat-provider">{children}</div>,
}));

vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div data-testid="chat-interface">Chat Interface</div>,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div data-testid="file-tree">File Tree</div>,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor">Code Editor</div>,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div data-testid="preview-frame">Preview Frame</div>,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div data-testid="header-actions">Header Actions</div>,
}));

vi.mock("@/components/ui/resizable", () => ({
  ResizableHandle: ({ className }: any) => <div className={className} data-testid="resizable-handle" />,
  ResizablePanel: ({ children, defaultSize }: any) => (
    <div data-testid="resizable-panel" data-default-size={defaultSize}>
      {children}
    </div>
  ),
  ResizablePanelGroup: ({ children, direction }: any) => (
    <div data-testid="resizable-panel-group" data-direction={direction}>
      {children}
    </div>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

test("renders with preview view by default", () => {
  render(<MainContent />);

  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
  expect(screen.queryByTestId("file-tree")).toBeNull();
});

test("toggle buttons exist and show correct initial state", () => {
  render(<MainContent />);

  const previewButton = screen.getByRole("tab", { name: /preview/i });
  const codeButton = screen.getByRole("tab", { name: /code/i });

  expect(previewButton).toBeDefined();
  expect(codeButton).toBeDefined();

  // Preview should be selected by default
  expect(previewButton.getAttribute("data-state")).toBe("active");
  expect(codeButton.getAttribute("data-state")).toBe("inactive");
});

test("clicking Code button switches to code view", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  const codeButton = screen.getByRole("tab", { name: /code/i });

  // Initially preview should be visible
  expect(screen.getByTestId("preview-frame")).toBeDefined();

  // Click the Code button
  await user.click(codeButton);

  // Code view should now be visible
  expect(screen.getByTestId("code-editor")).toBeDefined();
  expect(screen.getByTestId("file-tree")).toBeDefined();
  expect(screen.queryByTestId("preview-frame")).toBeNull();

  // Code button should be active
  expect(codeButton.getAttribute("data-state")).toBe("active");
});

test("clicking Preview button switches back to preview view", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  const previewButton = screen.getByRole("tab", { name: /preview/i });
  const codeButton = screen.getByRole("tab", { name: /code/i });

  // Switch to code view first
  await user.click(codeButton);
  expect(screen.getByTestId("code-editor")).toBeDefined();

  // Switch back to preview
  await user.click(previewButton);

  // Preview should be visible again
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
  expect(screen.queryByTestId("file-tree")).toBeNull();

  // Preview button should be active
  expect(previewButton.getAttribute("data-state")).toBe("active");
});

test("toggle buttons switch views multiple times", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  const previewButton = screen.getByRole("tab", { name: /preview/i });
  const codeButton = screen.getByRole("tab", { name: /code/i });

  // Toggle to code
  await user.click(codeButton);
  expect(screen.getByTestId("code-editor")).toBeDefined();
  expect(screen.queryByTestId("preview-frame")).toBeNull();

  // Toggle back to preview
  await user.click(previewButton);
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();

  // Toggle to code again
  await user.click(codeButton);
  expect(screen.getByTestId("code-editor")).toBeDefined();
  expect(screen.queryByTestId("preview-frame")).toBeNull();

  // Toggle back to preview again
  await user.click(previewButton);
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("clicking the same button twice keeps the same view", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  const previewButton = screen.getByRole("tab", { name: /preview/i });

  // Preview is already active, click it again
  await user.click(previewButton);
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();

  // Click preview again
  await user.click(previewButton);
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("renders with user and project props", () => {
  const user = {
    id: "user-1",
    email: "test@example.com",
  };

  const project = {
    id: "project-1",
    name: "Test Project",
    messages: [],
    data: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  render(<MainContent user={user} project={project} />);

  expect(screen.getByTestId("chat-interface")).toBeDefined();
  expect(screen.getByTestId("preview-frame")).toBeDefined();
});
