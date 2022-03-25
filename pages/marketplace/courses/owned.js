import { useAccount, useOwnedCourses } from "@components/hooks/web3";
import { useWeb3 } from "@components/providers";
import { Button, Message } from "@components/ui/common";
import { OwnedCourseCard } from "@components/ui/course";
import { BaseLayout } from "@components/ui/layout";
import { MarketHeader } from "@components/ui/marketplace";
import { getAllCourses } from "@content/courses/fetcher";
import Link from "next/link";
import { useRouter } from "next/router";

export default function OwnedCourses({ courses }) {
  const { account } = useAccount();

  const {requireInstall} = useWeb3()

  const { ownedCourses } = useOwnedCourses(courses, account.data);
  const router = useRouter();

  return (
    <>
      <MarketHeader />

      <section className="grid grid-cols-1">
        {ownedCourses.isEmpty && (
          <Message type="warning">
            <div>You don&apos;t own any course</div>
            <Link href="/marketplace">
              <a>Purchase course</a>
            </Link>
          </Message>
        )}

        {account.isEmpty && (
          <Message type="warning">
            <div>Please connect to metamask</div>
          </Message>
        )}

        {requireInstall && (
          <Message type="warning">
            <div>Please Install metamask</div>
          </Message>
        )}

        {ownedCourses.data?.map((course) => (
          <OwnedCourseCard key={course.id} course={course}>
            <Button
              onClick={() => {
                router.push(`/courses/${course.slug}`);
              }}
            >
              Watch the course
            </Button>
          </OwnedCourseCard>
        ))}
      </section>
    </>
  );
}

export function getStaticProps() {
  const { data } = getAllCourses();
  return {
    props: {
      courses: data || null,
    },
  };
}

OwnedCourses.Layout = BaseLayout;
