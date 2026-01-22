import { createFileRoute } from "@tanstack/react-router";
import type * as React from "react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute(`/login`)({
  component: Layout,
  ssr: false,
});

function Layout() {
  const [email, setEmail] = useState(``);
  const [password, setPassword] = useState(``);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(``);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(``);

    try {
      let { data: _data, error } = await authClient.signUp.email(
        {
          email,
          password,
          name: email,
        },
        {
          onSuccess: () => {
            window.location.href = `/`;
          },
        }
      );

      if (error?.code === `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL`) {
        const result = await authClient.signIn.email(
          {
            email,
            password,
          },
          {
            onSuccess: async () => {
              await authClient.getSession();
              window.location.href = `/`;
            },
          }
        );

        _data = result.data;
        error = result.error;
      }

      if (error) {
        console.error(`Authentication error:`, error);
        setError(error.message || `Authentication failed`);
      }
    } catch (err) {
      console.error(`Unexpected error:`, err);
      setError(`An unexpected error occurred`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign in to your account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertDescription>
              <strong>Development Mode:</strong> Any email/password combination
              will work for testing. New accounts will be automatically created
              when you try signing in with a new combo.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? `Signing in...` : `Sign in`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
