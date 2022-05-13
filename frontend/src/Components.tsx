import React, { useEffect, useMemo, useState } from "react";
import { Profile as ProfileType } from "./types/StateTypes";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { User } from "./services/UserService";
import http from "./services/HttpService";
import { Message } from "./services/MessageService";

export type ProfileProps = {
  id: number,
  imgUri: string,
  name: string,
  onLikeButtonClick: () => void,
  onPassButtonClick: () => void,
}

export function Profile(props: ProfileProps) {
  let { imgUri, name, onLikeButtonClick, onPassButtonClick } = props;

  useEffect(() => {
    console.log("Profile rerendered");
  });

  return (
    <div>
      <img src={imgUri} alt="Profile of pet" />
      <h2>{name}</h2>
      <div>
        <button onClick={onPassButtonClick}>Pass</button>
        <button onClick={onLikeButtonClick}>Like</button>
      </div>
    </div>
  );
}

type FilterBarProps = {
  onApply: (filterString: string) => void,
}

function FilterBar({ onApply }: FilterBarProps) {
  let [filterString, setFilterString] = useState("");

  let handleChange = (event) => {
    // onApply(filterString); // this is a bad idea, if you want to do this: use lodash.debounce!
    setFilterString(event.target.value);
  };

  let handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      onApply(filterString)
    }
  }

  return (
    <div>
      <label htmlFor="filter">Filter Matches:</label> &nbsp;
      <input id="filter"
        type="text"
        value={filterString}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      /> &nbsp;
      <button onClick={() => onApply(filterString)}>Apply</button>
    </div>
  )
}

//type MatchHistoryProfileProps = ProfileType & { onUnmatchButtonClick: (id: number) => void }

type MsgBoxState = {
  sender_id: number,
  receiver_id: number,
}

function MatchHistoryProfile(props) {
  let { id, thumbUri, name, onUnmatchButtonClick } = props;

  const navigate = useNavigate();

  let onMessageButtonClick = (id) => {
    const state: MsgBoxState = { sender_id: 1, receiver_id: 1 }
    navigate("/messages", { state: state })
    //props.state.sender_id
  }

  useEffect(() => {
    console.log(`Match History Profile ${name} rerendered`);
  });

  return <div>
    <img src={thumbUri} alt="" />
    {name}
    &nbsp;
    <button onClick={() => onUnmatchButtonClick(id)}>Unmatch</button>
    <button onClick={() => onMessageButtonClick(id)}>Message</button>
  </div>
}

export type MatchHistoryProps = {
  likeHistory: Array<ProfileType>,
  onUnmatchButtonClick: (id: number) => void,
}

export function MatchHistory({ likeHistory, onUnmatchButtonClick}: MatchHistoryProps) {
  let [filterString, setFilterString] = useState("");

  let profilesToDisplay = useMemo(
    () => likeHistory.filter(s => s.name.includes(filterString)),
    [likeHistory, filterString]
  );

  useEffect(() => {
    console.log("Match History rerendered");
  });

  let filterBar = <FilterBar onApply={setFilterString} />;

  return (
    <div>
      <h3>Past matches:</h3>
      {filterBar}
      <br />
      {profilesToDisplay.map(
        profile =>
          <MatchHistoryProfile
            onUnmatchButtonClick={onUnmatchButtonClick}
            key={profile.id}
            {...profile} />
      )}
    </div>
  )
}

export const NotFound = () => (
  <div>
    <h1>404 - Not Found!</h1>
    <Link to="/">Go Home</Link>
  </div>
);

export const Header = () => {
  return (<div>
    <h1>Doggr</h1>
    <div className="text-3xl subheader font-bold underline text-white">Where your pets finds love(tm)</div>
    <Link to="/">Dashboard</Link>
    &nbsp; | &nbsp;
    <Link to="/match-history">Match History</Link>
    &nbsp; | &nbsp;
    <Link to="/create-user">Create User</Link>
      &nbsp; | &nbsp;
      <Link to="/create-profile">Create Profile</Link>
    <br />
    <Outlet />
  </div>
  );
}

export const MessageBox = () => {

  //useNavigate("/messages") lands here
  const state = useLocation().state as MsgBoxState;

  const [message, setMessage] = useState("");


  function handleMessageChange(event) {
    console.log("Message changed");
    setMessage(event.target.value);
  }

  async function onSubmitButtonClick() {
    if (state !== null) {
      const result = await Message.send(message, state.sender_id, state.receiver_id);
      console.log(result);
    }
  }

  return (
    <div>
      <label htmlFor="message">Message</label>
      <input
        type="text"
        id="message"
        required
        value={message}
        onChange={handleMessageChange}
        name="message"
      />
      <br />
      <button onClick={onSubmitButtonClick}>
        Submit
      </button>
    </div>
  )
}


const initialUserState = {
  email: "",
  password: "",
};

export const CreateUser = () => {

  const [user, setUser] = useState(initialUserState);
  const [submitted, setSubmitted] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);


  const handleInputChange = event => {
    const { name, value } = event.target;
    setUser({ ...user, [name]: value });
  };

  const saveUser = () => {
    User.create(user)
      .then(res => {
        setSubmitted(true);
        setSubmitFailed(false);
        console.log(res.data);
      })
      .catch(e => {
        setSubmitFailed(true);
        console.log("Error creating new user", e);
      })
  }

  const resetUser = () => {
    setUser(initialUserState);
    setSubmitted(false);
  }

  return (
    <div>
      { submitted ? (
        <>     {/* If we've already submitted, show this piece*/}
          <h4>You submitted successfully!</h4>
          <button onClick={resetUser}>
            Reset
          </button>
        </>
      ) : (
        <>   {/* If we've NOT already submitted, show this piece*/}
          { submitFailed && //This will only render if our prior submit failed
            //we could add a div here and style this separately
            <h2>Email already exists!</h2>
          }
          <CreateUserForm handleInputChange={handleInputChange} saveUser={saveUser} user={user} />
        </>
      )
      }
    </div>
  )
}

enum SubmissionStatus {
  NotSubmitted,
  SubmitFailed,
  SubmitSucceeded
}

export const CreateUserForm = ({ handleInputChange, saveUser, user }) => {

  const [selectedFile, setSelectedFile] = useState();
  const [submitted, setSubmitted] = useState(SubmissionStatus.NotSubmitted);

  const onFileChange = event => {

    // Update the state
    setSelectedFile(event.target.files[0]);

  };

  const onUploadFile = (event) => {
    event.preventDefault();
    // @ts-ignore

    const formData = new FormData();
    // @ts-ignore
    formData.append('file', selectedFile);
    // @ts-ignore
    formData.append('fileName', selectedFile.name);
    const config = {
      headers: {
        'content-type': 'multipart/form-data',
      },
    };
    http.post("/uploadFile", formData, config).then((response) => {
      console.log("Got response from upload file:", response.status);
      if (response.status === 200) {
        setSubmitted(SubmissionStatus.SubmitSucceeded)
      } else {
        setSubmitted(SubmissionStatus.SubmitFailed);
      }

    });
  }

  // return (
  //     <div>
  //       {submitted ? (
  //           <>     {/* If we've already submitted, show this piece*/}
  //             <h4>You submi

  return (
    <div>
      { submitted === SubmissionStatus.SubmitFailed &&
        <h3>Submitting file failed!</h3>
      }
      <div>
        <label htmlFor="email">Email</label>
        <input
          type="text"
          id="email"
          required
          value={user.email}
          onChange={handleInputChange}
          name="email"
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          type="text"
          id="password"
          required
          value={user.password}
          onChange={handleInputChange}
          name="password"
        />
      </div>

      <button onClick={saveUser}>
        Create
      </button>
      <div>
        <label
            htmlFor="profilepic">Choose a profile picture:
        </label>
        <input
            type="file"
            id="profilepic"
            name="profilepic"
            accept="image/png, image/jpeg"
            onChange={onFileChange}
        />
        <button onClick={onUploadFile}>Upload File</button>

      </div>
    </div>
  )
}


export const CreateProfile = () => {

  const [selectedFile, setSelectedFile] = useState();
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(SubmissionStatus.NotSubmitted);

  const onFileChange = event => {
    // Update the state
    setSelectedFile(event.target.files[0]);
  };

  const onUploadFile = (event) => {
    const formData = new FormData();
    // @ts-ignore
    formData.append('file', selectedFile);
    // @ts-ignore
    formData.append('fileName', selectedFile.name);
    formData.append('name', name);
    const config = {
      headers: {
        'content-type': 'multipart/form-data',
      },
    };
    http.post("/createProfile", formData, config).then((response) => {
      console.log("Got response from upload file:", response.status);
      if (response.status === 200) {
        setSubmitted(SubmissionStatus.SubmitSucceeded)
      } else {
        setSubmitted(SubmissionStatus.SubmitFailed);
      }

    });
  }

  return (
    <div>
      { submitted === SubmissionStatus.SubmitFailed &&
        <h3>Creating Profile failed!</h3>
      }
      <div>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          name="name"
        />
      </div>

      <div>
        <label
          htmlFor="profilepic">Upload a profile picture (jpg/png):
        </label>
        <input
          type="file"
          id="profilepic"
          name="profilepic"
          accept="image/png, image/jpeg"
          onChange={onFileChange}
        />
        <button onClick={onUploadFile}>Create</button>

      </div>
    </div>
  )
}
