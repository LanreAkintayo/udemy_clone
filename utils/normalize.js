export const COURSE_STATES = {
  0: "Purchased",
  1: "Activated",
  2: "Deactivated",
};

export const nomalizeCourse = (web3, course, ownedCourse) => {
  return {
    ...course,
    ownedCourseId: ownedCourse.id,
    proof: ownedCourse.proof,
    owned: ownedCourse.owner,
    price: web3.utils.fromWei(ownedCourse.price),
    state: COURSE_STATES[ownedCourse.state],
  };
};
