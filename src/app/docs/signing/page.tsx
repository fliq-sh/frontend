import { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DocH1, DocLead, DocH2, DocP, DocUL, DocLI, DocCode, DocPre, DocCallout, DocNextPrev,
} from "../DocsPage";

export const metadata: Metadata = { title: "Webhook Signing" };

export default async function SigningPage() {
  return (
    <article>
      <DocH1>Webhook Signing</DocH1>
      <DocLead>
        Verify that incoming requests to your endpoints are genuinely from Fliq
        using HMAC-SHA256 signatures.
      </DocLead>

      <DocCallout type="info">
        Signature verification is optional but <strong>strongly recommended</strong> for
        production workloads. Without it, anyone who discovers your endpoint URL
        can send forged requests.
      </DocCallout>

      <DocH2>How it works</DocH2>
      <DocP>
        Every outgoing request from Fliq — both job executions and webhook
        notifications — includes two signature headers:
      </DocP>
      <DocPre lang="http">{`X-Fliq-Timestamp: 1774076020
X-Fliq-Signature: v1=661165d836a1ea...`}</DocPre>
      <DocUL>
        <DocLI>
          <DocCode>X-Fliq-Timestamp</DocCode> — Unix timestamp (seconds) when
          the request was signed. Use this to reject stale requests (replay
          protection).
        </DocLI>
        <DocLI>
          <DocCode>X-Fliq-Signature</DocCode> — HMAC-SHA256 signature prefixed
          with <DocCode>v1=</DocCode>. The version prefix allows future algorithm
          upgrades without breaking existing integrations.
        </DocLI>
      </DocUL>

      <DocH2>Getting your signing secret</DocH2>
      <DocP>
        Go to <strong>Dashboard &rarr; Settings &rarr; Webhook Signing</strong> to
        view your signing secret. It starts with <DocCode>whsec_</DocCode>.
        You can rotate it at any time — rotation takes effect immediately.
      </DocP>
      <DocCallout type="warning">
        After rotation, in-flight jobs may temporarily use the previous secret.
        They will be retried automatically with the new secret.
      </DocCallout>

      <DocH2>Signature scheme</DocH2>
      <DocP>
        The signed payload is a dot-separated string of four fields:
      </DocP>
      <DocPre label="signed payload">{`{timestamp}.{METHOD}.{url}.{body}`}</DocPre>
      <DocUL>
        <DocLI>
          <DocCode>timestamp</DocCode> — exact value of the{" "}
          <DocCode>X-Fliq-Timestamp</DocCode> header
        </DocLI>
        <DocLI>
          <DocCode>METHOD</DocCode> — uppercase HTTP method (e.g.{" "}
          <DocCode>POST</DocCode>)
        </DocLI>
        <DocLI>
          <DocCode>url</DocCode> — full URL of the request, as configured in
          the job
        </DocLI>
        <DocLI>
          <DocCode>body</DocCode> — raw request body, or empty string if none
        </DocLI>
      </DocUL>
      <DocP>
        The HMAC is computed using SHA-256 with your signing secret as the key,
        then hex-encoded and prefixed with <DocCode>v1=</DocCode>.
      </DocP>

      <DocH2>Verification examples</DocH2>
      <DocP>
        Copy the verification function for your language and call it in your
        request handler before processing the payload.
      </DocP>

      <Tabs defaultValue="python" className="my-5">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="python">Python</TabsTrigger>
          <TabsTrigger value="node">Node.js</TabsTrigger>
          <TabsTrigger value="go">Go</TabsTrigger>
        </TabsList>
        <TabsContent value="python">
          <DocPre lang="python">{`import hmac, hashlib, time

def verify_fliq_signature(secret, timestamp, method, url, body, signature):
    # Reject requests older than 5 minutes
    if abs(time.time() - int(timestamp)) > 300:
        raise ValueError("Timestamp too old — possible replay attack")

    payload = f"{timestamp}.{method}.{url}.{body or ''}"
    expected = "v1=" + hmac.new(
        secret.encode(), payload.encode(), hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected, signature):
        raise ValueError("Invalid signature")

# Usage in your request handler:
# verify_fliq_signature(
#     secret="whsec_...",
#     timestamp=request.headers["X-Fliq-Timestamp"],
#     method=request.method,
#     url=request.url,
#     body=request.get_data(as_text=True),
#     signature=request.headers["X-Fliq-Signature"],
# )`}</DocPre>
        </TabsContent>
        <TabsContent value="node">
          <DocPre lang="javascript">{`const crypto = require("crypto");

function verifyFliqSignature(secret, timestamp, method, url, body, signature) {
  // Reject requests older than 5 minutes
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
    throw new Error("Timestamp too old — possible replay attack");
  }

  const payload = \`\${timestamp}.\${method}.\${url}.\${body || ""}\`;
  const expected =
    "v1=" + crypto.createHmac("sha256", secret).update(payload).digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    throw new Error("Invalid signature");
  }
}

// Usage in Express:
// app.post("/webhook", (req, res) => {
//   verifyFliqSignature(
//     process.env.FLIQ_SIGNING_SECRET,
//     req.headers["x-fliq-timestamp"],
//     req.method,
//     \`\${req.protocol}://\${req.get("host")}\${req.originalUrl}\`,
//     req.body,
//     req.headers["x-fliq-signature"],
//   );
//   // ... handle request
// });`}</DocPre>
        </TabsContent>
        <TabsContent value="go">
          <DocPre lang="go">{`package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"math"
	"strconv"
	"time"
)

func VerifyFliqSignature(secret, timestamp, method, url, body, signature string) error {
	ts, err := strconv.ParseInt(timestamp, 10, 64)
	if err != nil {
		return fmt.Errorf("invalid timestamp")
	}
	if math.Abs(float64(time.Now().Unix()-ts)) > 300 {
		return fmt.Errorf("timestamp too old")
	}

	payload := fmt.Sprintf("%s.%s.%s.%s", timestamp, method, url, body)
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(payload))
	expected := "v1=" + hex.EncodeToString(mac.Sum(nil))

	if !hmac.Equal([]byte(expected), []byte(signature)) {
		return fmt.Errorf("invalid signature")
	}
	return nil
}`}</DocPre>
        </TabsContent>
      </Tabs>

      <DocH2>Best practices</DocH2>
      <DocUL>
        <DocLI>
          <strong>Always check the timestamp.</strong> Reject requests where{" "}
          <DocCode>X-Fliq-Timestamp</DocCode> is more than 5 minutes old to
          prevent replay attacks.
        </DocLI>
        <DocLI>
          <strong>Use constant-time comparison.</strong> Use{" "}
          <DocCode>hmac.compare_digest</DocCode> (Python),{" "}
          <DocCode>crypto.timingSafeEqual</DocCode> (Node.js), or{" "}
          <DocCode>hmac.Equal</DocCode> (Go) to prevent timing attacks.
        </DocLI>
        <DocLI>
          <strong>Store the secret securely.</strong> Use environment variables
          or a secrets manager — never hardcode it in your source code.
        </DocLI>
        <DocLI>
          <strong>Rotate periodically.</strong> You can rotate your signing
          secret at any time from the dashboard. In-flight jobs will
          self-heal via automatic retries.
        </DocLI>
      </DocUL>

      <DocNextPrev
        prev={{ label: "Buffers", href: "/docs/buffers" }}
        next={{ label: "API Reference", href: "/docs/api-reference" }}
      />
    </article>
  );
}
