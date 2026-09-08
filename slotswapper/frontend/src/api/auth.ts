import axios from "axios";

const API_URL = "http://localhost:5000";

interface UserData {
  name: string;
  email: string;
  college: string;
  role: "Admin" | "Faculty";
}

interface AuthResponse {
  success: boolean;
  message: string;
  user?: UserData;
  token?: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  college: string;
  role: "Admin" | "Faculty";
}

interface LoginData {
  email: string;
  password: string;
}

export const signup = async (
  data: SignupData
): Promise<AuthResponse> => {
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/signup`,
      data
    );

    return response.data;
  } catch (err: any) {
    return {
      success: false,
      message:
        err.response?.data?.message || "Signup failed",
    };
  }
};

export const login = async (
  data: LoginData
): Promise<AuthResponse> => {
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/login`,
      data
    );

    return response.data;
  } catch (err: any) {
    return {
      success: false,
      message:
        err.response?.data?.message || "Login failed",
    };
  }
};