import { GoogleLogin } from "@react-oauth/google";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import jwt_decode from "jwt-decode";

export const info_user = "info_user";
export const access_token = "access_token";
export const sessionId = "sessionId";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem(access_token)) {
      navigate("/search");
    }
  }, [navigate]);

  return (
    <Container>
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          const credential: any = credentialResponse.credential;
          var decoded: any = jwt_decode(credential);
          sessionStorage.setItem(access_token, decoded.jti);
          sessionStorage.setItem(info_user, JSON.stringify(decoded));
          navigate("/search");
        }}
        onError={() => {
          console.log("Login Failed");
        }}
      />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: none;
    width: 240px;
    height: 54px;
    background-color: white;
    border: solid 1px #424242;
    border-radius: 8px;
    color: #424242;
    font-size: 1.1rem;
    cursor: pointer;
    img {
      width: 34px;
      height: 34px;
    }
  }
`;

export default Login;
