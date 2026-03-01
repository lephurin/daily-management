import axiosLib from "axios";

// Create a configured Axios instance
export const axios = axiosLib.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: (Optional) Can attach auth headers here in the future if needed
axios.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor: Standardize error handling
axios.interceptors.response.use(
  (response) => {
    // Return the response data directly to simplify calling code
    return response.data;
  },
  (error) => {
    // Extract Next.js API route standardized `{ error: string }` errors if they exist
    if (error.response?.data?.error) {
      error.message = error.response.data.error;
    }
    return Promise.reject(error);
  },
);
