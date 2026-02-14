import NextAuth from "next-auth";
import { cookies } from "next/headers";
import { apiConfig } from "@/config/apiConfig";
import axiosClient from "@/config/axiosClient";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await axiosClient.post(
            `${apiConfig.baseUrl}${apiConfig.login}`,
            {
              email: credentials?.email,
              password: credentials?.password,
            },
          );

          if (res?.status === 200) {
            // ✅ Save cookies
            const { token, user } = res.data;

            cookies().set("sessionToken", token, {
              secure: true,
              maxAge: 24 * 60 * 60,
            });

            cookies().set("firstName", user.firstName, {
              maxAge: 24 * 60 * 60,
            });
            cookies().set("lastName", user.lastName, { maxAge: 24 * 60 * 60 });
            return { ...user, message: res.data.message };
          } else {
            throw new Error(res?.data?.message || "Login failed");
          }
        } catch (error) {
          console.error(
            "Authorize error:",
            error?.response?.data || error.message,
          );
          const backendMessage =
            error?.response?.data?.message ||
            error.message ||
            "Invalid email or password";
          throw new Error(backendMessage);
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
