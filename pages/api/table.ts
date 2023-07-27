// import prisma from "@/lib/prisma";
import { Prisma, PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse){
    if (req.method !== 'POST') {
        return res.status(400).json({error: "Invalid request"})
    }
    const { info, msg } = req.body
    const { user, password, host, port, dbname} = info
    try{
        const prisma = new PrismaClient({
            datasources: { 
                db: { 
                url: `postgresql://${user}:${password}@${host}:${port}/${dbname}`
                } 
            } 
            });
            const result = await prisma.$queryRawUnsafe(msg);
        await prisma.$disconnect()
        res.status(200).json(result)
       
    }catch(error){
        res.status(500).json(error)
    }
}