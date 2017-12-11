WIP

# Generic Block Explorer for Exonum-based blockchains

This guide will show you how to use this block explorer with [Exonum](https://exonum.com)-based blockchains.

# Prerequisites
1. Rust compiler,
2. Node.js,
3. An extension for your web-browser allowing to change CORS headers. This is required because we are going to make cross-domain requests.
As of version 0.3, Exonum has no built-in mechanisms to configure Cross-Origin policy. Yo may use, for example, [Moesif Origin & CORS Changer](https://chrome.google.com/webstore/detail/moesif-origin-cors-change/digfbfaphojjndkpccljibejjbppifbc) for Chrome.

# An Exonum-based blockchain application
For the purpose of this example we are going to use a [cryptocurrency](https://github.com/exonum/cryptocurrency) built using Exonum.

1. Get and run the cryptocurrency example:

```
git clone https://github.com/exonum/cryptocurrency.git
cd ./cryptocurrency
cargo run
```

2. Go to the `./example`,
3. Send some transactions to the server:

```
curl -H "Content-Type: application/json" -X POST -d @create-wallet-1.json http://127.0.0.1:8000/api/services/cryptocurrency/v1/wallets

curl -H "Content-Type: application/json" -X POST -d @create-wallet-2.json http://127.0.0.1:8000/api/services/cryptocurrency/v1/wallets

curl -H "Content-Type: application/json" -X POST -d @transfer-funds.json http://127.0.0.1:8000/api/services/cryptocurrency/v1/wallets/transfer
```

You might want to pause a little between sending the transactions for them to end up in different blocks.


# Block explorer

1. Get and run the block explorer:

```
git clone https://github.com/nedap/exonum-block-explorer.git
cd ./exonum-block-explorer
npm install
npm start
```

2. Navigate to `localhost:8080`,
3. **IMPORTANT** Enable CORS changer (see Prerequisites, item 3),
4. Refresh the page you must be able to see recent blocks and recent transactions,
5. Explore!
5. **IMPORTANT** Do disable CORS changer after you finished exploring.


# Tools used

Vue 2.0, Vuetify

# License

exonum-block-explorer is licensed under the MIT License. See [LICENSE](LICENSE) for details.
