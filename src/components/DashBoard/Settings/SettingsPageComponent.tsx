import { cookies } from "next/headers";
import prisma from "../../../../prisma/client";
import SettingsContent from "./SettingsContent";
import { User } from '@/lib/manage/user';
import { Id } from '@/lib/manage/types';
import { Toaster } from "react-hot-toast";

export const SettingsPageComponent = async () => {
  let sess = cookies().get('session-us')?.value;
  const userSession = await prisma.session.findFirst({ where: { sessionToken: sess } });
  if (sess == null)
    return <></>
  let usr = await prisma.user.findFirst({
    where: {
      Session: {
        some: {
          sessionToken: sess
        }
      }
    }
  });
  const db = await User.getAccessibleEntities(userSession.userId as Id<"User">);
  return (
    <div className="p-6">
      <Toaster
        position="top-center"
        reverseOrder={false}
      />
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="flex flex-row border-2 rounded-md ">
        <SettingsContent username={usr.Username} email={usr.Email} schema={db} isSuperAdmin={usr.isSuperAdmin} />
      </div>
    </div>
  )
}