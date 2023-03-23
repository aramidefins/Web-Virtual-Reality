import React, { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import * as THREE from "three";
import { useSpring, animated, config } from "@react-spring/three";
import * as d3 from "d3";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TextureLoader } from "three";

const PlaneGeometry = ({ position }) => {
  const planeRef = useRef();

  return (
    <mesh ref={planeRef} rotation-x={-0.5 * Math.PI} position={[0.2, 0, -1]}>
      <planeGeometry color="red" args={[19, 19, 1]} />
      <meshStandardMaterial side={THREE.DoubleSide} />
    </mesh>
  );
};

const MappedVariable = ({ data, zPos, color, scale }) => {
  const groupRef = useRef();
  const mesh = useRef();

  const yMax = d3.max(scale.openPrice);
  const dataSCale = d3.scaleLinear().domain([0, yMax]).range([-0, 50]);
  const yBase = dataSCale(yMax / 200);

  const [activeList, setActiveList] = useState(Array(data.length).fill(false));

  return (
    <group ref={groupRef}>
      {data.openPrice.map((d, i) => (
        <mesh
          key={i}
          ref={mesh}
          onPointerOver={() => {
            const newList = [...activeList];
            newList[i] = true; // always set the active state to true
            setActiveList(newList);
          }}
          onPointerOut={() => {
            const newList = [...activeList];
            newList[i] = false; // always set the active state to false
            setActiveList(newList);
          }}
          onClick={() => {
            toast.success(
              <>
                <h3>Symbol: {data.symbol}</h3>
                <h4>Price of stock on {data.dates[i]},</h4>
                <h4>Opening price: {d}</h4>
                <h4>Closing price: {data.closePrice[i]}</h4>
                <h4>Low price is {data.lowPrice[i]}</h4>
                <h4>High price: {data.highPrice[i]}</h4>
                <h4>Volume traded: {data.volume[i]}</h4>
              </>
            );
          }}
          position={[i * 1.2 - 8, yBase * dataSCale(d), zPos]}
          scale={[0.25, 1, 0.25]}
        >
          <boxGeometry args={[2, dataSCale(d / 2), 2.5]} />
          <animated.meshStandardMaterial
            color={color}
            opacity={activeList[i] ? 0.6 : 1}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
};

function AxisLabels({ data }) {
  const yMax = d3.max(data.openPrice);
  const domainMax = Math.ceil(yMax / 100) * 100;
  const labelAxis = d3.scaleLinear().domain([0, domainMax]).range([0, 26]);
  const tickValues = labelAxis.ticks(10);

  const tick = d3
    .scaleBand()
    .domain(data.dates)
    .range([0, 18])
    .padding(0.000009);

  const xLabels = [
    { position: [-11.5, 0.2, -2.5], text: "Google Stock Price" },
    { position: [-11.5, 0.2, 0.5], text: "Tesla Stock Price" },
    { position: [-11.5, 0.2, 2.5], text: "Twitter Stock Price" },
    { position: [-11.5, 0.2, 4.5], text: "Microsoft Stock Price" },
    { position: [-11.5, 0.2, 6.5], text: "Apple Stock Price" },
  ];

  return (
    <>
      <group>
        {tickValues.map((item, index) => {
          // console.log("item", item);
          // console.log("index", index);
          return (
            <Line
              key={index}
              points={[
                [-8.5, labelAxis(item), -3.5],
                [9.7, labelAxis(item), -3.5],
              ]}
              color="gray"
              linewidth={1}
            />
          );
        })}
      </group>
      <group>
        {tickValues.map((item, index) => {
          return (
            <Line
              key={index}
              points={[
                [9.7, labelAxis(item), -3.5],
                [9.7, labelAxis(item), 7.3],
              ]}
              color="gray"
              linewidth={1}
            />
          );
        })}
      </group>
      <group >
        {data.dates.map((label, index) => (
          <Text
            key={index}
            color="purple"
            fontSize={0.5}
            position={[tick(label) - 8.5, 0.3, 10]}
            anchorX="center"
            anchorY="middle"
            rotation={[Math.PI * -0.05, Math.PI * -0.5, Math.PI / 200]}
          >
            {label}
            <meshNormalMaterial />
          </Text>
        ))}
      </group>
      <group>
        {xLabels.map((label, index) => (
          <Text
            key={index}
            color="purple"
            fontSize={0.5}
            position={label.position}
            anchorX="center"
            anchorY="middle"
          >
            {label.text}
            <meshNormalMaterial />
          </Text>
        ))}
      </group>
      <group>
        {tickValues.map((label, index) => {
          return (
            <Text
              key={index}
              color="red"
              fontSize={1}
              position={[-10.5, labelAxis(label), -4]}
              anchorX="center"
              anchorY="middle"
            >
              {label}
              <meshNormalMaterial />
            </Text>
          );
        })}
      </group>
      <group>
        {tickValues.map((label, index) => {
          return (
            <Text
              key={index}
              color="red"
              fontSize={1}
              position={[11, labelAxis(label), 7.3]}
              anchorX="center"
              anchorY="middle"
            >
              {label}
              <meshNormalMaterial />
            </Text>
          );
        })}
      </group>
    </>
  );
}

const XAxis = ({ ticks, tickPositions, tickLabels, labelPosition }) => {
  const mesh = useRef();

  return (
    <group ref={mesh}>
      {ticks.map((tick, i) => (
        <line
          key={tick}
          position={[tickPositions[i][0], tickPositions[i][1], 0]}
          points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -0.5)]}
        />
      ))}
      {tickLabels.map((label, i) => (
        <Text
          key={i}
          color={"red"}
          anchorX="center"
          anchorY="top"
          fontSize={0.4}
          position={[tickPositions[i][0], tickPositions[i][1] - 0.6, 0]}
        >
          {label}
        </Text>
      ))}
      <Text
        color={"red"}
        anchorX="center"
        anchorY="top"
        fontSize={0.4}
        position={[labelPosition[0], labelPosition[1], labelPosition[2]]}
      >
        X-Axis Label
      </Text>
    </group>
  );
};

const Legend = ({ xPos }) => {
  return (
    <>
      <group rotation={[Math.PI * -0.5, 0, 0]}>
        <Text
          position={[xPos, 2, 0.4]}
          color="blue"
          fontSize={1.2}
          anchorX="left"
          anchorY="left"
        >
          GOOGL - Google Stock Price
        </Text>
        <Text
          position={[xPos, 0.5, 0.4]}
          color="orange"
          fontSize={1.2}
          anchorX="left"
          anchorY="left"
        >
          TWTR - Twitter Stock Price
        </Text>
        <Text
          position={[xPos, -1, 0.4]}
          color="red"
          fontSize={1.2}
          anchorX="left"
          anchorY="left"
        >
          MSFT - Microsoft Stock Price
        </Text>
        <Text
          position={[xPos, -2.5, 0.4]}
          color="magenta"
          fontSize={1.2}
          anchorX="left"
          anchorY="left"
        >
          TSLA - Tesla Stock Price
        </Text>
        <Text
          position={[xPos, -4, 0.4]}
          color="green"
          fontSize={1.2}
          anchorX="left"
          anchorY="left"
        >
          AAPL - Apple Stock Price
        </Text>
      </group>
    </>
  );
};

function BarChart() {
  const controlsRef = useRef();

  const [GoogleData, setGoogleData] = useState([]);
  const [TeslaData, setTeslaData] = useState([]);
  const [MicrosoftData, setMicrosoftData] = useState([]);
  const [AppleData, setAppleData] = useState([]);
  const [TwitterData, setTwitterData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState([])

  const endpoint = [
    "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=AAPL&apikey=DI91U4WXG9ASK3W4",
    "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=GOOGL&apikey=DI91U4WXG9ASK3W4",
    "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=TSLA&apikey=DI91U4WXG9ASK3W4",
    "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=MSFT&apikey=DI91U4WXG9ASK3W4",
    "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=TWTR&apikey=DI91U4WXG9ASK3W4",
  ];

  useEffect(() => {
    const cachedData = localStorage.getItem("technologyData");
    if (cachedData) {
      const collected = JSON.parse(cachedData);
      setResult(collected)
      setLoading(false);
      console.log("processed", collected);
    }else {
        const fetchData = async () => {
          try {
            const allData = await Promise.all(
              endpoint.map((end) => axios.get(end))
            );
            const result = allData.map((response) => response.data);
            localStorage.setItem("technologyData", JSON.stringify(result));
            setResult(result);

            if (result.length !== endpoint.length) {
              throw new Error("Not all data was fetched successfully");
            }
            console.log("newly fetched", result);
            setLoading(false);
          } catch (err) {
            console.error(err.message);
          }
        };
        fetchData();
      }

      console.log('result array', result)

  }, []);

  // Set each state data
  useEffect(() => {
    
    if (result[0]) {
      const first = result[0];
      const metaData = first["Meta Data"];
      const newArray = Object.values(metaData);
      const symbol = newArray[1];

      const monthlyAdjustedTimeSeries = first["Monthly Adjusted Time Series"];

      const dates = Object.keys(monthlyAdjustedTimeSeries);

      const openPrices = Object.values(monthlyAdjustedTimeSeries).map(
        (item) => {
          return parseFloat(item["1. open"]);
        }
      );
      const highPrices = Object.values(monthlyAdjustedTimeSeries).map(
        (item) => parseFloat(item["2. high"])
      );
      const lowPrices = Object.values(monthlyAdjustedTimeSeries).map((item) =>
        parseFloat(item["3. low"])
      );
      const closePrices = Object.values(monthlyAdjustedTimeSeries).map(
        (item) => parseFloat(item["4. close"])
      );
      const volumes = Object.values(monthlyAdjustedTimeSeries).map((item) =>
        parseFloat(item["6. volume"])
      );
      setAppleData({
        openPrice: openPrices.slice(0, 15),
        lowPrice: lowPrices.slice(0, 15),
        highPrice: highPrices.slice(0, 15),
        closePrice: closePrices.slice(0, 15),
        volume: volumes.slice(0, 15),
        dates: dates.slice(0, 15),
        symbol,
      });
    }

    if (result[1]) {
      const second = result[1];
      const metaData = second["Meta Data"];
      const newArray = Object.values(metaData);
      const symbol = newArray[1];

      // const symbol = Object.values(metaData).map(item => console.log(item["2. Symbol"]))
      const monthlyAdjustedTimeSeries =
        second["Monthly Adjusted Time Series"];

      const dates = Object.keys(monthlyAdjustedTimeSeries);
      const openPrices = Object.values(monthlyAdjustedTimeSeries).map(
        (item) => parseFloat(item["1. open"])
      );
      const highPrices = Object.values(monthlyAdjustedTimeSeries).map(
        (item) => parseFloat(item["2. high"])
      );
      const lowPrices = Object.values(monthlyAdjustedTimeSeries).map((item) =>
        parseFloat(item["3. low"])
      );
      const closePrices = Object.values(monthlyAdjustedTimeSeries).map(
        (item) => parseFloat(item["4. close"])
      );
      const volumes = Object.values(monthlyAdjustedTimeSeries).map((item) =>
        parseFloat(item["6. volume"])
      );
      setGoogleData({
        openPrice: openPrices.slice(0, 15),
        lowPrice: lowPrices.slice(0, 15),
        highPrice: highPrices.slice(0, 15),
        closePrice: closePrices.slice(0, 15),
        volume: volumes.slice(0, 15),
        dates: dates.slice(0, 15),
        symbol,
      });
    }

    if (result[2]) {
      const third = result[2];
      const metaData = third["Meta Data"];
      const newArray = Object.values(metaData);
      const symbol = newArray[1];

      const monthlyAdjustedTimeSeries = third["Monthly Adjusted Time Series"];

      const dates = Object.keys(monthlyAdjustedTimeSeries);
      const openPrices = Object.values(monthlyAdjustedTimeSeries).map(
        (item) => parseFloat(item["1. open"])
      );
      const highPrices = Object.values(monthlyAdjustedTimeSeries).map(
        (item) => parseFloat(item["2. high"])
      );
      const lowPrices = Object.values(monthlyAdjustedTimeSeries).map((item) =>
        parseFloat(item["3. low"])
      );
      const closePrices = Object.values(monthlyAdjustedTimeSeries).map(
        (item) => parseFloat(item["4. close"])
      );
      const volumes = Object.values(monthlyAdjustedTimeSeries).map((item) =>
        parseFloat(item["6. volume"])
      );
      setTeslaData({
        openPrice: openPrices.slice(0, 15),
        lowPrice: lowPrices.slice(0, 15),
        highPrice: highPrices.slice(0, 15),
        closePrice: closePrices.slice(0, 15),
        volume: volumes.slice(0, 15),
        dates: dates.slice(0, 15),
        symbol,
      });
    }

    if (result[3]) {
      const fourth = result[3];
      const metaData = fourth["Meta Data"];
      const newArray = Object.values(metaData);
      const symbol = newArray[1];

      const monthlyAdjustedTimeSeries =
        fourth["Monthly Adjusted Time Series"];

      const dates = Object.keys(monthlyAdjustedTimeSeries);
      const openPrices = Object.values(monthlyAdjustedTimeSeries).map(
        (item) => parseFloat(item["1. open"])
      );
      const highPrices = Object.values(monthlyAdjustedTimeSeries).map(
        (item) => parseFloat(item["2. high"])
      );
      const lowPrices = Object.values(monthlyAdjustedTimeSeries).map((item) =>
        parseFloat(item["3. low"])
      );
      const closePrices = Object.values(monthlyAdjustedTimeSeries).map(
        (item) => parseFloat(item["4. close"])
      );
      const volumes = Object.values(monthlyAdjustedTimeSeries).map((item) =>
        parseFloat(item["6. volume"])
      );
      setMicrosoftData({
        openPrice: openPrices.slice(0, 15),
        lowPrice: lowPrices.slice(0, 15),
        highPrice: highPrices.slice(0, 15),
        closePrice: closePrices.slice(0, 15),
        volume: volumes.slice(0, 15),
        dates: dates.slice(0, 15),
        symbol,
      });
    }
    if (result[4]) {
      const fifth = result[4];
      const metaData = fifth["Meta Data"];
      const newArray = Object.values(metaData);
      const symbol = newArray[1];

      const monthlyAdjustedTimeSeries = fifth["Monthly Adjusted Time Series"];

      const dates = Object.keys(monthlyAdjustedTimeSeries);
      const openPrices = Object.values(monthlyAdjustedTimeSeries).map(
        (item) => parseFloat(item["1. open"])
      );
      const highPrices = Object.values(monthlyAdjustedTimeSeries).map(
        (item) => parseFloat(item["2. high"])
      );
      const lowPrices = Object.values(monthlyAdjustedTimeSeries).map((item) =>
        parseFloat(item["3. low"])
      );
      const closePrices = Object.values(monthlyAdjustedTimeSeries).map(
        (item) => parseFloat(item["4. close"])
      );
      const volumes = Object.values(monthlyAdjustedTimeSeries).map((item) =>
        parseFloat(item["6. volume"])
      );
      setTwitterData({
        openPrice: openPrices.slice(0, 15),
        lowPrice: lowPrices.slice(0, 15),
        highPrice: highPrices.slice(0, 15),
        closePrice: closePrices.slice(0, 15),
        volume: volumes.slice(0, 15),
        dates: dates.slice(0, 15),
        symbol,
      });
    }
  
  }, [result])

  // console.log(result)
  return (
    <>
      <ToastContainer />
      {
        loading ? <h1>Loading data ...</h1> :
        <Canvas
        style={{
          width: "94vw",
          height: "100vh",
          background: `url(https://cdn.aframe.io/a-painter/images/sky.jpg)`,
        }}
        camera={{ position: [0, 0, 40] }}
      >
        <OrbitControls ref={controlsRef} />
        <axesHelper
          args={[11, 20]}
          scale={[1.7, 3, 1]}
          position={[-8.5, 0, -3.5]}
        />
        <axesHelper
          args={[11, 20]}
          scale={[0, 3, 0]}
          position={[9.7, 0, -3.5]}
        />
        <axesHelper
          args={[11, 20]}
          scale={[0, 3, 0]}
          position={[9.7, 0, 7.3]}
        />
        <gridHelper args={[19, 14]} position={[0.2, 0, -1]} />
        <AxisLabels data={GoogleData} />
        <ambientLight intensity={0.1} />
        <directionalLight color="gold" position={[0, 0, 5]} />
        <PlaneGeometry />
        <Legend xPos={13} />
        <MappedVariable
          data={AppleData}
          zPos={6.5}
          color={"green"}
          scale={GoogleData}
        />
        <MappedVariable
          data={MicrosoftData}
          zPos={4.5}
          color={"red"}
          scale={GoogleData}
        />
        <MappedVariable
          data={TwitterData}
          zPos={2.5}
          color={"orange"}
          scale={GoogleData}
        />
        <MappedVariable
          data={TeslaData}
          zPos={0.5}
          color={"magenta"}
          scale={GoogleData}
        />
        <MappedVariable
          data={GoogleData}
          zPos={-2.5}
          color={"blue"}
          scale={GoogleData}
        />
      </Canvas>
      }
    </>
  );
}

export default BarChart;
