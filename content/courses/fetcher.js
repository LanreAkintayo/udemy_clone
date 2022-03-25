import courses from "./index.json"

export const getAllCourses = () => {
    return {
        data: courses,
        courseMap: courses.reduce((a, c, i) => {
            a[c.id] = c
            a[c.id].index = i
            return a
        }, {})
    }
}


/*

It takes in an accumulator (a); The current item in the iteration (c stands for course) and the index of the iteration (i stands for index)
Now, we need to fill in what will be in the accumulator

In this case, accumulator is an empty dictionary.
a = {}
a[c.id] = c means We are appending an item with key (c.id) and value (c :NB This c is a dictionary)
a[c.id].index = i means that we are appending new key value pair (index: i) to that c


*/