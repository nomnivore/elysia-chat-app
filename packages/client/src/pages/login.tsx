import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Form,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/authStore";
import { useEden } from "@/lib/useEden";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export function Login() {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const { api } = useEden();
  const { login } = useAuthStore();
  // tanstack useNavigate
  const navigate = useNavigate();

  const [loginFailed, setLoginFailed] = useState(false);
  const [abortController, setAbortController] = useState(new AbortController());

  function onSubmit({ username, password }: z.infer<typeof loginSchema>) {
    abortController.abort();
    setLoginFailed(false);

    const abort = new AbortController();
    setAbortController(abort);
    api.auth.login
      .post({ name: username, password, $fetch: { signal: abort.signal } })
      .then(({ data }) => {
        if (data) {
          login(data.token).then(() => navigate({ to: "/" }));
        } else {
          setLoginFailed(true);
        }
      });
  }

  return (
    <div className="mt-20 flex items-center justify-center">
      <div className="w-full bg-slate-100 py-24">
        <Card className="mx-auto w-[350px]">
          <CardHeader>
            <CardTitle>Log in</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormMessage>
                  {loginFailed && (
                    <>
                      {"Incorrect username/password. "}
                      <br />
                      {"Please try again."}
                    </>
                  )}
                </FormMessage>
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="elysia" {...field} />
                      </FormControl>
                      <FormMessage>{fieldState.error?.message}</FormMessage>
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
                  <Link
                    to="/register"
                    className={buttonVariants({ variant: "link" })}
                  >
                    Sign up
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Login;
