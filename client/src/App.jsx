import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import "./App.css";
import SearchColor from "./SearchColor";
function App() {
  return (
    <>
      <div>
        <p className="read-the-docs">
          Colour Searcher
        </p>
        <SearchColor />
      </div>
    </>
  );
}

export default App;
