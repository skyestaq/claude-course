"use client";

import { Message } from "ai";
import { cn } from "@/lib/utils";
import { User, Bot, Loader2 } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ToolCallDisplay } from "./ToolCallDisplay";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 mb-6 shadow-lg border border-blue-100">
          <Bot className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-neutral-900 font-bold text-xl mb-3">Start building with AI</h2>
        <p className="text-neutral-600 text-base max-w-md leading-relaxed">
          Describe any React component you need and I'll generate it instantly with live preview
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-6 py-8">
      <div className="space-y-8 max-w-4xl mx-auto w-full">
        {messages.map((message) => (
          <div
            key={message.id || message.content}
            className={cn(
              "flex gap-4",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.role === "assistant" && (
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white to-neutral-50 border border-neutral-200 shadow-md flex items-center justify-center">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            )}
            
            <div className={cn(
              "flex flex-col gap-2 max-w-[85%]",
              message.role === "user" ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "rounded-2xl px-5 py-4",
                message.role === "user" 
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg" 
                  : "bg-white text-neutral-900 border border-neutral-200 shadow-md"
              )}>
                <div className="text-sm">
                  {message.parts ? (
                    <>
                      {message.parts.map((part, partIndex) => {
                        switch (part.type) {
                          case "text":
                            return message.role === "user" ? (
                              <span key={partIndex} className="whitespace-pre-wrap">{part.text}</span>
                            ) : (
                              <MarkdownRenderer
                                key={partIndex}
                                content={part.text}
                                className="prose-sm"
                              />
                            );
                          case "reasoning":
                            return (
                              <div key={partIndex} className="mt-4 p-4 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl border border-neutral-200">
                                <span className="text-xs font-semibold text-neutral-600 block mb-2 uppercase tracking-wide">Reasoning</span>
                                <span className="text-sm text-neutral-700 leading-relaxed">{part.reasoning}</span>
                              </div>
                            );
                          case "tool-invocation":
                            const tool = part.toolInvocation;
                            return <ToolCallDisplay key={partIndex} tool={tool} />;
                          case "source":
                            return (
                              <div key={partIndex} className="mt-2 text-xs text-neutral-500">
                                Source: {JSON.stringify(part.source)}
                              </div>
                            );
                          case "step-start":
                            return partIndex > 0 ? <hr key={partIndex} className="my-4 border-neutral-300" /> : null;
                          default:
                            return null;
                        }
                      })}
                      {isLoading &&
                        message.role === "assistant" &&
                        messages.indexOf(message) === messages.length - 1 && (
                          <div className="flex items-center gap-3 mt-4 text-neutral-500">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                            <span className="text-sm font-medium">Generating...</span>
                          </div>
                        )}
                    </>
                  ) : message.content ? (
                    message.role === "user" ? (
                      <span className="whitespace-pre-wrap">{message.content}</span>
                    ) : (
                      <MarkdownRenderer content={message.content} className="prose-sm" />
                    )
                  ) : isLoading &&
                    message.role === "assistant" &&
                    messages.indexOf(message) === messages.length - 1 ? (
                    <div className="flex items-center gap-3 text-neutral-500">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <span className="text-sm font-medium">Generating...</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            
            {message.role === "user" && (
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}