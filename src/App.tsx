import React from "react";
import { Client } from "@meshtastic/meshtasticjs";
import { useState } from "react";
import JSONPretty from "react-json-pretty";
import { useForm } from "react-hook-form";
import { TypeEnum } from "@meshtastic/meshtasticjs/dist/protobuf";
import "./main.css";

const device = new Client();
const radio = device.createBLEConnection();
function App() {
  const { register, handleSubmit } = useForm();
  const { register: register2, handleSubmit: handleSubmit2 } = useForm();
  const [radioData, setRadioData] = useState(undefined as any);
  const [messageHistory, setMessageHistory] = useState([]);
  const [messages, setMessages] = useState([] as string[]);
  radio.onConnectedEvent.subscribe((radioPacket) => {
    console.log("ConnectedEvent");
    console.log(radioPacket);
    console.log("_____");
    setRadioData({
      isConfigDone: radioPacket.isConfigDone,
      isConfigStarted: radioPacket.isConfigStarted,
      isConnected: radioPacket.isConnected,
      isReconnecting: radioPacket.isReconnecting,
    });
  });
  radio.onConfigDoneEvent.subscribe((radioPacket) => {
    console.log("ConfigDoneEvent");
    console.log(radioData);
    console.log("_____");
  });
  radio.onDisconnectedEvent.subscribe((radioPacket) => {
    console.log("DisconnectedEvent");
    console.log(radioData);
    console.log("_____");
    setRadioData(radioPacket);
  });

  radio.onDataPacketEvent.subscribe((radioPacket) => {
    console.log("DataPacketEvent");
    console.log(radioPacket);
    console.log("_____");
    let data = radioPacket;
    if (
      data.decoded.data.typ === TypeEnum.CLEAR_TEXT &&
      data.decoded.data.payload instanceof Uint8Array
    ) {
      setMessages([...messages, txtenc.decode(data.decoded.data.payload)]);
    }
    setRadioData(radioPacket);
  });
  radio.onUserPacketEvent.subscribe((radioPacket) => {
    console.log("UserPacketEvent");
    console.log(radioPacket);
    console.log("_____");
    setRadioData(radioPacket);
  });
  radio.onPositionPacketEvent.subscribe((radioPacket) => {
    console.log("PositionPacketEvent");
    console.log(radioPacket);
    console.log("_____");
    setRadioData(radioPacket);
  });
  radio.onNodeListChangedEvent.subscribe((radioPacket) => {
    console.log("NodeListChangeEvent");
    console.log(radioPacket);
    console.log("_____");
    setRadioData(radioPacket);
  });
  radio.onFromRadioEvent.subscribe((radioPacket) => {
    console.log("FromRadioEvent");
    console.log(radioPacket);
    console.log("_____");
    setRadioData(radioPacket);
  });

  const pushToMessageHistory = (message: any) => {
    console.log("a");
    // setMessageHistory((message) => [...message, message]);
  };

  const disconnect = () => {
    radio.disconnect();
  };

  const onBroadcastMessage = (data: any) => {
    radio.sendText(data.message, data.node);
    setMessages([...messages, data.message]);
  };
  const txtenc = new TextDecoder("utf-8");

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <div className="App h-screen flex">
      <div className="w-1/2 overflow-auto border-2 m-4">
        <div className="text-xl m-2 border-2 px-2">
          Connected: <b>{radio.isConnected ? "Connected" : "Disconnected"}</b>
        </div>
        <div className="border-2 mx-2">
          <button
            className="bg-gray-400 rounded-lg p-1 m-2 hover:bg-gray-500"
            onClick={() => {
              radio.isConnected ? disconnect() : radio.connect();
            }}
          >
            {radio.isConnected ? "Disconnect" : "Connect"}
          </button>

          <button
            className="bg-gray-400 rounded-lg p-1 m-2 hover:bg-gray-500"
            onClick={() => {
              const message = `broadcasting message at: ${new Date().toISOString()}`;
              radio.sendText(message, undefined, true);
              setMessages([...messages, message]);
            }}
          >
            Send Message
          </button>

          <button
            className="bg-gray-400 rounded-lg p-1 m-2 hover:bg-gray-500"
            onClick={() => {
              setRadioData(radio.radioConfig);
            }}
          >
            readConfig
          </button>
          <button
            className="bg-gray-400 rounded-lg p-1 m-2 hover:bg-gray-500"
            onClick={async () => {
              setRadioData(Array.from(radio.nodes.nodes));
            }}
          >
            readNodes
          </button>
          <button
            className="bg-gray-400 rounded-lg p-1 m-2 hover:bg-gray-500"
            onClick={() => {
              setRadioData(radio.myInfo);
            }}
          >
            readmyInfo
          </button>
        </div>
        <div className="m-2 border-2 p-2">
          {radio.radioConfig ? (
            <form className=" flex flex-col" onSubmit={handleSubmit(onSubmit)}>
              <div className="flex">
                <div className="w-1/2 mr-2">
                  <small>wifiSsid</small>
                  <input
                    defaultValue={radio.radioConfig.preferences.wifiSsid}
                    className="border mb-1 w-full"
                    name="wifiSsid"
                    ref={register}
                  />
                  <small>wifiPassword</small>
                  <input
                    type="password"
                    defaultValue={radio.radioConfig.preferences.wifiPassword}
                    className="border mb-1 w-full"
                    name="wifiPassword"
                    ref={register}
                  />
                  <small>wifiApMode</small>
                  <input
                    type="checkbox"
                    defaultChecked={radio.radioConfig.preferences.wifiApMode}
                    className="border mb-1 w-full"
                    name="wifiApMode"
                    ref={register}
                  />
                  <small>region</small>
                  <input
                    defaultValue={radio.radioConfig.preferences.region}
                    className="border mb-1 w-full"
                    name="region"
                    ref={register}
                  />
                </div>
                <div className="w-1/2">
                  <small>name</small>
                  <input
                    defaultValue={radio.radioConfig.channelSettings.name}
                    className="border mb-1 w-full"
                    name="name"
                    ref={register}
                  />
                  <small>psk</small>
                  <input
                    defaultValue={txtenc.decode(
                      radio.radioConfig.channelSettings.psk
                    )}
                    className="border mb-1 w-full"
                    name="psk"
                    ref={register}
                  />
                </div>
              </div>
              <input type="submit" value="Save Config" />
            </form>
          ) : (
            <h5>
              Please connect and read <b>DeviceNodes</b>
            </h5>
          )}
        </div>

        {radio.nodes.nodes.size ? (
          <div className="m-2 border-2 p-2">
            <form
              className=" flex flex-col"
              onSubmit={handleSubmit2(onBroadcastMessage)}
            >
              <small>Message</small>
              <textarea
                placeholder="message"
                className="border mb-1"
                name="message"
                ref={register2}
              />
              <select name="node" className="border mb-1" ref={register2}>
                {Array.from(radio.nodes.nodes).map((node) => (
                  <option key={node[1].num} value={node[1].num}>
                    {node[1].user.longName}
                  </option>
                ))}
              </select>

              <input type="submit" className="cursor-pointer" value="Send" />
            </form>
          </div>
        ) : undefined}
      </div>

      <div className="w-1/2 overflow-auto border-2 m-4">
        <div className="text-xl m-2 border-2 px-2">
          {messages.length ? (
            messages.map((message, index) => (
              <p>
                # {index}: {message}
              </p>
            ))
          ) : (
            <p>No messages</p>
          )}
        </div>
        <div className="text-xl m-2 border-2 px-2">
          <JSONPretty
            theme={{
              main: "line-height:1.3;color:#18515c;overflow:auto;",
              error: "line-height:1.3;color:#66d9ef;overflow:auto;",
              key: "color:#f92672;",
              string: "color:#fd971f;",
              value: "color:#a6e22e;",
              boolean: "color:#ac81fe;",
            }}
            data={JSON.stringify(radioData)}
          ></JSONPretty>
        </div>
      </div>
    </div>
  );
}

export default App;
