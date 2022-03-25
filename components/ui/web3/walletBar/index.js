import { useWalletInfo } from "@components/hooks/web3";
import { useWeb3 } from "@components/providers";
import { Button } from "@components/ui/common";

export default function WalletBar() {
  const { requireInstall } = useWeb3();

  const { network, account } = useWalletInfo()

  return (
    <section className="text-white bg-indigo-600 rounded-lg">
      <div className="p-8">
        <h1 className="text-xl break-words sm:text-2xl">Hello, {account.data}</h1>
        <h2 className="subtitle mb-5 text-xl">
          I hope you are having a great day!
        </h2>
        <div className="flex justify-between items-center">
          <div className="sm:flex sm:justify-center lg:justify-start">
            <Button className="mr-2 text-sm xs:text-lg" variant="white">
              Learn how to purchase
            </Button>
          </div>
          <div>
            {requireInstall && (
              <div className="bg-yellow-600 p-4 rounded-lg">Cannot connect to metamask. Please install metamask</div>
            )}
            {network.hasInitialResponse && !network.isSupported && (
              <div className="bg-red-600 p-4 rounded-lg">
                <div>Connected to the wrong network</div>
                <div>
                  Connect to{" "}
                  <strong className="text-2xl">{network.target}</strong>
                </div>
              </div>
            )}
            {network.data && (
              <div>
                <span>Currently on </span>
                <strong className="text-2xl">{network.data}</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
