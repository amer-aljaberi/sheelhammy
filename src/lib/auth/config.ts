import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

// Dynamic import for Prisma to avoid edge runtime issues
async function getPrisma() {
  const { prisma } = await import("@/lib/db");
  return prisma;
}

// Validate that secret is set
const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
if (!secret || secret === "your-secret-key-here-change-this-in-production") {
  console.error(
    "⚠️  NEXTAUTH_SECRET is not set or is using default value. Please set a secure secret in your .env file."
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const prisma = await getPrisma();
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            avatar: true,
            password: true,
            permissions: true,
          },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // Parse permissions if it's a JSON string
        let permissions: string[] | null = null;
        if (user.permissions) {
          if (Array.isArray(user.permissions)) {
            // Ensure all items are strings
            permissions = user.permissions.filter((p): p is string => typeof p === 'string');
          } else if (typeof user.permissions === 'string') {
            try {
              const parsed = JSON.parse(user.permissions);
              permissions = Array.isArray(parsed) ? parsed.filter((p): p is string => typeof p === 'string') : null;
            } catch {
              permissions = null;
            }
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          permissions,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        // Type assertion needed because permissions is added dynamically
        const userWithPermissions = user as typeof user & { permissions?: string[] | null };
        token.permissions = userWithPermissions.permissions || null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.permissions = token.permissions || null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: secret || "fallback-secret-for-development-only-change-in-production",
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
  basePath: "/api/auth",
});
