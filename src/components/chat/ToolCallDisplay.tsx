import { Loader2 } from "lucide-react";
import { getToolDisplayMessage } from "@/lib/tools/tool-messages";

interface ToolInvocation {
  toolName: string;
  args?: any;
  state?: string;
  result?: any;
}

interface ToolCallDisplayProps {
  tool: ToolInvocation;
}

export function ToolCallDisplay({ tool }: ToolCallDisplayProps) {
  const message = getToolDisplayMessage(tool);
  const isCompleted = tool.state === "result" && tool.result;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isCompleted ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-700">{message}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{message}</span>
        </>
      )}
    </div>
  );
}