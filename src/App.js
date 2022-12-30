import "./App.css";
import Home from "./Pages/Home";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import EditorPage from "./Pages/EditorPage";
import { Toaster } from "react-hot-toast";
import Footer from "./Components/Footer";

function App() {
  return (
    <div>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          success: {
            primary: "green",
          },
        }}
      ></Toaster>
      <header>
        <BrowserRouter>
          <Routes>
            <Route exact path="/" element={<Home />}></Route>
            <Route
              exact
              path="/editor/:roomId"
              element={<EditorPage />}
            ></Route>
          </Routes>
        </BrowserRouter>
      </header>
      <Footer />
    </div>
  );
}

export default App;
