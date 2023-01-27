const main = async () => {
  const daoContractFactory = await hre.ethers.getContractFactory('DAO');
  const daoContract = await daoContractFactory.deploy();
  await daoContract.deployed();
  console.log("Contract deployed to:", daoContract.address);
  tx = await daoContract.addMember("Test Discord ID", "Tester", "https://fiverr-res.cloudinary.com/images/q_auto,f_auto/gigs/204080868/original/eaee136e18be1a1786b48f6a26d72c114455e529/create-unique-nft-characters.png");
  await tx.wait();
  tx = await daoContract.addEvent("Community Call", "Call to get to know our community better :)", "https://d33wubrfki0l68.cloudfront.net/058d394781a4ab24b210ea0a8eb231204a56e33f/d23ad/static/d17b5ecb3655c50d6540e590a93d65e7/87c97/dao-2.png");
  await tx.wait();
  tx = await daoContract.joinEvent(1);
  await tx.wait();
  tx = await daoContract.getEvents();
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();