import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../components/App/App.css";
import PromptInput from "../components/PromptInput/PromptInput";
import PromptResponseList from "../components/PromptResponseList/PromptResponseList";
import { ResponseInterface } from "../components/PromptResponseList/response-interface";
import { endpointChatGPT } from "../untils/APIRoutes";
import { access_token } from "./Login";
import { v4 as uuidv4 } from "uuid";
// import { useAppSelector } from "../hooks/useHooks";
// import { addResponses } from "../store/homeSlice";
// import { unwrapResult } from "@reduxjs/toolkit";

const Home = () => {
  const navigate = useNavigate();
  // const dispatch = useAppDispatch();

  // useEffect(() => {
  //   if (!sessionStorage.getItem(access_token)) {
  //     navigate("/");
  //   }
  // }, [navigate]);

  const [responseList, setResponseList] = useState<ResponseInterface[]>([]);
  const [prompt, setPrompt] = useState<string>("");
  const [promptToRetry, setPromptToRetry] = useState<string | null>(null);
  const [uniqueIdToRetry, setUniqueIdToRetry] = useState<string | null>(
    "hello"
  );
  const [isLoading, setIsLoading] = useState(false);

  // const responses: any = sessionStorage.getItem("listResponse");
  // const res = JSON.parse(responses);
  // console.log("res", res);

  let loadInterval: number | undefined;

  const generateUniqueId = () => {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
  };

  const htmlToText = (html: string) => {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent;
  };

  const delay = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const addLoader = (uid: string) => {
    const element = document.getElementById(uid) as HTMLElement;
    element.textContent = "";

    // @ts-ignore
    loadInterval = setInterval(() => {
      // Update the text content of the loading indicator
      element.textContent += ".";

      // If the loading indicator has reached three dots, reset it
      if (element.textContent === "....") {
        element.textContent = "";
      }
    }, 300);
  };

  const addResponse = (selfFlag: boolean, response?: string) => {
    const uid = generateUniqueId();
    setResponseList((prevResponses) => [
      ...prevResponses,
      {
        id: uid,
        response,
        selfFlag,
      },
    ]);
    return uid;
  };

  const updateResponse = (
    uid: string,
    updatedObject: Record<string, unknown>
  ) => {
    setResponseList((prevResponses) => {
      const updatedList = [...prevResponses];
      const index = prevResponses.findIndex((response) => response.id === uid);
      if (index > -1) {
        updatedList[index] = {
          ...updatedList[index],
          ...updatedObject,
        };
      }

      sessionStorage.setItem("listResponse", JSON.stringify(updatedList));
      return updatedList;
    });
  };

  const regenerateResponse = async () => {
    await getGPTResult(promptToRetry, uniqueIdToRetry);
  };

  const getAccessToken = () => {
    return sessionStorage.getItem("access_token");
  };

  const getGPTResult = async (
    _promptToRetry?: string | null,
    _uniqueIdToRetry?: string | null
  ) => {
    // Get the prompt input
    const _prompt = _promptToRetry ?? htmlToText(prompt);

    // If a response is already being generated or the prompt is empty, return
    if (isLoading || !_prompt) {
      return;
    }

    setIsLoading(true);

    // Clear the prompt input
    setPrompt("");

    let uniqueId: string;
    if (_uniqueIdToRetry) {
      uniqueId = _uniqueIdToRetry;
    } else {
      // Add the self prompt to the response list
      addResponse(true, _prompt);
      uniqueId = addResponse(false);
      await delay(50);
      addLoader(uniqueId);
      setUniqueIdToRetry(uniqueId);
    }

    try {
      // Send a POST request to the API with the prompt in the request body
      let sessionId = getAccessToken();

      const response = await axios.post(endpointChatGPT, {
        question: _prompt,
        idSession: uuidv4(),
      });

      updateResponse(uniqueId, {
        response: response.data.Answer.trim(),
      });

      setPromptToRetry(null);
      // setUniqueIdToRetry("");
    } catch (err) {
      setPromptToRetry(_prompt);
      setUniqueIdToRetry(uniqueId);
      updateResponse(uniqueId, {
        // @ts-ignore
        response: `Error: ${err.message}`,
        error: true,
      });
    } finally {
      // Clear the loader interval
      clearInterval(loadInterval);
      setIsLoading(false);
    }
  };

  const handleClickHome = () => {
    navigate("/search");
  };

  return (
    <div className="App">
      <div id="response-list">
        <PromptResponseList responseList={responseList} key="response-list" />
      </div>

      {uniqueIdToRetry && (
        <div id="regenerate-button-container">
          <button
            id="regenerate-response-button"
            className={isLoading ? "loading" : ""}
            onClick={handleClickHome}
            style={{ marginLeft: "8px" }}
          >
            Home
          </button>
          <button
            id="regenerate-response-button"
            className={isLoading ? "loading" : ""}
            onClick={() => regenerateResponse()}
          >
            Regenerate Response
          </button>
        </div>
      )}

      <div id="input-container">
        <PromptInput
          prompt={prompt}
          onSubmit={() => getGPTResult()}
          key="prompt-input"
          updatePrompt={(prompt) => setPrompt(prompt)}
        />
        <button
          id="submit-button"
          className={isLoading ? "loading" : ""}
          onClick={() => getGPTResult()}
        ></button>
      </div>
    </div>
  );
};

export default Home;
