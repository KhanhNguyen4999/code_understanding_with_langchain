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
    <FormContainer>
      <div className="wrapper">
        <div className="brand">
          <h2>Code UnderStand</h2>
        </div>
        <div className="btn_login">
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
        </div>
      </div>
    </FormContainer>
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
    h2 {
      color: #482136;
      text-transform: uppercase;
    }
  }

  .btn_login {
    display: flex;
    margin: auto;
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 8px;
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
    width: 300px;
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

// const Container = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   width: 100%;
//   height: 100vh;
//   button {
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     gap: 8px;
//     border: none;
//     width: 240px;
//     height: 54px;
//     background-color: white;
//     border: solid 1px #424242;
//     border-radius: 8px;
//     color: #424242;
//     font-size: 1.1rem;
//     cursor: pointer;
//     img {
//       width: 34px;
//       height: 34px;
//     }
//   }
// `;

export default Login;
