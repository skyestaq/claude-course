import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallDisplay } from "../ToolCallDisplay";

afterEach(() => {
  cleanup();
});

test("ToolCallDisplay shows loading state", () => {
  const tool = {
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
    state: "pending"
  };

  render(<ToolCallDisplay tool={tool} />);
  
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
  // Check for loading spinner by looking for the animate-spin class
  expect(document.querySelector('.animate-spin')).toBeTruthy();
});

test("ToolCallDisplay shows completed state", () => {
  const tool = {
    toolName: "str_replace_editor",
    args: { command: "str_replace", path: "/Button.tsx" },
    state: "result",
    result: "Success"
  };

  render(<ToolCallDisplay tool={tool} />);
  
  expect(screen.getByText("Editing Button.tsx")).toBeDefined();
  // Check for success indicator (green dot)
  expect(document.querySelector('.bg-emerald-500')).toBeTruthy();
  // Should not show loading spinner
  expect(document.querySelector('.animate-spin')).toBeFalsy();
});

test("ToolCallDisplay handles file manager operations", () => {
  const tool = {
    toolName: "file_manager",
    args: { command: "delete", path: "/temp.js" },
    state: "result",
    result: "Deleted"
  };

  render(<ToolCallDisplay tool={tool} />);
  
  expect(screen.getByText("Deleting temp.js")).toBeDefined();
});

test("ToolCallDisplay handles unknown tools", () => {
  const tool = {
    toolName: "unknown_tool",
    state: "pending"
  };

  render(<ToolCallDisplay tool={tool} />);
  
  expect(screen.getByText("unknown_tool")).toBeDefined();
});

test("ToolCallDisplay applies correct styling", () => {
  const tool = {
    toolName: "str_replace_editor",
    args: { command: "view", path: "/config.json" },
    state: "pending"
  };

  const { container } = render(<ToolCallDisplay tool={tool} />);
  
  const displayElement = container.firstChild as HTMLElement;
  expect(displayElement.className).toContain("inline-flex");
  expect(displayElement.className).toContain("bg-neutral-50");
  expect(displayElement.className).toContain("rounded-lg");
  expect(displayElement.className).toContain("border-neutral-200");
});