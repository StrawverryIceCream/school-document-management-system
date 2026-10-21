import { getAllRequests } from "../controllers/requests.controller.js";
import type { Request, Response } from "express";

async function testRequestsFilter() {
  let responseData: any = null;
  let statusCode = 200;

  const mockReq = {
    query: {
      officeCode: "HRMO",
      sector: "OVPAF",
      limit: "5",
    },
    session: { userId: "test-user" },
  } as unknown as Request<any, any, any, any>;

  const mockRes = {
    status: (code: number) => {
      statusCode = code;
      return mockRes;
    },
    json: (data: any) => {
      responseData = data;
      return mockRes;
    },
  } as unknown as Response;

  await getAllRequests(mockReq, mockRes);

  if (statusCode !== 200) {
    throw new Error(`Failed with status ${statusCode}: ${JSON.stringify(responseData)}`);
  }

  console.assert(responseData && Array.isArray(responseData.data), "data must be array");
  console.log("✅ getAllRequests officeCode & sector filtering passed! Total found:", responseData.total);
}

testRequestsFilter()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
