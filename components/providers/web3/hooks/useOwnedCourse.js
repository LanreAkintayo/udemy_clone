import { createCourseHash } from "@utils/hash";
import { nomalizeCourse } from "@utils/normalize";
import useSWR from "swr";

/*

Because the first argument of useSWR() uniquely identifies each instance of useSWR. When the identifier changes, the useSWR() will be re-executed
*/

export const handler = (web3, contract) => (course, account) => {
  const swrRes = useSWR(
    () => (web3 && contract && account ? `web3/ownedCourse/${account}` : null),
    async () => {
      if (!course.id) {
        return null
      }

      const courseHash = createCourseHash(web3, course.id, account)
      
      const ownedCourse = await contract.methods
        .getCourseByHash(courseHash)
        .call();

      if (ownedCourse.owner == "0x0000000000000000000000000000000000000000") {
        return null;
      }
      return nomalizeCourse(web3, course, ownedCourse);
    }
  );

  return swrRes;
};
