import axios from "axios";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { endpointSubmitUrl } from "../untils/APIRoutes";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import { info_user, access_token } from "./Login";

const Search = () => {
  const navigate = useNavigate();
  const inputRef: any = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>({});

  useEffect(() => {
    if (!sessionStorage.getItem(access_token)) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const data: any = sessionStorage.getItem(info_user);
    const infoUser = JSON.parse(data);
    if (infoUser) {
      setUser(infoUser);
    }
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const { value } = inputRef.current;
    if (value) {
      try {
        setIsLoading(true);
        const sessionId = uuidv4();

        // Send a POST request to the API with the prompt in the request body
        await axios.post(endpointSubmitUrl, {
          gitUrl: value,
          idSession: sessionId,
        });
        sessionStorage.setItem("access_token", sessionId);

        navigate("/home");
      } catch (error) {
        console.log("error", error);
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
        <Container>
          <h1>{user?.name}</h1>
          <form onSubmit={handleSubmit}>
            <div className="wrapper">
              <label className="title">CODE UNDERSTANDING</label>
              <input
                ref={inputRef}
                type="text"
                name="url"
                placeholder="Please enter URL"
                className="inputUrl"
              />
            </div>

            <button type="submit" className="btn">
              Phân tích
            </button>
            <button type="submit" className="btn_logout" onClick={handleLogOut}>
              Log out
            </button>
          </form>
        </Container>
      )}
    </>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: auto;
  width: 100%;
  height: 100vh;
  h1 {
    color: white;
  }
  .wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .title {
    font-size: 40px;
    color: red;
    font-weight: bold;
  }
  .inputUrl {
    height: 40px;
    width: 400px;
  }
  .btn,
  .btn_logout {
    display: flex;
    margin: 16px auto;
    padding: 12px 16px;
    font-size: 24px;
    color: #ffff;
    background: green;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }
  .btn_logout {
    margin-top: 40px;
  }
`;

export default Search;
