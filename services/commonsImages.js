const COMMONS_API_URL = "https://commons.wikimedia.org/w/api.php";

function buildCommonsUrl(params) {
  const url = new URL(COMMONS_API_URL);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

function cleanText(value) {
  if (!value) return "";

  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function makeKoreanDescription(item, teamName) {
  const sourceText = item.description || item.title;

  return `${teamName}와 관련된 역대 포뮬러 원 레이스카 이미지입니다. 원본 자료명은 "${sourceText}"이며, Wikimedia Commons 공개 이미지 자료를 기반으로 불러왔습니다.`;
}

export const historicTeams = [
  {
    id: "ferrari",
    name: "Ferrari",
    query: "Ferrari Formula One car OR Ferrari F1 car",
    color: "#e10600",
  },
  {
    id: "mclaren",
    name: "McLaren",
    query: "McLaren Formula One car OR McLaren F1 car",
    color: "#ff8700",
  },
  {
    id: "williams",
    name: "Williams",
    query: "Williams Formula One car OR Williams F1 car",
    color: "#00a3e0",
  },
  {
    id: "mercedes",
    name: "Mercedes",
    query: "Mercedes Formula One car OR Mercedes F1 car",
    color: "#00a19c",
  },
  {
    id: "red-bull",
    name: "Red Bull Racing",
    query: "Red Bull Racing Formula One car OR Red Bull F1 car",
    color: "#1e5bff",
  },
  {
    id: "renault-alpine",
    name: "Renault / Alpine",
    query: "Renault Formula One car OR Alpine Formula One car",
    color: "#ff87bc",
  },
  {
    id: "lotus",
    name: "Lotus",
    query: "Lotus Formula One car OR Lotus F1 car",
    color: "#0f9d58",
  },
  {
    id: "brabham",
    name: "Brabham",
    query: "Brabham Formula One car OR Brabham F1 car",
    color: "#ffffff",
  },
  {
    id: "tyrrell",
    name: "Tyrrell",
    query: "Tyrrell Formula One car OR Tyrrell F1 car",
    color: "#2b6cff",
  },
  {
    id: "benetton",
    name: "Benetton",
    query: "Benetton Formula One car OR Benetton F1 car",
    color: "#00b050",
  },
  {
    id: "jordan",
    name: "Jordan",
    query: "Jordan Formula One car OR Jordan F1 car",
    color: "#ffd500",
  },
  {
    id: "minardi",
    name: "Minardi",
    query: "Minardi Formula One car OR Minardi F1 car",
    color: "#111111",
  },
];

export async function searchHistoricMachines({
  team,
  limit = 24,
  offset = 0,
}) {
  const searchUrl = buildCommonsUrl({
    action: "query",
    generator: "search",
    gsrsearch: `${team.query} filetype:bitmap`,
    gsrnamespace: "6",
    gsrlimit: String(limit),
    gsroffset: String(offset),
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "900",
    format: "json",
    origin: "*",
  });

  const response = await fetch(searchUrl);

  if (!response.ok) {
    throw new Error("Failed to fetch Wikimedia Commons images.");
  }

  const data = await response.json();
  const pages = Object.values(data.query?.pages || {});
  const nextOffset = data.continue?.gsroffset ?? null;

  const items = pages
    .map((page) => {
      const imageInfo = page.imageinfo?.[0];
      const metadata = imageInfo?.extmetadata || {};
      const title = cleanText(page.title.replace("File:", ""));
      const originalDescription = cleanText(metadata.ImageDescription?.value);
      const artist = cleanText(metadata.Artist?.value) || "알 수 없음";
      const license =
        cleanText(metadata.LicenseShortName?.value) ||
        cleanText(metadata.UsageTerms?.value) ||
        "라이선스 정보 확인 필요";

      const item = {
        id: page.pageid,
        title,
        originalTitle: title,
        image: imageInfo?.thumburl || imageInfo?.url,
        original: imageInfo?.url,
        pageUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(
          page.title.replaceAll(" ", "_")
        )}`,
        artist,
        license,
        description: originalDescription,
      };

      return {
        ...item,
        koreanTitle: title,
        koreanDescription: makeKoreanDescription(item, team.name),
      };
    })
    .filter((item) => item.image);

  return {
    items,
    nextOffset,
  };
}