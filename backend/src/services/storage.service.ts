import { v2 as cloudinary } from "cloudinary";

const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
} satisfies {
  cloud_name: string;
  api_key: string;
  api_secret: string;
};

cloudinary.config(cloudinaryConfig);

export function uploadPaymentProof(
  buffer: Buffer,
  paymentId: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "student-document-management-system/payment-proofs",
        public_id: `payment-${paymentId}-${Date.now()}`,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result)
          return reject(error ?? new Error("Upload failed"));
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

export function uploadCorProof(
  buffer: Buffer,
  userId: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "student-document-management-system/cor-proofs",
        public_id: `cor-${userId}-${Date.now()}`,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result)
          return reject(error ?? new Error("Upload failed"));
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}
