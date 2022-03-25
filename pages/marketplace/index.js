import { Button, Loader, Message } from "@components/ui/common";
import { CourseList, CourseCard } from "@components/ui/course";
import { OrderMordal } from "@components/ui/order";
import { BaseLayout } from "@components/ui/layout";
import { getAllCourses } from "@content/courses/fetcher";
import { useWeb3 } from "@components/providers";
import { useOwnedCourses, useWalletInfo } from "@components/hooks/web3";
import { useState } from "react";
import { MarketHeader } from "@components/ui/marketplace";
import { withToast } from "test/utils/toast";

export default function Home({ courses }) {
  const { web3, contract, requireInstall } = useWeb3();
  const { account, hasConnectedWallet, isConnecting } = useWalletInfo();
  const { ownedCourses } = useOwnedCourses(courses, account.data);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [busyCourseId, setBusyCourseId] = useState(null);

  const [isNewPurchase, setIsNewPurchase] = useState(true);

  const purchaseCourse = async (order, course) => {
    const hexCourseId = web3.utils.utf8ToHex(selectedCourse.id);

    const courseHash = web3.utils.soliditySha3(
      { type: "bytes16", value: hexCourseId },
      { type: "address", value: account.data }
    );

    const value = web3.utils.toWei(String(order.price));

    if (isNewPurchase) {
      withToast(_purchaseCourse(hexCourseId, courseHash, value, order, course));
    } else {
      withToast(_repurchaseCourse(courseHash, value, course));
    }
  };

  const _purchaseCourse = async (
    hexCourseId,
    courseHash,
    value,
    order,
    course
  ) => {
    const emailHash = web3.utils.sha3(order.email);

    const proof = web3.utils.soliditySha3(
      { type: "bytes32", value: emailHash },
      { type: "bytes32", value: courseHash }
    );
    try {
      setBusyCourseId(course.id);
      const result = await contract.methods
        .purchaseCourse(hexCourseId, proof)
        .send({ from: account.data, value: value });

      ownedCourses.mutate([
        ...ownedCourses.data,
        {
          ...course,
          proof,
          owned: account.data,
          price: value,
          state: "Purchased",
        },
      ]);

      return result;
    } catch (error) {
      throw new Error(error.message);
    } finally {
      setBusyCourseId(null);
    }
  };

  const _repurchaseCourse = async (courseHash, value, course) => {
    try {
      setBusyCourseId(course.id);
      const result = await contract.methods
        .repurchaseCourse(courseHash)
        .send({ from: account.data, value: value });

      ownedCourses.mutate([
        ...ownedCourses.data,
        {
          ...course,
          owned: account.data,
          price: value,
          state: "Purchased",
        },
      ]);

      return result;
    } catch (error) {
      throw new Error(error.message);
    } finally {
      setBusyCourseId(null);
    }
  };

  const cleanupModal = () => {
    setSelectedCourse(null);
    setIsNewPurchase(true);
  };

  return (
    <>
      <MarketHeader />

      <CourseList courses={courses}>
        {(course) => {
          const owned = ownedCourses.lookup[course.id];
          const isBusy = busyCourseId === course.id;

          return (
            <CourseCard
              key={course.id}
              disabled={!hasConnectedWallet}
              course={course}
              state={owned?.state}
              Footer={() => {
                if (requireInstall) {
                  return (
                    <Button
                      disabled={true}
                      onClick={() => setSelectedCourse(course)}
                      variant="lightPurple"
                    >
                      Install Metamask
                    </Button>
                  );
                }

                if (isConnecting) {
                  return (
                    <Button
                      disabled={!hasConnectedWallet}
                      onClick={() => setSelectedCourse(course)}
                      variant="lightPurple"
                    >
                      <Loader size="sm" />
                    </Button>
                  );
                }

                if (!ownedCourses.hasInitialResponse) {
                  return (
                    <Button
                      disabled={!hasConnectedWallet}
                      onClick={() => setSelectedCourse(course)}
                      variant="lightPurple"
                    >
                      <div>Loading State...</div>
                    </Button>
                  );
                }

                if (owned) {
                  return (
                    <>
                      <div>
                        <Button
                          className="mr-2"
                          onClick={() => alert("You already own this course")}
                          disabled={false}
                          variant="white"
                        >
                          Yours &#10004;
                        </Button>

                        {owned.state === "Deactivated" && (
                          <Button
                            disabled={!hasConnectedWallet || isBusy}
                            onClick={() => {
                              setIsNewPurchase(false);
                              setSelectedCourse(course);
                            }}
                          >
                            {isBusy ? (
                              <div className="flex">
                                <Loader size="sm" />
                                <div className="ml-2">In progress</div>
                              </div>
                            ) : (
                              <div>Fund to Activate </div>
                            )}
                          </Button>
                        )}
                      </div>
                    </>
                  );
                }

                return (
                  <Button
                    disabled={!hasConnectedWallet || isBusy}
                    onClick={() => {
                      setSelectedCourse(course);
                      setIsNewPurchase(true);
                    }}
                    variant="lightPurple"
                  >
                    {isBusy ? (
                      <div className="flex">
                        <Loader size="sm" />
                        <div className="ml-2">In progress</div>
                      </div>
                    ) : (
                      <div>Purchase</div>
                    )}
                  </Button>
                );
              }}
            />
          );
        }}
      </CourseList>

      <OrderMordal
        isNewPurchase={isNewPurchase}
        onSubmit={(order, course) => {
          purchaseCourse(order, course);
        }}
        course={selectedCourse}
        onClose={cleanupModal}
      />
    </>
  );
}

export function getStaticProps() {
  const { data } = getAllCourses();
  return {
    props: {
      courses: data,
    },
  };
}

Home.Layout = BaseLayout;
