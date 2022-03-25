// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract CourseMarketplace {
    // Mapping of course hash to course
    mapping(bytes32 => Course) private ownedCourses;

    // Mapping of courseID to course hash
    mapping(uint256 => bytes32) private ownedCourseHash;

    uint256 private totalOwnedCourses;

    enum State {
        Purchased,
        Activated,
        Deactivated
    }

    struct Course {
        uint256 id; // 32
        uint256 price; // 32
        bytes32 proof; // 32
        address owner; // 20
        State state; // 1
    }

    address payable private owner;

    bool isStopped = false;

    constructor() {
        setContractOwner(msg.sender);
    }

    /// You already own the course
    error CourseHasOwner();

    // courseId = 10 = 0x00000000000000000000000000003130
    // proof = 0x0000000000000000000000000000313000000000000000000000000000003130

    modifier onlyOwner() {
        require(
            msg.sender == getContractOwner(),
            "Only the contract owner have access to this method"
        );
        _;
    }

    modifier onlyWhenNotStopped() {
        require(!isStopped, "Contract has been stopped");
        _;
    }

    modifier onlyWhenStopped() {
        require(
            isStopped,
            "This transaction is possible only when contract is not stopped"
        );
        _;
    }

    receive() external payable {}

    function withdraw(uint256 amount) external onlyOwner {
        require(address(this).balance > amount, "Amount to withdraw is higher than the contract balance");

        (bool success, ) = owner.call{value: amount}("");
        require(success, "Wthdraw transaction failed");
    }

    function emergencyWithdraw() external onlyOwner onlyWhenStopped {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Emergency Wthdraw transaction failed");
    }

    function selfDestruct() external onlyOwner onlyWhenStopped {
        selfdestruct(owner);
    }

    function stopContract() external onlyOwner {
        isStopped = true;
    }

    function resumeContract() external onlyOwner {
        isStopped = false;
    }

    function purchaseCourse(bytes16 courseId, bytes32 proof)
        external
        payable
        onlyWhenNotStopped
    {
        bytes32 courseHash = keccak256(abi.encodePacked(courseId, msg.sender));

        if (hasCourseOwnership(courseHash)) {
            revert CourseHasOwner();
        }

        uint256 id = totalOwnedCourses++;

        ownedCourses[courseHash] = Course({
            id: id,
            price: msg.value,
            proof: proof,
            owner: msg.sender,
            state: State.Purchased
        });

        ownedCourseHash[id] = courseHash;
    }

    function repurchaseCourse(bytes32 courseHash)
        external
        payable
        onlyWhenNotStopped
    {
        require(isCourseCreated(courseHash), "Course is not created");

        require(
            hasCourseOwnership(courseHash),
            "You haven't purchase this course at all"
        );

        Course storage course = ownedCourses[courseHash];

        require(
            course.state == State.Deactivated,
            "Only deactivated courses can be repurchased"
        );

        course.state = State.Purchased;
        course.price = msg.value;
    }

    function activateCourse(bytes32 courseHash) external onlyOwner {
        require(isCourseCreated(courseHash), "Course is not created");

        Course storage course = ownedCourses[courseHash];

        require(
            course.state == State.Purchased,
            "Course needs to be purchased first before it is activated"
        );

        course.state = State.Activated;
    }

    function deactivateCourse(bytes32 courseHash) external onlyOwner {
        // Before deactivating, make sure you send back the course price to the buyer.
        require(isCourseCreated(courseHash), "Course is not created");

        Course storage course = ownedCourses[courseHash];

        require(
            course.state == State.Purchased,
            "Course needs to be purchased first before it is deactivated"
        );

        (bool success, ) = course.owner.call{value: course.price}("");

        require(success, "Transfer failed");

        course.state = State.Deactivated;
        course.price = 0;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        setContractOwner(newOwner);
    }

    function getCourseCount() external view returns (uint256) {
        return totalOwnedCourses;
    }

    function getCourseHashAtIndex(uint256 index)
        external
        view
        returns (bytes32)
    {
        return ownedCourseHash[index];
    }

    function getCourseByHash(bytes32 courseHash)
        external
        view
        returns (Course memory)
    {
        return ownedCourses[courseHash];
    }

    function getContractOwner() public view returns (address) {
        return owner;
    }

    function setContractOwner(address newOwner) private {
        owner = payable(newOwner);
    }

    function isCourseCreated(bytes32 courseHash) private view returns (bool) {
        return
            ownedCourses[courseHash].owner !=
            0x0000000000000000000000000000000000000000;
    }

    function hasCourseOwnership(bytes32 courseHash)
        private
        view
        returns (bool)
    {
        return ownedCourses[courseHash].owner == msg.sender;
    }
}

/*

bytes16 = 32 characters
bytes32 = 64 characters

 */
