import React, { useState, useEffect, useRef, useCallback } from "react";
import { firebaseConnect } from "react-redux-firebase";

const SignInForm = (props) => {
  const [signIn, toggleSignInFlow] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [valid, isValid] = useState(false);

  const didMountRef = useRef(false);

  const authenticate = useCallback((e) => {
    e.preventDefault();
    const credentials = {
      email: email,
      password: password
    }
    props.firebase.login(credentials).then(result => {
      alert("Good job, we knew it was you!");
    }).catch(error => {
      alert("Nice try!");
    });
  }, [email, password, props.firebase]);

  const register = useCallback((e) => {
    e.preventDefault();
    const credentials = {
      email: email,
      password: password
    }
    props.firebase.createUser(credentials, { username, email }).then(result => {
      // now the user should be logged in.
      // reroute the user?
    }).catch(error => {
      alert("There was a problem");
      console.log(error);
    });
  }, [email, password, username, props.firebase]);


  useEffect(() => {
    // only if the state that changed was one of the form field states
    if (didMountRef.current) {
      // most basic validation
        const emailIsValid = email.length !== 0;
        const passwordIsValid = password.length !== 0;
        const formIsValid = emailIsValid && passwordIsValid;
        isValid(formIsValid);
    } else {
      didMountRef.current = true;
    }
  }, [didMountRef, email, password]);

  return (
    <div className="sign-in-form">
      <h2 className="text-3xl">{ signIn ? "Sign In" : "Registration" } </h2>
      { signIn ? (
        <div>
          <form onSubmit={(e) => authenticate(e)} className="flex flex-col">
            <label htmlFor="email">Email</label>
            <input className="text-input mb-2" type="text" name="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} />

            <label htmlFor="password">Password</label>
            <input className="text-input mb-2" type="password" name="password" autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} />

            <div className="flex flex-row-reverse py-2">
              <button type="submit" className="button bg-black text-yellow-400 px-4 py-2 mx-auto text-center submit-button" style={{transform: "skew(-10deg)"}} disabled={!valid}>Submit</button>
            </div>
          </form>
          <p className="text-purple-500 cursor-pointer text-center" onClick={() => toggleSignInFlow(false)}>Register</p>
        </div>
      ) : (
        <div>
          <form onSubmit={(e) => register(e)} className="flex flex-col">
            <label htmlFor="email">Email</label>
            <input className="text-input mb-2" type="text" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />

            <label htmlFor="email">UserName</label>
            <input className="text-input mb-2" type="text" name="username" value={username} onChange={(e) => setUsername(e.target.value)} />

            <label htmlFor="password">Password</label>
            <input className="text-input mb-2" type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} />

            <div className="flex flex-row-reverse py-2">
              <button type="submit" className="button bg-black text-yellow-400 px-4 py-2 mx-auto text-center submit-button" style={{transform: "skew(-10deg)"}} disabled={!valid}>Submit</button>
            </div>
          </form>
          <p className="text-purple-500 cursor-pointer text-center" onClick={() => toggleSignInFlow(true)}>Sign In</p>
        </div>
      )}
      

    </div>
  )
}

export default firebaseConnect()(SignInForm);
