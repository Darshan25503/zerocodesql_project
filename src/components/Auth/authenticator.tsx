import { cookies, headers } from "next/headers";
import prisma from "../../../prisma/client";
import { redirect } from "next/navigation";

const protectedRoutes = ['/dashboard/home', '/dashboard/users'];
const unProtectedRoutes = ['/auth/signin', '/auth/signup','/auth/signinotp'];

export const Authenticator = async ({ children }: { children: React.ReactNode }) => {
  const path = headers().get('x-current-path');

  let sess = cookies().get('session-us')?.value;
  let authenticated = false;
  if (sess != null) {
    const userSession = await prisma.session.findFirst({ where: { sessionToken: sess } });
    if (userSession != null) {
      authenticated = true;
    }
  }


  if (authenticated && unProtectedRoutes.includes(path))
    return redirect('/dashboard/home')

  if (protectedRoutes.includes(path)) {
    if (authenticated)
      return <>{children}</>
    else
      return redirect('/auth/signin')
  } else {
    return <>{children}</>
  }
}