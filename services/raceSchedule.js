const CURRENT_SEASON_URL = "https://api.jolpi.ca/ergast/f1/current.json";

const sessionLabels = {
  FirstPractice: "FP1",
  SecondPractice: "FP2",
  ThirdPractice: "FP3",
  SprintQualifying: "Sprint Qualifying",
  Sprint: "Sprint",
  Qualifying: "Qualifying",
};

function getRaceDateTime(race) {
  if (!race.date) return null;

  const time = race.time || "00:00:00Z";
  return new Date(`${race.date}T${time}`);
}

function getRaceEndTime(race) {
  const raceStart = getRaceDateTime(race);

  if (!raceStart) return null;

  const raceEnd = new Date(raceStart);
  raceEnd.setHours(raceEnd.getHours() + 4);

  return raceEnd;
}

function getSessionDateTime(session) {
  if (!session?.date) return null;

  return new Date(`${session.date}T${session.time || "00:00:00Z"}`);
}

function getSessions(race) {
  const sessions = Object.keys(sessionLabels)
    .filter((sessionName) => race[sessionName])
    .map((sessionName) => ({
      name: sessionLabels[sessionName],
      dateTime: getSessionDateTime(race[sessionName]),
    }));

  sessions.push({
    name: "Race",
    dateTime: getRaceDateTime(race),
  });

  return sessions
    .filter((session) => session.dateTime)
    .sort((a, b) => a.dateTime - b.dateTime);
}

function getNextRaceFromSchedule(races) {
  const now = new Date();

  return races
    .filter((race) => getRaceDateTime(race))
    .sort((a, b) => getRaceDateTime(a) - getRaceDateTime(b))
    .find((race) => getRaceEndTime(race) >= now);
}

function getNextSession(race) {
  const now = new Date();
  const sessions = getSessions(race);

  const nextSession = sessions.find((session) => session.dateTime >= now);

  return nextSession?.name || "Race Weekend";
}

function normalizeRace(race) {
  return {
    season: race.season,
    round: race.round,
    name: race.raceName,
    dateTime: getRaceDateTime(race),
    circuit: race.Circuit?.circuitName || "Circuit TBA",
    locality: race.Circuit?.Location?.locality || "",
    country: race.Circuit?.Location?.country || "",
    nextSession: getNextSession(race),
    sessions: getSessions(race),
    source: "Jolpica F1 API",
  };
}

export async function getNextRaceWeekend() {
  const response = await fetch(CURRENT_SEASON_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch F1 calendar.");
  }

  const data = await response.json();
  const races = data.MRData?.RaceTable?.Races || [];
  const nextRace = getNextRaceFromSchedule(races);

  if (!nextRace) {
    return {
      season: data.MRData?.RaceTable?.season || "Current",
      round: "-",
      name: "Season Complete",
      dateTime: null,
      circuit: "Next season calendar will appear when API updates.",
      locality: "",
      country: "",
      nextSession: "TBA",
      sessions: [],
      source: "Jolpica F1 API",
    };
  }

  return normalizeRace(nextRace);
}

export function formatRaceDate(dateTime) {
  if (!dateTime) return "TBA";

  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateTime);
}

export function getDaysUntilRace(dateTime) {
  if (!dateTime) return "TBA";

  const now = new Date();
  const diff = dateTime - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return "Race Week";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";

  return `D-${days}`;
}