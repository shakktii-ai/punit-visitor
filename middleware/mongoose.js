import mongoose from "mongoose";
import dns from "dns";

// Force Node.js to use public DNS servers (Google/Cloudflare) to resolve MongoDB Atlas SRV connection strings
if (dns && typeof dns.setServers === "function") {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

// Force Node.js to prefer IPv4 DNS resolution to fix MongoDB Atlas SRV lookup issues on Windows
if (dns && typeof dns.setDefaultResultOrder === "function") {
    dns.setDefaultResultOrder("ipv4first");
}

const connectDb = handler => async(req,res)=>{
    if(mongoose.connections[0].readyState){
        return handler(req, res)
    }
    await mongoose.connect(process.env.MONGO_URI)
    return handler(req,res);
}

export default connectDb; 