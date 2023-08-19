import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, ToastOptions, toast } from "react-toastify";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import Logo from "../assets/logo.svg";
import Loading from "../components/Loading";
import { endpointSubmitUrl } from "../untils/APIRoutes";
import { access_token, info_user } from "./Login";
import "react-toastify/dist/ReactToastify.css";

const Search = () => {
  const navigate = useNavigate();
  const inputRef: any = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>({});

  const toastOptions: ToastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  useEffect(() => {
    if (!sessionStorage.getItem(access_token)) {
      navigate("/");
    }
  }, [navigate]);

  // useEffect(() => {
  //   const data: any = sessionStorage.getItem(info_user);
  //   const infoUser = JSON.parse(data);
  //   if (infoUser) {
  //     setUser(infoUser);
  //   }
  // }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const { value } = inputRef.current;
    if (value) {
      try {
        setIsLoading(true);
        const sessionId = sessionStorage.getItem(access_token);

        // Send a POST request to the API with the prompt in the request body
        await axios.post(endpointSubmitUrl, {
          gitUrl: value,
          idSession: sessionId,
        });

        navigate("/home");
      } catch (error) {
        console.log("error", error);
        toast.error("Invalid GIT url", toastOptions);
      }
      setIsLoading(false);
    }
  };

  const handleLogOut = () => {
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <FormContainer>
            <form onSubmit={handleSubmit}>
              <div className="brand">
                <img src={Logo} alt="Logo" />
                <h1>Code Understanding</h1>
              </div>
              <input
                ref={inputRef}
                type="text"
                name="url"
                placeholder="Please enter GIT URL"
                className="inputUrl"
              />
              <button type="submit">Submit</button>
              <span onClick={handleLogOut}>Log out</span>
            </form>
          </FormContainer>
          <ToastContainer />
        </>
      )}
    </>
  );
};

const FormContainer = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    img {
      height: 5rem;
    }
    h1 {
      color: white;
      text-transform: uppercase;
    }
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    background-color: #00000076;
    border-radius: 2rem;
    padding: 3rem 5rem;
  }
  input {
    background-color: transparent;
    padding: 1rem;
    border: 0.1rem solid #4e0eff;
    border-radius: 0.4rem;
    color: white;
    width: auto;
    font-size: 1rem;
    width: auto;
    &:focus {
      border: 0.1rem solid #997af0;
      outline: none;
    }
  }
  button {
    background-color: #997af0;
    color: white;
    padding: 1rem 2rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 1rem;
    text-transform: uppercase;
    &:hover {
      background-color: #4e0eff;
    }
  }
  span {
    color: white;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4e0eff;
    text-decoration: none;
    font-weight: bold;
    cursor: pointer;
  }
`;

export default Search;
