import { Message, Modal } from "@components/ui/common";
import { CourseHero, Keypoints, Curriculum } from "@components/ui/course";
import { BaseLayout } from "@components/ui/layout";
import { getAllCourses } from "@content/courses/fetcher";
import { useWeb3 } from "@components/providers";
import { useAccount, useOwnedCourse } from "@components/hooks/web3";

export default function Course({ course }) {
  const { account } = useAccount();
  const { isLoading } = useWeb3()

  const { ownedCourse } = useOwnedCourse(course, account.data);

  const courseState = ownedCourse.data?.state;

  const locked = !courseState || courseState === "Purchased" || courseState === "Deactivated";

  return (
    <>
      <div className="py-4">
        <CourseHero
          hasOwner={!!ownedCourse.data}
          title={course.title}
          description={course.description}
          image={course.coverImage}
        />
      </div>
      <Keypoints points={course.wsl} />
      <div className="max-w-5xl mx-auto">
        {courseState === "Purchased" && (
          <Message type="warning">
            Course has successfully been purchased. Please wait for 24 hours for
            the course to be activated
          </Message>
        )}
        {courseState === "Activated" && (
          <Message type="success">
            Course has successfully been activated. You can now view all the
            contents of the course.
          </Message>
        )}
        {courseState === "Deactivated" && (
          <Message type="danger">
            Course has been deactivated due to the incorrect purchase data. The
            functionality to watch the course has been temporarily disabled.
            <i className="block font-norml">
              {" "}
              Visit akintayolanre2019@gmail.com to know more about it
            </i>
          </Message>
        )}
      </div>

      <Curriculum locked={locked} courseState={courseState} isLoading={isLoading}/>
      <Modal />
    </>
  );
}

export function getStaticPaths() {
  const { data } = getAllCourses();

  /*
  return {
  paths: [{params: {slug: a}}, {params: {slug: b}}]
  }
  
  */

  return {
    
    paths: data.map((course) => {
      return {
        params: { slug: course.slug },
      };
    }),
    fallback: false, // This means that we are telling next that we have specified the path of all the pages that will be dynamically prerendered
  };
}

export function getStaticProps(context) {
  /* context is each element return in the paths array returned by getStaticPaths()

  i.e 
  paths: [{params: {slug: a}}, {params: {slug: b}}]
  }
  */
  const params = context.params;
  const { data } = getAllCourses();

  const course = data.filter((course) => course.slug == params.slug)[0];

  return {
    props: {
      course: course || null,
    },
  };
}

Course.Layout = BaseLayout;
