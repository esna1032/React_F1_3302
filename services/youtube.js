const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

export async function searchDriverAnthem(query) {
  if (!YOUTUBE_API_KEY) {
    throw new Error("YouTube API key is missing.");
  }

  const url = new URL(YOUTUBE_SEARCH_URL);

  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "1");
  url.searchParams.set("videoEmbeddable", "true");
  url.searchParams.set("safeSearch", "moderate");
  url.searchParams.set("key", YOUTUBE_API_KEY);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch YouTube video.");
  }

  const data = await response.json();
  const video = data.items?.[0];

  if (!video?.id?.videoId) {
    throw new Error("No YouTube video found.");
  }

  return {
    videoId: video.id.videoId,
    title: video.snippet.title,
    channelTitle: video.snippet.channelTitle,
    thumbnail: video.snippet.thumbnails?.high?.url,
  };
}