import { PrismaClient } from '@prisma/client';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(400).json({error: "Invalid request"})
    }
    const { user, password, host, port, dbname } = req.body;

    try {
        const prisma = new PrismaClient({
        datasources: { 
            db: { 
            url: `postgresql://${user}:${password}@${host}:${port}/${dbname}`
            } 
        } 
        });
        const result = await prisma.$queryRaw`SELECT table_name, column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' ORDER BY table_name;`;
        // console.log(`Connected to database: ${connectedDatabase}`);
        return res.status(200).json(result);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Failed to connect to the database' });
    }
  
}
