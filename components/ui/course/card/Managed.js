const Item = ({ title, value, className }) => {
  return (
    <div className={`${className} px-4 py-2  sm:px-6`}>
      <div className="text-sm font-medium text-gray-500">{title}</div>
      <div className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
        {value}
      </div>
    </div>
  );
};

export default function ManagedCourseCard({ children, course, isSearched }) {
  return (
    <div className={`${isSearched ? "border-indigo-400": "bg-grey-200"} border shadow overflow-hidden sm:rounded-lg mb-5`}>
      {Object.keys(course).map((key, index) => (
        <Item
          key={key}
          title={key[0].toUpperCase() + key.substr(1)}
          className={`${index % 2 ? "bg-gray-50" : "bg-white"}`}
          value={course[key]}
        />
      ))}
      <div className="bg-white px-4 py-5 sm:px-6">{children}</div>
    </div>
  );
}
