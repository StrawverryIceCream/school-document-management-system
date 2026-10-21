import { getRequestRoutingSteps } from "../controllers/routingSteps.controller.js";
import type { Request, Response } from "express";

async function testRoutingSteps() {
  let responseData: any = null;
  let statusCode = 200;

  const mockReq = {
    params: {
      id: "00000000-0000-0000-0000-000000000000",
    },
    session: { userId: "test-user" },
  } as unknown as Request<any>;

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

  await getRequestRoutingSteps(mockReq, mockRes);

  if (statusCode !== 200) {
    throw new Error(`Failed with status ${statusCode}: ${JSON.stringify(responseData)}`);
  }

  console.assert(responseData && Array.isArray(responseData.data), "data must be an array");
  console.log("✅ getRequestRoutingSteps passed! Empty steps returned for non-existent test ID:", responseData.data.length);
}

testRoutingSteps()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
