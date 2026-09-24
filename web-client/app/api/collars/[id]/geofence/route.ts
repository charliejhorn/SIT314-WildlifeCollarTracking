import { proxyToService } from "@/lib/proxy";

type Context = { params: Promise<{ id: string }> };

async function forward(request: Request, { params }: Context) {
  const { id } = await params;
  return proxyToService({
    baseUrl: process.env.ALERT_API_URL,
    path: `/api/geofences/collars/${id}/geofence`,
    request,
    method: request.method === "PUT" ? "POST" : request.method,
  });
}

export const GET = forward;
export const PUT = forward;
