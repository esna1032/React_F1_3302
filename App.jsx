import { useState } from "react";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import FaceTime from "./pages/FaceTime";
import Music from "./pages/Music";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  return (
    <div className="app">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />

      <main>
        {currentPage === "home" && <Home onPageChange={setCurrentPage} />}
        {currentPage === "gallery" && <Gallery />}
        {currentPage === "facetime" && <FaceTime />}
        {currentPage === "music" && <Music />}
      </main>
    </div>
  );
}

export default App;