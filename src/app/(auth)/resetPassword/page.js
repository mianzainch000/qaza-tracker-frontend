import React from "react";
import { Suspense } from "react";
import ResetPassword from "./template";

const ResetPasswordForm = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPassword />
    </Suspense>
  );
};

export default ResetPasswordForm;

export function generateMetadata() {
  return { title: "Reset Password" };
}
