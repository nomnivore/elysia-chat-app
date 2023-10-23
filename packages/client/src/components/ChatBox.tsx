import { useAuthStore } from "@/lib/authStore";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem } from "./ui/form";
import { useChatStore } from "@/lib/chatStore";
import { useEffect } from "react";

const messageSchema = z.object({
  message: z.string(),
});

export const ChatBox = () => {
  const form = useForm<z.infer<typeof messageSchema>>({
    defaultValues: { message: "" },
  });
  const { token } = useAuthStore();

  const { messages, sendMessage, connect, disconnect, status } = useChatStore();

  async function onSubmit({ message }: z.infer<typeof messageSchema>) {
    sendMessage(message);
    form.reset();
  }

  useEffect(() => {
    if (token) connect(token);

    return () => disconnect();
  }, [connect, disconnect, token]);

  const statusText =
    status === "CONNECTED" ? "🟢 Connected" : "🔴 Disconnected";

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Global</CardTitle>
      </CardHeader>
      <CardContent>
        {messages.map((msg, i) => (
          <div className="my-2" key={i}>
            <strong>{msg.name}</strong> {msg.message}
          </div>
        ))}
      </CardContent>
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
};
