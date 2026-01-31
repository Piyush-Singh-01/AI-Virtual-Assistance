import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white gap-4">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-xl">Page not found</p>

      <button
        onClick={() => navigate("/")}
        className="bg-white text-black px-6 py-2 rounded-xl"
      >
        Go Home
      </button>
    </div>
  );
}

export default NotFound;
