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

function uploadBufferToCloudinary(
  buffer: Buffer,
  options: {
    folder: string;
    publicId: string;
    resourceType: "image" | "auto";
  },
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.publicId,
        resource_type: options.resourceType,
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

export function uploadPaymentProof(
  buffer: Buffer,
  paymentId: string,
): Promise<string> {
  return uploadBufferToCloudinary(buffer, {
    folder: "student-document-management-system/payment-proofs",
    publicId: `payment-${paymentId}-${Date.now()}`,
    resourceType: "image",
  });
}

export function uploadRefundQrCode(
  buffer: Buffer,
  paymentId: string,
): Promise<string> {
  return uploadBufferToCloudinary(buffer, {
    folder: "student-document-management-system/refund-qr-codes",
    publicId: `refund-qr-${paymentId}-${Date.now()}`,
    resourceType: "image",
  });
}

export function uploadRefundProof(
  buffer: Buffer,
  paymentId: string,
): Promise<string> {
  return uploadBufferToCloudinary(buffer, {
    folder: "student-document-management-system/refund-proofs",
    publicId: `refund-proof-${paymentId}-${Date.now()}`,
    resourceType: "image",
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

export function uploadRequestAttachment(
  buffer: Buffer,
  requestId: string,
  key: string,
): Promise<string> {
  const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40) || "file";
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "student-document-management-system/request-attachments",
        public_id: `req-${requestId}-${safeKey}-${Date.now()}`,
        resource_type: "auto",
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
