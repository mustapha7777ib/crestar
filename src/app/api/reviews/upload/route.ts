import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { db } from "@/lib/db";

// Issues upload tokens for review photos. Only someone holding a delivered
// order's private review link can upload.
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const { orderId, token } = JSON.parse(clientPayload ?? "{}") as { orderId?: string; token?: string };
        const order = orderId ? await db.order.findUnique({ where: { id: orderId } }) : null;
        if (!order || order.reviewToken !== token || order.status !== "DELIVERED") throw new Error("Not allowed");
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/heic"],
          maximumSizeInBytes: 5 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
    });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
