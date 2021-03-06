import React from "react";
import ReactDOM from "react-dom";
import reportWebVitals from "./reportWebVitals";
import axios from "axios";

import "./index.css";
import App from "./App";
import { Redirect } from "react-router-dom";

import { toast } from "react-toastify";
import { UserUtils } from "./components/shared/user";
import { BASE_URL, REFRESH_TOKEN_URL } from "./components/shared/axiosUrls";
import "./assets/css/nucleo-icons.css";
import "./assets/css/black-dashboard-react.css";

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: false,
    };
  }
  initializeAxiosConfig = () => {
    axios.interceptors.request.use(
      (config) => {
        const token = UserUtils.getAccessToken();
        if (token) {
          config.headers["Authorization"] = "Bearer " + token;
        }
        // config.headers['Content-Type'] = 'application/json';
        return config;
      },
      (error) => {
        Promise.reject(error);
      }
    );

    const handleServerErrors = (status) => {
      if (status >= 500) {
        toast("Internal Server Error");
      }
    };

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (err) => {
        const originalConfig = err.config;
        if (originalConfig) {
          if (err.response) {
            // All other status code except 401
            if (err.response.status !== 401) {
              handleServerErrors(err.response.status);
              return Promise.reject(err);
            }
            // Access Token was expired
            if (err.response.status === 401 && !originalConfig._retry) {
              axios.interceptors.response.eject(interceptor);
              originalConfig._retry = true;

              try {
                const rs = await axios.post(BASE_URL + REFRESH_TOKEN_URL, {
                  refresh: UserUtils.getRefreshToken(),
                });
                UserUtils.setAccessToken(rs.data.access);

                return axios(originalConfig);
              } catch (_error) {
                this.setState({
                  redirect: true,
                });
                UserUtils.clearLocalStorage();
                return Promise.reject(_error);
              }
            }
          } else {
            // Access and refresh Token were expired
            UserUtils.clearLocalStorage();
            this.setState({
              redirect: true,
            });
          }
        }
        //Server is down and not responded
        toast("Server Unavailable");
        UserUtils.clearLocalStorage();
        this.setState({
          redirect: true,
        });
      }
    );
  };

  render() {
    this.initializeAxiosConfig();
    this.state.redirect ? <Redirect to="/login" /> : <></>;
    return <App />;
  }
}

export default Index;

ReactDOM.render(
  <React.StrictMode>
    <Index />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
