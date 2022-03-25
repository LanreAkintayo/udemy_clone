import { nomalizeCourse } from "@utils/normalize";
import useSWR from "swr";

/*

Because the first argument of useSWR() uniquely identifies each instance of useSWR. When the identifier changes, the useSWR() will be re-executed
*/

export const handler = (web3, contract) => (account) => {
  const swrRes = useSWR(
    () =>
      web3 && contract && account.data && account.isAdmin
        ? `web3/managedCourses/${account.data}`
        : null,
    async () => {
      // Course hash is the combination of courseId and the account address
      const courses = [];

      const totalOwnedCourse = await contract.methods.getCourseCount().call();

      for (let i = totalOwnedCourse - 1; i >= 0; i--) {
        const courseHash = await contract.methods
          .getCourseHashAtIndex(i)
          .call();
        const course = await contract.methods
          .getCourseByHash(courseHash)
          .call();

        if (course) {
          const normalized = nomalizeCourse(web3, { hash: courseHash }, course);

          courses.push(normalized);
        }
      }

      return courses;
    }
  );

  return swrRes;
};
