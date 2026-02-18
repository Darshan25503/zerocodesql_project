import { cookies } from "next/headers";
import prisma from "../../../prisma/client";
import Profile from "./Profile";

export const ProfilePage = async () => {
  let sess = cookies().get('session-us')?.value;
  if (sess == null) return <></>;

  let usr = await prisma.user.findFirst({
    where: {
      Session: {
        some: {
          sessionToken: sess
        }
      }
    }
  });

  if (!usr) return <p>User not found</p>;

  return (
      <Profile Username={usr.Username} Email={usr.Email} />
  );
};
