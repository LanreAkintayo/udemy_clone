import { Loader } from "@components/ui/common";
import { toast } from "react-toastify";

export const withToast = (promise) => {
  toast.promise(
    promise,
    {
      pending: {
        render() {
          return (
            <div className="p-2 flex items-center ">
              <Loader size="sm" />
              <p className="ml-4">You transaction is being processed</p>
            </div>
          );
        },
        icon: false,
      },
      success: {
        render({ data }) {
          return (
            <div>
              <p className="font-bold">
                Tx: {data.transactionHash.slice(0, 20)}...
              </p>
              <p>Has been sucessfully processed</p>
              <a
                target="_blank"
                href={`https://ropsten.etherscan.io/tx/${data.transactionHash}`}
              >
                <i>See Tx details</i>
              </a>
            </div>
          );
        },
        // other options
        icon: "🟢",
      },
      error: {
        render({ data }) {
          // When the promise reject, data will contains the error
          return <div>{data.message ?? "Transaction has failed"}</div>;
        },
      },
    },
    {
      closeButton: true,
    }
  );
};
