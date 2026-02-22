import { apiConfig } from "@/config/apiConfig";
import axiosClient from "@/config/axiosClient";

export async function GET(request) {
    try {
        // Query se month nikalna (e.g., ?month=2026-02)
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month');

        // Axios client ke zariye backend controller ko call karna
        // Hum query param ko aage pass kar rahe hain
        const response = await axiosClient.get(`${apiConfig.getMonthlyStats}?month=${month}`);

        return new Response(JSON.stringify(response.data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            message: error.response?.data?.message || error.message
        }), { status: error.response?.status || 500 });
    }
}