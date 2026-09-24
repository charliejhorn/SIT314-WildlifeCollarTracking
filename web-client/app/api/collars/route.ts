import { proxyToService } from "@/lib/proxy";

export async function GET(request: Request) {
  return proxyToService({ baseUrl: process.env.COLLAR_API_URL, path: "/api/collars", request });
}

export async function POST(request: Request) {
  return proxyToService({ baseUrl: process.env.COLLAR_API_URL, path: "/api/collars", request });
}
