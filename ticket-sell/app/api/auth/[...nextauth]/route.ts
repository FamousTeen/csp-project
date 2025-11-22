// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

// NextAuth expects a default export of a handler
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  // If environment is misconfigured, NextAuth would fail — but throw early
  console.warn("Supabase env vars missing for NextAuth");
}

const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error || !data.user) {
          return null;
        }

        // Return a minimal user object for NextAuth
        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name ?? undefined,
          role: data.user.user_metadata?.role ?? "user", // if you store role in metadata
        };
      },
    }),
  ],

  pages: {
    signIn: "/login", // optional: custom sign-in page
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      // on sign-in, `user` will be defined
      if (user) {
        token.user = user;
      }
      return token;
    },

    async session({ session, token }) {
      // Attach the user object to the session (client will see session.user)
      if (token.user) session.user = token.user;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(options);
export { handler as GET, handler as POST };
