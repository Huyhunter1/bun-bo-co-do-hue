// src/app/api/health/route.ts - Health check endpoint
import { NextResponse } from "next/server";
import { checkMongoDBHealth } from "@/lib/mongodb";

export async function GET() {
  try {
    const mongoHealth = await checkMongoDBHealth();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      mongodb: mongoHealth,
      status: mongoHealth.connected ? "healthy" : "degraded",
    }, { 
      status: mongoHealth.connected ? 200 : 503 
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        error: error.message,
        status: "unhealthy",
      },
      { status: 503 }
    );
  }
}
