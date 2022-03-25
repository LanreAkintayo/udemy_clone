import { WalletBar, EthRates } from "@components/ui/web3";
import { Breadcrumbs } from "@components/ui/common";
import { useAccount } from "@components/hooks/web3";

export default function MarketHeader() {

  const { account } = useAccount()
  
   const LINKS = [
    { href: "/marketplace", value: "Buy" },
    { href: "/marketplace/courses/owned", value: "Owned Courses" },
    { href: "/marketplace/courses/managed", value: "Manage Courses", requireAdmin: true },
  ];
  return (
    <>
      <div className="pt-4">
        <WalletBar />
        </div>
      <EthRates />
      <div className="flex flex-row-reverse p-4 sm:px-6 lg:px-8">
        <Breadcrumbs isAdmin={account.isAdmin} items={LINKS}/>
      </div>
    </>
  );
}
