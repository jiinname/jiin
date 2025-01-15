import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardContent } from './ui/card';
import Checkbox from './ui/checkbox';
import Papa from 'papaparse';

function HanjaSelector() {
    const [selectedElements, setSelectedElements] = useState({
        목: false,
        화: false,
        토: false,
        금: false,
        수: false,
    });
    const [sungHanjaStrokes, setSungHanjaStrokes] = useState(0);
    const [firstStrokes, setFirstStrokes] = useState(0);
    const [secondStrokes, setSecondStrokes] = useState(0);
    const [results, setResults] = useState({ firstNames: [], secondNames: [] });
    const [data, setData] = useState([]);
    const [selectedHanja, setSelectedHanja] = useState([]); // 선택된 한자 저장
    // handleAddSelectedHanja 함수 추가
    const handleAddSelectedHanja = (hanja) => {
        setSelectedHanja((prevSelectedHanja) => {
            // 이미 선택된 한자라면 중복 추가하지 않음
            if (prevSelectedHanja.some((item) => item.한자 === hanja.한자)) {
                return prevSelectedHanja; // 중복 방지
            }
            return [...prevSelectedHanja, hanja]; // 새로운 한자 추가
        });
    };
    
    const handleRemoveSelectedHanja = (hanja) => {
        setSelectedHanja((prevSelectedHanja) =>
            prevSelectedHanja.filter((item) => item.한자 !== hanja.한자) // 한자 제거
        );
    };

    useEffect(() => {
        Papa.parse('/Total_name_hanja.csv', {
            download: true,
            header: true,
            complete: (result) => {
                console.log('CSV 데이터 로드 결과:', result.data); // 데이터 확인 로그
                setData(result.data); // 상태에 데이터 저장
            },
            error: (error) => {
                console.error('CSV 로드 오류:', error); // 오류 로그 출력
            },
        });
    }, []);
    
    

    const handleCheckboxChange = (element) => {
        setSelectedElements((prevState) => {
            const updatedState = {
                ...prevState,
                [element]: !prevState[element],
            };
            console.log("선택된 오행 업데이트:", updatedState); // 상태 변경 로그
            return updatedState;
        });
    };
    

    const calculateWonyoung = () => {
        const won = parseInt(firstStrokes) + parseInt(secondStrokes);
        const hyeong = parseInt(sungHanjaStrokes) + parseInt(firstStrokes);
        const i = parseInt(sungHanjaStrokes) + parseInt(secondStrokes);
        const jeong =
            parseInt(sungHanjaStrokes) + parseInt(firstStrokes) + parseInt(secondStrokes);

        const badNumbers = [
            2, 4, 9, 10, 12, 14, 19, 20, 22, 26, 27, 28, 30, 36, 40, 42, 43, 44,
            46, 49, 50, 53, 54, 56, 59, 60, 62, 64, 66, 69, 70, 72, 74, 76, 78,
            79, 80,
        ];

        const checkGoodOrBad = (number) =>
            badNumbers.includes(number) ? '흉수' : '길수';

        return {
            won: { value: won, result: checkGoodOrBad(won) },
            hyeong: { value: hyeong, result: checkGoodOrBad(hyeong) },
            i: { value: i, result: checkGoodOrBad(i) },
            jeong: { value: jeong, result: checkGoodOrBad(jeong) },
        };
    };

    const wonyoungResults = calculateWonyoung();

    const hanjaOhaengMapping = { 목: "木", 화: "火", 토: "土", 금: "金", 수: "水" };
    
 const handleFilterData = () => {
    console.log('필터링 전 전체 데이터:', data); // 전체 데이터 확인
    console.log('선택된 오행:', selectedElements); // 선택된 오행 값 확인

    const filteredFirstNames = data.filter((row) => {
        const hanjaStrokes = parseInt(row.획수, 10);
        const hanjaOhaeng = hanjaOhaengMapping[
            Object.keys(selectedElements).find((key) => selectedElements[key])
        ];
        return (
            row.자원오행 === hanjaOhaeng && // 자원오행 매칭
            hanjaStrokes === parseInt(firstStrokes, 10) // 상명자 획수 매칭
        );
    });

    console.log('필터링된 상명자 데이터:', filteredFirstNames);

    const filteredSecondNames = data.filter((row) => {
        const hanjaStrokes = parseInt(row.획수, 10);
        const hanjaOhaeng = hanjaOhaengMapping[
            Object.keys(selectedElements).find((key) => selectedElements[key])
        ];
        return (
            row.자원오행 === hanjaOhaeng && // 자원오행 매칭
            hanjaStrokes === parseInt(secondStrokes, 10) // 하명자 획수 매칭
        );
    });

    console.log('필터링된 하명자 데이터:', filteredSecondNames);

    setResults({ firstNames: filteredFirstNames, secondNames: filteredSecondNames });
};

  
    return (
        <div>
            <Card>
                <CardHeader>
                    <h1>이름 한자 선택</h1>
                </CardHeader>
                <CardContent>
                    <div>
                        <p>부족한 오행 선택 (다중 선택 가능):</p>
                        {['목', '화', '토', '금', '수'].map((element) => (
                            <Checkbox
                                key={element}
                                label={element}
                                checked={selectedElements[element]}
                                onChange={() => handleCheckboxChange(element)}
                            />
                        ))}
                    </div>
                    <div>
                        <label>
                            성씨 획수:
                            <input
                                type="number"
                                value={sungHanjaStrokes}
                                onChange={(e) => setSungHanjaStrokes(e.target.value)}
                            />
                        </label>
                        <label>
                            상명자 획수:
                            <input
                                type="number"
                                value={firstStrokes}
                                onChange={(e) => setFirstStrokes(e.target.value)}
                            />
                        </label>
                        <label>
                            하명자 획수:
                            <input
                                type="number"
                                value={secondStrokes}
                                onChange={(e) => setSecondStrokes(e.target.value)}
                            />
                        </label>
                    </div>
                    <button onClick={handleFilterData}>추천 필터링</button>
                   
                    
<h2>선택된 한자</h2>
<ul>
    {selectedHanja.map((hanja, index) => (
        <li key={index}>
            {hanja.한글발음} ({hanja.한자}) - {hanja.획수}획 - 자원오행: {hanja.자원오행} - 뜻: {hanja.뜻} - 발음오행: {hanja.발음오행}
            <button
                style={{
                    marginLeft: "10px",
                    backgroundColor: "red",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                }}
                onClick={() => handleRemoveSelectedHanja(hanja)} // 삭제 이벤트
            >
                삭제
            </button>
        </li>
    ))}
</ul>


                    <div>
                        <h2>원형이정 계산 결과</h2>
                        <p>원(元): {wonyoungResults.won.value} - {wonyoungResults.won.result}</p>
                        <p>형(亨): {wonyoungResults.hyeong.value} - {wonyoungResults.hyeong.result}</p>
                        <p>이(利): {wonyoungResults.i.value} - {wonyoungResults.i.result}</p>
                        <p>정(貞): {wonyoungResults.jeong.value} - {wonyoungResults.jeong.result}</p>
                    </div>
                    <div>
                    <h2>상명자 추천</h2>
<ul>
    {results.firstNames &&
        results.firstNames.map((row, index) => (
            <li
                key={index}
                onClick={() => handleAddSelectedHanja(row)} // 클릭 이벤트 추가
                style={{
                    cursor: "pointer",
                    backgroundColor: selectedHanja.includes(row)
                        ? "#f0f0f0"
                        : "transparent", // 선택된 한자는 배경색 변경
                }}
            >
                {row.한글발음} ({row.한자}) - {row.획수}획 - 자원오행: {row.자원오행} - 뜻: {row.뜻} - 발음오행: {row.발음오행}
            </li>
        ))}
</ul>
                    </div>
                    <div>
                    <h2>하명자 추천</h2>
<ul>
    {results.secondNames &&
        results.secondNames.map((row, index) => (
            <li
                key={index}
                onClick={() => handleAddSelectedHanja(row)}
                style={{
                    cursor: "pointer",
                    backgroundColor: selectedHanja.includes(row)
                        ? "#f0f0f0"
                        : "transparent",
                }}
            >
                {row.한글발음} ({row.한자}) - {row.획수}획 - 자원오행: {row.자원오행} - 뜻: {row.뜻} - 발음오행: {row.발음오행}
            </li>
        ))}
</ul>

                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default HanjaSelector;
