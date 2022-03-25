const NETWORK_ID = process.env.NEXT_PUBLIC_NETWORK_ID;

export const loadContract = async (contractName, web3) => {
  const res = await fetch(`/contracts/${contractName}.json`);
  const Artifact = await res.json();

  let contract = null;

  try {

    contract = new web3.eth.Contract(
      Artifact.abi,
      Artifact.networks[NETWORK_ID].address
    );
    
  }
  catch (err) {
    console.error(err);
  }

  return contract;
};
