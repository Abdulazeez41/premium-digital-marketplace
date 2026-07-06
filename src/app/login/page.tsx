import Link from "next/link";

import { Container } from "@/components/layout/container";
import { LoginForm } from "@/components/forms/login-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Container className="py-20">
      <div className="mx-auto max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Sign in to access your dashboard, orders, downloads, and course
              progress.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <LoginForm />
            <div className="flex items-center justify-between text-sm text-[#666666]">
              <Link href="/forgot-password" className="hover:text-[#7A1F2B]">
                Forgot password
              </Link>
              <Link href="/register" className="hover:text-[#7A1F2B]">
                Create account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
