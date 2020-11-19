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
  const [messageHistory, setMessageHistory] = useState([] as any[]);
  const [messages, setMessages] = useState(
    [] as { message: string; from: number }[]
  );
  radio.onConnectedEvent.subscribe((radioPacket) => {
    console.log("Device connected");
    radio.onConfigDoneEvent.subscribe((radioPacket) => {
      console.log("ConfigDoneEvent");
    });

    radio.onDataPacketEvent.subscribe((radioPacket) => {
      console.log("DataPacketEvent");
      let data = radioPacket;
      if (
        data.decoded.data.typ === TypeEnum.CLEAR_TEXT &&
        data.decoded.data.payload instanceof Uint8Array
      ) {
        const message = txtenc.decode(data.decoded.data.payload);
        setMessages([...messages, { message, from: radio.myInfo.myNodeNum }]);
      }
      setRadioData(radioPacket);
      setMessageHistory([...messageHistory, radioPacket]);
    });
    radio.onUserPacketEvent.subscribe((radioPacket) => {
      console.log("UserPacketEvent");
      setRadioData(radioPacket);
      setMessageHistory([...messageHistory, radioPacket]);
    });
    radio.onPositionPacketEvent.subscribe((radioPacket) => {
      console.log("PositionPacketEvent");
      setRadioData(radioPacket);
      setMessageHistory([...messageHistory, radioPacket]);
    });
    radio.onNodeListChangedEvent.subscribe((radioPacket) => {
      console.log("NodeListChangeEvent");
      setRadioData(radioPacket);
      setMessageHistory([...messageHistory, radioPacket]);
    });
    radio.onFromRadioEvent.subscribe((radioPacket) => {
      console.log("FromRadioEvent");
      setRadioData(radioPacket);
      setMessageHistory([...messageHistory, radioPacket]);
    });
  });

  radio.onDisconnectedEvent.subscribe((radioPacket) => {
    console.log("Device disconnected");

    radio.onDataPacketEvent.cancelAll();
    radio.onUserPacketEvent.cancelAll();
    radio.onPositionPacketEvent.cancelAll();
    radio.onNodeListChangedEvent.cancelAll();
    radio.onFromRadioEvent.cancelAll();
  });

  const disconnect = () => {
    radio.disconnect();
  };

  const onBroadcastMessage = (data: any) => {
    radio.sendText(data.message, data.node);
    setMessages([
      ...messages,
      { message: data.message, from: radio.myInfo.myNodeNum },
    ]);
  };
  const txtenc = new TextDecoder("utf-8");

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <div className="App h-screen flex">
      <div className="w-1/2 overflow-auto border-2  my-2 ml-2 mr-1">
        <div className="text-xl m-2 border-2 px-2">
          Connected: <b>{radio.isConnected ? "Connected" : "Disconnected"}</b>
        </div>
        <div className="border-2 mx-2">
          <button
            className="bg-gray-300 rounded-lg p-1 m-2 hover:bg-gray-400"
            onClick={() => {
              radio.isConnected ? disconnect() : radio.connect().catch();
            }}
          >
            {radio.isConnected ? "Disconnect" : "Connect"}
          </button>

          <button
            className="bg-gray-300 rounded-lg p-1 m-2 hover:bg-gray-400"
            onClick={() => {
              const message = `broadcasting message at: ${new Date().toISOString()}`;
              radio.sendText(message, undefined, true);
              setMessages([
                ...messages,
                { message, from: radio.myInfo.myNodeNum },
              ]);
            }}
          >
            Send Message
          </button>

          <button
            className="bg-gray-300 rounded-lg p-1 m-2 hover:bg-gray-400"
            onClick={() => {
              setRadioData(radio.radioConfig);
              setMessageHistory([...messageHistory, radio.radioConfig]);
            }}
          >
            readConfig
          </button>
          <button
            className="bg-gray-300 rounded-lg p-1 m-2 hover:bg-gray-400"
            onClick={async () => {
              setRadioData(Array.from(radio.nodes.nodes));
              setMessageHistory([
                ...messageHistory,
                Array.from(radio.nodes.nodes),
              ]);
            }}
          >
            readNodes
          </button>
          <button
            className="bg-gray-300 rounded-lg p-1 m-2 hover:bg-gray-400"
            onClick={() => {
              setRadioData(radio.myInfo);
              setMessageHistory([...messageHistory, radio.myInfo]);
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
                {Array.from(radio.nodes.nodes).map((node) => {
                  if (node[1].num !== radio.myInfo.myNodeNum) {
                    return (
                      <option key={node[1].num} value={node[1].num}>
                        {node[1].user.longName} ({node[1].num})
                      </option>
                    );
                  }
                })}
              </select>

              <input type="submit" className="cursor-pointer" value="Send" />
            </form>
          </div>
        ) : undefined}
      </div>

      <div className="w-1/2 overflow-auto border-2 my-2 mr-2 ml-1 flex flex-col text-xl">
        <div className="mx-2 mt-2 border-2 px-2 overflow-auto h-24">
          {messageHistory.length ? (
            messageHistory.map((message, index) => (
              <p
                className="cursor-pointer border-b-2 truncate hover:border-black"
                onClick={() => {
                  setRadioData(message);
                }}
                key={index}
              >
                #{index}: {JSON.stringify(message)}
              </p>
            ))
          ) : (
            <p>Message History</p>
          )}
        </div>
        <div className="m-2 border-2 px-2 flex-grow overflow-auto">
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
        <div className="mx-2 mb-2 border-2 px-2 py-1 overflow-auto h-24">
          {messages.length ? (
            messages.map((message, index) => (
              <p key={index}>
                <span
                  className={`bg-${
                    message.from === radio.myInfo?.myNodeNum
                      ? "blue-200"
                      : "gray-200"
                  } rounded-lg px-1`}
                >
                  {message.from}
                </span>
                : {message.message}
              </p>
            ))
          ) : (
            <p>No messages</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
