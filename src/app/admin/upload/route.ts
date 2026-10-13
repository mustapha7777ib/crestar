import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { checkAdminAuth } from "@/lib/admin-auth";

// Issues upload tokens for product photos chosen in the admin product editor.
// The photo goes straight from the browser to Vercel Blob.
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        if (checkAdminAuth(request.headers.get("authorization")) !== "ok") throw new Error("Not authorised");
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          maximumSizeInBytes: 10 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
    });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
