import { useEthPrice, COURSE_PRICE } from "@components/hooks/useEthPrice";
import { Loader } from "@components/ui/common";
import Image from "next/image";

export default function EthRates() {
  const { eth } = useEthPrice();

  return (
    <div className="flex flex-col xs:flex-row text-center mt-2">
      <div className="p-6 border rounded-md mr-2">
        <div className="flex items-center">
          {eth.data ? (
            <>
              <span className="text-xl font-bold">1</span>
              <Image
                layout="fixed"
                width="30"
                height="30"
                src="/small-eth.webp"
              />
              <span className="text-xl font-bold"> = ${eth.data}</span>
            </>
          ) : (
            <div className="w-full flex justify-center">
              <Loader size="md" />
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500">Current ETH Price</p>
      </div>

      <div className="p-6 border rounded-md">
        <div className="flex items-center">
          {eth.data ? (
            <>
              <span className="text-xl font-bold">{eth.perItem}</span>
              <Image
                layout="fixed"
                width="30"
                height="30"
                src="/small-eth.webp"
              />
              <span className="text-xl font-bold"> = ${COURSE_PRICE}</span>
            </>
          ) : (
            <div className="w-full flex justify-center">
              <Loader size="md" />
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500">Price Per Course</p>
      </div>
    </div>
  );
}
