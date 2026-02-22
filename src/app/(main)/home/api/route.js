import { apiConfig } from "@/config/apiConfig";
import axiosClient from "@/config/axiosClient";

export const getQazaLogs = async () => {
    return await axiosClient.get(apiConfig.getQaza);
};

export const saveQazaLog = async (params) => {
    return await axiosClient.post(apiConfig.saveQaza, params);
};

export const subscribeUser = async (params) => {
    return await axiosClient.post(apiConfig.subscribe, params);
};

export const updateUserSettings = async (params) => {
    return await axiosClient.post(apiConfig.updateSettings, params);
};

export async function GET() {
    const data = await getQazaLogs();
    return new Response(JSON.stringify(data?.data), { status: data?.status });
}

export async function POST(req) {
    try {
        const body = await req.json();

        if (body.subscription) {
            const data = await subscribeUser(body);
            return new Response(JSON.stringify(data?.data), { status: data?.status });
        }

        if (body.reminderTimes) {
            const data = await updateUserSettings(body);
            return new Response(JSON.stringify(data?.data), { status: data?.status });
        }

        const data = await saveQazaLog(body);
        return new Response(JSON.stringify(data?.data), { status: data?.status });
    } catch (error) {
        return new Response(JSON.stringify({ message: error.message }), {
            status: 500,
        });
    }
}
