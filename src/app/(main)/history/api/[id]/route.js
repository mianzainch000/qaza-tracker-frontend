import { apiConfig } from "@/config/apiConfig";
import axiosClient from "@/config/axiosClient";

export const deleteQaza = async (id) => {
    return await axiosClient.delete(`${apiConfig.deleteQaza}/${id}`);
};

export async function DELETE(req, { params }) {
    const { id } = params;
    const data = await deleteQaza(id);
    return new Response(JSON.stringify(data?.data), { status: data?.status });
}