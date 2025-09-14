import { NextRequest, NextResponse } from "next/server"
import { ElevenLabsClient, play } from '@elevenlabs/elevenlabs-js'

export async function GET(
  req: NextRequest,
) {



 
  return NextResponse.json({message: "ok"})
}
