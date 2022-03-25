import { handler as createAccountHook } from "./useAccount"
import { handler as createNetworkHook } from "./useNetwork"
import {handler as createUseOwnedCoursesHook} from "./useOwnedCourses"
import { handler as createUseOwnedCourseHook } from "./useOwnedCourse"
import {handler as createUseManagedCoursesHook} from "./useManagedCourses"

export const setupHooks = ({web3, provider, contract}) => {
    return {
        useAccount: createAccountHook(web3, provider),
        useNetwork: createNetworkHook(web3),
        useOwnedCourses: createUseOwnedCoursesHook(web3, contract),
        useOwnedCourse: createUseOwnedCourseHook(web3, contract),
        useManagedCourses: createUseManagedCoursesHook(web3, contract)

    }
}

/*
setUpHook function returns a dictionary where every key has a value that returns a function. In another words, every key has a hook

*/