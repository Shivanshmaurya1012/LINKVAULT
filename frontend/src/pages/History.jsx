import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const History = () => {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const getRemainingTime = (expiresAt) => {
    if (!expiresAt) return "No expiry";

    const diff = new Date(expiresAt) - new Date();

    if (diff <= 0) return "Expired";

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${minutes}m ${seconds}s remaining`;
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/content/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (res.ok) {
          setItems(data);
        } else {
          console.log("History fetch failed:", data);
        }
      } catch (err) {
        console.log("History fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 1000); // refresh every 5s

  return () => clearInterval(interval);
  }, [token]);

  const handleDelete = async (uniqueId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/content/${uniqueId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setItems(items.filter(item => item.uniqueId !== uniqueId));
      } else {
        alert("Delete failed");
      }
    } catch (err) {
      console.log("Delete error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh] ">
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]
  bg-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-black
  flex items-center justify-center px-6
  transition-colors duration-300" >
    <div className="mx-auto bg-gray-200 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-black backdrop-blur-xl 
                p-10 rounded-2xl shadow-2xl 
                w-full max-w-xl space-y-6
                min-h-[calc(100vh-4rem)]">

      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Your Upload History
      </h2>

      {items.length === 0 && (
        <p className="text-gray-600 dark:text-gray-400">
          No uploads yet.
        </p>
      )}

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item._id}
            className="bg-white dark:bg-gray-800
             rounded-xl p-5 shadow-md
             hover:shadow-xl hover:scale-[1.01]
             transition-all duration-300"
          >
            <div className="flex justify-between items-start">

              <div className="flex-1">
                <div className="font-semibold text-gray-800 dark:text-white">
                  {item.type === "file"
                    ? `📁 ${item.originalFileName}`
                    : `📝 ${item.text?.substring(0, 40) || "Text content"}`
                  }
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  📅 Uploaded: {new Date(item.createdAt).toLocaleString()}
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  ⏳ {getRemainingTime(item.expiresAt)}
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  👁 Views: {item.views}
                  {item.maxViews && ` / ${item.maxViews}`}
                </div>

              </div>

              <div className="flex flex-col gap-2 ml-6">

                {/* OPEN LINK */}
                <button
                  onClick={() => window.open(`/view/${item.uniqueId}`, "_blank")}
                  className="bg-blue-500 hover:bg-blue-600
                   hover:scale-105 active:scale-95
                   text-white px-4 py-1 rounded
                   transition-all duration-300 text-sm"
                >
                  Open LINK
                </button>

                {/* COPY LINK */}
                <button
                  onClick={() => {
                    const link = `${window.location.origin}/view/${item.uniqueId}`;
                    navigator.clipboard.writeText(link);
                    alert("Link copied!");
                  }}
                  className="bg-green-500 hover:bg-green-600
                   hover:scale-105 active:scale-95
                   text-white px-4 py-1 rounded
                   transition-all duration-300 text-sm"
                >
                  Copy Link
                </button>

                {/* DELETE */}
                <button
                  onClick={() => handleDelete(item.uniqueId)}
                  className="bg-red-500 hover:bg-red-600
                   hover:scale-105 active:scale-95
                   text-white px-4 py-1 rounded
                   transition-all duration-300 text-sm"
                >
                  Delete
                </button>

              </div>

            </div>
          </div>

        ))}
      </div>
      </div>
    </div>
  );
};

export default History;
