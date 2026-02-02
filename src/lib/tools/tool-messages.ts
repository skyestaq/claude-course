interface ToolInvocation {
  toolName: string;
  args?: any;
}

export function getToolDisplayMessage(tool: ToolInvocation): string {
  const { toolName, args } = tool;

  switch (toolName) {
    case "str_replace_editor":
      return getEditorMessage(args);
    case "file_manager":
      return getFileManagerMessage(args);
    default:
      return toolName;
  }
}

function getEditorMessage(args?: any): string {
  if (!args) return "Working with files";

  const { command, path } = args;

  if (!path) {
    switch (command) {
      case "create":
        return "Creating file";
      case "str_replace":
        return "Editing file";
      case "insert":
        return "Adding to file";
      case "view":
        return "Viewing file";
      default:
        return "Working with file";
    }
  }

  const fileName = path.split("/").pop() || path;

  switch (command) {
    case "create":
      return `Creating ${fileName}`;
    case "str_replace":
      return `Editing ${fileName}`;
    case "insert":
      return `Adding to ${fileName}`;
    case "view":
      return `Viewing ${fileName}`;
    default:
      return `Working with ${fileName}`;
  }
}

function getFileManagerMessage(args?: any): string {
  if (!args) return "Managing files";

  const { command, path, new_path } = args;

  if (!path) {
    switch (command) {
      case "rename":
        return "Renaming file";
      case "delete":
        return "Deleting file";
      default:
        return "Managing file";
    }
  }

  const fileName = path.split("/").pop() || path;
  const newFileName = new_path ? new_path.split("/").pop() || new_path : null;

  switch (command) {
    case "rename":
      return newFileName ? `Renaming ${fileName} to ${newFileName}` : `Renaming ${fileName}`;
    case "delete":
      return `Deleting ${fileName}`;
    default:
      return `Managing ${fileName}`;
  }
}