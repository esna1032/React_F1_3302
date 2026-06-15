import { useEffect, useState } from "react";
import { drivers } from "../data/drivers";
import { generateDriverReply } from "../services/gemini";

function FaceTime() {
  const [selectedDriver, setSelectedDriver] = useState(drivers[0]);
  const [callStatus, setCallStatus] = useState("selecting");
  const [seconds, setSeconds] = useState(0);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const quickQuestions = [
    "오늘 레이스 전략은 뭐야?",
    "이 서킷에서 가장 어려운 코너는 어디야?",
    "팬들에게 한마디 해줘.",
    "타이어 관리는 어떻게 해야 해?",
  ];

  useEffect(() => {
    if (callStatus !== "connected") return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [callStatus]);

  const formatTime = (value) => {
    const minutes = String(Math.floor(value / 60)).padStart(2, "0");
    const remainingSeconds = String(value % 60).padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
  };

  const startIncomingCall = (driver) => {
    setSelectedDriver(driver);
    setCallStatus("ringing");
    setSeconds(0);
    setMessages([]);
    setQuestion("");
    setErrorMessage("");
    setIsGenerating(false);
  };

  const acceptCall = () => {
    setCallStatus("connected");
    setMessages([
      {
        sender: "driver",
        text: `안녕, 나는 ${selectedDriver.name} 인터뷰 스타일을 바탕으로 만든 AI 패독 인터뷰야. 오늘 궁금한 걸 편하게 물어봐.`,
      },
    ]);
  };

  const endCall = () => {
    setCallStatus("ended");
    setIsGenerating(false);
  };

  const sendQuestion = async (text) => {
    const trimmedText = text.trim();

    if (!trimmedText || isGenerating) return;

    const nextMessages = [
      ...messages,
      {
        sender: "user",
        text: trimmedText,
      },
    ];

    setMessages(nextMessages);
    setQuestion("");
    setErrorMessage("");
    setIsGenerating(true);

    try {
      const aiReply = await generateDriverReply({
        driver: selectedDriver,
        userQuestion: trimmedText,
        messages: nextMessages,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "driver",
          text: aiReply,
        },
      ]);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "Gemini 답변을 불러오지 못했습니다. API 키 또는 네트워크 상태를 확인하세요."
      );

      setMessages((prev) => [
        ...prev,
        {
          sender: "driver",
          text: "지금은 연결 상태가 좋지 않아 답변을 만들지 못했어. 잠시 후 다시 질문해줘.",
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="facetime-page">
      <div className="page-heading">
        <p className="eyebrow">AI Paddock Interview</p>
        <h1>FaceTime</h1>
        <p>
          원하는 드라이버를 선택하고, Gemini AI를 통해 패독 인터뷰처럼 질문과
          답변을 나눠보세요.
        </p>
      </div>

      <div className="facetime-layout">
        <aside className="driver-list">
          <h2>Choose Driver</h2>

          {drivers.map((driver) => (
            <button
              key={driver.id}
              className={selectedDriver.id === driver.id ? "selected" : ""}
              onClick={() => startIncomingCall(driver)}
            >
              <span
                className="driver-dot"
                style={{ backgroundColor: driver.color }}
              />
              <span>
                <strong>{driver.name}</strong>
                <small>{driver.team}</small>
              </span>
              <em>#{driver.number}</em>
            </button>
          ))}
        </aside>

        <div className="phone-shell">
          {callStatus === "selecting" && (
            <div className="call-empty">
              <p>드라이버를 선택하면 FaceTime 수신 화면이 시작됩니다.</p>
            </div>
          )}

          {callStatus === "ringing" && (
            <div
              className="incoming-call"
              style={{ "--driver-color": selectedDriver.color }}
            >
              <div className="driver-avatar">
                <img src={selectedDriver.image} alt={selectedDriver.name} />
              </div>

              <p>Incoming FaceTime</p>
              <h2>{selectedDriver.name}</h2>
              <span>{selectedDriver.team}</span>

              <div className="call-controls">
                <button className="decline-button" onClick={endCall}>
                  Decline
                </button>
                <button className="accept-button" onClick={acceptCall}>
                  Accept
                </button>
              </div>
            </div>
          )}

          {callStatus === "connected" && (
            <div
              className="active-call"
              style={{ "--driver-color": selectedDriver.color }}
            >
              <div className="call-video-area">
                <img src={selectedDriver.image} alt={selectedDriver.name} />
                <div className="call-gradient" />

                <div className="call-topbar">
                  <span>{formatTime(seconds)}</span>
                  <strong>{selectedDriver.name}</strong>
                </div>

                <div className="driver-caption">
                  <strong>{selectedDriver.shortName}</strong>
                  <p>{selectedDriver.intro}</p>
                </div>
              </div>

              <div className="interview-panel">
                <div className="message-list">
                  {messages.map((message, index) => (
                    <div
                      key={`${message.sender}-${index}`}
                      className={`message ${message.sender}`}
                    >
                      {message.text}
                    </div>
                  ))}

                  {isGenerating && (
                    <div className="message driver loading-message">
                      답변 생성 중...
                    </div>
                  )}
                </div>

                {errorMessage && <p className="call-error">{errorMessage}</p>}

                <div className="quick-questions">
                  {quickQuestions.map((item) => (
                    <button
                      key={item}
                      disabled={isGenerating}
                      onClick={() => sendQuestion(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <div className="question-box">
                  <input
                    value={question}
                    disabled={isGenerating}
                    onChange={(event) => setQuestion(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        sendQuestion(question);
                      }
                    }}
                    placeholder={
                      isGenerating ? "답변을 기다리는 중..." : "질문을 입력하세요"
                    }
                  />
                  <button
                    disabled={isGenerating}
                    onClick={() => sendQuestion(question)}
                  >
                    Send
                  </button>
                </div>

                <button className="end-call-button" onClick={endCall}>
                  End Call
                </button>
              </div>
            </div>
          )}

          {callStatus === "ended" && (
            <div className="call-ended">
              <p>Call Ended</p>
              <h2>{selectedDriver.name}</h2>
              <span>Duration {formatTime(seconds)}</span>

              <button onClick={() => startIncomingCall(selectedDriver)}>
                다시 통화하기
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default FaceTime;