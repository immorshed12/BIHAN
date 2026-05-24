import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GatewayState from '@/models/GatewayState';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { deviceId, appVersion, status } = body;

    if (!deviceId || !appVersion) {
      return NextResponse.json({ error: 'Device ID and App Version are required' }, { status: 400 });
    }

    // Upsert the gateway heartbeat state
    const gateway = await GatewayState.findOneAndUpdate(
      { deviceId },
      {
        deviceId,
        lastPing: new Date(),
        status: status || 'online',
        appVersion,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      message: 'Gateway heartbeat received successfully',
      status: gateway.status,
      lastPing: gateway.lastPing,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Gateway ping error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
