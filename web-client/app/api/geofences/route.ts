import { proxyToService } from "@/lib/proxy";

export async function GET(request: Request) {
  return proxyToService({ baseUrl: process.env.ALERT_API_URL, path: "/api/geofences", request });
}

export async function POST(request: Request) {
  return proxyToService({ baseUrl: process.env.ALERT_API_URL, path: "/api/geofences", request });
}
