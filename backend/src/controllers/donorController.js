const { JWT_SECRET } = require("../config/serverConfig");
const DonorService = require("../services/donorService");
const jwt = require('jsonwebtoken');
const donorServ = new DonorService();

const createDonation = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                data: {},
                success: false,
                message: 'User not logged-in',
                err: 'Authentication required'
            });
        }
        const donorId = req.user.id;
        const role = req.user.role;
        const address = req.body.address;
        const organName = req.body.organName;
        const bloodGroup = req.body.bloodGroup;
        
        const donateOrgan = await donorServ.createDonation({
            organName,
            bloodGroup,
            donorId,
            role,
            address
        });
        
        return res.status(201).json({
            data: donateOrgan,
            success: true,
            message: 'Successfully added organ for donation',
            err: {}
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            data: {},
            success: false,
            message: 'Request Failed',
            err: error.message
        });
    }
};

const confirmDonation = async (req, res) => {
    try {
        const donatedOrganId = req.body.organId;
        const consentType = req.body.consentType;
        const donorId = req.user.id;
        
        if (!donatedOrganId || !consentType) {
            return res.status(400).json({
                data: {},
                success: false,
                message: 'organId and consentType are required',
                err: 'Missing required fields'
            });
        }
        
        const confirmed = await donorServ.confirmDonation(donatedOrganId, donorId, consentType);
        
        return res.status(201).json({
            data: confirmed,
            success: true,
            message: 'Successfully confirmed organ for donation',
            err: {}
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            data: {},
            success: false,
            message: 'Request Failed',
            err: error.message
        });
    }
};

const findAllRequests = async (req, res) => {
    try {
        const bloodGroup = req.query.bloodGroup;
        const organName = req.query.organName;
        
        const requests = await donorServ.findAllRequests({ bloodGroup, organName });
        
        return res.status(200).json({
            data: requests,
            success: true,
            message: 'Successfully fetched all requests',
            err: {}
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            data: {},
            success: false,
            message: 'Request Failed',
            err: error.message
        });
    }
};

const confirmAllocation = async (req, res) => {
    try {
        const allocationId = req.params.id;
        const donorId = req.user.id;
        
        if (!allocationId) {
            return res.status(400).json({
                success: false,
                message: 'Allocation ID is required',
                err: 'Missing allocation ID'
            });
        }
        
        const allocation = await donorServ.confirmAllocation(allocationId, donorId);
        
        return res.status(200).json({
            success: true,
            message: 'Allocation confirmed successfully',
            data: allocation,
            err: {}
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to confirm allocation',
            err: error.message
        });
    }
};

const rejectAllocation = async (req, res) => {
    try {
        const allocationId = req.params.id;
        const donorId = req.user.id;
        
        if (!allocationId) {
            return res.status(400).json({
                success: false,
                message: 'Allocation ID is required',
                err: 'Missing allocation ID'
            });
        }
        
        const allocation = await donorServ.rejectAllocation(allocationId, donorId);
        
        return res.status(200).json({
            success: true,
            message: 'Allocation rejected successfully',
            data: allocation,
            err: {}
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to reject allocation',
            err: error.message
        });
    }
};

const findAll = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                data: {},
                success: false,
                message: 'Not Authenticated',
                err: 'Authentication required'
            });
        }
        
        const all = await donorServ.findAll(req.user.id);
        
        return res.status(200).json({
            message: 'Successfully fetched all',
            data: all,
            err: {},
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            data: {},
            success: false,
            message: 'Request Failed',
            err: error.message
        });
    }
};

const acceptOrganById = async (req, res) => {
    try {
        const donorId = req.user.id;
        const { organId } = req.body;
        
        if (!organId) {
            return res.status(400).json({
                success: false,
                message: "organId is required",
                err: "Missing required field"
            });
        }

        const result = await donorServ.acceptOrganById({
            organId,
            donorId
        });

        return res.status(200).json({
            success: true,
            message: "Organ accepted successfully",
            data: result,
            err: {}
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to accept organ",
            err: error.message
        });
    }
};

module.exports = {
    createDonation,
    confirmDonation,
    findAllRequests,
    rejectAllocation,
    confirmAllocation,
    findAll,
    acceptOrganById
};