async function verify(contractAddress, args) {
  console.log("Verifying contract ...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = [verify];
