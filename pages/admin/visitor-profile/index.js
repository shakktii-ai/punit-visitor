import mongoose from "mongoose";
import FormModel from "@/models/form";

export default function VisitorProfileIndex() {
  return null;
}

export async function getServerSideProps() {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    // Find the most recently added visitor
    const latestVisitor = await FormModel.findOne().sort({ createdAt: -1 });

    if (latestVisitor) {
      return {
        redirect: {
          destination: `/admin/visitor-profile/${latestVisitor._id}`,
          permanent: false,
        },
      };
    }

    return {
      redirect: {
        destination: "/admin/visitorTable",
        permanent: false,
      },
    };
  } catch (error) {
    console.error("Error in visitor-profile index redirect:", error);
    return {
      redirect: {
        destination: "/admin/visitorTable",
        permanent: false,
      },
    };
  }
}
