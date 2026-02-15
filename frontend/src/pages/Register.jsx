import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleRegister = async () => {
        const res = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await res.json();

        if (res.ok) {
            alert("Registered successfully");
            navigate("/login");
        } else {
            alert(data.message);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)]
  bg-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-black
  flex items-center justify-center px-6
  transition-colors duration-300">
            <div className="bg-gray-200 dark:bg-gray-800 p-8 rounded-2xl w-96 transition-all duration-500 hover:scale-[1.01]">
                <h2 className="text-xl text-gray-800 dark:text-gray-200 mb-4">Register</h2>

                <input
                    type="text"
                    placeholder="Username"
                    className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    onClick={handleRegister}
                    className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded"
                >
                    Register
                </button>
                <p className="text-sm text-gray-400 mt-4 text-center">
                    Already have an account?{" "}
                    <span
                        onClick={() => navigate("/login")}
                        className="text-blue-400 cursor-pointer"
                    >
                        Login
                    </span>
                </p>

            </div>
        </div>
    );
};

export default Register;
