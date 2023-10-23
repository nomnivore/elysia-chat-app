import { useAuthStore } from "@/lib/authStore";
import { Card, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem } from "./ui/form";
import { useChatStore } from "@/lib/chatStore";
import { HTMLAttributes, forwardRef, useEffect, useRef } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";

const messageSchema = z.object({
  message: z.string(),
});

export const ChatBox = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const form = useForm<z.infer<typeof messageSchema>>({
    defaultValues: { message: "" },
  });

  const { messages, sendMessage, connect, disconnect, status } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function onSubmit({ message }: z.infer<typeof messageSchema>) {
    sendMessage(message);
    form.reset();
  }

  useEffect(() => {
    connect();

    return () => disconnect();
  }, [connect, disconnect]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  }, [messages]);

  const statusText =
    status === "CONNECTED" ? "🟢 Connected" : "🔴 Disconnected";

  return (
    <Card
      className={cn("flex h-[88vh] max-w-2xl flex-col", className)}
      {...props}
      ref={ref}
    >
      <CardHeader>
        <CardTitle>Global</CardTitle>
      </CardHeader>
      <ScrollArea className="flex-grow p-6 pt-0">
        {messages.map((msg, i) => (
          <div className="my-2" key={i}>
            <strong>{msg.name}</strong> {msg.message}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>
      <CardFooter className="pb-1">
        <Form {...form}>
          <form
            className="flex w-full space-x-2"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="w-full">
                  <Input
                    placeholder="Type a message..."
                    autoComplete="off"
                    autoFocus={true}
                    {...field}
                  />
                </FormItem>
              )}
            />
            <Button type="submit">Send</Button>
          </form>
        </Form>
      </CardFooter>
      <CardFooter className="justify-end pb-2">
        <div className="text-sm">{statusText}</div>
      </CardFooter>
    </Card>
  );
});
