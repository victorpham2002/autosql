// import prisma from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse){
    
    try{
        const prisma = new PrismaClient()
        const allTable = await prisma.$queryRaw`SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE';`
        res.status(200).json(allTable)
    }catch{
        res.status(500).json({error: 'An error occurred while fetching table information'})
    }
}