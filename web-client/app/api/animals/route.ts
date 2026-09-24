import { proxyToService } from "@/lib/proxy";

export async function GET(request: Request) {
  return proxyToService({ baseUrl: process.env.ANIMAL_API_URL, path: "/api/animals", request });
}

export async function POST(request: Request) {
  return proxyToService({ baseUrl: process.env.ANIMAL_API_URL, path: "/api/animals", request });
}
