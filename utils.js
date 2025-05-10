function cube(x) {
  return x * x * x;
}

// module.exports = { cube }; // commonjs type

export { cube }; // ES type
