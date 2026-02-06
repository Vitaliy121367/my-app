import axios from "axios";
import { getToken, removeToken } from "./auth";

const axiosInstance =axios.create({
    baseURL: "http://localhost:4000/api",
    withCredentials: true
})

axiosInstance.interceptors.request.use(
    (config: any)=>{
        const token = getToken()
        if(token){
            config.headers["Authorization"]=token
        }
        return config
    },
    (error: any)=>Promise.reject(error)
)

axiosInstance.interceptors.response.use(
    (response: any)=>response,
    (error: any)=>{
        if(error.response && error.response.status === 401){
            removeToken()
            window.location.href='/login'
        }
        return Promise.reject(error)
    }
)

export default axiosInstance