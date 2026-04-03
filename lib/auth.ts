import { NextAuthOptions } from "next-auth";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: "email,public_profile,pages_show_list,pages_manage_metadata,pages_messaging,pages_read_engagement,pages_manage_posts",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.passwordHash) {
          throw new Error("User not found");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }
        
        if (!user.isVerified) {
          throw new Error("Please verify your email before logging in");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image
        };
      }
    })
  ],
  pages: {
    signIn: '/register',
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "facebook") {
        const email = user.email || profile?.email || null;

        let existingUser = null;
        
        if (email) {
          existingUser = await prisma.user.findUnique({
            where: { email }
          });
        }
        
        if (!existingUser) {
          existingUser = await prisma.user.findUnique({
            where: { facebookId: account.providerAccountId }
          });
        }

        if (existingUser) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              facebookConnected: true,
              facebookId: account.providerAccountId,
              facebookAccessToken: account.access_token,
              ...(email && !existingUser.email ? { email } : {}), // Update email if previously empty
            }
          });
        } else {
          // Fallback if no email is provided to avoid error
          const fallbackEmail = email || `${account.providerAccountId}@facebook.local`;
          
          await prisma.user.create({
            data: {
              name: user.name || "Facebook User",
              email: fallbackEmail,
              isVerified: true,
              image: user.image,
              facebookConnected: true,
              facebookId: account.providerAccountId,
              facebookAccessToken: account.access_token,
            }
          });
        }
        return true;
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      // Whenever jwt is invoked, we query the db to ensure we have the absolute latest state
      // (Optimization: we could trigger the update via useSession({ update: ... }) but hitting DB here guarantees freshness)
      if (token.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: token.email } });
        if (dbUser) {
          token.id = dbUser.id;
          token.facebookConnected = dbUser.facebookConnected;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).facebookConnected = token.facebookConnected;
      }
      return session;
    }
  }
};
