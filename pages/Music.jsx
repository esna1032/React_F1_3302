import { useState } from "react";
import { musicTracks } from "../data/musicTracks";

function getYoutubeVideoId(url) {
  if (!url) return "";

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtu.be")) {
      return parsedUrl.pathname.replace("/", "");
    }

    if (parsedUrl.hostname.includes("youtube.com")) {
      return parsedUrl.searchParams.get("v") || "";
    }

    return "";
  } catch {
    return "";
  }
}

function getYoutubeSearchUrl(driver) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${driver} F1 fan chant anthem`
  )}`;
}

function Music() {
  const [selectedChant, setSelectedChant] = useState(musicTracks[0]);
  const [favorites, setFavorites] = useState([]);

  const videoId = getYoutubeVideoId(selectedChant.youtubeUrl);
  const youtubeWatchUrl = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : getYoutubeSearchUrl(selectedChant.driver);

  const toggleFavorite = (chantId) => {
    setFavorites((prevFavorites) => {
      if (prevFavorites.includes(chantId)) {
        return prevFavorites.filter((id) => id !== chantId);
      }

      return [...prevFavorites, chantId];
    });
  };

  return (
    <section className="music-page">
      <div className="page-heading">
        <p className="eyebrow">Driver Fan Anthem</p>
        <h1>Music</h1>
        <p>
          드라이버별 응원가와 팬 챈트 영상을 YouTube로 바로 재생하는 응원
          라운지입니다.
        </p>
      </div>

      <div className="anthem-layout">
        <section className="anthem-player">
          <div className="youtube-frame">
            {videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={selectedChant.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="youtube-empty">
                <img src={selectedChant.cover} alt={selectedChant.driver} />
                <div>
                  <strong>YouTube 링크 필요</strong>
                  <p>
                    이 드라이버의 응원가 YouTube 링크를 musicTracks.js에
                    추가하면 여기에서 바로 재생됩니다.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="anthem-info">
            <span>{selectedChant.type}</span>
            <h2>{selectedChant.title}</h2>
            <p>{selectedChant.driver}</p>
            <small>{selectedChant.team}</small>
          </div>

          <p className="anthem-mood">{selectedChant.mood}</p>

          <div className="chant-tags">
            {selectedChant.chants.map((chant) => (
              <span key={chant}>{chant}</span>
            ))}
          </div>

          <div className="anthem-actions">
            <a href={youtubeWatchUrl} target="_blank" rel="noreferrer">
              YouTube에서 열기
            </a>
          </div>
        </section>

        <section className="anthem-list">
          {musicTracks.map((chant) => {
            const isCurrent = selectedChant.id === chant.id;
            const isFavorite = favorites.includes(chant.id);

            return (
              <article
                className={`anthem-item ${isCurrent ? "current" : ""}`}
                key={chant.id}
              >
                <button
                  className="anthem-main"
                  onClick={() => setSelectedChant(chant)}
                >
                  <img src={chant.cover} alt={chant.driver} />

                  <span>
                    <strong>{chant.driver}</strong>
                    <small>{chant.title}</small>
                  </span>
                </button>

                <span className="anthem-type">{chant.type}</span>

                <button
                  className={
                    isFavorite ? "favorite-button active" : "favorite-button"
                  }
                  onClick={() => toggleFavorite(chant.id)}
                >
                  {isFavorite ? "Saved" : "Save"}
                </button>
              </article>
            );
          })}
        </section>
      </div>
    </section>
  );
}

export default Music;