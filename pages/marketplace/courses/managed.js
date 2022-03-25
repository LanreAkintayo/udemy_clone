import {
  useAccount,
  useAdmin,
  useManagedCourses,
} from "@components/hooks/web3";
import { useWeb3 } from "@components/providers";
import { Button, Loader, Message } from "@components/ui/common";
import { CourseFilter, ManagedCourseCard } from "@components/ui/course";
import { BaseLayout } from "@components/ui/layout";
import { MarketHeader } from "@components/ui/marketplace";
import { nomalizeCourse } from "@utils/normalize";
import { useState, useEffect } from "react";
import { withToast } from "test/utils/toast";

const VerificationInput = ({ onVerify }) => {
  const [email, setEmail] = useState("");

  return (
    <div className="flex mr-2 relative rounded-md">
      <input
        value={email}
        onChange={(event) => {
          const { value } = event.target;
          setEmail(value);
        }}
        type="text"
        name="account"
        id="account"
        className="w-96 focus:ring-indigo-500 border focus:border-indigo-500 block pl-7 p-4 sm:text-sm border-gray-300 rounded-l-lg"
        placeholder="0x2341ab..."
      />
      <Button border="rounded-r-lg" onClick={() => onVerify(email)}>
        Verify
      </Button>
    </div>
  );
};

export default function ManagedCourses() {
  const { web3, provider, contract } = useWeb3();

  const { account } = useAdmin({ redirectTo: "/marketplace" });

  const { managedCourses } = useManagedCourses(account);

  const [proofedOwnership, setProofedOwnership] = useState({});

  const [searchedCourse, setSearchedCourse] = useState(null);

  const [busyCourseId, setBusyCourseId] = useState(null);

  const [mission, setMission] = useState("");

  const [filters, setFilters] = useState({ state: "All" });

  useEffect(() => {
    console.log("Busy course Id", busyCourseId)
  }, [busyCourseId])

  const verifyCourse = (email, { hash, proof }) => {
    if (!email) {
      return null;
    }

  

    const emailHash = web3.utils.sha3(email);

    const proofToCheck = web3.utils.soliditySha3(
      { type: "bytes32", value: emailHash },
      { type: "bytes32", value: hash }
    );

    proofToCheck === proof
      ? setProofedOwnership({
          ...proofedOwnership,
          [hash]: true,
        })
      : setProofedOwnership({
          ...proofedOwnership,
          [hash]: false,
        });

    console.log(proofedOwnership);
  };

  if (!account.isAdmin) {
    return null;
  }

  const changeCourseState = async (courseHash, course, method) => {

    try {
      setBusyCourseId(course.ownedCourseId);
      setMission(method);
      const result = await contract.methods[method](courseHash).send({
        from: account.data,
      });

      managedCourses.mutate([...managedCourses.data, { 
        ...course,
        owned: account.data,
        price: method === "activateCourse" ? course.price : "0",
        state: method === "activateCourse" ? "Activated" : "Deactivated",
      }])

      return result;
    } catch (error) {
      console.error(error.message);
      throw new Error(error.message);
    } finally {
      setBusyCourseId(null);
    }
  };

  const activateCourse = async (courseHash, course) => {
    withToast(changeCourseState(courseHash, course, "activateCourse"));
  };

  const deactivateCourse = async (courseHash, course) => {
    withToast(changeCourseState(courseHash, course, "deactivateCourse"));
  };

  const searchCourse = async (searchText) => {
    const re = /[0-9A-fa-f]{6}/g;

    if (!account.isAdmin) {
      setSearchedCourse(null);
      return;
    }

    if (searchText && searchText.length === 66 && re.test(searchText)) {
      const course = await contract.methods.getCourseByHash(searchText).call();

      if (course.owner != "0x0000000000000000000000000000000000000000") {
        const nomalized = nomalizeCourse(web3, { hash: searchText }, course);
        setSearchedCourse(nomalized);

        return;
      }

      setSearchedCourse(null);
    }
  };

  const renderCard = (course, isSearched = false) => {

    const isBusy = busyCourseId === course.ownedCourseId;

    return (
      <ManagedCourseCard
        key={course.ownedCourseId}
        isSearched={isSearched}
        course={course}
      >
        <VerificationInput
          onVerify={(email) => {
            verifyCourse(email, { hash: course.hash, proof: course.proof });
          }}
        />
        <div className="mt-3">
          {proofedOwnership[course.hash] && <Message>Verified</Message>}
          {proofedOwnership[course.hash] == false && (
            <Message type="danger">Wrong proof</Message>
          )}
        </div>
        {course.state !== "Activated" && (
          <>
            <div className="flex items-center">
            <Button
              disabled={isBusy}
              onClick={() => activateCourse(course.hash, course)}
              variant="green"
              className="mr-2"
            >
              <div className="flex items-center">
              {isBusy && mission === "activateCourse" ? (
                <div className="flex">
                  <Loader size="sm" />
                  <div className="ml-2">In progress</div>
                </div>
              ) : (
                <div>Activate </div>
                  )}
                </div>
              
            </Button>
            <Button
              disabled={isBusy}
              onClick={() => deactivateCourse(course.hash, course)}
              variant="red"
            >
              {" "}
              {isBusy && mission === "deactivateCourse" ? (
                <div className="flex">
                  <Loader size="sm" />
                  <div className="ml-2">In progress</div>
                </div>
              ) : (
                <div>Deactivate </div>
              )}
              </Button>
              </div>
          </>
        )}
      </ManagedCourseCard>
    );
  };

  const filteredCourses = managedCourses.data
    ?.filter((course) => {
      if (filters.state === "All") {
        return true;
      }
      return course.state === filters.state;
    })
    .map((course) => renderCard(course));

  return (
    <>
      <MarketHeader />
      <CourseFilter
        onSearchSubmit={searchCourse}
        onFilterSelect={(value) => setFilters({ state: value })}
      />
      <section className="grid grid-cols-1">
        {searchedCourse && (
          <>
            <div className="font-bold mb-3 text-lg p-2"> Searched Course</div>
            {renderCard(searchedCourse, true)}
          </>
        )}

        <div className="font-bold mb-3 text-lg p-2"> All Courses</div>
        {filteredCourses}
        {filteredCourses?.length === 0 && (
          <Message variant="warning"> No course to display</Message>
        )}
      </section>
    </>
  );
}

ManagedCourses.Layout = BaseLayout;
