import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import {
  bufferToHex,
  ecrecover,
  fromRpcSig,
  keccak,
  toBuffer,
  pubToAddress,
} from "ethereumjs-util";

const app = express();
const port = 3030;
const secret = "secret";

app.use(cors());
app.use(express.json());

app.get("/token", (req, res) => {
  let nonce = Math.floor(Math.random() * 1000000).toString() // in a real life scenario we would random this after each login and fetch it from the db as well
  return res.send(nonce)
});

app.post("/auth", (req, res) => {
  const { nonce, address, signature } = req.body;

  // adds prefix to the message, makes the calculated signature recognisable as an ethereum specific signature
  const prefix = keccak(
    Buffer.from(`\x19Ethereum Signed Message:\n${nonce.toString().length}${nonce}`)
  );

  const { v, r, s } = fromRpcSig(signature);

  // send the message and the signature to the network and recover the account
  const pubKey = ecrecover(toBuffer(prefix), v, r, s);

  // get recover address from pub key
  const recoveredAddress = bufferToHex(pubToAddress(pubKey));

  if (recoveredAddress !== address) {
    return res.status(401).send();
  }

  const token = jwt.sign(recoveredAddress, secret);

  return res.send(token);
})

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
})
