import { NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';

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

    const client = new ApifyClient({ token });

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

    const run = await client.actor("S5h7zRLfKFEr8pdj7").call(input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }

    const raw = items[0] as Record<string, unknown>;

    // Log all keys to help debug
    console.log('[Apify] Raw item keys:', Object.keys(raw));
    console.log('[Apify] Raw item:', JSON.stringify(raw, null, 2));

    // Extract fields — Apify returns flat dot-notation keys
    const coverUrl: string = raw['videoMeta.coverUrl'] ?? raw['videoMeta']?.coverUrl ?? '';
    const downloadAddrRaw: string = raw['videoMeta.downloadAddr'] ?? raw['videoMeta']?.downloadAddr ?? '';
    const duration: number = raw['videoMeta.duration'] ?? raw['videoMeta']?.duration ?? 0;
    const definition: string = raw['videoMeta.definition'] ?? raw['videoMeta']?.definition ?? '';
    const format: string = raw['videoMeta.format'] ?? raw['videoMeta']?.format ?? 'mp4';
    const text: string = raw['text'] ?? '';
    const authorMeta = raw['authorMeta'] ?? {};
    const authorName: string = authorMeta?.name ?? authorMeta?.nickName ?? raw['authorMeta.name'] ?? '';

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
        _raw: raw, // include raw so frontend can debug if needed
      }
    });
  } catch (error: unknown) {
    console.error('Apify Actor Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to scrape TikTok';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
