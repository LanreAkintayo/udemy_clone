
const { catchRevert } = require("./utils/exceptions");
const CourseMarketplace = artifacts.require("CourseMarketplace");

const toBN = (value) => web3.utils.toBN(value);

const getGas = async (result) => {
  const transaction = await web3.eth.getTransaction(result.tx);
  const gasPrice = toBN(transaction.gasPrice);

  const gasUsed = toBN(result.receipt.gasUsed);

  const gas = gasPrice.mul(gasUsed);

  return gas;
};

contract(
  "CourseMarketplace",
  ([contractOwner, buyer, account3, account4, account5]) => {
    let _contract = null;

    const courseId = "0x00000000000000000000000000003130";
    const proof =
      "0x0000000000000000000000000000313000000000000000000000000000003130";

    const courseId2 = "0x00000000000000000000000000002130";
    const proof2 =
      "0x0000000000000000000000000000213000000000000000000000000000002130";

    const courseId3 = "0x00000000000000000000000000001130";
    const proof3 =
      "0x0000000000000000000000000000113000000000000000000000000000001130";
    
      const courseId4 = "0x00000000000000000000000000006130";
      const proof4 =
        "0x0000000000000000000000000000613000000000000000000000000000006130";

    const value = "900000000";

    let courseHash = null;

    // Before executing the text, execute this callback function first
    before(async () => {
      _contract = await CourseMarketplace.deployed();
    });

    describe("Purchasing of course", () => {
      before(async () => {
        await _contract.purchaseCourse(courseId, proof, { from: buyer, value });
      });

      it("should not allow repurchase of course by buyer", async () => {
        await catchRevert(
          _contract.purchaseCourse(courseId, proof, { from: buyer, value })
        );
      });

      it("can get purchased course hash by index", async () => {
        const index = 0;

        courseHash = await _contract.getCourseHashAtIndex(index);
        const expectedCourseHash = web3.utils.soliditySha3(
          { type: "bytes16", value: courseId },
          { type: "address", value: buyer }
        );

        assert.equal(
          courseHash,
          expectedCourseHash,
          "Purchased course hash is not matching with the stored hash"
        );
      });

      it("should match the data of the course purchased by buyer", async () => {
        const expectedIndex = 0;
        const expectedState = 0;
        const course = await _contract.getCourseByHash(courseHash);

        assert.equal(
          course.id,
          expectedIndex,
          `Course Id should be ${expectedIndex}`
        );
        assert.equal(course.price, value, `Course price should be ${value}`);
        assert.equal(course.proof, proof, `Course proof should be ${proof}`);
        assert.equal(course.owner, buyer, `Course owner should be ${buyer}`);
        assert.equal(
          course.state,
          expectedState,
          `Course state should be ${expectedState}`
        );
      });
    });

    describe("Activation of course", () => {
      it("should not be able to activate course. Only owner can activate", async () => {
        await catchRevert(
          _contract.purchaseCourse(courseId, proof, { from: buyer })
        );
      });

      it("should have 'activated' state", async () => {
        await _contract.activateCourse(courseHash, { from: contractOwner });

        const course = await _contract.getCourseByHash(courseHash);
        const expectedState = 1;
        assert.equal(
          course.state,
          expectedState,
          "Course should have 'activated' state"
        );
      });
    });

    describe("Transfering ownership", () => {
      let currentOwner = null;
      before(async () => {
        currentOwner = await _contract.getContractOwner();
      });

      it("getContractOwner should return deployer address", async () => {
        assert.equal(
          contractOwner,
          currentOwner,
          "contract owner is not the same as the owner returned by getContractOwner function"
        );
      });

      it("Any other account aside owner's account should not be able to transfer ownership", async () => {
        await catchRevert(
          _contract.transferOwnership(account3, { from: buyer })
        );
      });

      it("should transfer ownership to the third address", async () => {
        await _contract.transferOwnership(account3, { from: currentOwner });
        const owner = await _contract.getContractOwner();

        assert.equal(
          owner,
          account3,
          "New contract owner is not the third address"
        );
      });

      it("should transfer ownership from the third address back to the original owner", async () => {
        await _contract.transferOwnership(contractOwner, { from: account3 });
        const owner = await _contract.getContractOwner();

        assert.equal(
          owner,
          contractOwner,
          "Contract ownership is not transferred back to the current owner"
        );
      });
    });

    describe("Deactivation of course", async () => {
      let courseHash2 = null;
      let currentOwner = null;

      before(async () => {
        await _contract.purchaseCourse(courseId2, proof2, {
          from: buyer,
          value,
        });
        courseHash2 = await _contract.getCourseHashAtIndex(1);
        currentOwner = await _contract.getContractOwner();
      });

      it("Only contract owner should be able to deactivate the course", async () => {
        await catchRevert(
          _contract.deactivateCourse(courseHash2, { from: buyer })
        );
      });

      it("Course status, course price should have been updated ", async () => {
        const beforeTXcontractBalance = await web3.eth.getBalance(
          _contract.address
        );
        const beforeTXBuyerBalance = await web3.eth.getBalance(buyer);
        const beforeTXCurrentOwnerBalance = await web3.eth.getBalance(
          currentOwner
        );

        const result = await _contract.deactivateCourse(courseHash2, {
          from: contractOwner,
        });

        const afterTXcontractBalance = await web3.eth.getBalance(
          _contract.address
        );
        const afterTXBuyerBalance = await web3.eth.getBalance(buyer);
        const afterTXCurrentOwnerBalance = await web3.eth.getBalance(
          currentOwner
        );

        const gas = await getGas(result);

        const expectedContractBalance = toBN(beforeTXcontractBalance)
          .sub(toBN(value))
          .toString();
        const expectedCurrentOwnerBalance = toBN(beforeTXCurrentOwnerBalance)
          .sub(toBN(gas))
          .toString();
        const expectedBuyerBalance = toBN(beforeTXBuyerBalance)
          .add(toBN(value))
          .toString();

        const course = await _contract.getCourseByHash(courseHash2);

        const expectedState = 2;
        const expectedPrice = 0;

        assert.equal(
          afterTXBuyerBalance,
          expectedBuyerBalance,
          "Failed to update buyer's balance"
        );
        assert.equal(
          afterTXcontractBalance,
          expectedContractBalance,
          "Failed to update contract's balance"
        );
        assert.equal(
          afterTXCurrentOwnerBalance,
          expectedCurrentOwnerBalance,
          "Failed to update Contract owner's balance"
        );

        assert.equal(
          course.state,
          expectedState,
          "Course State is not 'deactivated'"
        );

        assert.equal(
          course.price,
          expectedPrice,
          "Course price is not set to 0"
        );
      });

      it("should not be able to activate deactivated course", async () => {
        await catchRevert(
          _contract.activateCourse(courseHash2, { from: contractOwner })
        );
      });
    });

    describe("Repurchasing of course", () => {
      // Purchase a course, deactivate it and try to repurchase it.
      let courseHash2 = null;

      before(async () => {
        courseHash2 = await _contract.getCourseHashAtIndex(1);
      });

      it("should not repurchase if the course do not exist", async () => {
        const testCourseHash =
          "0xf14a159c3a5466b26952f179ee92f0538be53c13b48f1dfcb00b929b9752f03a";

        await catchRevert(
          _contract.repurchaseCourse(testCourseHash, { from: buyer })
        );
      });

      it("should not repurchase if not course owner", async () => {
        await catchRevert(
          _contract.repurchaseCourse(courseHash2, { from: account3 })
        );
      });
      it("should be able to repurchase with the original buyer", async () => {
        const beforeTxBuyerBalance = await web3.eth.getBalance(buyer);
        const beforeTxContractBalance = await web3.eth.getBalance(
          _contract.address
        );

        const result = await _contract.repurchaseCourse(courseHash2, {
          from: buyer,
          value,
        });

        const gas = await getGas(result);

        const afterTxBuyerBalance = await web3.eth.getBalance(buyer);
        const afterTxContractBalance = await web3.eth.getBalance(
          _contract.address
        );

        const expectedBuyerBalance = toBN(beforeTxBuyerBalance)
          .sub(toBN(value))
          .sub(gas)
          .toString();
        const expectedContractBalance = toBN(beforeTxContractBalance)
          .add(toBN(value))
          .toString();

        const expectedState = 0;
        const course = await _contract.getCourseByHash(courseHash2);

        assert.equal(
          afterTxContractBalance,
          expectedContractBalance,
          "Contract balance before and after transaction is not matching"
        );
        assert.equal(
          afterTxBuyerBalance,
          expectedBuyerBalance,
          "Buyer's balance after purchasing get issue"
        );
        assert.equal(
          course.state,
          expectedState,
          "Course is not in purchased state"
        );
        assert.equal(
          course.price,
          value,
          `Course price is not equal to ${value}`
        );
      });

      it("should not be able to repurchase purchased course", async () => {
        await catchRevert(
          _contract.repurchaseCourse(courseHash2, { from: buyer, value })
        );
      });
    });

    describe("Stopping and resuming contract", () => {
      it("Only owner can stop contract", async () => {
        await catchRevert(_contract.stopContract({ from: buyer }));
      });

      it("Only owner can resume contract", async () => {
        await catchRevert(_contract.resumeContract({ from: buyer }));
      });

      it("should not be able to purchase course when contract is stoped", async () => {
        await _contract.stopContract({ from: contractOwner });

        await catchRevert(
          _contract.purchaseCourse(courseId3, proof3, { from: buyer, value })
        );
      });

      it("should be able to purchase contract when the contract owner resumes the contract", async () => {
        await _contract.resumeContract({ from: contractOwner });

        await _contract.purchaseCourse(courseId3, proof3, {
          from: buyer,
          value,
        });
      });
    });

    describe("Receive Funds", () => {
      it("should transfer fund to the smart contract", async () => {
        const beforeTXContractBalance = await web3.eth.getBalance(_contract.address);

        await web3.eth.sendTransaction({
          from: buyer,
          to: _contract.address,
          value,
        });

        const afterTXContractBalance = await web3.eth.getBalance(_contract.address);

        const expectedContractBalance = toBN(beforeTXContractBalance).add(
          toBN(value)).toString()
        

        assert.equal(afterTXContractBalance, expectedContractBalance, "Contract balance is not matching");
      });
    });

    describe("Testing withdraw", () => {
      // Only owner can wit
      it("Only owner should be able to withdraw", async () => {
        await catchRevert(_contract.withdraw(value, {from: buyer}))
      })

      it("should transfer ether to the owner's account", async () => {
        const ownerBalanceBeforeTx = await web3.eth.getBalance(contractOwner)
        const contractBalanceBeforeTx = await web3.eth.getBalance(_contract.address)

        const result = await _contract.withdraw(value, { from: contractOwner })

        const gas = await getGas(result)
        
        const ownerBalanceAfterTx = await web3.eth.getBalance(contractOwner)
        const contractBalanceAfterTx = await web3.eth.getBalance(_contract.address)

        assert.equal(ownerBalanceAfterTx,
          toBN(ownerBalanceBeforeTx).add(toBN(value)).sub(toBN(gas)).toString(),
          "Contract owner balance before and after transaction is not matching"
        )

        assert.equal(contractBalanceAfterTx,
          toBN(contractBalanceBeforeTx).sub(toBN(value)).toString(),
          "Contract balance is not matching before and after transaction"
        )
      })
    })

    describe("Testing Emergency", () => {
      let currentOwner = null

      before(async () => {
        currentOwner = await _contract.getContractOwner()
      })
      // Only owner can wit
      it("Only owner should be able to withdraw and contract must be stopped before emergency withdraw", async () => {
        await catchRevert(_contract.emergencyWithdraw({from: buyer}))
      })

      it("Only owner can stop the contract", async () => {
        await catchRevert(_contract.stopContract({from: buyer}))
      })

      it("should not purchase course when contract is stopped", async () => {
        
        await _contract.stopContract({ from: currentOwner })

        await catchRevert(_contract.purchaseCourse(courseId4, proof4, { from: buyer, value }));
      })

      it("should be purchase course when contract is resumed", async () => {
        
        await _contract.resumeContract({ from: currentOwner })

        await _contract.purchaseCourse(courseId4, proof4, { from: buyer, value });
      })

      

      it("should be able to transfer to contract owner when contract is stopped", async () => {
        const ownerBalanceBeforeTx = await web3.eth.getBalance(currentOwner)
        const contractBalanceBeforeTx = await web3.eth.getBalance(_contract.address)

        const result = await _contract.stopContract({ from: currentOwner })

        const result2 = await _contract.emergencyWithdraw({from: currentOwner})

        const gas1 = await getGas(result)
        
        const gas2 = await getGas(result2)

        const gas = gas1.add(gas2)
        
        const ownerBalanceAfterTx = await web3.eth.getBalance(currentOwner)
        const contractBalanceAfterTx = await web3.eth.getBalance(_contract.address)

        assert.equal(contractBalanceAfterTx,
          "0",
          "Contract balance is not matching before and after transaction"
        )
        assert.equal(ownerBalanceAfterTx,
          toBN(ownerBalanceBeforeTx).add(toBN(contractBalanceBeforeTx)).sub(toBN(gas)).toString(),
          "Contract owner balance before and after transaction is not matching"
        )

        
      })
    })

  }
);
