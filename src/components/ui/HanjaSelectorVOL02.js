import React, { useState } from "react";
import Papa from "papaparse";
import "./HanjaSelectorVOL02.css";

const HanjaSelectorVOL02 = () => {
  const [sungInput, setSungInput] = useState("");
  const [sungHanjaStrokes, setSungHanjaStrokes] = useState(0);
  const [firstStrokes, setFirstStrokes] = useState(0);
  const [secondStrokes, setSecondStrokes] = useState(0);
  const [popupData, setPopupData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedOhaeng, setSelectedOhaeng] = useState([]);
  const [selectedHanja, setSelectedHanja] = useState([]); 
  const [recommendedHanja, setRecommendedHanja] = useState([]);
  const [additionalHanja, setAdditionalHanja] = useState([]);

  const badNumbers = [
    2, 4, 9, 10, 12, 14, 19, 20, 22, 26, 27, 28, 30, 36, 40, 42, 43, 44, 46, 49,
    50, 53, 54, 56, 59, 60, 62, 64, 66, 69, 70, 72, 74, 76, 78, 79, 80,
  ];

  const checkGoodOrBad = (number) =>
    badNumbers.includes(number) ? "흉수" : "길수";

  const calculateWonyoung = () => {
    const won = Number(sungHanjaStrokes) + Number(firstStrokes);
    const hyeong = Number(sungHanjaStrokes) + Number(secondStrokes);
    const i = Number(sungHanjaStrokes) + Number(firstStrokes);
    const jeong =
      Number(sungHanjaStrokes) + Number(firstStrokes) + Number(secondStrokes);
     
    return {
      "원(元)": { value: won, result: checkGoodOrBad(won) },
      "형(亨)": { value: hyeong, result: checkGoodOrBad(hyeong) },
      "이(利)": { value: i, result: checkGoodOrBad(i) },
      "정(貞)": { value: jeong, result: checkGoodOrBad(jeong) },
    };
  };

  const wonyoungResults = calculateWonyoung();

  const handleHanjaSelect = (hanja, type) => {
    setSelectedHanja((prev) =>
      prev.some((item) => item.Hanja === hanja.Hanja && item.type === type)
        ? prev.filter((item) => !(item.Hanja === hanja.Hanja && item.type === type)) // 이미 선택된 경우 해제
        : [...prev, { ...hanja, type }] // 새로운 한자 선택
    );
  };

  const handleDeleteHanja = (index) => {
    setSelectedHanja((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDownload = () => {
    const txtData = selectedHanja.map((hanja) => ({
      발음: hanja.KoreanPronunciation,
      한자: hanja.Hanja,
      획수: hanja.Strokes,
      뜻: hanja.Meaning,
      자원오행: hanja.Element,
      발음오행: hanja.SoundElement,
    }));
    const txt = Papa.unparse(txtData);
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "선택한한자.txt";
    link.click();
  };

  const handleSearch = () => {
    setSelectedOhaeng([]); // 부족한 오행 초기화
    Papa.parse("/firstname-cvs.csv", {
      download: true,
      header: true,
      complete: (result) => {
        const data = result.data;
        const filteredData = data.filter(
          (item) => item["한글발음"] === sungInput.trim()
        );

        if (filteredData.length > 0) {
          setPopupData(filteredData);
          setShowPopup(true);
        } else {
          alert("입력한 성씨를 찾을 수 없습니다.");
        }
      },
      error: (err) => {
        console.error("CSV 파일 로드 실패:", err);
      },
    });
  };

  const handleSelectHanja = (selectedHanja) => {
    setSungInput(
      `${selectedHanja["한글발음"]}(${selectedHanja["한자"]})(${selectedHanja["발음오행"]})`
    );
    setSungHanjaStrokes(selectedHanja["획수"]);
    setShowPopup(false);
    setFirstStrokes(0);
    setSecondStrokes(0);
  };

  const handleRecommendHanja = () => {
    console.log("handleRecommendHanja 실행됨");
  
    Papa.parse("/Total_name_hanja.csv", {
      download: true,
      header: true,
      complete: (result) => {
        console.log("CSV 데이터 로드:", result.data); // 데이터 로드 확인
        const data = result.data;
  
        // 필터링 조건 로그
        console.log("필터링 조건 - 상명자 획수:", firstStrokes);
        console.log("필터링 조건 - 하명자 획수:", secondStrokes);
        console.log("필터링 조건 - 부족한 오행:", selectedOhaeng);

        const normalizeOhaeng = {
          "목(木)": "木",
          "화(火)": "火",
          "토(土)": "土",
          "금(金)": "金",
          "수(水)": "水",
        };
        
        const filteredRecommended = data.filter(
          (item) =>
            parseInt(item["Strokes"]) === parseInt(firstStrokes) &&
            selectedOhaeng.map((ohaeng) => normalizeOhaeng[ohaeng]).includes(item["Element"])
        );
        
        const filteredAdditional = data.filter(
          (item) =>
            parseInt(item["Strokes"]) === parseInt(secondStrokes) &&
            selectedOhaeng.map((ohaeng) => normalizeOhaeng[ohaeng]).includes(item["Element"])
        );
  
        // 상태 업데이트
        setRecommendedHanja(filteredRecommended);
        setAdditionalHanja(filteredAdditional);
  
        // 상태 업데이트 확인
        console.log("추천 상태 업데이트 완료");
        console.log("상명자 추천 상태:", filteredRecommended);
        console.log("하명자 추천 상태:", filteredAdditional);
      },
      error: (err) => {
        console.error("CSV 파일 로드 실패:", err);
      },
    });
  };

  const handleOhaengSelection = (ohaeng) => {
    setSelectedOhaeng((prev) =>
      prev.includes(ohaeng)
        ? prev.filter((item) => item !== ohaeng)
        : [...prev, ohaeng]
    );
  };

  return (
    <div style={{ textAlign: "center", fontFamily: "Arial, sans-serif" }}>
      <h1>이름 추천 시스템 - VOL02</h1>

      {/* 성씨 입력 및 획수 입력 */}
      <div className="input-container">
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <input
            type="text"
            value={sungInput}
            onChange={(e) => setSungInput(e.target.value)}
            placeholder="성을 입력하세요"
            className="rounded-input"
            lang="ko"
            style={{
              height: "40px",
              fontSize: "16px",
              padding: "0 10px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={handleSearch}
            className="blue-button"
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
          >
            검색
          </button>
        </div>
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <input
            type="number"
            value={sungHanjaStrokes}
            onChange={(e) => setSungHanjaStrokes(e.target.value)}
            placeholder="성씨 획수"
            className="rounded-input"
          />
          <input
            type="number"
            value={firstStrokes}
            onChange={(e) => setFirstStrokes(Number(e.target.value))}
            placeholder="상명자 획수"
            className="rounded-input"
          />
          <input
            type="number"
            value={secondStrokes}
            onChange={(e) => setSecondStrokes(Number(e.target.value))}
            placeholder="하명자 획수"
            className="rounded-input"
          />
        </div>
      </div>

      {/* 원형이정 결과 */}
      <div className="card-container">
        {Object.keys(wonyoungResults).map((key) => (
          <div className="card" key={key}>
            <h4>{key}</h4>
            <h2>{wonyoungResults[key].value}</h2>
            <p
              style={{
                color:
                  wonyoungResults[key].result === "길수" ? "#007bff" : "red",
              }}
            >
              {wonyoungResults[key].result}
            </p>
          </div>
        ))}
      </div>

      {/* 부족한 오행 선택 */}
      <div
        className="card-container"
        style={{
          marginTop: "20px",
          padding: "20px",
          backgroundColor: "#f4f4f4",
          borderRadius: "10px",
        }}
      >
        <h3 style={{ marginBottom: "10px", marginLeft: "50px" }}>부족한 오행 선택</h3>
        <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap" }}>
          {['목(木)', '화(火)', '토(土)', '금(金)', '수(水)'].map((ohaeng, index) => (
            <div
              key={index}
              className="card"
              style={{
                width: "80px",
                height: "80px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: selectedOhaeng.includes(ohaeng)
                  ? ohaeng === '목(木)'
                    ? "blue"
                    : ohaeng === '화(火)'
                    ? "red"
                    : ohaeng === '토(土)'
                    ? "orange"
                    : ohaeng === '금(金)'
                    ? "lightgray"
                    : "black"
                  : "white",
                color: selectedOhaeng.includes(ohaeng) ? "white" : "black",
                border: "1px solid #ccc",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                margin: "10px",
              }}
              onClick={() => handleOhaengSelection(ohaeng)}
            >
              {ohaeng}
            </div>
          ))}
        </div>
      </div>

      {/* 추천 버튼 */}
      <button
        onClick={handleRecommendHanja}
        className="blue-button"
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          cursor: "pointer",
          transition: "background-color 0.3s",
        }}
      >
        추천
      </button>

      {/* 팝업창 */}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>성씨 선택</h3>
            <table>
              <thead>
                <tr>
                  <th>발음</th>
                  <th>한자</th>
                  <th>획수</th>
                  <th>발음 오행</th>
                </tr>
              </thead>
              <tbody>
                {popupData.map((item, index) => (
                  <tr
                    key={index}
                    onClick={() => handleSelectHanja(item)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{item["한글발음"]}</td>
                    <td>{item["한자"]}</td>
                    <td>{item["획수"]}</td>
                    <td>{item["발음오행"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={() => setShowPopup(false)}
              className="blue-button"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 한자 추천 섹션 */}
      <div className="recommendation-container" style={{ marginTop: "20px" }}>
        {/* 상명자 추천 */}
        <div className="recommendation-box">
          <h3>상명자 추천</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>발음</th>
                  <th>한자</th>
                  <th>획수</th>
                  <th>뜻</th>
                  <th>자원오행</th>
                  <th>발음오행</th>
                </tr>
              </thead>
              <tbody>
                {recommendedHanja.length > 0 ? (
                  recommendedHanja.map((hanja, index) => (
                    <tr
                      key={index}
                      className={
                        selectedHanja.some(
                          (selected) => selected.Hanja === hanja.Hanja && selected.type === "상명자"
                        )
                          ? "selected-row"
                          : ""
                      }
                      onClick={() => handleHanjaSelect(hanja, "상명자")}
                    >
                      <td>{hanja["KoreanPronunciation"]}</td>
                      <td>{hanja["Hanja"]}</td>
                      <td>{hanja["Strokes"]}</td>
                      <td>{hanja["Meaning"]}</td>
                      <td>{hanja["Element"]}</td>
                      <td>{hanja["SoundElement"]}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">추천 데이터가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 하명자 추천 */}
        <div className="recommendation-box">
          <h3>하명자 추천</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>발음</th>
                  <th>한자</th>
                  <th>획수</th>
                  <th>뜻</th>
                  <th>자원오행</th>
                  <th>발음오행</th>
                </tr>
              </thead>
              <tbody>
                {additionalHanja.length > 0 ? (
                  additionalHanja.map((hanja, index) => (
                    <tr
                      key={index}
                      className={
                        selectedHanja.some(
                          (selected) => selected.Hanja === hanja.Hanja && selected.type === "하명자"
                        )
                          ? "selected-row"
                          : ""
                      }
                      onClick={() => handleHanjaSelect(hanja, "하명자")}
                    >
                      <td>{hanja["KoreanPronunciation"]}</td>
                      <td>{hanja["Hanja"]}</td>
                      <td>{hanja["Strokes"]}</td>
                      <td>{hanja["Meaning"]}</td>
                      <td>{hanja["Element"]}</td>
                      <td>{hanja["SoundElement"]}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">추천 데이터가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 선택한 한자 섹션 */}
      {selectedHanja.length > 0 && (
        <div className="recommendation-box" style={{ marginTop: "20px", marginLeft: "auto", marginRight: "auto", maxWidth: "900px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ textAlign: "left", flex: 1 }}>선택한 한자</h3>
            <button
              className="download-button"
              onClick={handleDownload}
              style={{ marginBottom: "10px" }}
            >
              다운로드
            </button>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>종류</th>
                  <th>발음</th>
                  <th>한자</th>
                  <th>획수</th>
                  <th>발음오행</th>
                  <th>자원오행</th>
                  <th>삭제</th>
                </tr>
              </thead>
              <tbody>
                {selectedHanja.map((hanja, index) => (
                  <tr key={index}>
                    <td>{hanja.type}</td>
                    <td>{hanja.KoreanPronunciation}</td>
                    <td>{hanja.Hanja}</td>
                    <td>{hanja.Strokes}</td>
                    <td>{hanja.Element}</td>
                    <td>{hanja.SoundElement}</td>
                    <td>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteHanja(index)}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HanjaSelectorVOL02;