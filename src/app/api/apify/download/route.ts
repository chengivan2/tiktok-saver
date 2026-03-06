import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoUrl = searchParams.get('url');

  if (!videoUrl) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  }

  // Only proxy known Apify URLs for security
  if (!videoUrl.includes('api.apify.com')) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 403 });
  }

  const upstream = await fetch(videoUrl);

  if (!upstream.ok) {
    return NextResponse.json({ error: 'Failed to fetch video' }, { status: upstream.status });
  }

  const contentType = upstream.headers.get('content-type') || 'video/mp4';
  
  // Extract filename from the URL path
  const urlPath = new URL(videoUrl).pathname;
  const filename = urlPath.split('/').pop() || 'tiktok-video.mp4';

  return new NextResponse(upstream.body, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
