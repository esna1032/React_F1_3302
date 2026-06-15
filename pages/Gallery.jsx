import { useEffect, useState } from "react";
import {
  historicTeams,
  searchHistoricMachines,
} from "../services/commonsImages";

function Gallery() {
  const [selectedTeam, setSelectedTeam] = useState(historicTeams[0]);
  const [machineImages, setMachineImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [galleryError, setGalleryError] = useState("");
  const [nextOffset, setNextOffset] = useState(null);

  useEffect(() => {
    async function loadHistoricMachines() {
      setIsLoading(true);
      setGalleryError("");
      setSelectedImage(null);
      setNextOffset(null);

      try {
        const result = await searchHistoricMachines({
          team: selectedTeam,
          limit: 24,
          offset: 0,
        });

        setMachineImages(result.items);
        setNextOffset(result.nextOffset);
      } catch (error) {
        console.error(error);
        setGalleryError("역대 레이스카 이미지를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    loadHistoricMachines();
  }, [selectedTeam]);

  const loadMoreMachines = async () => {
    if (nextOffset === null || isMoreLoading) return;

    setIsMoreLoading(true);
    setGalleryError("");

    try {
      const result = await searchHistoricMachines({
        team: selectedTeam,
        limit: 24,
        offset: nextOffset,
      });

      setMachineImages((prevImages) => {
        const existingIds = new Set(prevImages.map((item) => item.id));
        const newItems = result.items.filter((item) => !existingIds.has(item.id));

        return [...prevImages, ...newItems];
      });

      setNextOffset(result.nextOffset);
    } catch (error) {
      console.error(error);
      setGalleryError("추가 이미지를 불러오지 못했습니다.");
    } finally {
      setIsMoreLoading(false);
    }
  };

  const toggleBookmark = (photoId) => {
    setBookmarks((prevBookmarks) => {
      if (prevBookmarks.includes(photoId)) {
        return prevBookmarks.filter((id) => id !== photoId);
      }

      return [...prevBookmarks, photoId];
    });
  };

  const handleDownload = (item) => {
    const link = document.createElement("a");
    link.href = item.original;
    link.download = item.originalTitle;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.click();
  };

  return (
    <section className="gallery-page">
      <div className="page-heading">
        <p className="eyebrow">Historic F1 Racecar Museum</p>
        <h1>Gallery</h1>
        <p>
          팀을 선택하면 Wikimedia Commons 공개 이미지 API를 통해 역대 F1
          레이스카 사진을 자동으로 불러오고, 한국어 설명으로 보여줍니다.
        </p>
      </div>

      <div className="historic-gallery-layout">
        <aside className="team-selector">
          <h2>팀 선택</h2>

          {historicTeams.map((team) => (
            <button
              key={team.id}
              className={selectedTeam.id === team.id ? "selected" : ""}
              onClick={() => setSelectedTeam(team)}
            >
              <span style={{ backgroundColor: team.color }} />
              <strong>{team.name}</strong>
            </button>
          ))}
        </aside>

        <section className="historic-results">
          <div
            className="historic-header"
            style={{ "--team-color": selectedTeam.color }}
          >
            <span>선택된 팀</span>
            <h2>{selectedTeam.name}</h2>
            <p>Wikimedia Commons에서 역대 F1 레이스카 이미지를 검색합니다.</p>
          </div>

          {isLoading ? (
            <div className="gallery-loading">이미지를 불러오는 중...</div>
          ) : galleryError ? (
            <div className="gallery-loading">{galleryError}</div>
          ) : machineImages.length === 0 ? (
            <div className="gallery-loading">
              검색 결과가 없습니다. 다른 팀을 선택해보세요.
            </div>
          ) : (
            <>
              <div className="gallery-grid">
                {machineImages.map((item) => {
                  const isBookmarked = bookmarks.includes(item.id);

                  return (
                    <article className="gallery-card" key={item.id}>
                      <div className="gallery-image-wrap">
                        <img src={item.image} alt={item.koreanTitle} />
                        <span>{item.license}</span>
                      </div>

                      <div className="gallery-card-body">
                        <h2>{item.koreanTitle}</h2>
                        <p>{item.koreanDescription}</p>

                        <div className="gallery-actions">
                          <button onClick={() => setSelectedImage(item)}>
                            자세히
                          </button>
                          <button onClick={() => handleDownload(item)}>
                            다운로드
                          </button>
                          <button
                            className={isBookmarked ? "bookmarked" : ""}
                            onClick={() => toggleBookmark(item.id)}
                          >
                            {isBookmarked ? "저장됨" : "북마크"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="load-more-wrap">
                {nextOffset !== null ? (
                  <button onClick={loadMoreMachines} disabled={isMoreLoading}>
                    {isMoreLoading ? "더 불러오는 중..." : "역대 레이스카 더 보기"}
                  </button>
                ) : (
                  <p>현재 API 검색 결과를 모두 불러왔습니다.</p>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {selectedImage && (
        <div className="modal-backdrop" onClick={() => setSelectedImage(null)}>
          <div
            className="image-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>

            <img src={selectedImage.image} alt={selectedImage.koreanTitle} />

            <div>
              <span>{selectedImage.license}</span>
              <h2>{selectedImage.koreanTitle}</h2>
              <p>{selectedImage.koreanDescription}</p>
              <p className="image-credit">저작자: {selectedImage.artist}</p>

              <div className="modal-actions">
                <button onClick={() => handleDownload(selectedImage)}>
                  이미지 다운로드
                </button>

                <a
                  href={selectedImage.pageUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Wikimedia 원본 보기
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Gallery;