const networkConfig = {
  11155111: {
    name: "Sepolia",
    ethUSDPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  },
  137: {
    name: "Polygon",
    ethUSDPriceFeed: "0x97d9F9A00dEE0004BE8ca0A8fa374d486567eE2D",
  },
};

const DECIMAL = 8;
const INITIAL_ANS = 200000000000;
module.exports = {
  networkConfig,
  DECIMAL,
  INITIAL_ANS,
};
