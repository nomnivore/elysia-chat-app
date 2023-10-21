import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  Form,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEden } from "@/lib/useEden";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username is too short")
    .max(20, "Username is too long"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password is too short")
    .max(100, "Password is too long"),
});

export function Register() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const { api } = useEden();
  const [nameTaken, setNameTaken] = useState(false);
  const currentUsername = form.watch("username");

  function onSubmit({ username, password }: z.infer<typeof formSchema>) {
    setNameTaken(false);
    api.auth.register.post({ name: username, password }).then(({ status }) => {
      if (status === 201) {
        console.log("success");
        // TODO: redirect to login
      } else if (status === 409) {
        // TODO: display this message
        setNameTaken(true);
      }
    });
  }

  useEffect(() => setNameTaken(false), [currentUsername]);

  return (
    <div className="mt-20 flex items-center justify-center">
      <div className="w-full bg-slate-100 py-24">
        <Card className="mx-auto w-[350px]">
          <CardHeader>
            <CardTitle>Create account</CardTitle>
            <CardDescription>
              Get started on your chat-app journey.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="elysia" {...field} />
                      </FormControl>
                      <FormDescription>
                        This will be your display name.
                      </FormDescription>
                      <FormMessage>
                        {fieldState.error?.message ||
                          (nameTaken && "Username is already taken")}
                      </FormMessage>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••" {...field} />
                      </FormControl>
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                  )}
                />

                <div className="space-x-4 space-y-2">
                  <Button type="submit">Submit</Button>
                  <a href="#" className={buttonVariants({ variant: "link" })}>
                    Log in
                  </a>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Register;
