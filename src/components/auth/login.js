import React, { Component } from "react";
import axios from "axios";
import { Link, Redirect } from "react-router-dom";

import { UserUtils } from "../shared/user";
import { BASE_URL, GET_USER_BASIC_DATA, LOGIN_URL } from "../shared/axiosUrls";
import { toast } from "react-toastify";

class login extends Component {
  constructor(props) {
    super(props);
    this.loggedIn = UserUtils.isLogin();
    this.state = {
      username: "",
      password: "",
      redirect: false,
      error: "",
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.Login = this.Login.bind(this);
  }

  onChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  Login(data) {
    const config = {
      method: "post",
      url: BASE_URL + LOGIN_URL,
      data: data,
    };
    axios(config)
      .then((res) => {
        console.log(res)
        if (res.status === 200) {
          UserUtils.setToken(res.data.access, res.data.refresh);
          UserUtils.setUserName(data.username);
          axios
            .get(BASE_URL + GET_USER_BASIC_DATA)
            .then((res) => {
              if (res.status === 200) {
                const data = res.data;
                UserUtils.setIsAdmin(data.is_admin);
              } else {
                toast("Error User Fetching Info");
              }
            })
            .catch((err) => {
              console.log(err);
            })
            .finally(() => {
              if (UserUtils.isLogin()) {
                this.props.history.push("/index");
              } else {
                this.setState({
                  error: "Wrong Username or Password",
                });
              }
            });
        } else {
          toast("Error Logging In");
        }
      })
      .catch(() => {
        this.setState({
          error: "Wrong Username or Password",
        });
      });
  }

  onSubmit = (e) => {
    e.preventDefault();
    const data = {
      username: this.state.username,
      password: this.state.password,
    };
    this.Login(data);
  };
  render() {
    if (this.loggedIn) {
      return <Redirect to="/index" />;
    }
    const { username, password } = this.state;
    return (
      <div className="row ">
        <div className="mt-5 mb-5 offset-md-4 col-md-4 offset-2 col-8 card">
          <h2>User Login</h2>
          <form onSubmit={this.onSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                className="form-control text-center"
                type="text"
                name="username"
                minLength="5"
                onChange={this.onChange}
                value={username}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                className="form-control text-center"
                type="password"
                name="password"
                onChange={this.onChange}
                minLength="4"
                maxLength="20"
                value={password}
                required
              />
            </div>
            <span className="text-center">{this.state.error}</span>
            <div className="form-group">
              <button type="submit" className="btn btn-primary mb-2 mt-2">
                Submit
              </button>
            </div>
            <div className="text-center">
              Don't Have an Account: <Link to="/signup">Sign UP</Link> Instead
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default login;
