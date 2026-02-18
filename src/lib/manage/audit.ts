import { use } from "react";
import prisma from "../../../prisma/client";
import { Id } from "./types";

export class Audit {
    public static async log(user: Id<"User">, kind: string, message: string) {
        await prisma.audit.create({
            data: {
                kind: kind,
                Message: message,
                User_id: user,
                Timestamp: new Date(),
            },
        });
    }

    public static async get(offset: number, count: number, user_id?: number) {
        const whereCondition = user_id !== undefined ? { User_id: user_id } : undefined;
        if(offset == undefined && count == undefined)
        {
            return await prisma.audit.findMany({
                where: whereCondition,
                orderBy: {
                    Timestamp: "desc",
                },
                select: {
                    Id: true,
                    kind: true,
                    Message: true,
                    Timestamp: true,
                    User: {
                        select: {
                            id: true,
                            Username: true,
                        },
                    },
                },
            });
        }
        return await prisma.audit.findMany({
            where: whereCondition,
            take: count,
            skip: offset,
            orderBy: {
                Timestamp: "desc",
            },
            select: {
                Id: true,
                kind: true,
                Message: true,
                Timestamp: true,
                User: {
                    select: {
                        id: true,
                        Username: true,
                    },
                },
            },
        });
    }

    public static async getCount(user_id?: number): Promise<number> {
        if(user_id) {
            return await prisma.audit.count({
                where: {
                    User_id: user_id
                }
            })
        }
        else {
            return await prisma.audit.count();
        }
    }
}
