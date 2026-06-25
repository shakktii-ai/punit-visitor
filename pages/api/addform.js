import Visit from '@/models/form';
import connectDb from '@/middleware/mongoose';
import { uploadToCloudinary } from '@/lib/cloudinary';

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const data = req.body;

    // Upload images to Cloudinary if they are in Base64 format
    const photos = await uploadToCloudinary(data.photos, 'visitors/photos');
    const studentPhoto = await uploadToCloudinary(data.studentPhoto, 'visitors/studentPhotos');
    const policePhoto = await uploadToCloudinary(data.policePhoto, 'visitors/policePhotos');

    const newVisit = new Visit({
      photos,
      fullName: data.fullName,
      email: data.email,
      phoneNo: data.phoneNo,
      age: data.age,
      sex: data.sex,
      DOB: data.DOB,
      aadharVoter: data.aadharVoter,
      houseNo: data.houseNo,
      landmark: data.landmark,
      village: data.village,
      pincode: data.pincode,
      purpose: data.purpose,
      patiantName: data.patiantName,
      hospitalName: data.hospitalName,
      trackingDoctor: data.trackingDoctor,
      reason: data.reason,
      studentName: data.studentName,
      studentDOB: data.studentDOB,
      studentGender: data.studentGender,
      studentCategory: data.studentCategory,
      studentPhoto: studentPhoto,
      jobFullName: data.jobFullName,
      jobPosition: data.jobPosition,
      jobDepartment: data.jobDepartment,
      jobLocation: data.jobLocation,
      jobSalary: data.jobSalary,
      employeeName: data.employeeName,
      employeeId: data.employeeId,
      employeeDepartment: data.employeeDepartment,
      employeeDesignation: data.employeeDesignation,
      employeeRDepartment: data.employeeRDepartment,
      employeeRTransfer: data.employeeRTransfer,
      schemeName: data.schemeName,
      schemePApplication: data.schemePApplication,
      schemeApplyDate: data.schemeApplyDate,
      schemeMaritalStatus: data.schemeMaritalStatus,
      schemeCategary: data.schemeCategary,
      schemeAddhar: data.schemeAddhar,
      businessName: data.businessName,
      businessType: data.businessType,
      businessSector: data.businessSector,
      businessRNo: data.businessRNo,
      businessDOE: data.businessDOE,
      businessGST: data.businessGST,
      businessAddress: data.businessAddress,
      utilityServiceInstallation: data.utilityServiceInstallation,
      utilityProblem: data.utilityProblem,
      policeApplicationNo: data.policeApplicationNo,
      policeApplicationDate: data.policeApplicationDate,
      policeApplicationPlace: data.policeApplicationPlace,
      policeIncidentDetails: data.policeIncidentDetails,
      policeInvolveName: data.policeInvolveName,
      policeDeclaration: data.policeDeclaration,
      policePhoto: policePhoto,
      projectName: data.projectName,
      projectLocation: data.projectLocation,
      projectProblem: data.projectProblem,
      message: data.message,
      addedBy: data.addedBy,
      status: data.status || 'Pending',
      followUp: data.followUp || '',
    });

    await newVisit.save();

    return res.status(200).json({ success: true, message: 'Visit added successfully' });
  } catch (error) {
    console.error('Error adding visit:', error);
    return res.status(500).json({ success: false, message: 'Error adding visit' });
  }
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default connectDb(handler);