import Image from "next/image";
import Link from "next/link";
import { AnimateKeyframes } from "react-simple-animate";

export default function CourseCard({ course, Footer, disabled, state }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
      <div className="flex h-full">
        <div className="flex-1 h-full next-image-wrapper">
          <Image
            className={`object-cover ${disabled && "filter grayscale"}`}
            src={course.coverImage}
            layout="responsive"
            width="200"
            height="200"
            alt={course.title}
          />
        </div>
        <div className="p-8 pb-4 flex-2">
          <div className="flex items-center">
            <div className="uppercase mr-2 tracking-wide text-sm text-indigo-500 font-semibold">
              {course.type}
            </div>
            <div className="text-sm">
              {state === "Purchased" && (
                <AnimateKeyframes
                  play
                  duration={3}
                  keyframes={["opacity: 0", "opacity: 1"]}
                  iterationCount="infinite"
                >
                  <div className="bg-yellow-200 text-yellow-700 p-1 px-3 rounded-full">
                    Pending
                  </div>
                </AnimateKeyframes>
              )}
              {state === "Activated" && (
                <div className="bg-green-200 text-green-700 p-1 px-3 rounded-full">
                  Activated
                </div>
              )}
              {state === "Deactivated" && (
                <div className="bg-red-200 text-red-700 p-1 px-3 rounded-full">
                  Deactivated
                </div>
              )}
            </div>
          </div>
          <Link href={`/courses/${course.slug}`}>
            <a className="h-12 block mt-1 text-sm sm:text-lg leading-tight font-medium text-black hover:underline">
              {course.title}
            </a>
          </Link>
          <p className="my-2 text-sm sm:text-base  text-gray-500">
            {course.description.substr(0, 70)}...
          </p>
          <div className="pt-4">{Footer && <Footer />}</div>
        </div>
      </div>
    </div>
  );
}
