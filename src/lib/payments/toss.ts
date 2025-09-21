import crypto from "crypto"

type ConfirmParams = {
  paymentKey: string
  orderId: string
  amount: number
}

export async function confirmTossPayment(params: ConfirmParams) {
  const secretKey = process.env.TOSS_SECRET_KEY
  if (!secretKey) {
    throw new Error("TOSS_SECRET_KEY is not set")
  }

  const basicAuthToken = Buffer.from(`${secretKey}:`).toString("base64")
  const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuthToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    const err = await safeJson(res)
    const message = typeof err?.message === "string" ? err.message : `confirm failed: ${res.status}`
    const code = typeof err?.code === "string" ? err.code : undefined
    const name = typeof err?.name === "string" ? err.name : undefined
    const error = new Error(message) as Error & { code?: string; name?: string; raw?: unknown }
    error.code = code
    error.name = name
    error.raw = err as unknown
    throw error
  }

  return (await res.json()) as unknown
}

export function generateOrderId() {
  // 6~64자, 영문/숫자/-/_/=
  const base = crypto.randomBytes(24).toString("base64") // includes + and /
  const safe = base.replace(/[+/]/g, () => (Math.random() > 0.5 ? "-" : "_"))
  return safe.replace(/=+$/, "=").slice(0, 24)
}

export function verifyTossWebhookSignature(rawBody: string, signatureHeader?: string | null): boolean {
  if (!signatureHeader) return false
  const secret = process.env.TOSS_WEBHOOK_SECRET
  if (!secret) return false

  // v1 style: "t=timestamp,v1=signature"
  if (/t=\d+,v1=/.test(signatureHeader)) {
    const parts = Object.fromEntries(
      signatureHeader.split(",").map((kv) => {
        const [k, v] = kv.split("=")
        return [k.trim(), (v ?? "").trim()]
      })
    ) as Record<string, string>
    const message = `${parts.t}.${rawBody}`
    const computed = crypto.createHmac("sha256", secret).update(message).digest("hex")
    return timingSafeEqual(parts.v1, computed)
  }

  // fallback: plain HMAC of body
  const computed = crypto.createHmac("sha256", secret).update(rawBody).digest("hex")
  return timingSafeEqual(signatureHeader, computed)
}

function timingSafeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) return false
  return crypto.timingSafeEqual(aBuf, bBuf)
}

async function safeJson(res: Response) {
  try {
    return await res.json()
  } catch {
    return null
  }
}


