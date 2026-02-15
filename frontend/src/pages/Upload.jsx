import { useState } from "react";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";


const Upload = () => {
  const [mode, setMode] = useState("text"); // text | file
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [expiry, setExpiry] = useState("");
  const [oneTime, setOneTime] = useState(false);
  const [maxViews, setMaxViews] = useState("");
  const [copied, setCopied] = useState(false);



  const { token } = useAuth();


  const saveToHistory = (item) => {
    const history = JSON.parse(localStorage.getItem("linkvault_history")) || [];
    history.unshift(item); // newest first
    localStorage.setItem("linkvault_history", JSON.stringify(history));
  };

  const submit = async () => {
    setError("");      // ✅ always clear old error
    setLink("");

    try {
      setLoading(true);

      let res;

      if (mode === "text") {
        res = await fetch("http://localhost:5000/api/content/text", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            text,
            expiry: expiry || null,
            password: password || undefined,
            oneTime,
            maxViews: oneTime ? 1 : (maxViews ? Number(maxViews) : null),
          }),
        });
        // console.log("TOKEN:", token);

      } else {
        const formData = new FormData();
        formData.append("file", file);
        if (password) formData.append("password", password);
        if (expiry) formData.append("expiry", expiry);
        formData.append("oneTime", oneTime);
        if (!oneTime && maxViews) {
          formData.append("maxViews", maxViews);
        }


        res = await fetch("http://localhost:5000/api/content/file", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,   // 🔥 ADD THIS
          },
          body: formData,
        });
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Upload failed");
        return;
      }

      // ✅ SUCCESS PATH
      setLink(data.link || data.shareableLink);
      saveToHistory({
        id: data.link.split("/").pop(),
        type: mode,
        name: data.name,
        createdAt: Date.now(),
        expiresAt: new Date(data.expiresAt).getTime(), // ✅ REAL VALUE
        views: 0,
      });


      setError("");   // 🔥 IMPORTANT: clear any previous error

    } catch (err) {
      setError("Backend not reachable");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="
  min-h-[calc(100vh-4rem)]
  bg-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-black
  flex items-center justify-center px-6
  transition-colors duration-300
">


      <div className=" bg-gray-200 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-black backdrop-blur-xl 
                p-10 rounded-2xl shadow-2xl 
                w-full max-w-xl space-y-6
                ">


        

        {/* Mode toggle */}
        <div className="flex gap-2 mb-4 ">
          <button
            onClick={() => setMode("text")}
            className={`flex-1 py-2 rounded transition-all duration-500 hover:scale-[1.01] ${mode === "text"
              ? "bg-blue-600 text-white"
              : "bg-gray-300 dark:bg-gray-800 text-black dark:text-white"
              }`}
          >
            📝 Text
          </button>
          <button

            onClick={() => setMode("file")}
            className={`flex-1 py-2 rounded transition-all duration-500 hover:scale-[1.01] ${mode === "file"
              ? "bg-blue-600 text-white"
              : "bg-gray-300 dark:bg-gray-800 text-black dark:text-white"
              }`}
          >
            📁 File
          </button>
        </div>

        {/* Input */}
        {mode === "text" ? (
          <textarea
            className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-black dark:text-white transition-all duration-500 hover:scale-[1.01]"
            rows="8"
            placeholder="Paste your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        ) : (
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full text-black dark:text-white"
          />
        )}
        {/* Password */}
        <input
          type="password"
          placeholder="Optional password (for protected access)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-3 w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700 
             text-black dark:text-white transition-all duration-500 hover:scale-[1.01]"
        />

        {/* Expiry */}
        <div>
          <label className="block text-sm text-gray-900 dark:text-gray-200 mb-1">
            Expiry date & time (optional)
          </label>
          <input
            type="datetime-local"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className="mt-3 w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700 
             text-gray-500 dark:text-gray-400 transition-all duration-500 hover:scale-[1.01]"
          />
          <p className="text-xs text-gray-800 dark:text-gray-300 mt-1">
            If not set, link expires after 10 minutes
          </p>
        </div>


        <div className="flex items-center gap-2 mt-3 transition-all duration-500 hover:scale-[1.01]">
          <input
            type="checkbox"
            checked={oneTime}
            onChange={(e) => {
              const checked = e.target.checked;
              setOneTime(checked);

              if (checked) {
                setMaxViews(""); // clear max views automatically
              }
            }}
            className="w-4 h-4"
          />
          <label className="text-sm text-black dark:text-gray-200">
            One-time view link (can be opened only once)
          </label>
        </div>

        {/* MAX VIEWS (hidden if one-time selected) */}
        {!oneTime && (
          <div className="mt-4">
            <label className="block text-sm text-gray-800 dark:text-gray-200 mb-1  ">
              Max views / downloads (optional)
            </label>

            <input
              type="number"
              min="1"
              placeholder="e.g. 5"
              value={maxViews}
              onChange={(e) => setMaxViews(e.target.value)}
              className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-white transition-all duration-500 hover:scale-[1.01]"
            />

            <p className="text-xs text-gray-800 dark:text-gray-200 mt-1">
              Leave empty for unlimited access
            </p>
          </div>
        )}


        {/* Submit */}
        <button
          onClick={submit}
          disabled={loading}
          className="w-full py-3 rounded-xl text-lg font-semibold
           bg-gradient-to-r from-green-500 to-emerald-600
           hover:from-green-600 hover:to-emerald-700
           transition-all duration-300 transform hover:scale-[1.02]
           shadow-lg"

        >
          {loading ? "Uploading..." : "Generate Link"}
        </button>

        {/* Error */}
        {error && !link && (
          <p className="mt-3 text-red-500 text-sm text-center">
            {error}
          </p>
        )}

        {/* Success */}
        {link && (
          <div
            className="mt-6 p-5 rounded-xl
               bg-green-50 dark:bg-green-900/30
               border border-green-200 dark:border-green-700
               transition-all duration-300"
          >
            <p className="text-green-700 dark:text-green-300 text-sm font-medium mb-2">
              ✅ Shareable Link
            </p>

            {(() => {
              const id = link.split("/").pop();
              const frontendLink = `http://localhost:5173/view/${id}`;

              return (
                <>
                  <div className="break-all text-gray-800 dark:text-gray-200 text-sm mb-4">
                    {frontendLink}
                  </div>

                  <div className="flex gap-3">

                    {/* OPEN BUTTON */}
                    <button
                      onClick={() => window.open(frontendLink, "_blank")}
                      className="bg-blue-500 hover:bg-blue-600
                         hover:scale-105 active:scale-95
                         text-white px-4 py-2 rounded-lg
                         transition-all duration-300 shadow-md text-sm"
                    >
                      Open Link
                    </button>

                    {/* COPY BUTTON */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(frontendLink);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="bg-green-500 hover:bg-green-600
             hover:scale-105 active:scale-95
             text-white px-4 py-2 rounded-lg
             transition-all duration-300 shadow-md text-sm"
                    >
                      Copy Link
                    </button>
                    {copied && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2 animate-pulse">
                        ✔ Copied!
                      </p>
                    )}

                  </div>
                </>
              );
            })()}
          </div>
        )}


      </div>
    </div>
  );
};

export default Upload;
