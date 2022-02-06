import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Step,
  StepLabel,
  Stepper,
} from "@material-ui/core";
import { Field, Form, Formik, FormikValues } from "formik";
import { TextField } from "formik-material-ui";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import DAOJson from "../../utils/DAO.json";
import Paper from "@material-ui/core/Paper";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";

// old hosted contracts 0xFB1d03d9Fdf585521b5Aab0541EC9B0Ec5952917 0x899E775ee5B8212d6514bd8E505c008C274f142D, 0xdbfd75875d985d353609470348f5b9ff5bd3615d, 0xCD7e28E92eD055b44512e9bE3b52cFDfcFe49373
const CONTRACT_ADDRESS = "0x610659c6B7cDcfe24daFE6d90dabD2C1E9B4ed04";

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [flowState, setFlowState] = useState("notConnected");
  const [memberList, setMemberList] = useState([]);
  const [eventList, setEventList] = useState([]);
  const [value, setValue] = React.useState(0);

  const checkIfWalletIsConnected = async () => {
    // @ts-ignore
    const { ethereum } = window;

    if (!ethereum) {
      alert("Get MetaMask!");
      return;
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      setCurrentAccount(account);
      setFlowState("connected");
    } else {
      console.log("No authorized account found");
    }
  };

  const connectWallet = async () => {
    try {
      // @ts-ignore
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      let chainId = await ethereum.request({ method: "eth_chainId" });

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x13881";
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Polygon Mumbai Network!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
      setFlowState("connected");
    } catch (error) {
      console.log(error);
    }
  };

  const getMembers = async () => {
    try {
      // @ts-ignore
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          DAOJson.abi,
          signer
        );

        let nftTxn = await connectedContract.getMembers();
        await nftTxn.wait();

        connectedContract.on("MembersList", (memberList) => {
          const finalMemberList = memberList
            .map((member) => {
              return {
                id: member[0].toNumber(),
                points: member[1].toNumber(),
                timestamp: member[2]?.toNumber(),
                discordUsername: member[3],
                role: member[4],
                pastActivities: member[5],
                profileURL: member[6],
                memberAddress: member[7],
              };
            })
            .sort((a, b) => b.points - a.points);
          setMemberList(finalMemberList);
          console.log(finalMemberList);
        });
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getEvents = async () => {
    try {
      // @ts-ignore
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          DAOJson.abi,
          signer
        );

        let nftTxn = await connectedContract.getEvents();
        await nftTxn.wait();
        connectedContract.on("EventsList", (eventList) => {
          const eventMemberList = eventList.map((event) => {
            console.log(currentAccount, event[6]);
            let isAttending = false;
            event[6].forEach((attendee) => {
              if (attendee == currentAccount) {
                isAttending = true;
              }
            });

            return {
              id: event[0].toNumber(),
              timestamp: event[1].toNumber(),
              name: event[2],
              description: event[3],
              coverURL: event[4],
              createdBy: event[5],
              attendees: event[6],
              isAttending: isAttending,
            };
          });
          setEventList(eventMemberList);
        });
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const joinEvents = async (eventID) => {
    try {
      // @ts-ignore
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          DAOJson.abi,
          signer
        );
        let nftTxn = await connectedContract.joinEvent(eventID);
        await nftTxn.wait();
        const tempEventList = eventList.map((event) => {
          if (event.id == eventID) {
            event.isAttending = true;
          }
          return event;
        });
        setEventList(tempEventList);
        alert("Event joined");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      alert("Something went wrong! You already joined event or you are not part of DAO");
    }
  };

  const signupMembers = async (_discordUsername, _role, _profileURL) => {
    try {
      // @ts-ignore
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          DAOJson.abi,
          signer
        );

        let nftTxn = await connectedContract.addMember(
          _discordUsername,
          _role,
          _profileURL
        );
        await nftTxn.wait();
        setFlowState("home");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
      alert("Already a member! Please login.");
    }
  };

  const loginMembers = async () => {
    try {
      // @ts-ignore
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          DAOJson.abi,
          signer
        );
        let nftTxn = await connectedContract.login();
        await nftTxn.wait();
        setFlowState("home");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
      alert("User not found!");
    }
  };

  const createEvents = async (values) => {
    try {
      // @ts-ignore
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          DAOJson.abi,
          signer
        );
        let nftTxn = await connectedContract.addEvent(
          values.name,
          values.description,
          values.coverURL
        );
        await nftTxn.wait();
        alert("Event created!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
      alert("You are not part of DAO! Please signup to create an event.");
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const connectMetamaskScreen = (
    <div className="container">
      <h2 className="gradient-text">Welcome to DAOfront</h2>
      <p className="sub-text">For signup, please connect metamask</p>
      <button
        onClick={connectWallet}
        className="connect-wallet-button blue-button"
      >
        Connect Metamask
      </button>
    </div>
  );

  const signUpScreen = (
    <Card>
      <CardContent>
        <FormikStepper
          initialValues={{
            discordUsername: "",
            role: "",
            profileURL: "",
          }}
          onSubmit={async (values) => {
            await signupMembers(
              values.discordUsername,
              values.role,
              values.profileURL
            );
          }}
        >
          <FormikStep label="About DAOfront">
            <h2>Vision</h2>
            <p>
              Provide Lightning-fast Bookkeeping for DAOs and Crypto Companies
            </p>
            <h2>Important Links</h2>
            <p>
              Join our <a href="#">Discord</a>
              <br></br>
              Follow us on <a href="#">Twitter</a>, <a href="#">Instagram</a>{" "}
              and <a href="#">Facebook</a>.
            </p>
          </FormikStep>
          <FormikStep label="Personal Data">
            <Box paddingBottom={2}>
              <Field
                fullWidth
                name="discordUsername"
                component={TextField}
                label="Discord Username"
              />
            </Box>
            <Box paddingBottom={2}>
              <Field
                fullWidth
                name="role"
                component={TextField}
                label="Role?"
              />
            </Box>
            <Box paddingBottom={2}>
              <Field
                fullWidth
                name="profileURL"
                component={TextField}
                label="Profile URL"
              />
            </Box>
          </FormikStep>
          <FormikStep label="Community Call">
            <h2>Attend onboard call</h2>
            <a target="_blank" href="https://calendar.google.com/calendar/render?action=TEMPLATE&dates=20220212T180000Z%2F20220212T200000Z&details=Learn more about our community in the call.%0A%0Ahttps://www.daofront.xyz/&location=remote&text=Community Call DAOfront">
              Add to calendar
            </a>
            <br></br>
            <br></br>
          </FormikStep>
          <FormikStep label="Done">
            <h2>Say hi to your community on discord 👋!!</h2>
          </FormikStep>
        </FormikStepper>
      </CardContent>
    </Card>
  );

  const memberListComponent = (
    <div className="container">
      <h2 className="gradient-text">DAOfront Members</h2>
      <p className="sub-text">Here are the current members of DAOfront.</p>
      <Button
        color="primary"
        type="submit"
        className="blue-button"
        onClick={async () => await getMembers()}
      >
        get members
      </Button>
      <div className="member-list">
        <div className="member-list-item bold">
          <div>
            <p>Member ID</p>
          </div>
          <div>
            <p>Image</p>
          </div>
          <div>
            <p>Discord Username</p>
          </div>
          <div>
            <p>Role</p>
          </div>
          <div>
            <p>Points</p>
          </div>
        </div>
      </div>
      {memberList.map((member) => {
        return (
          <div className="member-list-item">
            <div>
              <p>{member.id}</p>
            </div>
            <div>
              <img
                src={member.profileURL}
                alt="member"
                className="member-list-item-image"
              />
            </div>
            <div>
              <p>{member.discordUsername}</p>
            </div>
            <div>
              <p className="role">{member.role}</p>
            </div>
            <div>
              <p>{member.points} points</p>
            </div>
          </div>
        );
      })}
    </div>
  );

  const eventListComponent = (
    <div className="container">
      <h2 className="gradient-text">DAOfront Events</h2>
      <p className="sub-text">Here are the current events of DAOfront.</p>
      <Button
        color="primary"
        type="submit"
        className="blue-button"
        onClick={async () => await getEvents()}
      >
        get events
      </Button>
      <div className="event-list">
        <div className="event-list-item bold">
          <div>
            <p>Event ID</p>
          </div>
          <div>
            <p>Image</p>
          </div>
          <div>
            <p>Name</p>
          </div>
          <div>
            <p>Description</p>
          </div>
          <div>
            <p>Time</p>
          </div>
          <div>
            <p>More</p>
          </div>
        </div>
      </div>
      {eventList.map((event) => {
        const date = new Date(event.timestamp);
        const dateString =
          date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();

        return (
          <div className="event-list-item">
            <div>
              <p>{event.id}</p>
            </div>
            <div>
              <img
                src={event.coverURL}
                alt="event"
                className="event-list-item-image"
              />
            </div>
            <div>
              <p>{event.name}</p>
            </div>
            <div>
              <p>{event.description}</p>
            </div>
            <div>
              <p>{dateString}</p>
            </div>
            <div>
              <p>Attendees: {event.attendees.length}</p>
              <p>Created By: {event.createdBy}</p>
              <Button
                color="primary"
                type="submit"
                className="blue-button"
                onClick={() =>
                  !event.isAttending ? joinEvents(event.id) : null
                }
              >
                {event.isAttending ? "Already joined" : "join events"}
              </Button>
              <br></br>
              <br></br>
              <a target="_blank" href={`https://calendar.google.com/calendar/render?action=TEMPLATE&dates=${event.timestamp}&details=${event.description}&location=remote&text=${event.name}`}>
              Add to calendar
            </a>
            </div>
          </div>
        );
      })}
    </div>
  );

  const createEventComponent = (
    <div className="container">
      <h2 className="gradient-text">DAOfront Create Events</h2>
      <p className="sub-text">Fill fields to create events.</p>
      <Card>
        <CardContent>
          <FormikStepper
            initialValues={{
              name: "",
              description: "",
              coverURL: "",
            }}
            onSubmit={async (values) => await createEvents(values)}
          >
            <FormikStep label="Event Data">
              <Box paddingBottom={2}>
                <Field
                  fullWidth
                  name="name"
                  component={TextField}
                  label="Name of event"
                />
              </Box>
              <Box paddingBottom={2}>
                <Field
                  fullWidth
                  name="description"
                  component={TextField}
                  label="Description of event"
                />
              </Box>
              <Box paddingBottom={2}>
                <Field
                  fullWidth
                  name="coverURL"
                  component={TextField}
                  label="Cover image url"
                />
              </Box>
            </FormikStep>
          </FormikStepper>
        </CardContent>
      </Card>
    </div>
  );

  const getTabComponent = (value) => {
    switch (value) {
      case 0:
        return memberListComponent;
      case 1:
        return eventListComponent;
      case 2:
        return createEventComponent;
    }
  };

  const homeScreen = (
    <>
      <Paper square>
        <Tabs
          value={value}
          textColor="primary"
          indicatorColor="primary"
          onChange={(event, newValue) => {
            setValue(newValue);
          }}
        >
          <Tab label="DAO Members" />
          <Tab label="DAO Events" />
          <Tab label="Create Events" />
        </Tabs>
        {getTabComponent(value)}
      </Paper>
    </>
  );

  const authScreen = (
    <div className="container">
      <h2 className="gradient-text">DAOfront</h2>
      <p className="sub-text">
        Welcome to DAOfront! Please sign in to continue.
      </p>
      <Button
        color="primary"
        type="submit"
        className="blue-button"
        onClick={() => loginMembers()}
      >
        Login
      </Button>
      <Button
        color="primary"
        type="submit"
        className="blue-button"
        onClick={() => setFlowState("signup")}
        style={{ marginLeft: "10px" }}
      >
        Sign Up
      </Button>
    </div>
  );

  const getComponent = (state) => {
    switch (state) {
      case "notConnected":
        return connectMetamaskScreen;
      case "connected":
        return authScreen;
      case "signup":
        return signUpScreen;
      case "home":
        return homeScreen;
    }
  };

  return getComponent(flowState);
}

// export interface FormikStepProps
//   extends Pick<FormikConfig<FormikValues>, "children" | "validationSchema"> {
//   label: string;
// }

export function FormikStep({ children }) {
  return <>{children}</>;
}

export function FormikStepper({
  children,
  ...props
}){
  const childrenArray = React.Children.toArray(
    children
  );
  const [step, setStep] = useState(0);
  const currentChild = childrenArray[step];
  const [completed, setCompleted] = useState(false);

  function isLastStep() {
    return step === childrenArray.length - 1;
  }

  return (
    <Formik
      {...props}
      validationSchema={currentChild.props.validationSchema}
      onSubmit={async (values, helpers) => {
        if (isLastStep()) {
          await props.onSubmit(values, helpers);
          setCompleted(true);
        } else {
          setStep((s) => s + 1);
          helpers.setTouched({});
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form autoComplete="off">
          <Stepper alternativeLabel activeStep={step}>
            {childrenArray.map((child, index) => (
              <Step
                key={child.props.label}
                completed={step > index || completed}
              >
                <StepLabel>{child.props.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {currentChild}
          <Grid container spacing={2}>
            {step > 0 ? (
              <Grid item>
                <Button
                  disabled={isSubmitting}
                  variant="contained"
                  color="primary"
                  className="blue-button"
                  onClick={() => setStep((s) => s - 1)}
                >
                  Back
                </Button>
              </Grid>
            ) : null}
            <Grid item>
              <Button
                startIcon={
                  isSubmitting ? <CircularProgress size="1rem" /> : null
                }
                disabled={isSubmitting}
                variant="contained"
                color="primary"
                type="submit"
                className="blue-button"
              >
                {isSubmitting ? "Submitting" : isLastStep() ? "Submit" : "Next"}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
}
