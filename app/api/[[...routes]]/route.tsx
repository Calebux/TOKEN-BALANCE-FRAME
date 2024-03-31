/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from "frog";
import BigNumber from "bignumber.js";
import { handle } from "frog/next";
import { pinata } from "frog/hubs";
import { CovalentClient } from "@covalenthq/client-sdk";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";

type State = {
  tokens: any;
  error: string;
};

const app = new Frog<{ State: State }>({
  basePath: "/api",
  hub: pinata(),
  initialState: {
    tokens: [],
    error: "",
  },
});

app.frame("/", async (c) => {
  console.log(c);
  const { buttonValue, inputText, status, deriveState } = c;

  const state = await deriveState(async (previousState) => {
    try {
      previousState.error = "";
      if (!inputText) {
        previousState.error = "Enter a valid wallet address";
        return;
      }
      const chain: any = buttonValue;
      const client = new CovalentClient(`${process.env.NEXT_API_KEY}`);
      const resp = await client.BalanceService.getTokenBalancesForWalletAddress(
        chain,
        inputText
      );
      const newData = resp?.data?.items
        .map((item) => {
          let balance = new BigNumber(item.balance);
          return {
            contract_display_name: item.contract_display_name,
            logo_url: item.logo_url,
            balance: balance.shiftedBy(-18).toFixed(2).toString(),
            contract_ticker_symbol: item.contract_ticker_symbol,
            pretty_quote: item.pretty_quote,
          };
        })
        .filter((item) => parseFloat(item.balance) > 0)
        .sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));

      // console.log(newData);
      console.log(resp?.data?.items);
      previousState.tokens = newData;
    } catch (err: any) {
      previousState.error = err.message;
    }
  });
  return c.res({
    image: (
      <div
        style={{
          color: "#000000",
          fontSize: 24,
          background: "#ffffff",
          backgroundSize: "100% 100%",
          display: "flex",
          height: "100%",
          width: "100%",
          padding: "24px",
        }}
      >
        {state?.tokens?.at(0)?.contract_display_name ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10",
            }}
          >
            {state?.tokens?.at(0)?.contract_display_name ? (
              <div
                style={{
                  fontStyle: "normal",
                  letterSpacing: "-0.025em",
                  lineHeight: 1.4,
                  // marginTop: 30,
                  // padding: "0 120px",
                  whiteSpace: "pre-wrap",
                  display: "flex",
                  flexGrow: 1,
                  flexDirection: "column",
                  // height: "1200px",
                }}
              >
                <h3>1. {state?.tokens?.at(0)?.contract_display_name}</h3>
                {`${state?.tokens?.at(0)?.balance} ${
                  state?.tokens?.at(0)?.contract_ticker_symbol
                } - ${state?.tokens?.at(0)?.pretty_quote}`}
              </div>
            ) : (
              ""
            )}
            {state?.tokens?.at(1)?.contract_display_name ? (
              <div
                style={{
                  fontStyle: "normal",
                  letterSpacing: "-0.025em",
                  lineHeight: 1.4,
                  // marginTop: 30,
                  // padding: "0 120px",
                  whiteSpace: "pre-wrap",
                  display: "flex",
                  flexGrow: 1,
                  flexDirection: "column",
                  // height: "1200px",
                }}
              >
                <h3>2. {state?.tokens?.at(1)?.contract_display_name}</h3>
                {`${state?.tokens?.at(1)?.balance} ${
                  state?.tokens?.at(1)?.contract_ticker_symbol
                } - ${state?.tokens?.at(1)?.pretty_quote}`}
              </div>
            ) : (
              ""
            )}
            {state?.tokens?.at(2)?.contract_display_name ? (
              <div
                style={{
                  fontStyle: "normal",
                  letterSpacing: "-0.025em",
                  lineHeight: 1.4,
                  // marginTop: 30,
                  // padding: "0 120px",
                  whiteSpace: "pre-wrap",
                  display: "flex",
                  flexGrow: 1,
                  flexDirection: "column",
                  // height: "1200px",
                }}
              >
                <h3>3. {state?.tokens?.at(2)?.contract_display_name}</h3>
                {`${state?.tokens?.at(2)?.balance} ${
                  state?.tokens?.at(2)?.contract_ticker_symbol
                } - ${state?.tokens?.at(2)?.pretty_quote}`}
              </div>
            ) : (
              ""
            )}
          </div>
        ) : (
          <p
            style={{
              textAlign: "center",
              width: "100%",
              fontSize: 40,
              padding: "80px 0",
            }}
          >
            {state.error
              ? state.error
              : "Enter a wallet address to get the top 3 tokens held by the address."}
          </p>
        )}
      </div>
    ),
    intents: [
      status !== "response" && (
        <TextInput placeholder="Enter a wallet address..." />
      ),
      status !== "response" && <Button value="eth-mainnet">Ethereum</Button>,
      status !== "response" && <Button value="matic-mainnet">Matic</Button>,
      status !== "response" && (
        <Button value="optimism-mainnet">Optimisim</Button>
      ),
      status !== "response" && (
        <Button value="avalanche-mainnet">Avalanche</Button>
      ),
      status === "response" && <Button.Reset>Reset input fields</Button.Reset>,
    ],
  });
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
