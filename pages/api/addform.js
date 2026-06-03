import Visit from '@/models/form';
import connectDb from '@/middleware/mongoose';

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const data = req.body;

    const newVisit = new Visit({
      photos: data.photos,
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
      state: data.state,
      nation: data.nation,
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
      studentPhoto: data.studentPhoto,
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
      policePhoto: data.policePhoto,
      projectName: data.projectName,
      projectLocation: data.projectLocation,
      projectProblem: data.projectProblem,
      message: data.message,
    });

    await newVisit.save();

    return res.status(200).json({ success: true, message: 'Visit added successfully' });
  } catch (error) {
    console.error('Error adding visit:', error);
    return res.status(500).json({ success: false, message: 'Error adding visit' });
  }
};

export default connectDb(handler);