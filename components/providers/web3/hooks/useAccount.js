import { useEffect } from "react";
import useSWR from "swr";

export const handler = (web3 = null, provider = null) => {
  return () => {
    const { mutate, data, error, ...rest } = useSWR(
      () => (web3 ? "web3/accounts" : null),
      async () => {
        const accounts = await web3.eth.getAccounts();

        const account = accounts[0];

        if (!account) {
          throw new Error(
            "Failed to detect Account. Please refresh your browser"
          );
        }

        return account;
      }
    );

    const adminAddresses = {
      "0xdf73b5af21d6a23c27dad0bac3ee33476ccfc443a89fbac071c09c6f7ece01d1": true,
      "0xf199b54e61b0af5033037f88ac7e6ec4fc9942a737e2853f291a86cd516b7cb7": true
    };

    useEffect(() => {
      const mutator = (accounts) => mutate(accounts[0] ?? null);

      provider?.on("accountsChanged", mutator);

      return () => provider?.removeListener("accountsChanged", mutator);
    }, [provider]);

    return {
      mutate,
      data,
      error,
      isAdmin: (data && adminAddresses[web3.utils.keccak256(data)]) ?? false,
      ...rest,
    };
  };
};
