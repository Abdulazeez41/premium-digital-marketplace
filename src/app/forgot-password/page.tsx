import { Container } from "@/components/layout/container";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : undefined;

  return (
    <Container className="py-20">
      <div className="mx-auto max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>
              {token ? "Set a new password" : "Reset your password"}
            </CardTitle>
            <CardDescription>
              {token
                ? "Choose a strong new password for your account."
                : "Enter your email address and we will send a secure reset link."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {token ? (
              <ResetPasswordForm token={token} />
            ) : (
              <ForgotPasswordForm />
            )}
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
