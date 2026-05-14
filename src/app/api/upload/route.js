
import { requireApiAuth } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { isCloudinaryConfigured, uploadImageBuffer } from "@/lib/cloudinary";

export async function POST(req) {
  // Check authentication and role
  const gate = await requireApiAuth({ allowedRoles: ["admin"] });

  if (!gate.ok) {
    return jsonError(gate.error, gate.status);
  }

  // Check Cloudinary configuration
  if (!isCloudinaryConfigured()) {
    return jsonError(
      "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to .env.local",
      503
    );
  }

  try {
    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file");

    // Validate uploaded file
    if (!file || typeof file === "string") {
      return jsonError("No image file provided", 400);
    }

    // Debug logs (check terminal)
    console.log("Uploading file:", file.name);
    console.log("Type:", file.type);
    console.log("Size:", file.size);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Default MIME type if missing
    const mimeType = file.type || "image/jpeg";

    // Upload to Cloudinary
    const result = await uploadImageBuffer(buffer, { mimeType });

    console.log("Cloudinary upload result:", result);

    // Return uploaded image URL
    return jsonOk({
      url: result.url,
      publicId: result.publicId,
    });
  } catch (error) {
    // Print exact error in terminal
    console.error("Upload API Error:", error);

    return jsonError(
      error instanceof Error
        ? error.message
        : "Failed to upload image",
      500
    );
  }
}

