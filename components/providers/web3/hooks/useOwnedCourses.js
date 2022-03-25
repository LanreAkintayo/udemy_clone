import { createCourseHash } from "@utils/hash";
import { nomalizeCourse } from "@utils/normalize";
import useSWR from "swr";

/*

Because the first argument of useSWR() uniquely identifies each instance of useSWR. When the identifier changes, the useSWR() will be re-executed
*/

export const handler = (web3, contract) => (courses, account) => {
  const swrRes = useSWR(
    () => (web3 && contract && account ? `web3/ownedCourses/${account}` : null),
    async () => {
      // Course hash is the combination of courseId and the account address
      const ownedCourses = [];

      for (let i = 0; i < courses.length; i++) {
        const course = courses[i];

        if (!course.id) {
          continue;
        }

        const courseHash = createCourseHash(web3, course.id, account);

        const ownedCourse = await contract.methods
          .getCourseByHash(courseHash)
          .call();

        if (ownedCourse.owner != "0x0000000000000000000000000000000000000000") {
          const detailedOwnedCourse = nomalizeCourse(web3, course, ownedCourse);

          ownedCourses.push(detailedOwnedCourse);
        }
      }

      return ownedCourses;
    }
  );


  return {
    ...swrRes,
    lookup:
      swrRes.data?.reduce((accumulator, course) => {
        accumulator[course.id] = course;
        return accumulator;
      }, {}) ?? {},
  };
};
