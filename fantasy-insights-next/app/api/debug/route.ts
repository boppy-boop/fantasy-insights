export async function GET() {
  return Response.json({
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    YAHOO_REDIRECT_URI: process.env.YAHOO_REDIRECT_URI,
  })
}
