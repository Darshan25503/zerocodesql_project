import { cookies } from "next/headers";
import prisma from "../../../prisma/client";

export class Auth {
    // Authenticate a user's session
    public static async authenticate() {
        let sess = cookies().get("session-us")?.value;
        let authenticated = null;
        if (sess != null) {
            const userSession = await prisma.session.findFirst({ where: { sessionToken: sess } });
            if (userSession != null) {
                authenticated = userSession.userId;
            }
        }
        return authenticated;
    }
}
