import { useState } from "react"
import fetch from "node-fetch"
import Web3 from "web3"
import { InputGroup, FormControl, Button } from "react-bootstrap"

const server_url = "http://localhost:3030"

const web3 = new Web3(Web3.givenProvider);

function App() {
  const [token, setToken] = useState("")
  const [error, setError] = useState("")

  const handleSignin = async () => {
    try {
      // retreive nonce 
      const getNonce = await fetch(`${server_url}/token`);
      const nonce = await getNonce.json();

      // check MetaMask is installed
      if (!window.ethereum) {
        setError("MetaMask is not detected. Please install MetaMask and retry!");
      }

      // get an account from Metamask
      const address = await window.ethereum.request({
        method: "eth_requestAccounts",
      })
      if (address.length < 0) {
        setError("No accoun! Please, create an account");
      }

      // get data to unlock account
      const signature = await web3.eth.personal.sign(
        nonce.toString(),
        address[0]
      );

      // auth request body
      const data = {
        nonce,
        address: address[0],
        signature,
      };

      // authenticate user and get a token
      const authentication = await fetch(`${server_url}/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const token = await authentication.text();
      setToken(token);
    } catch (error) {
      console.log(error.message);
    }
  }

  return (
    <div className="text-center mt-4">
      <InputGroup className="m-3">
        <InputGroup.Text id="inputGroup-sizing-default">Auth</InputGroup.Text>
        <FormControl
          as="textarea"
          aria-label="Default"
          aria-describedby="inputGroup-sizing-default"
          value={token}
          onChange={() => { }}
        />
      </InputGroup>
      <Button onClick={() => handleSignin()} >
        {"Sign in"}
      </Button>
      <p>{error ? error : null} </p>
    </div >
  );
}

export default App;
