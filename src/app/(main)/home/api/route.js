import { apiConfig } from "@/config/apiConfig";
import axiosClient from "@/config/axiosClient";

export const getQazaLogs = async () => {
    return await axiosClient.get(apiConfig.getQaza);
};

export const saveQazaLog = async (params) => {
    return await axiosClient.post(apiConfig.saveQaza, params);
};

export async function GET() {
    const data = await getQazaLogs();
    return new Response(JSON.stringify(data?.data), { status: data?.status });
}

export async function POST(req) {
    const body = await req.json();
    const data = await saveQazaLog(body);
    return new Response(JSON.stringify(data?.data), { status: data?.status });
}