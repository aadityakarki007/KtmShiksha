import { v2 as cloudinary } from "cloudinary";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function configure() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * @param {Buffer} buffer
 * @param {{ mimeType: string }} opts
 * @returns {Promise<{ url: string; publicId: string }>}
 */
export async function uploadImageBuffer(buffer, { mimeType }) {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured");
  }
  if (!ALLOWED.has(mimeType)) {
    throw new Error("Only JPEG, PNG, WebP, and GIF images are allowed");
  }
  if (buffer.length > MAX_BYTES) {
    throw new Error("Image must be 8 MB or smaller");
  }

  configure();

  const folder = process.env.CLOUDINARY_FOLDER || "ktm-shiksha/updates";
  const b64 = buffer.toString("base64");
  const dataUri = `data:${mimeType};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    overwrite: false,
  });

  return { url: result.secure_url, publicId: result.public_id };
}
