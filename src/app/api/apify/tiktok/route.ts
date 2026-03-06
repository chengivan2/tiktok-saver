import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const token = process.env.APIFY_API_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'APIFY_API_TOKEN is missing' }, { status: 500 });
    }

    const actorId = "S5h7zRLfKFEr8pdj7";
    const input = {
      "commentsPerPost": 0,
      "excludePinnedPosts": false,
      "maxFollowersPerProfile": 0,
      "maxFollowingPerProfile": 0,
      "maxRepliesPerComment": 0,
      "postURLs": [url],
      "proxyCountryCode": "None",
      "resultsPerPage": 1,
      "scrapeRelatedVideos": false,
      "shouldDownloadAvatars": false,
      "shouldDownloadCovers": false,
      "shouldDownloadMusicCovers": false,
      "shouldDownloadSlideshowImages": false,
      "shouldDownloadVideos": true,
      "profileScrapeSections": ["videos"],
      "profileSorting": "latest",
      "searchSection": "",
      "maxProfilesPerQuery": 10,
      "searchSorting": "0",
      "searchDatePosted": "0",
      "downloadSubtitlesOptions": "NEVER_DOWNLOAD_SUBTITLES"
    };

    console.log('[Apify] Starting actor run via fetch...');
    
    // Run actor and wait for output (up to 120s timeout)
    const response = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${token}&timeout=110`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Apify] API Error:', errorData);
      throw new Error(`Apify API responded with ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const items = await response.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No data found. The video might be private or the URL is invalid.' }, { status: 404 });
    }

    const raw = items[0] as Record<string, any>;

    // Log for debugging
    console.log('[Apify] Received item count:', items.length);

    // Extract fields — Apify returns flat dot-notation keys
    const videoMeta = raw['videoMeta'] || {};
    const authorMeta = raw['authorMeta'] || {};

    const coverUrl: string = (raw['videoMeta.coverUrl'] as string) ?? videoMeta.coverUrl ?? '';
    const downloadAddrRaw: string = (raw['videoMeta.downloadAddr'] as string) ?? videoMeta.downloadAddr ?? '';
    const duration: number = (raw['videoMeta.duration'] as number) ?? videoMeta.duration ?? 0;
    const definition: string = (raw['videoMeta.definition'] as string) ?? videoMeta.definition ?? '';
    const format: string = (raw['videoMeta.format'] as string) ?? videoMeta.format ?? 'mp4';
    const text: string = (raw['text'] as string) ?? '';
    const authorName: string = authorMeta.name ?? authorMeta.nickName ?? (raw['authorMeta.name'] as string) ?? '';

    // Apify key-value store URLs require the API token for authentication
    let downloadAddr = downloadAddrRaw;
    if (downloadAddrRaw && downloadAddrRaw.includes('api.apify.com')) {
      const separator = downloadAddrRaw.includes('?') ? '&' : '?';
      downloadAddr = `${downloadAddrRaw}${separator}token=${token}`;
    }

    return NextResponse.json({
      data: {
        coverUrl,
        downloadAddr,
        duration,
        definition,
        format,
        text,
        authorName,
        _raw: raw,
      }
    });
  } catch (error: unknown) {
    console.error('Apify Scraper Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to scrape TikTok';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
