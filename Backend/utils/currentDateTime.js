const getCurrentDateTime = () => {
  const now = new Date();

  return {
    date: now.toLocaleDateString("en-IN"), // 26/01/2026
    time: now.toLocaleTimeString("en-IN"), // 10:45:30 am
    day: now.toLocaleString("en-IN", { weekday: "long" }) // Monday
  };
};

module.exports = getCurrentDateTime;
