import Link from "next/link";

import { Container } from "@/components/layout/container";
import { RegisterForm } from "@/components/forms/register-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <Container className="py-20">
      <div className="mx-auto max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Purchase products, access your library instantly, and continue
              learning from any device.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <RegisterForm />
            <p className="text-sm text-[#666666]">
              Already have an account?{" "}
              <Link href="/login" className="text-[#7A1F2B]">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
