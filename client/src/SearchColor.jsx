import React, { useEffect, useState } from "react";
import axios from "axios";

const SearchColor = () => {
  const [colors, setColors] = useState([]);
  const [searchColor, setSearchColor] = useState("");
  const [colorSelect, setColorSelect] = useState("#000000");
  const [searchResults, setSearchResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    fetchColors();
  }, []);

  const fetchColors = async () => {
    try {
      setIsFetching(true);
      let response = await axios.get(
        "https://raw.githubusercontent.com/NishantChandla/color-test-resources/main/xkcd-colors.json"
      );
      setColors(response.data.colors);
      setSearchResults(response.data.colors);
      setIsFetching(false);
    } catch (ex) {
      setIsFetching(false);
      console.error("Error fetching colors:", error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchColor(event.target.value);
    setErrorMessage("");
  };

  function matchHexColor() {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexColorRegex.test(searchColor);
  }
  function isValidRGBColor() {
    const regex =
      /^rgb\(\s*((\d{1,2}|1\d{2}|2[0-4]\d|25[0-5])\s*,\s*){2}(\d{1,2}|1\d{2}|2[0-4]\d|25[0-5])\s*\)$/i;
    return regex.test(searchColor);
  }

  const search = (e) => {
    e.preventDefault();
    if (!isValidRGBColor() && !matchHexColor()) {
      setErrorMessage("The colour is invalid.");
      return;
    }
    setErrorMessage([]);
    let searchHex = searchColor;
    if (isValidRGBColor()) {
      searchHex = rgbToHex(searchColor);
    }
    setColorSelect(searchHex);
    const sortedHexArray = sortHexArrayBySimilarity(searchHex);
    // console.log(sortedHexArray);

    setSearchResults(sortedHexArray?.slice(0, 99));
  };
  function sortHexArrayBySimilarity(searchHex) {
    const sortedArray = colors?.sort((a, b) => {
      const similarityA = calculateSimilarity(a.hex, searchHex);
      const similarityB = calculateSimilarity(b.hex, searchHex);
      return similarityA - similarityB;
    });

    return sortedArray;
  }

  function calculateSimilarity(hexColor, searchHex) {
    const rgbColor = hexToRgb(hexColor);
    const searchRgbColor = hexToRgb(searchHex);
    const rDiff = searchRgbColor[0] - rgbColor[0];
    const gDiff = searchRgbColor[1] - rgbColor[1];
    const bDiff = searchRgbColor[2] - rgbColor[2];
    const distance = Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
    // console.log(distance)
    return distance;
  }

  function hexToRgb(hexColor) {
    const red = parseInt(hexColor.substr(1, 2), 16);
    const green = parseInt(hexColor.substr(3, 2), 16);
    const blue = parseInt(hexColor.substr(5, 2), 16);
    return [red, green, blue];
  }

  function rgbToHex(rgbString) {
    const match = rgbString.match(
      /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/
    );

    if (match) {
      const red = parseInt(match[1]);
      const green = parseInt(match[2]);
      const blue = parseInt(match[3]);

      const hexRed = red.toString(16).padStart(2, "0");
      const hexGreen = green.toString(16).padStart(2, "0");
      const hexBlue = blue.toString(16).padStart(2, "0");

      return `#${hexRed}${hexGreen}${hexBlue}`;
    }

    // Return original input if it doesn't match the RGB format
    return rgbString;
  }

  const handleRetry = () => {
    setErrorMessage("");
    fetchColors();
  };

  const hexToHSL = (H) => {
    // Convert hex to RGB first
    let r = 0,
      g = 0,
      b = 0;
    if (H.length == 4) {
      r = "0x" + H[1] + H[1];
      g = "0x" + H[2] + H[2];
      b = "0x" + H[3] + H[3];
    } else if (H.length == 7) {
      r = "0x" + H[1] + H[2];
      g = "0x" + H[3] + H[4];
      b = "0x" + H[5] + H[6];
    }
    // Then to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r, g, b),
      cmax = Math.max(r, g, b),
      delta = cmax - cmin,
      h = 0,
      s = 0,
      l = 0;

    if (delta == 0) h = 0;
    else if (cmax == r) h = ((g - b) / delta) % 6;
    else if (cmax == g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0) h += 360;

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return `${h}, ${s}, ${l}`;
  };

  return (
    <div>
      {isFetching ? (
        <div>Loading colors...</div>
      ) : (
        <div>
          <form onSubmit={search}>
            <div className="row g-1 align-items-center mb-5 justify-content-center">
              <div className="col-1">
                <input
                  type="color"
                  value={colorSelect}
                  className="form-control"
                  onChange={handleSearchChange}
                />
              </div>
              <div className="col-auto">
                <input
                  className={
                    "form-control mx-2 " +
                    (errorMessage?.length ? "input-error" : "")
                  }
                  type="search"
                  value={searchColor}
                  onChange={handleSearchChange}
                  placeholder="Enter colour"
                />
              </div>
              <div className="col-auto">
                <button type="submit" className="btn btn-primary btn-sm ms-3">
                  Search
                </button>
              </div>
              {errorMessage ? (
                <div className="d-flex align-items-center mb-5 justify-content-center">
                  <small className="col text-danger "> {errorMessage}</small>
                </div>
              ) : (
                ""
              )}
            </div>
          </form>
          <div className="container">
            <div className="row">
              <div className="col-1">
                <h5>Color</h5>
              </div>
              <div className="col">
                <h5>Name</h5>
              </div>
              <div className="col">
                <h5>HEX</h5>
              </div>
              <div className="col">
                <h5>RGB</h5>
              </div>
              <div className="col">
                <h5>HSL</h5>
              </div>
            </div>
            {searchResults?.length ? (
              searchResults?.map((row) => (
                <div className="row mt-3" key={row?.hex}>
                  <div className="col-1">
                    <div
                      className="color-box"
                      style={{ backgroundColor: row?.hex }}
                    ></div>
                  </div>
                  <div className="col">{row?.color} </div>
                  <div className="col">{row?.hex} </div>
                  <div className="col">{hexToRgb(row?.hex)?.join(", ")} </div>
                  <div className="col">{hexToHSL(row?.hex)} </div>
                </div>
              ))
            ) : (
              <div className="row mt-3">
                <div className="col">
                  {searchColor ? (
                    <h6> No color matches to your search.</h6>
                  ) : (
                    <div>
                      <div>Unable to load colors!</div>
                      <button
                        className="btn btn-sm btn-primary mt-2"
                        onClick={handleRetry}
                      >
                        reload
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchColor;
