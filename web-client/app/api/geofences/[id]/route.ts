import { proxyToService } from "@/lib/proxy";

type Context = { params: Promise<{ id: string }> };

async function forward(request: Request, { params }: Context) {
  const { id } = await params;
  return proxyToService({ baseUrl: process.env.ALERT_API_URL, path: `/api/geofences/${id}`, request });
}

export const GET = forward;
export const PUT = forward;
export const DELETE = forward;
