import { useEffect, useRef, useState } from "react";
import {
  formatRaceDate,
  getDaysUntilRace,
  getNextRaceWeekend,
} from "../services/raceSchedule";

function Home({ onPageChange }) {
  const [nextRace, setNextRace] = useState(null);
  const [isRaceLoading, setIsRaceLoading] = useState(true);
  const [raceError, setRaceError] = useState("");
  const raceWeekendRef = useRef(null);

  useEffect(() => {
    async function loadNextRace() {
      try {
        const race = await getNextRaceWeekend();
        setNextRace(race);
      } catch (error) {
        console.error(error);
        setRaceError("F1 캘린더 정보를 불러오지 못했습니다.");
      } finally {
        setIsRaceLoading(false);
      }
    }

    loadNextRace();
  }, []);

  const scrollToRaceWeekend = () => {
    raceWeekendRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section className="home-page">
      <div className="hero">
        <div className="hero-content">
          <p className="eyebrow">F1 Fan Interaction Hub</p>

          <h1>New</h1>

          <p className="hero-description">
            복잡한 F1 기술 규정, 드라이버 정보, 레이스 위켄드 콘텐츠를
            한곳에서 빠르게 탐색하는 팬 중심 웹사이트입니다.
          </p>

          <div className="hero-actions">
            <button onClick={scrollToRaceWeekend}>Race Weekend 보기</button>

            <button
              className="secondary-button"
              onClick={() => onPageChange("gallery")}
            >
              역대 F1 레이스카 박물관
            </button>
          </div>
        </div>

        <div className="race-panel">
          {isRaceLoading ? (
            <div className="race-loading">Next Race 불러오는 중...</div>
          ) : raceError ? (
            <div className="race-loading">{raceError}</div>
          ) : (
            <>
              <div className="panel-header">
                <span>Next Race</span>
                <strong>{getDaysUntilRace(nextRace.dateTime)}</strong>
              </div>

              <div className="track-info">
                <p className="track-name">{nextRace.name}</p>

                <p className="track-detail">
                  {nextRace.circuit}
                  {nextRace.locality ? ` · ${nextRace.locality}` : ""}
                  {nextRace.country ? `, ${nextRace.country}` : ""}
                </p>

                <p className="race-date">{formatRaceDate(nextRace.dateTime)}</p>
              </div>

              <div className="race-stats">
                <div>
                  <span>Round</span>
                  <strong>{nextRace.round}</strong>
                </div>

                <div>
                  <span>Country</span>
                  <strong>{nextRace.country || "TBA"}</strong>
                </div>

                <div>
                  <span>Next</span>
                  <strong>{nextRace.nextSession}</strong>
                </div>
              </div>

              <p className="race-source">Updated by {nextRace.source}</p>
            </>
          )}
        </div>
      </div>

      <section className="race-weekend-section" ref={raceWeekendRef}>
        <div className="section-heading">
          <p className="eyebrow">Auto Updated Schedule</p>
          <h2>Race Weekend</h2>
        </div>

        {isRaceLoading ? (
          <div className="weekend-empty">일정을 불러오는 중...</div>
        ) : raceError ? (
          <div className="weekend-empty">{raceError}</div>
        ) : (
          <div className="weekend-card">
            <div className="weekend-summary">
              <span>Round {nextRace.round}</span>
              <h3>{nextRace.name}</h3>
              <p>
                {nextRace.circuit}
                {nextRace.locality ? ` · ${nextRace.locality}` : ""}
                {nextRace.country ? `, ${nextRace.country}` : ""}
              </p>
            </div>

            <div className="session-list">
              {nextRace.sessions.map((session) => (
                <article className="session-item" key={session.name}>
                  <span>{session.name}</span>
                  <strong>{formatRaceDate(session.dateTime)}</strong>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="feature-grid">
        <article className="feature-card">
          <span className="feature-icon">▦</span>
          <h2>역대 F1 레이스카 박물관</h2>
          <p>팀별 역대 F1 머신 이미지를 공개 이미지 API 기반으로 탐색합니다.</p>
        </article>

        <article className="feature-card">
          <span className="feature-icon">◉</span>
          <h2>FaceTime</h2>
          <p>선택한 드라이버와 패독 인터뷰를 하는 듯한 가상 통화를 체험합니다.</p>
        </article>

        <article className="feature-card">
          <span className="feature-icon">♪</span>
          <h2>Music</h2>
          <p>드라이버 웜업 플레이리스트와 엔진 사운드를 감상합니다.</p>
        </article>
      </section>
    </section>
  );
}

export default Home;