export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  // Resumable streams are currently disabled
  return new Response(null, { status: 204 });
}
