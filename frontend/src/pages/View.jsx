import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ThemeToggle from "../components/ThemeToggle";

const View = () => {
  const { id } = useParams();

  const [content, setContent] = useState(null);
  const [password, setPassword] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Try to access content (without password initially)
  const fetchContent = async () => {
    setError("");

    const url = password
      ? `http://localhost:5000/api/content/${id}?password=${password}`
      : `http://localhost:5000/api/content/${id}`;

    try {
      const res = await fetch(url);

      // 🔑 CHECK CONTENT TYPE
      const contentType = res.headers.get("content-type");

      // ❌ ERROR RESPONSE (always JSON)
      if (!res.ok) {
        const err = await res.json();

        if (err.message === "Password required") {
          setNeedsPassword(true);
          return;
        }

        setError(err.message || "Access denied");
        return;
      }

      // ✅ JSON → TEXT CONTENT
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        setContent(data);
        setAuthorized(true);
        setNeedsPassword(false);
        return;
      }

      // ✅ FILE → DO NOT PARSE JSON
      setAuthorized(true);
      setNeedsPassword(false);
      setContent({ type: "file" });

    } catch (err) {
      console.error("Frontend fetch error:", err);
      setError("Server error");
    }
  };


  // initial attempt
  useEffect(() => {
    fetchContent();
    // eslint-disable-next-line
  }, []);

  // Step 3: Download file ONLY after password unlock
  const downloadFile = () => {
    let downloadUrl =
      `http://localhost:5000/api/content/${id}?download=true`;

    if (password) {
      downloadUrl += `&password=${password}`;
    }
    window.location.href = downloadUrl;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl w-[420px]">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
            {content?.type === "file" ? "📁 File" : "📝 Text"}
          </h2>

        </div>

        {/* PASSWORD UI */}
        {needsPassword && (
          <div className="mt-4">
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded bg-gray-100 dark:bg-gray-700
                         text-black dark:text-white"
            />
            <button
              onClick={fetchContent}
              className="mt-3 w-full bg-blue-600 hover:bg-blue-700
                         text-white py-2 rounded"
            >
              Unlock
            </button>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-800 rounded text-center">
            <p className="text-red-700 dark:text-red-200">
              ❌ {error}
            </p>
          </div>
        )}

        {/* TEXT CONTENT */}
        {authorized && content?.type === "text" && (
          <div>
            <pre
              className="bg-gray-100 dark:bg-gray-700 p-4 rounded
                 text-black dark:text-white whitespace-pre-wrap"
            >
              {content.text}
            </pre>

            {/* VIEW INFO */}
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-300 flex justify-between">
              <span>
                👁️ Views: {content.views}
                {content.maxViews && ` / ${content.maxViews}`}
              </span>
              {content.maxViews === 1 && (
                <span className="text-orange-400 font-medium">
                  One-time link
                </span>
              )}
            </div>
          </div>
        )}

        {/* FILE DOWNLOAD */}
        {authorized && content?.type === "file" && (
          <div className="mt-4">
            {/* VIEW INFO */}
            <div className="mb-2 text-sm text-gray-600 dark:text-gray-300 text-center">
              <span>
                👁️ Views: {content.views}
                {content.maxViews && ` / ${content.maxViews}`}
              </span>
              {content.maxViews === 1 && (
                <span className="text-orange-400 font-medium">
                  {" "}• One-time link
                </span>
              )}
            </div>

            <button
              onClick={downloadFile}
              className="w-full bg-green-600 hover:bg-green-700
                 text-white py-2 rounded transition-all"
            >
              ⬇ Download File
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default View;
