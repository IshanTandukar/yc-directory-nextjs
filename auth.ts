import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { AUTHOR_BY_GITHUB_ID_QUERY } from "./sanity/lib/query";
import { client } from "./sanity/lib/client";
import { writeClient } from "./sanity/lib/write-client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
  callbacks: {
    async signIn({
      user: { name, email, image },
      profile: { id, login, bio },
    }) {
      // const existingUser = await client
      //   .withConfig({ useCdn: false })
      //   .fetch(AUTHOR_BY_GITHUB_ID_QUERY, {
      //     id: id,
      //   });

      // if (!existingUser) {
      //   await writeClient.create({
      //     _type: "author",
      //     id,
      //     name,
      //     username: login,
      //     email,
      //     image,
      //     bio: bio || "",
      //   });
      // }

      // return true;
      try {
        const existingUser = await client
          .withConfig({ useCdn: false })
          .fetch(AUTHOR_BY_GITHUB_ID_QUERY, {
            id,
          });

        if (!existingUser) {
          await writeClient.create({
            _type: "author",
            id,
            name,
            username: login,
            email,
            image,
            bio: bio || "",
          });
        }

        return true;
      } catch (err) {
        console.error("[signIn error]", err);
        return false;
      }
    },

    async jwt({ token, account, profile }) {
      if (account && profile) {
        const user = await client
          .withConfig({ useCdn: false })
          .fetch(AUTHOR_BY_GITHUB_ID_QUERY, {
            id: profile?.id,
          });

        token.id = user?._id;
      }

      return token;
    },

    async session({ session, token }) {
      Object.assign(session, { id: token.id });
      return session;
    },
  },
});
