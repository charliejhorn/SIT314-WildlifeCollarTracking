import { proxyToService } from "@/lib/proxy";

type Context = { params: Promise<{ id: string }> };

async function forward(request: Request, { params }: Context) {
  const { id } = await params;
  return proxyToService({ baseUrl: process.env.ANIMAL_API_URL, path: `/api/animals/${id}`, request });
}

export const GET = forward;
export const PUT = forward;
