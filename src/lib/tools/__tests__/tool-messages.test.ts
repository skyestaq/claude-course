import { test, expect } from "vitest";
import { getToolDisplayMessage } from "../tool-messages";

test("getToolDisplayMessage handles str_replace_editor commands", () => {
  expect(
    getToolDisplayMessage({
      toolName: "str_replace_editor",
      args: { command: "create", path: "/App.jsx" }
    })
  ).toBe("Creating App.jsx");

  expect(
    getToolDisplayMessage({
      toolName: "str_replace_editor",
      args: { command: "str_replace", path: "/components/Button.tsx" }
    })
  ).toBe("Editing Button.tsx");

  expect(
    getToolDisplayMessage({
      toolName: "str_replace_editor",
      args: { command: "insert", path: "/utils/helpers.js" }
    })
  ).toBe("Adding to helpers.js");

  expect(
    getToolDisplayMessage({
      toolName: "str_replace_editor",
      args: { command: "view", path: "/package.json" }
    })
  ).toBe("Viewing package.json");
});

test("getToolDisplayMessage handles file_manager commands", () => {
  expect(
    getToolDisplayMessage({
      toolName: "file_manager",
      args: { command: "rename", path: "/old.txt", new_path: "/new.txt" }
    })
  ).toBe("Renaming old.txt to new.txt");

  expect(
    getToolDisplayMessage({
      toolName: "file_manager",
      args: { command: "delete", path: "/temp.js" }
    })
  ).toBe("Deleting temp.js");

  expect(
    getToolDisplayMessage({
      toolName: "file_manager",
      args: { command: "rename", path: "/config.json" }
    })
  ).toBe("Renaming config.json");
});

test("getToolDisplayMessage handles missing args gracefully", () => {
  expect(
    getToolDisplayMessage({
      toolName: "str_replace_editor"
    })
  ).toBe("Working with files");

  expect(
    getToolDisplayMessage({
      toolName: "file_manager"
    })
  ).toBe("Managing files");

  expect(
    getToolDisplayMessage({
      toolName: "str_replace_editor",
      args: { command: "create" }
    })
  ).toBe("Creating file");
});

test("getToolDisplayMessage handles unknown tools", () => {
  expect(
    getToolDisplayMessage({
      toolName: "unknown_tool"
    })
  ).toBe("unknown_tool");

  expect(
    getToolDisplayMessage({
      toolName: "custom_tool",
      args: { some: "data" }
    })
  ).toBe("custom_tool");
});

test("getToolDisplayMessage extracts filename from complex paths", () => {
  expect(
    getToolDisplayMessage({
      toolName: "str_replace_editor",
      args: { command: "create", path: "/src/components/ui/Button.tsx" }
    })
  ).toBe("Creating Button.tsx");

  expect(
    getToolDisplayMessage({
      toolName: "file_manager",
      args: { command: "delete", path: "/very/deep/nested/path/file.js" }
    })
  ).toBe("Deleting file.js");
});