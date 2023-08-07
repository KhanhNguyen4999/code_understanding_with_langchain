import { useRef, useState } from 'react';
import axios from "axios";
import PromptInput from "../PromptInput/PromptInput";
import './App.css';
import { ResponseInterface } from "../PromptResponseList/response-interface";
import PromptResponseList from "../PromptResponseList/PromptResponseList";
import { v4 as uuidv4 } from 'uuid';

type ModelValueType = 'gpt' | 'codex' | 'image';
const App = () => {

  const [responseList, setResponseList] = useState<ResponseInterface[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [promptToRetry, setPromptToRetry] = useState<string | null>(null);
  const [uniqueIdToRetry, setUniqueIdToRetry] = useState<string | null>(null);
  const [modelValue, setModelValue] = useState<ModelValueType>('gpt');
  const [isLoading, setIsLoading] = useState(false);
  const [responseSubmit, setResponseSubmit] = useState(false);

  let loadInterval: number | undefined;

  const [isShow, setIsShow] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const inputRef: any = useRef();
  const endpointChatGPT = "https://stickerai.azure-api.net/chat";
  const endpointSubmitUrl = "https://stickerai.azure-api.net/load";


  const generateUniqueId = () => {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
  }

  const htmlToText = (html: string) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent;
  }

  const delay = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const addLoader = (uid: string) => {
    const element = document.getElementById(uid) as HTMLElement;
    element.textContent = ''

    // @ts-ignore
    loadInterval = setInterval(() => {
      // Update the text content of the loading indicator
      element.textContent += '.';

      // If the loading indicator has reached three dots, reset it
      if (element.textContent === '....') {
        element.textContent = '';
      }
    }, 300);
  }


  const addResponse = (selfFlag: boolean, response?: string) => {
    const uid = generateUniqueId()
    setResponseList(prevResponses => [
      ...prevResponses,
      {
        id: uid,
        response,
        selfFlag
      },
    ]);
    return uid;
  }

  const updateResponse = (uid: string, updatedObject: Record<string, unknown>) => {
    setResponseList(prevResponses => {
      const updatedList = [...prevResponses]
      const index = prevResponses.findIndex((response) => response.id === uid);
      if (index > -1) {
        updatedList[index] = {
          ...updatedList[index],
          ...updatedObject
        }
      }
      return updatedList;
    });
  }

  const regenerateResponse = async () => {
    await getGPTResult(promptToRetry, uniqueIdToRetry);
  }

  // Function to set the access token in sessionStorage
  const setAccessToken = (token: string) => {
    localStorage.setItem('access_token', token);
  };

  const getAccessToken = () => {
    return localStorage.getItem('access_token');
  };

  const getGPTResult = async (_promptToRetry?: string | null, _uniqueIdToRetry?: string | null) => {
    // Get the prompt input
    const _prompt = _promptToRetry ?? htmlToText(prompt);

    // If a response is already being generated or the prompt is empty, return
    if (isLoading || !_prompt) {
      return;
    }

    setIsLoading(true);

    // Clear the prompt input
    setPrompt('');

    let uniqueId: string;
    if (_uniqueIdToRetry) {
      uniqueId = _uniqueIdToRetry;
    } else {
      // Add the self prompt to the response list
      addResponse(true, _prompt);
      uniqueId = addResponse(false);
      await delay(50);
      addLoader(uniqueId);
    }

    try {
      // Send a POST request to the API with the prompt in the request body
      let sessionId = getAccessToken();
      console.log("get session id: " +  sessionId)
      console.log("prompt: " + _prompt)
      const response = await axios.post(endpointChatGPT, {
        question: _prompt,
        idSession: sessionId
      });

      console.log("Response: ", response)
      updateResponse(uniqueId, {
        response: response.data.Answer.trim(),
      });

      setPromptToRetry(null);
      setUniqueIdToRetry(null);
    } catch (err) {
      setPromptToRetry(_prompt);
      setUniqueIdToRetry(uniqueId);
      updateResponse(uniqueId, {
        // @ts-ignore
        response: `Error: ${err.message}`,
        error: true
      });
    } finally {
      // Clear the loader interval
      clearInterval(loadInterval);
      setIsLoading(false);
    }
  }

  const handleSubmit = (e: any) => {
    e.preventDefault();

    const { value } = inputRef.current;
    if (value) {
      setIsShow(true);

      setIsLoading2(true);

      console.log("Hello " + value);

      // Send a POST request to the API with the prompt in the request body
      let sessionId = uuidv4()

      const response = axios.post(endpointSubmitUrl, {
        gitUrl: value,
        idSession: sessionId
      }).then(function (response) {
        // 
        // setResponseSubmit(true)
      })
      .catch(function (error) {
        console.log(error);
      })
      .finally(()=>{
        // if responseSubmit:
        // setIsLoading2(false)
        setTimeout(() => {
          setIsLoading2(false);
        }, 500)

        setAccessToken(sessionId);
        console.log(sessionId);
      })
      
    }
  }

  const handleClickHome = () => {
    setIsShow(false);
  }

  return (
    <div className="App">
      {
        isLoading2 ? <>
          <div className="overlay">
            <div className="overlay__inner">
              <div className="overlay__content"><span className="spinner"></span></div>
            </div>
          </div>
        </> :
          isShow ?
            <>
              <div id="response-list">
                <PromptResponseList responseList={responseList} key="response-list" />
              </div>
              {uniqueIdToRetry &&
                (<div id="regenerate-button-container">
                  <button id="regenerate-response-button" className={isLoading ? 'loading' : ''} onClick={() => regenerateResponse()}>
                    Regenerate Response
                  </button>
                  <button id="regenerate-response-button" className={isLoading ? 'loading' : ''} onClick={handleClickHome} style={{marginLeft: '8px'}}>
                    Home
                  </button>
                </div>
                )
              }
              {/* <div id="model-select-container">
                <label htmlFor="model-select">Select model:</label>
                <select id="model-select" value={modelValue} onChange={(event) => setModelValue(event.target.value as ModelValueType)}>
                  <option value="gpt">GPT-3 (Understand and generate natural language )</option>
                  <option value="codex">Codex (Understand and generate code, including translating natural language to code)
                  </option>
                  <option value="image">Create Image (Create AI image using DALL·E models)</option>
                </select>
              </div> */}
              <div id="input-container">
                <PromptInput
                  prompt={prompt}
                  onSubmit={() => getGPTResult()}
                  key="prompt-input"
                  updatePrompt={(prompt) => setPrompt(prompt)}
                />
                <button id="submit-button" className={isLoading ? 'loading' : ''} onClick={() => getGPTResult()}></button>
              </div>
            </> : <>
              <div className='wapper'>
                <form onSubmit={handleSubmit}>

                  <div>
                    <label className='title'>Pornhub</label>
                    <input ref={inputRef} type="text" name='url' placeholder="Please enter URL" className='inputUrl' />
                  </div>

                  <button
                    type='submit' className='btn'>Phan tich</button>
                </form>
              </div>
            </>
      }

    </div>
  );
}

export default App;
