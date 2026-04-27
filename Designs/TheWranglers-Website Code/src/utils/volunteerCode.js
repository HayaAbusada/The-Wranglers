export const getVolunteerCode = () => {
  const today = new Date();

  const dateString =
    today.getFullYear().toString() +
    String(today.getMonth() + 1).padStart(2, "0") +
    String(today.getDate()).padStart(2, "0");

  const SECRET = "wranglers_secret";

  const combined = dateString + SECRET;

  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash * 31 + combined.charCodeAt(i)) % 1000000;
  }

  return String(hash).padStart(6, "0");
};